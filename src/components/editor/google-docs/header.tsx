"use client"

import { FileText, Star, Share2, Edit3, Eye, Check, Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
    title: string
    onTitleChange: (title: string) => void
    isSaving?: boolean
    readOnly?: boolean
    docId?: string
}

export default function Header({ title, onTitleChange, isSaving, readOnly = false, docId }: HeaderProps) {
    const [isStarred, setIsStarred] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [copiedType, setCopiedType] = useState<'editor' | 'viewer' | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowShareMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin
        }
        return ''
    }

    const copyLink = (type: 'editor' | 'viewer') => {
        if (!docId) return
        const path = type === 'editor' ? `/docs/edit/${docId}` : `/docs/view/${docId}`
        const url = `${getBaseUrl()}${path}`
        navigator.clipboard.writeText(url).then(() => {
            setCopiedType(type)
            setTimeout(() => setCopiedType(null), 2000)
        })
    }

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col bg-[#f9fbfd] border-b border-[#dadce0] z-[60]"
        >
            <div className="flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2">
                <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors shrink-0"
                    >
                        <div className="bg-[#4285f4] p-1 sm:p-1.5 rounded-sm shadow-sm">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                    </motion.div>

                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-1 group">
                            {readOnly ? (
                                <span className="text-base sm:text-lg font-medium px-1 rounded font-sans cursor-default truncate max-w-[300px] sm:max-w-[500px]">
                                    {title}
                                </span>
                            ) : (
                                <input
                                    className="text-base sm:text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#4285f4] px-1 rounded hover:bg-gray-100 transition-all duration-200 w-auto min-w-[50px] font-sans truncate"
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    maxLength={104}
                                    style={{ width: `${Math.min(Math.max(title.length, 5) + 1, 105)}ch`, maxWidth: '500px' }}
                                />
                            )}
                            <motion.div whileTap={{ scale: 1.2 }} className="shrink-0">
                                <Star
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer transition-colors duration-300 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setIsStarred(!isStarred)}
                                />
                            </motion.div>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={isSaving ? 'saving' : (readOnly ? 'readonly' : 'saved')}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 5 }}
                                    className={`text-[9px] sm:text-[11px] ml-1 sm:ml-4 font-normal whitespace-nowrap ${readOnly ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100' : 'text-gray-500'}`}
                                >
                                    {isSaving ? 'Saving...' : (readOnly ? 'View only' : 'Document saved')}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Share button with dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => setShowShareMenu(prev => !prev)}
                            className="bg-[#c2e7ff] text-[#001d35] hover:bg-[#b3d7ef] gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 font-semibold text-xs sm:text-sm shadow-none transition-colors duration-200"
                        >
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Share</span>
                        </Button>
                    </motion.div>

                    <AnimatePresence>
                        {showShareMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-800 font-sans">Share document</span>
                                    <button onClick={() => setShowShareMenu(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Editor link */}
                                <button
                                    onClick={() => copyLink('editor')}
                                    disabled={!docId}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fa] transition-colors group disabled:opacity-40"
                                >
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <Edit3 className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-800 font-sans">Share as Editor</p>
                                        <p className="text-[11px] text-gray-500 font-sans">Anyone with link can edit</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {copiedType === 'editor' ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                        )}
                                    </div>
                                </button>

                                {/* Viewer link */}
                                <button
                                    onClick={() => copyLink('viewer')}
                                    disabled={!docId}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fa] transition-colors group disabled:opacity-40 border-t border-gray-50"
                                >
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                        <Eye className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-800 font-sans">Share as Viewer</p>
                                        <p className="text-[11px] text-gray-500 font-sans">Anyone with link can view</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {copiedType === 'viewer' ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                        )}
                                    </div>
                                </button>

                                {/* Copied toast */}
                                <AnimatePresence>
                                    {copiedType && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center gap-2"
                                        >
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                            <span className="text-[11px] text-green-700 font-medium font-sans">Link copied to clipboard!</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    )
}
