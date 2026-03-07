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
import { Plugin, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

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
        },
        searchReplace: {
            setSearchTerm: (term: string) => ReturnType
            goToNextResult: () => ReturnType
            goToPrevResult: () => ReturnType
            replace: (replaceWith: string) => ReturnType
            replaceAll: (replaceWith: string) => ReturnType
        },
        textCase: {
            setTextCase: (type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot') => ReturnType
        }
    }
}

export const TextCase = Extension.create({
    name: 'textCase',
    addCommands() {
        return {
            setTextCase: (type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot') => ({ editor, chain }) => {
                const { from, to } = editor.state.selection
                if (from === to) return false

                const text = editor.state.doc.textBetween(from, to)
                let transformedText = text

                // Helper to get words from any common case
                const getWords = (str: string) => {
                    return str
                        .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
                        .replace(/[_-]/g, ' ') // split snake/kebab
                        .replace(/\./g, ' ') // split dot.case
                        .trim()
                        .split(/\s+/)
                }

                switch (type) {
                    case 'uppercase':
                        transformedText = text.toUpperCase()
                        break
                    case 'lowercase':
                        transformedText = text.toLowerCase()
                        break
                    case 'title':
                        transformedText = getWords(text)
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')
                        break
                    case 'sentence':
                        transformedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
                        break
                    case 'camel': {
                        const words = getWords(text)
                        transformedText = words[0].toLowerCase() + words.slice(1)
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join('')
                        break
                    }
                    case 'pascal':
                        transformedText = getWords(text)
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join('')
                        break
                    case 'snake':
                        transformedText = getWords(text)
                            .map(word => word.toLowerCase())
                            .join('_')
                        break
                    case 'kebab':
                        transformedText = getWords(text)
                            .map(word => word.toLowerCase())
                            .join('-')
                        break
                    case 'constant':
                        transformedText = getWords(text)
                            .map(word => word.toUpperCase())
                            .join('_')
                        break
                    case 'dot':
                        transformedText = getWords(text)
                            .map(word => word.toLowerCase())
                            .join('.')
                        break
                }

                return chain()
                    .insertContent(transformedText)
                    .setTextSelection({ from, to: from + transformedText.length })
                    .run()
            },
        }
    },
})

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
                // Disable to avoid duplicates as we add them manually with custom config
                underline: false,
                link: false,
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
            TextCase,
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
            Extension.create({
                name: 'searchReplace',
                addStorage() {
                    return {
                        searchTerm: '',
                        results: [] as { from: number; to: number }[],
                        currentIndex: 0,
                    }
                },
                addCommands() {
                    return {
                        setSearchTerm: (term: string) => ({ editor }) => {
                            this.storage.searchTerm = term
                            this.storage.results = []
                            this.storage.currentIndex = 0

                            if (term) {
                                const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                                editor.state.doc.descendants((node, pos) => {
                                    if (node.isText) {
                                        const text = node.text || ''
                                        let match
                                        while ((match = regex.exec(text)) !== null) {
                                            this.storage.results.push({
                                                from: pos + match.index,
                                                to: pos + match.index + match[0].length,
                                            })
                                        }
                                    }
                                })
                            }

                            const { tr } = editor.state
                            editor.view.dispatch(tr)
                            return true
                        },
                        goToNextResult: () => ({ editor }) => {
                            if (this.storage.results.length === 0) return false
                            this.storage.currentIndex = (this.storage.currentIndex + 1) % this.storage.results.length
                            const result = this.storage.results[this.storage.currentIndex]
                            const { tr } = editor.state
                            editor.view.dispatch(tr.setSelection(TextSelection.create(editor.state.doc, result.from)).scrollIntoView())
                            return true
                        },
                        goToPrevResult: () => ({ editor }) => {
                            if (this.storage.results.length === 0) return false
                            this.storage.currentIndex = (this.storage.currentIndex - 1 + this.storage.results.length) % this.storage.results.length
                            const result = this.storage.results[this.storage.currentIndex]
                            const { tr } = editor.state
                            editor.view.dispatch(tr.setSelection(TextSelection.create(editor.state.doc, result.from)).scrollIntoView())
                            return true
                        },
                        replace: (replaceWith: string) => ({ editor }) => {
                            const { results, currentIndex, searchTerm } = this.storage
                            if (results.length === 0) return false

                            const currentResult = results[currentIndex]
                            const { tr } = editor.state
                            tr.insertText(replaceWith, currentResult.from, currentResult.to)
                            editor.view.dispatch(tr)

                            // Refresh search results after mutation
                            this.editor.commands.setSearchTerm(searchTerm)
                            return true
                        },
                        replaceAll: (replaceWith: string) => ({ editor }) => {
                            const { results, searchTerm } = this.storage
                            if (results.length === 0) return false

                            let { tr } = editor.state
                            // Track offset because replacing changes positions
                            let offset = 0
                            results.forEach((result: any) => {
                                tr.insertText(replaceWith, result.from + offset, result.to + offset)
                                offset += replaceWith.length - (result.to - result.from)
                            })

                            editor.view.dispatch(tr)

                            // Clear Search
                            this.editor.commands.setSearchTerm('')
                            return true
                        },
                    }
                },
                addProseMirrorPlugins() {
                    return [
                        new Plugin({
                            props: {
                                decorations: (state: any) => {
                                    const decorations: any[] = []
                                    if (this.storage.searchTerm && this.storage.results.length > 0) {
                                        this.storage.results.forEach((result: any, index: number) => {
                                            const isCurrent = index === this.storage.currentIndex
                                            decorations.push(
                                                Decoration.inline(result.from, result.to, {
                                                    class: isCurrent ? 'search-result-current' : 'search-result',
                                                    style: isCurrent ? 'background-color: #f7e200; color: black;' : 'background-color: #ceead6; color: black;'
                                                })
                                            )
                                        })
                                    }
                                    return DecorationSet.create(state.doc, decorations)
                                }
                            }
                        })
                    ]
                }
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: `focus:outline-none min-[1056px]:min-h-[1056px] min-h-[1056px] w-full max-w-[816px] ${customPaperHeader ? 'pb-8 pt-4 sm:pb-12 sm:pt-6' : 'py-8 sm:py-12'} ${readOnly ? 'cursor-default' : 'cursor-text'}`,
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
