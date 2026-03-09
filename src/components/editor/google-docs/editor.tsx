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
import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Collaboration } from '@tiptap/extension-collaboration'

// Custom extension for font size
import { Extension, Node, mergeAttributes } from '@tiptap/core'

export const TabNode = Node.create({
    name: 'tabNode',
    group: 'inline',
    inline: true,
    selectable: false,
    marks: '_',
    addAttributes() {
        return {
            width: {
                default: '24px',
                parseHTML: element => element.style.width,
                renderHTML: attributes => ({
                    style: `display: inline-block; width: ${attributes.width}; white-space: pre; border-bottom: 1px transparent;`,
                }),
            },
        }
    },
    parseHTML() {
        return [
            {
                tag: 'span[data-type="tab"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'tab' }), '\t']
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

// Random pastel color for collaboration cursor
function getRandomColor() {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
    return colors[Math.floor(Math.random() * colors.length)]
}

// Random guest name
function getGuestName() {
    const adjectives = ['Swift', 'Bright', 'Calm', 'Bold', 'Wise', 'Kind']
    const nouns = ['Editor', 'Writer', 'Author', 'Scribe', 'Coder', 'Creator']
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
}

interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    onReady: (editor: any) => void;
    readOnly?: boolean;
    showWatermark?: boolean;
    customPaperHeader?: React.ReactNode;
    tabStops?: { position: number, type: 'left' | 'center' | 'right' }[];
    docId?: string; // used as the Yjs room name for collaboration
}

export default function GoogleDocsEditor(props: EditorProps) {
    const { docId } = props
    const [collabData, setCollabData] = useState<{ ydoc: Y.Doc | null; provider: WebsocketProvider | null; user: { name: string; color: string } | null }>({ ydoc: null, provider: null, user: null })

    useEffect(() => {
        if (!docId) return
        
        const baseWsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:1234'
        const WS_URL = window.location.protocol === 'https:'
            ? baseWsUrl.replace(/^ws:\/\//i, 'wss://')
            : baseWsUrl;

        const ydoc = new Y.Doc()
        const provider = new WebsocketProvider(WS_URL, `doc-${docId}`, ydoc)
        const user = { name: getGuestName(), color: getRandomColor() }
        
        setCollabData({ ydoc, provider, user })

        return () => {
            provider.destroy()
            ydoc.destroy()
        }
    }, [docId])

    if (docId && !collabData.ydoc) {
        return (
            <div className="flex items-center justify-center p-20 bg-[#f8f9fa] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground animate-pulse">Initializing Collaboration...</p>
                </div>
            </div>
        )
    }

    return <GoogleDocsEditorInner {...props} collab={collabData} />
}

function GoogleDocsEditorInner({ 
    content, 
    onChange, 
    onReady, 
    readOnly = false, 
    showWatermark = false, 
    customPaperHeader, 
    tabStops = [], 
    docId,
    collab
}: EditorProps & { collab: any }) {
    const { ydoc } = collab

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
                underline: false,
                link: false,
                ...(ydoc ? { history: false } : {}),
            }),
            ...(ydoc ? [
                Collaboration.configure({ document: ydoc }),
            ] : []),
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
                addStorage() {
                    return {
                        tabStops: [] as any[],
                    }
                },
                addKeyboardShortcuts() {
                    return {
                        Tab: () => {
                            const { state, view } = this.editor
                            const { selection } = state
                            const coords = view.coordsAtPos(selection.from)
                            const editorPort = view.dom.getBoundingClientRect()
                            const currentX = coords.left - editorPort.left

                            const stops = this.storage.tabStops || []
                            const sortedStops = [...stops].sort((a: any, b: any) => a.position - b.position)
                            const nextStop = sortedStops.find(t => t.position > currentX + 2)

                            let tabWidth = 48 

                            if (nextStop) {
                                tabWidth = nextStop.position - currentX
                            } else {
                                const nextDefault = Math.ceil((currentX + 1) / 48) * 48
                                tabWidth = nextDefault - currentX
                                if (tabWidth < 10) tabWidth += 48
                            }

                            return this.editor.chain().focus().insertContent([
                                {
                                    type: 'tabNode',
                                    attrs: { width: `${tabWidth}px` }
                                }
                            ]).run()
                        },
                        'Mod-Tab': () => {
                            if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
                                return this.editor.chain().focus().sinkListItem('listItem').run()
                            }
                            if (this.editor.isActive('taskList')) {
                                return this.editor.chain().focus().sinkListItem('taskItem').run()
                            }
                            return false
                        },
                        'Shift-Tab': () => {
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

                            this.editor.commands.setSearchTerm(searchTerm)
                            return true
                        },
                        replaceAll: (replaceWith: string) => ({ editor }) => {
                            const { results, searchTerm } = this.storage
                            if (results.length === 0) return false

                            let { tr } = editor.state
                            let offset = 0
                            results.forEach((result: any) => {
                                tr.insertText(replaceWith, result.from + offset, result.to + offset)
                                offset += replaceWith.length - (result.to - result.from)
                            })

                            editor.view.dispatch(tr)
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
        content: ydoc ? undefined : content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: `focus:outline-none min-[1056px]:min-h-[1056px] min-h-[1056px] w-full max-w-[816px] ${customPaperHeader ? 'pb-12 pt-6' : 'py-12'} ${readOnly ? 'cursor-default' : 'cursor-text'}`,
            },
        },
        autofocus: false,
        immediatelyRender: false,
    })

    useEffect(() => {
        if (editor) {
            onReady(editor)
        }
    }, [editor, onReady])

    const initializedRef = React.useRef(false)

    useEffect(() => {
        if (!editor || !ydoc || !content || initializedRef.current) return
        
        const yXml = ydoc.getXmlFragment('prosemirror')
        // Only initialize from database if Yjs is empty
        if (yXml.length === 0) {
            initializedRef.current = true
            const timer = setTimeout(() => {
                // Ensure editor still exists and is empty before setting
                if (editor.isEmpty) {
                    editor.commands.setContent(content)
                }
            }, 200)
            return () => clearTimeout(timer)
        } else {
            initializedRef.current = true
        }
    }, [editor, ydoc])


    useEffect(() => {
        if (editor && tabStops) {
            (editor.storage as any).tabKey.tabStops = tabStops
        }
    }, [editor, tabStops])

    return (
        <div className="flex justify-center w-full bg-[#f8f9fa] min-h-screen">
            <div className="mt-2 sm:mt-4 mb-10 w-full max-w-[816px] mx-auto px-0 sm:px-4">
                <div
                    className={`bg-white shadow-xl border border-gray-200 w-full ${showWatermark ? 'bg-watermark' : ''}`}
                >
                    {customPaperHeader}
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}
