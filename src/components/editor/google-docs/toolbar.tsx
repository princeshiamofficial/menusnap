"use client"

import { Editor } from '@tiptap/react'
import {
    Bold, Italic, Underline, Undo, Redo, List, ListOrdered, Type,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Image as ImageIcon, Code, Highlighter,
    ChevronDown, Minus, Plus, Quote, CheckSquare, RemoveFormatting, Download,
    Baseline, CaseSensitive, Palette, ArrowUpDown as LineHeightIcon,
    PlusCircle, ListIcon, FileText as FileTextIcon, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { generateDocxFromJSON } from '@/lib/docx-generator'
import { saveAs } from 'file-saver'

interface ToolbarProps {
    editor: Editor | null
    title?: string
    isVibeMode?: boolean
}

const FONTS = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Inter', value: 'Inter' },
]

const HEADINGS = [
    { label: 'Normal text', value: 0 },
    { label: 'Heading 1', value: 1 },
    { label: 'Heading 2', value: 2 },
    { label: 'Heading 3', value: 3 },
]

const COLORS = [
    { label: 'Black', value: '#000000' },
    { label: 'Gray', value: '#5f6368' },
    { label: 'Red', value: '#ea4335' },
    { label: 'Orange', value: '#ff6d01' },
    { label: 'Yellow', value: '#fbbc04' },
    { label: 'Green', value: '#34a853' },
    { label: 'Blue', value: '#4285f4' },
    { label: 'Purple', value: '#a142f4' },
]

const TEXT_CASES = [
    { label: 'Upper Case', value: 'uppercase' },    // HELLO WORLD
    { label: 'Lower Case', value: 'lowercase' },    // hello world
    { label: 'Title Case', value: 'title' },        // Hello World
    { label: 'Sentence Case', value: 'sentence' },  // Hello world
    { label: 'Camel Case', value: 'camel' },        // helloWorld
    { label: 'Pascal Case', value: 'pascal' },      // HelloWorld
    { label: 'Snake Case', value: 'snake' },        // hello_world
    { label: 'Kebab Case', value: 'kebab' },        // hello-world
    { label: 'Constant Case', value: 'constant' },  // HELLO_WORLD
    { label: 'Dot Case', value: 'dot' },            // hello.world
]

const LINE_HEIGHTS = [
    { label: 'Single', value: '1.0' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: 'Double', value: '2.0' },
]

