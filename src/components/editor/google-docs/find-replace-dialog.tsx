"use client"

import React, { useState, useEffect, useRef } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Editor } from '@tiptap/react'

interface FindReplaceDialogProps {
    isOpen: boolean
    onClose: () => void
    editor: Editor | null
    initialSearch?: string
}

export default function FindReplaceDialog({ isOpen, onClose, editor, initialSearch = '' }: FindReplaceDialogProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch)
    const [replaceTerm, setReplaceTerm] = useState('')
    const [matchCase, setMatchCase] = useState(false)
    const [useRegex, setUseRegex] = useState(false)
    const [ignoreDiacritics, setIgnoreDiacritics] = useState(true)
    const [resultsCount, setResultsCount] = useState({ current: 0, total: 0 })
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setSearchTerm(initialSearch)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, initialSearch])

    useEffect(() => {
        if (!editor || !isOpen) return

        if (searchTerm) {
            editor.commands.setSearchTerm(searchTerm)
            updateCount()
        } else {
            editor.commands.setSearchTerm('')
            setResultsCount({ current: 0, total: 0 })
        }
    }, [searchTerm, editor, isOpen])

    const updateCount = () => {
        if (!editor) return
        const storage = (editor.storage as any).searchReplace
        setResultsCount({
            current: storage.results.length > 0 ? storage.currentIndex + 1 : 0,
            total: storage.results.length
        })
    }

    const handleNext = () => {
        editor?.commands.goToNextResult()
        updateCount()
    }

    const handlePrevious = () => {
        editor?.commands.goToPrevResult()
        updateCount()
    }

    const handleReplace = () => {
        (editor?.commands as any).replace(replaceTerm)
        updateCount()
    }

    const handleReplaceAll = () => {
        (editor?.commands as any).replaceAll(replaceTerm)
        updateCount()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-lg shadow-[0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12),0_11px_15px_-7px_rgba(0,0,0,0.2)] w-full max-w-[480px] overflow-hidden border border-gray-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h2 className="text-[22px] font-normal font-sans text-[#202124]">Find and replace</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-[#5f6368]">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="px-6 space-y-5 pb-8">
                    {/* Find */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-[#202124] min-w-[100px]">Find</label>
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-9 px-3 pr-16 text-sm border-[2px] border-[#1a73e8] rounded-[4px] focus:outline-none placeholder-gray-500 font-sans"
                            />
                            {resultsCount.total > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5f6368] font-sans">
                                    {resultsCount.current} of {resultsCount.total}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Replace with */}
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-[#202124] min-w-[100px]">Replace with</label>
                        <input
                            type="text"
                            value={replaceTerm}
                            onChange={(e) => setReplaceTerm(e.target.value)}
                            className="flex-1 h-9 px-3 text-sm border border-[#dadce0] rounded-[4px] focus:outline-none focus:border-[#1a73e8] font-sans"
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-3.5 pt-1 ml-[116px]">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="matchCase"
                                checked={matchCase}
                                onCheckedChange={(checked) => setMatchCase(checked === true)}
                                className="w-[18px] h-[18px] rounded-[2px] border-[#5f6368] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8]"
                            />
                            <label htmlFor="matchCase" className="text-sm text-[#3c4043] font-normal cursor-pointer">Match case</label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="useRegex"
                                checked={useRegex}
                                onCheckedChange={(checked) => setUseRegex(checked === true)}
                                className="w-[18px] h-[18px] rounded-[2px] border-[#5f6368] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8]"
                            />
                            <div className="flex items-center gap-1.5">
                                <label htmlFor="useRegex" className="text-sm text-[#3c4043] font-normal cursor-pointer">
                                    Use regular expressions (e.g. \n for newline, \t for tab)
                                </label>
                                <a href="#" className="text-sm text-[#1a73e8] hover:underline">Help</a>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="ignoreDiacritics"
                                checked={ignoreDiacritics}
                                onCheckedChange={(checked) => setIgnoreDiacritics(checked === true)}
                                className="w-[18px] h-[18px] rounded-[2px] border-[#5f6368] data-[state=checked]:bg-[#1a73e8] data-[state=checked]:border-[#1a73e8]"
                            />
                            <label htmlFor="ignoreDiacritics" className="text-sm text-[#3c4043] font-normal cursor-pointer">
                                Ignore diacritics (e.g. ä = a, E = É, א = א)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 mt-2 flex justify-end gap-x-2 sm:gap-x-3">
                    <Button
                        variant="outline"
                        onClick={handleReplace}
                        className="h-9 px-6 text-[#1a73e8] border-[#dadce0] font-sans font-medium text-sm hover:bg-blue-50 hover:text-blue-700"
                    >
                        Replace
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleReplaceAll}
                        className="h-9 px-6 text-[#1a73e8] border-[#dadce0] font-sans font-medium text-sm hover:bg-blue-50 hover:text-blue-700"
                    >
                        Replace all
                    </Button>
                    <Button
                        variant="default"
                        onClick={handlePrevious}
                        className="h-9 px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-sans font-medium text-sm"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleNext}
                        className="h-9 px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-sans font-medium text-sm"
                    >
                        Next
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
