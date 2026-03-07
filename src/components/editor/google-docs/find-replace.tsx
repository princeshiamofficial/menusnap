"use client"

import React, { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, MoreVertical, X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

import { Editor } from '@tiptap/react'

interface FindReplaceProps {
    isOpen: boolean
    onClose: () => void
    editor: Editor | null
    onOpenDialog?: () => void
}

export default function FindReplace({ isOpen, onClose, editor, onOpenDialog }: FindReplaceProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [resultsCount, setResultsCount] = useState({ current: 0, total: 0 })
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }

        return () => {
            if (editor) {
                editor.commands.setSearchTerm('')
            }
        }
    }, [isOpen, editor])

    useEffect(() => {
        if (!editor || !isOpen) return

        if (searchTerm) {
            editor.commands.setSearchTerm(searchTerm)
            const storage = editor.storage as any
            const searchStorage = storage.searchReplace
            setResultsCount({
                current: searchStorage.results.length > 0 ? searchStorage.currentIndex + 1 : 0,
                total: searchStorage.results.length
            })
        } else {
            editor.commands.setSearchTerm('')
            setResultsCount({ current: 0, total: 0 })
        }
    }, [searchTerm, editor, isOpen])

    // Update count when navigating results
    const updateCount = () => {
        if (!editor) return
        const storage = editor.storage as any
        const searchStorage = storage.searchReplace
        setResultsCount({
            current: searchStorage.results.length > 0 ? searchStorage.currentIndex + 1 : 0,
            total: searchStorage.results.length
        })
    }

    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-[120px] right-12 z-[70] bg-white shadow-[0_1px_3px_1px_rgba(60,64,67,.15),0_1px_2px_0_rgba(60,64,67,.3)] border border-gray-200 rounded-lg py-1.5 px-3 flex items-center gap-1 min-w-[380px]"
        >
            <div className="relative flex-1 py-1 flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Find in document"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 px-3 pr-16 text-[14px] border-[2px] border-[#1a73e8] rounded-[4px] focus:outline-none placeholder-gray-500 font-sans"
                />
                {resultsCount.total > 0 && (
                    <div className="absolute right-3 text-xs text-gray-500 pointer-events-none select-none">
                        {resultsCount.current} of {resultsCount.total}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-0 ml-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={() => {
                        editor?.commands.goToPrevResult()
                        updateCount()
                    }}
                >
                    <ChevronUp className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={() => {
                        editor?.commands.goToNextResult()
                        updateCount()
                    }}
                >
                    <ChevronDown className="h-5 w-5" />
                </Button>
            </div>

            <div className="h-6 w-[1px] bg-gray-300 mx-2" />

            <div className="flex items-center gap-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={onOpenDialog}
                >
                    <MoreVertical className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </motion.div>
    )
}
