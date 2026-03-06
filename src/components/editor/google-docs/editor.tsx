"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { FontFamily } from '@tiptap/extension-font-family'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Placeholder } from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

// Custom extension for font size
import { Extension, Node, mergeAttributes } from '@tiptap/core'

export const TabNode = Node.create({
    name: 'tabNode',
    group: 'inline',
    inline: true,
    selectable: false,
    marks: '_',

    parseHTML() {
        return [
            {
                tag: 'span[data-type="tab"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'tab', style: 'white-space: pre' }), '\t']
    },
})

export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        }
    },
})

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            setFontSize: (size: string) => ReturnType
            unsetFontSize: () => ReturnType
        }
    }
}

interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    onReady: (editor: any) => void;
    readOnly?: boolean;
    showWatermark?: boolean;
    customPaperHeader?: React.ReactNode;
}

export default function GoogleDocsEditor({ content, onChange, onReady, readOnly = false, showWatermark = false, customPaperHeader }: EditorProps) {
    const editor = useEditor({
        parseOptions: {
            preserveWhitespace: 'full',
        },
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg shadow-sm block mx-auto my-4',
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Write something or type "/" for commands...',
            }),
            TabNode,
            Extension.create({
                name: 'tabKey',
                priority: 1000,
                addKeyboardShortcuts() {
                    return {
                        Tab: () => {
                            // Insert atomic Tab node to guarantee it survives database saves and real-time syncs perfectly
                            return this.editor.chain().focus().insertContent([{ type: 'tabNode' }, { type: 'tabNode' }]).run()
                        },
                        'Mod-Tab': () => {
                            // Ctrl + Tab to create a sub-list (sink list item)
                            if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
                                return this.editor.chain().focus().sinkListItem('listItem').run()
                            }
                            if (this.editor.isActive('taskList')) {
                                return this.editor.chain().focus().sinkListItem('taskItem').run()
                            }
                            return false
                        },
                        'Shift-Tab': () => {
                            // If in a list, we can keep the outdent behavior as it's useful and doesn't conflict with "always spaces" for Tab
                            if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
                                return this.editor.chain().focus().liftListItem('listItem').run()
                            }
                            if (this.editor.isActive('taskList')) {
                                return this.editor.chain().focus().liftListItem('taskItem').run()
                            }
                            return false
                        },
                    }
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: `focus:outline-none min-[1056px]:min-h-[1056px] min-h-[1056px] w-full max-w-[816px] px-6 sm:px-16 ${customPaperHeader ? 'pb-8 pt-4 sm:pb-12 sm:pt-6' : 'py-8 sm:py-12'} ${readOnly ? 'cursor-default' : 'cursor-text'}`,
            },
        },
    })

    useEffect(() => {
        if (editor) {
            onReady(editor)
        }
    }, [editor, onReady])

    // Sync content if it changes externally (e.g. from template/load or real-time)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center w-full bg-[#f8f9fa] min-h-screen"
        >
            <div className="mt-2 sm:mt-4 mb-10 w-full max-w-[816px] mx-auto px-0 sm:px-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className={`bg-white shadow-xl border border-gray-200 w-full ${showWatermark ? 'bg-watermark' : ''}`}
                >
                    {customPaperHeader}
                    <EditorContent editor={editor} />
                </motion.div>
            </div>
        </motion.div>
    )
}
