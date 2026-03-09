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
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Plugin, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { io, Socket } from 'socket.io-client'

// ... (TabNode, FontSize, TextCase remain the same)
// I'll skip re-writing them in this replacement block for brevity if the tool allows, 
// but I must ensure they stay. I'll include them to be safe.

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
                        setTextCase: (type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot') => ({ editor, chain }: { editor: any, chain: any }) => {
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
                                case 'uppercase': transformedText = text.toUpperCase(); break
                                case 'lowercase': transformedText = text.toLowerCase(); break
                                case 'title': transformedText = getWords(text).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '); break
                                case 'sentence': transformedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); break
                                case 'camel': { const words = getWords(text); transformedText = words[0].toLowerCase() + words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''); break }
                                case 'pascal': transformedText = getWords(text).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''); break
                                case 'snake': transformedText = getWords(text).map(word => word.toLowerCase()).join('_'); break
                                case 'kebab': transformedText = getWords(text).map(word => word.toLowerCase()).join('-'); break
                                case 'constant': transformedText = getWords(text).map(word => word.toUpperCase()).join('_'); break
                                case 'dot': transformedText = getWords(text).map(word => word.toLowerCase()).join('.'); break
                            }
            
                            return chain().insertContent(transformedText).setTextSelection({ from, to: from + transformedText.length }).run()
                        },
                    }
                }
})

// Random color for presence
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
    docId?: string;
}

export default function GoogleDocsEditor(props: EditorProps) {
    const { docId } = props
    const [socket, setSocket] = useState<Socket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])

    useEffect(() => {
        if (!docId) return
        
        const baseWsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'http://localhost:1234'
        const socketInstance = io(baseWsUrl)
        
        const user = { name: getGuestName(), color: getRandomColor() }
        
        socketInstance.on('connect', () => {
            socketInstance.emit('join-room', { docId, user })
        })

        socketInstance.on('users-update', (users: any[]) => {
            setOnlineUsers(users)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [docId])

    return <GoogleDocsEditorInner {...props} socket={socket} onlineUsers={onlineUsers} />
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
    socket,
    onlineUsers
}: EditorProps & { socket: Socket | null, onlineUsers: any[] }) {
    const isRemoteUpdate = useRef(false)

    const editor = useEditor({
        parseOptions: {
            preserveWhitespace: 'full',
        },
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
                underline: false,
                link: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'max-w-full h-auto rounded-lg shadow-sm block mx-auto my-4' },
            }),
            Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle, FontFamily, FontSize, Color,
            Highlight.configure({ multicolor: true }),
            TaskList, 
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: 'Write something or type "/" for commands...' }),
            TabNode,
            TextCase,
            Extension.create({
                name: 'tabKey',
                priority: 1000,
                addStorage() { return { tabStops: [] as any[] } },
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
                            if (nextStop) tabWidth = nextStop.position - currentX
                            else {
                                const nextDefault = Math.ceil((currentX + 1) / 48) * 48
                                tabWidth = nextDefault - currentX
                                if (tabWidth < 10) tabWidth += 48
                            }
                            return this.editor.chain().focus().insertContent([{ type: 'tabNode', attrs: { width: `${tabWidth}px` } }]).run()
                        },
                    }
                },
            }),
            Extension.create({
                name: 'searchReplace',
                addStorage() { return { searchTerm: '', results: [] as { from: number; to: number }[], currentIndex: 0 } },
                addCommands() {
                    return {
                        setSearchTerm: (term: string) => ({ editor }: { editor: any }) => {
                            this.storage.searchTerm = term
                            this.storage.results = []
                            this.storage.currentIndex = 0
                            if (term) {
                                const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
                                editor.state.doc.descendants((node: any, pos: number) => {
                                    if (node.isText) {
                                        const text = node.text || ''
                                        let match
                                        while ((match = regex.exec(text)) !== null) {
                                            this.storage.results.push({ from: pos + match.index, to: pos + match.index + match[0].length })
                                        }
                                    }
                                })
                            }
                            const { tr } = editor.state
                            editor.view.dispatch(tr)
                            return true
                        },
                        goToNextResult: () => ({ editor }: { editor: any }) => {
                            if (this.storage.results.length === 0) return false
                            this.storage.currentIndex = (this.storage.currentIndex + 1) % this.storage.results.length
                            const result = this.storage.results[this.storage.currentIndex]
                            editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, result.from)).scrollIntoView())
                            return true
                        },
                        goToPrevResult: () => ({ editor }: { editor: any }) => {
                            if (this.storage.results.length === 0) return false
                            this.storage.currentIndex = (this.storage.currentIndex - 1 + this.storage.results.length) % this.storage.results.length
                            const result = this.storage.results[this.storage.currentIndex]
                            editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, result.from)).scrollIntoView())
                            return true
                        },
                    } as any
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
                                            decorations.push(Decoration.inline(result.from, result.to, {
                                                class: isCurrent ? 'search-result-current' : 'search-result',
                                                style: isCurrent ? 'background-color: #f7e200; color: black;' : 'background-color: #ceead6; color: black;'
                                            }))
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
            const html = editor.getHTML()
            onChange(html)
            if (!isRemoteUpdate.current && socket && docId) {
                socket.emit('content-change', { docId, content: html })
            }
            isRemoteUpdate.current = false
        },
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: `focus:outline-none min-[1056px]:min-h-[1056px] min-h-[1056px] w-full max-w-[816px] ${customPaperHeader ? 'pb-12 pt-6' : 'py-12'} ${readOnly ? 'cursor-default' : 'cursor-text'}`,
            },
        },
        autofocus: false,
        immediatelyRender: false,
    }, [socket, docId]) // Re-initialized when socket connects

    useEffect(() => {
        if (editor) onReady(editor)
    }, [editor, onReady])

    useEffect(() => {
        if (!editor || !socket || !docId) return

        socket.on('document-update', (newContent: string) => {
            if (editor.getHTML() !== newContent) {
                isRemoteUpdate.current = true
                editor.commands.setContent(newContent, { emitUpdate: false })
            }
        })

        return () => {
            socket.off('document-update')
        }
    }, [editor, socket, docId])

    const initializedRef = React.useRef(false)
    useEffect(() => {
        if (!editor || !content || initializedRef.current) return
        initializedRef.current = true
        editor.commands.setContent(content)
    }, [editor, content])

    useEffect(() => {
        if (editor && tabStops) (editor.storage as any).tabKey.tabStops = tabStops
    }, [editor, tabStops])

    return (
        <div className="flex justify-center w-full bg-[#f8f9fa] min-h-screen relative">
            {/* Online Users Indicator */}
            <div className="fixed bottom-4 right-4 z-[100] flex -space-x-2">
                {onlineUsers.map((u, i) => (
                    <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                        style={{ backgroundColor: u.color }}
                        title={u.name}
                    >
                        {u.name.charAt(0)}
                    </div>
                ))}
            </div>

            <div className="mt-2 sm:mt-4 mb-10 w-full max-w-[816px] mx-auto px-0 sm:px-4">
                <div className={`bg-white shadow-xl border border-gray-200 w-full ${showWatermark ? 'bg-watermark' : ''}`}>
                    {customPaperHeader}
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}
