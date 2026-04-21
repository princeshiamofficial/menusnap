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
import { getRandomColor, getGuestName } from './editor-utils'



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
    renderText() {
        return '\t'
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

export const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading', 'listItem'],
            defaultLineHeight: 'normal',
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: element => element.style.lineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) return {}
                            return { style: `line-height: ${attributes.lineHeight}` }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight: string) => ({ commands }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }))
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight: null }))
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
        lineHeight: {
            setLineHeight: (height: string) => ReturnType
            unsetLineHeight: () => ReturnType
        },
        searchReplace: {
            setSearchTerm: (term: string) => ReturnType
            goToNextResult: () => ReturnType
            goToPrevResult: () => ReturnType
        },
        textCase: {
            setTextCase: (type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot') => ReturnType
        },
        multiSelection: {
            runCommandOnAllSelections: (commandName: string, ...args: any[]) => ReturnType
        }
    }
}

export const TextCase = Extension.create({
    name: 'textCase',
                addCommands() {
                    return {
                        setTextCase: (type: 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot') => ({ state, tr }) => {
                            const { from, to } = state.selection
                            if (from === to) return false
            
                            const getWords = (str: string) => {
                                return str
                                    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
                                    .replace(/[_-]/g, ' ') // split snake/kebab
                                    .replace(/\./g, ' ') // split dot.case
                                    .trim()
                                    .split(/\s+/)
                            }

                            const transformText = (text: string) => {
                                switch (type) {
                                    case 'uppercase': return text.toUpperCase()
                                    case 'lowercase': return text.toLowerCase()
                                    case 'title': return getWords(text).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
                                    case 'sentence': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
                                    case 'camel': { 
                                        const words = getWords(text); 
                                        return words[0].toLowerCase() + words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(''); 
                                    }
                                    case 'pascal': return getWords(text).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
                                    case 'snake': return getWords(text).map(word => word.toLowerCase()).join('_');
                                    case 'kebab': return getWords(text).map(word => word.toLowerCase()).join('-');
                                    case 'constant': return getWords(text).map(word => word.toUpperCase()).join('_');
                                    case 'dot': return getWords(text).map(word => word.toLowerCase()).join('.');
                                    default: return text
                                }
                            }
            
                            const changes: { start: number, end: number, transformed: string }[] = []
                            state.doc.nodesBetween(from, to, (node, pos) => {
                                if (node.isText) {
                                    const nodeStart = Math.max(from, pos)
                                    const nodeEnd = Math.min(to, pos + node.nodeSize)
                                    const text = node.text?.slice(nodeStart - pos, nodeEnd - pos) || ''
                                    const transformed = transformText(text)
                                    changes.push({ start: nodeStart, end: nodeEnd, transformed })
                                }
                            })
                            
                            // Apply transformations in REVERSE order to preserve position integrity
                            for (let i = changes.length - 1; i >= 0; i--) {
                                const { start, end, transformed } = changes[i]
                                tr.insertText(transformed, start, end)
                            }

                            return true
                        },
                    }
                }
})

export const CategoryAutodetect = Extension.create({
    name: 'categoryAutodetect',
    addOptions() {
        return {
            levels: [2],
        }
    },
    onUpdate() {
        const { state } = this.editor
        const { selection } = state
        const { $from } = selection
        const node = $from.parent

        if (node.type.name === 'paragraph') {
            const text = node.textContent?.trim()
            // Detect all-caps categories (at least 4 chars, no digits, no dashes/prices)
            if (text && text === text.toUpperCase() && text.length >= 4 && !text.includes('-') && !text.includes(':') && !text.match(/\d/)) {
                // Use setTimeout to avoid conflict with the current update cycle
                setTimeout(() => {
                    if (this.editor.isDestroyed) return
                    const { state: currentState } = this.editor
                    if (currentState.selection.$from.parent.textContent.trim() === text) {
                        this.editor.commands.setNode('heading', { level: 2 })
                    }
                }, 10)
            }
        }
    }
})