export default function Toolbar({ editor, title, isVibeMode = false }: ToolbarProps) {
    const [fontSize, setFontSize] = useState(11)

    // Auto-detect font size on selection change
    React.useEffect(() => {
        if (!editor) return

        const updateFontSize = () => {
            const attrs = editor.getAttributes('textStyle')
            if (attrs.fontSize) {
                // If it's a string like "14pt", extract the number
                const size = parseInt(attrs.fontSize)
                if (!isNaN(size)) {
                    setFontSize(size)
                }
            } else {
                // Default to 11 if no specific font size is set
                setFontSize(11)
            }
        }

        editor.on('selectionUpdate', updateFontSize)
        editor.on('transaction', updateFontSize)

        return () => {
            editor.off('selectionUpdate', updateFontSize)
            editor.off('transaction', updateFontSize)
        }
    }, [editor])

    if (!editor) return null

    const incrementFontSize = () => {
        const newSize = fontSize + 1
        setFontSize(newSize)
        executeCommand('setFontSize', `${newSize}pt`)
    }

    const decrementFontSize = () => {
        const newSize = Math.max(1, fontSize - 1)
        setFontSize(newSize)
        executeCommand('setFontSize', `${newSize}pt`)
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const handleDownload = async () => {
        if (!editor) return
        try {
            const json = editor.getJSON()
            const blob = await generateDocxFromJSON(json)
            saveAs(blob, `${title || 'document'}.docx`)
        } catch (error) {
            console.error('Failed to export DOCX:', error)
        }
    }

    const executeCommand = (command: string, ...args: any[]) => {
        if (!editor) return
        (editor.commands as any).runCommandOnAllSelections(command, ...args)
    }

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="flex items-center gap-0.5 px-1 sm:px-3 py-1 bg-[#edf2fa] border-b border-[#dadce0] overflow-x-auto no-scrollbar min-h-[40px] sm:min-h-[44px] shadow-sm z-[55]"
        >
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    icon={<Undo className="w-4 h-4" />}
                    tooltip="Undo (Ctrl+Z)"
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    icon={<Redo className="w-4 h-4" />}
                    tooltip="Redo (Ctrl+Y)"
                />
                <ToolbarButton
                    onClick={handleDownload}
                    icon={<Download className="w-4 h-4" />}
                    tooltip="Download as Word (.docx)"
                />
            </div>

            {isVibeMode && (
                <>
                    <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />
                    <div className="flex items-center gap-0.5 ml-1 mr-1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().insertContent('<h1>CATEGORY</h1>\n').run()}
                            icon={<Layers className="w-4 h-4" />}
                            tooltip="Add Category (#)"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().insertContent('Item Name - 100\n').run()}
                            icon={<PlusCircle className="w-4 h-4" />}
                            tooltip="Add Item"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().insertContent('Description goes here...\n').run()}
                            icon={<FileTextIcon className="w-4 h-4" />}
                            tooltip="Add Description"
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().insertContent('- Variation - 50\n').run()}
                            icon={<ListIcon className="w-4 h-4" />}
                            tooltip="Add Sub-item (-)"
                        />
                    </div>
                </>
            )}

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            {/* Heading Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-2 text-sm font-medium hover:bg-white transition-all duration-200 shadow-none border border-transparent hover:border-[#dadce0]">
                            {HEADINGS.find(h => h.value === (editor.getAttributes('heading').level || 0))?.label || 'Normal text'}
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                        </Button>
                    </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-1 min-w-[150px] animate-in slide-in-from-top-2 duration-200">
                    {HEADINGS.map(h => (
                        <DropdownMenuItem
                            key={h.value}
                            onClick={() => {
                                if (h.value === 0) executeCommand('setParagraph')
                                else executeCommand('toggleHeading', { level: h.value as any })
                            }}
                            className={`p-2 rounded-sm cursor-pointer hover:bg-[#f1f3f4] ${h.value === 0 ? 'text-base' : `text-${h.value + 1}xl font-bold`}`}
                        >
                            {h.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            {/* Font Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium hover:bg-white transition-all duration-200 shadow-none border border-transparent hover:border-[#dadce0] min-w-[80px] sm:min-w-[100px] justify-between">
                            <span className="truncate">{editor.getAttributes('textStyle').fontFamily || 'Arial'}</span>
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                        </Button>
                    </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-1 max-h-[300px] overflow-y-auto animate-in slide-in-from-top-2 duration-200 no-scrollbar">
                    {FONTS.map(f => (
                        <DropdownMenuItem
                            key={f.value}
                            onClick={() => executeCommand('setFontFamily', f.value)}
                            style={{ fontFamily: f.value }}
                            className="p-2 rounded-sm cursor-pointer hover:bg-[#f1f3f4]"
                        >
                            {f.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            {/* Font Size */}
            <div className="flex items-center bg-white border border-[#dadce0] rounded-md px-0.5 sm:px-1 h-7 sm:h-8 shadow-sm">
                <ToolbarButton onClick={decrementFontSize} icon={<Minus className="w-3 h-3" />} transparent />
                <input
                    type="text"
                    value={fontSize}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        if (val === '') setFontSize(0)
                        else setFontSize(parseInt(val))
                    }}
                    onBlur={() => {
                        if (fontSize > 0) {
                            executeCommand('setFontSize', `${fontSize}pt`)
                        } else {
                            // Reset to default or previous if invalid
                            setFontSize(11)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.blur()
                        }
                    }}
                    className="w-[28px] sm:w-[36px] h-full text-xs sm:text-sm font-medium text-center focus:outline-none bg-transparent"
                />
                <ToolbarButton onClick={incrementFontSize} icon={<Plus className="w-3 h-3" />} transparent />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            {/* Formatting Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => executeCommand('toggleBold')}
                    active={editor.isActive('bold')}
                    icon={<Bold className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleItalic')}
                    active={editor.isActive('italic')}
                    icon={<Italic className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleUnderline')}
                    active={editor.isActive('underline')}
                    icon={<Underline className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleHighlight')}
                    active={editor.isActive('highlight')}
                    icon={<Highlighter className="w-4 h-4" />}
                />

                {/* Text Color */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white border border-transparent hover:border-[#dadce0] hover:shadow-sm flex flex-col items-center justify-center gap-0">
                                <Baseline className="w-4 h-4 text-gray-600" />
                                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                            </Button>
                        </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="p-2 min-w-[140px] grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200 z-[100] shadow-xl border border-[#dadce0] bg-white"
                    >
                        {COLORS.map(c => (
                            <DropdownMenuItem
                                key={c.value}
                                onClick={() => executeCommand('setColor', c.value)}
                                className="p-0 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer hover:scale-110 transition-transform border border-gray-100"
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                            >
                                {editor.getAttributes('textStyle').color === c.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm border border-black/10" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                            onClick={() => {
                                executeCommand('unsetColor')
                                editor.chain().focus().run()
                            }}
                            className="col-span-4 mt-1 p-1.5 text-[11px] font-medium text-center justify-center hover:bg-[#f1f3f4] rounded-md transition-colors border-t border-gray-100"
                        >
                            Reset color
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Text Case */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white border border-transparent hover:border-[#dadce0] hover:shadow-sm">
                                <CaseSensitive className="w-4 h-4 text-gray-600" />
                            </Button>
                        </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="p-1 min-w-[150px] animate-in slide-in-from-top-2 duration-200 z-[100] shadow-xl border border-[#dadce0] bg-white"
                    >
                        {TEXT_CASES.map(tc => (
                            <DropdownMenuItem
                                key={tc.value}
                                onClick={() => executeCommand('setTextCase', tc.value)}
                                className="p-2 text-xs font-medium rounded-sm cursor-pointer hover:bg-[#f1f3f4] transition-colors"
                            >
                                {tc.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={setLink}
                    active={editor.isActive('link')}
                    icon={<LinkIcon className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={addImage}
                    icon={<ImageIcon className="w-4 h-4" />}
                />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => executeCommand('setTextAlign', 'left')}
                    active={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('setTextAlign', 'center')}
                    active={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('setTextAlign', 'right')}
                    active={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('setTextAlign', 'justify')}
                    active={editor.isActive({ textAlign: 'justify' })}
                    icon={<AlignJustify className="w-4 h-4" />}
                />

                {/* Line Spacing */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white border border-transparent hover:border-[#dadce0] hover:shadow-sm">
                                <LineHeightIcon className="w-4 h-4 text-gray-600" />
                            </Button>
                        </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        sideOffset={8}
                        className="p-1 min-w-[120px] animate-in slide-in-from-top-2 duration-200 z-[100] shadow-xl border border-[#dadce0] bg-white"
                    >
                        {LINE_HEIGHTS.map(lh => (
                            <DropdownMenuItem
                                key={lh.value}
                                onClick={() => executeCommand('setLineHeight', lh.value)}
                                className="p-2 text-xs font-medium rounded-sm cursor-pointer hover:bg-[#f1f3f4] transition-colors"
                            >
                                {lh.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => executeCommand('toggleBulletList')}
                    active={editor.isActive('bulletList')}
                    icon={<List className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleOrderedList')}
                    active={editor.isActive('orderedList')}
                    icon={<ListOrdered className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleTaskList')}
                    active={editor.isActive('taskList')}
                    icon={<CheckSquare className="w-4 h-4" />}
                />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => executeCommand('toggleBlockquote')}
                    active={editor.isActive('blockquote')}
                    icon={<Quote className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => executeCommand('toggleCodeBlock')}
                    active={editor.isActive('codeBlock')}
                    icon={<Code className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => {
                        executeCommand('unsetAllMarks')
                        executeCommand('clearNodes')
                    }}
                    icon={<RemoveFormatting className="w-4 h-4" />}
                />
            </div>
        </motion.div>
    )
}

function ToolbarButton({
    icon,
    onClick,
    active = false,
    disabled = false,
    tooltip,
    transparent = false
}: {
    icon: React.ReactNode
    onClick: () => void
    active?: boolean
    disabled?: boolean
    tooltip?: string
    transparent?: boolean
}) {
    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md transition-all duration-200 ${transparent ? 'hover:bg-[#f1f3f4]' : 'hover:bg-white border border-transparent hover:border-[#dadce0] hover:shadow-sm'
                    } ${active ? 'bg-[#d3e3fd] text-[#041e49] hover:bg-[#c2d7f7] border-[#a8c7fa] shadow-inner' : 'text-gray-600'
                    }`}
                onClick={(e) => {
                    e.preventDefault()
                    onClick()
                }}
                disabled={disabled}
                title={tooltip}
            >
                {icon}
            </Button>
        </motion.div>
    )
}
