"use client"

import { Editor } from '@tiptap/react'
import {
    Bold, Italic, Underline, Undo, Redo, List, ListOrdered, Type,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link as LinkIcon, Image as ImageIcon, Code, Highlighter,
    ChevronDown, Minus, Plus, Quote, Printer, CheckSquare, RemoveFormatting
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ToolbarProps {
    editor: Editor | null
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

export default function Toolbar({ editor }: ToolbarProps) {
    if (!editor) return null

    const [fontSize, setFontSize] = useState(11)

    const incrementFontSize = () => {
        const newSize = fontSize + 1
        setFontSize(newSize)
        editor.chain().focus().setFontSize(`${newSize}pt`).run()
    }

    const decrementFontSize = () => {
        const newSize = Math.max(1, fontSize - 1)
        setFontSize(newSize)
        editor.chain().focus().setFontSize(`${newSize}pt`).run()
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

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="flex items-center gap-0.5 px-1 sm:px-3 py-1 bg-[#edf2fa] border-b border-[#dadce0] overflow-x-auto no-scrollbar min-h-[40px] sm:min-h-[44px] shadow-sm sticky top-[48px] sm:top-[64px] z-[55]"
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
                    onClick={() => window.print()}
                    icon={<Printer className="w-4 h-4" />}
                    tooltip="Print (Ctrl+P)"
                />
            </div>

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
                                if (h.value === 0) editor.chain().focus().setParagraph().run()
                                else editor.chain().focus().toggleHeading({ level: h.value as any }).run()
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
                            onClick={() => editor.chain().focus().setFontFamily(f.value).run()}
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
                <div className="px-1 sm:px-2 py-0.5 text-xs sm:text-sm font-medium min-w-[24px] sm:min-w-[32px] text-center select-none font-sans">
                    {fontSize}
                </div>
                <ToolbarButton onClick={incrementFontSize} icon={<Plus className="w-3 h-3" />} transparent />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            {/* Formatting Group */}
            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    icon={<Bold className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    icon={<Italic className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    icon={<Underline className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    active={editor.isActive('highlight')}
                    icon={<Highlighter className="w-4 h-4" />}
                />
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
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    active={editor.isActive({ textAlign: 'justify' })}
                    icon={<AlignJustify className="w-4 h-4" />}
                />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    icon={<List className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    icon={<ListOrdered className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    active={editor.isActive('taskList')}
                    icon={<CheckSquare className="w-4 h-4" />}
                />
            </div>

            <Separator orientation="vertical" className="hidden sm:block mx-1 sm:mx-2 h-6 bg-[#dadce0]" />

            <div className="flex items-center gap-0.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    icon={<Quote className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive('codeBlock')}
                    icon={<Code className="w-4 h-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
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