export const MultiSelection = Extension.create({
    name: 'multiSelection',
    addStorage() {
        return {
            ranges: [] as { from: number, to: number }[],
        }
    },
    addCommands() {
        return {
            runCommandOnAllSelections: (commandName: string, ...args: any[]) => ({ editor, chain }) => {
                const ranges = [...this.storage.ranges]
                // Include current selection if not already added
                const { from, to } = editor.state.selection
                if (from !== to && !ranges.some(r => r.from === from && r.to === to)) {
                    ranges.push({ from, to })
                }

                if (ranges.length === 0) return (editor.chain().focus() as any)[commandName](...args).run()

                let c = chain().focus()
                ranges.forEach((range: { from: number, to: number }) => {
                    c = (c.setTextSelection(range) as any)[commandName](...args)
                })
                
                // Reset multi-selection after command if desired, or keep it? Google docs keeps it.
                // We'll keep it for better UX.
                return c.run()
            }
        }
    },
    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    decorations: (state) => {
                        const { ranges } = this.storage
                        if (!ranges || ranges.length === 0) return DecorationSet.empty
                        
                        const decorations = ranges.map((range: { from: number, to: number }) => 
                            Decoration.inline(range.from, range.to, { class: 'multi-selection-highlight' })
                        )
                        return DecorationSet.create(state.doc, decorations)
                    },
                    handleDOMEvents: {
                        mousedown: (view, event) => {
                            if (!event.ctrlKey && !event.metaKey) {
                                this.storage.ranges = []
                                view.dispatch(view.state.tr)
                            }
                            return false
                        },
                        mouseup: (view, event) => {
                            if (event.ctrlKey || event.metaKey) {
                                const { from, to } = view.state.selection
                                if (from !== to) {
                                    // Avoid duplicates
                                    if (!this.storage.ranges.some((r: any) => r.from === from && r.to === to)) {
                                        this.storage.ranges.push({ from, to })
                                        view.dispatch(view.state.tr)
                                    }
                                }
                            }
                            return false
                        }
                    }
                }
            })
        ]
    }
})


interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    onReady: (editor: any) => void;
    readOnly?: boolean;
    showWatermark?: boolean;
    customPaperHeader?: React.ReactNode;
    tabStops?: { position: number, type: 'left' | 'center' | 'right' }[];
    docId?: string;
    socket?: Socket | null;
    onlineUsers?: any[];
    onUpdateContent?: (html: string) => void;
}

export default function GoogleDocsEditor(props: EditorProps) {
    const { socket, onlineUsers = [] } = props
    return <GoogleDocsEditorInner {...props} socket={socket || null} onlineUsers={onlineUsers} />
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
    onlineUsers,
    onUpdateContent
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
            TextStyle, FontFamily, FontSize, Color, LineHeight,
            Highlight.configure({ multicolor: true }),
            TaskList, 
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: 'Write something or type "/" for commands...' }),
            TabNode,
            TextCase,
            MultiSelection,
            CategoryAutodetect,
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
            Extension.create({
                name: 'clipboardCustomizer',
                addProseMirrorPlugins() {
                    return [
                        new Plugin({
                            props: {
                                clipboardTextSerializer: (slice) => {
                                    const serialize = (node: any): string => {
                                        if (node.type.name === 'tabNode') return '\t'
                                        if (node.type.name === 'hardBreak') return '\n'
                                        if (node.isText) return node.text || ''
                                        
                                        let childText = ''
                                        node.content.forEach((child: any, _: any, index: number) => {
                                            if (node.type.name === 'bulletList' && child.type.name === 'listItem') {
                                                childText += '• ' + serialize(child)
                                            } else if (node.type.name === 'orderedList' && child.type.name === 'listItem') {
                                                childText += `${index + 1}. ` + serialize(child)
                                            } else {
                                                childText += serialize(child)
                                            }
                                        })
                                        
                                        return node.isBlock ? childText + '\n' : childText
                                    }
                                    
                                    let result = ''
                                    slice.content.forEach(node => {
                                        result += serialize(node)
                                    })
                                    return result.trimEnd().replace(/\u200b/g, '')
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
            if (onUpdateContent) onUpdateContent(html)
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
        <div className="flex justify-center w-full bg-[#f8f9fa] min-h-full relative">

            <div className="mt-2 sm:mt-4 mb-10 w-full max-w-[816px] mx-auto px-0 sm:px-4">
                <div className={`bg-white shadow-xl border border-gray-200 w-full ${showWatermark ? 'bg-watermark' : ''}`}>
                    {customPaperHeader}
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    )
}
