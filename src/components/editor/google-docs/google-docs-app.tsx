"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Header from './header'
import Toolbar from './toolbar'
import { Editor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamically import editor with no SSR to avoid hydrations issues
const EditorComponent = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center w-full bg-[#f8f9fa] min-h-screen pt-16 sm:pt-[100px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[816px] h-screen bg-white shadow-md py-8 px-6 sm:py-12 sm:px-16"
      >
        <div className="h-8 w-3/4 bg-gray-100 rounded mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-50 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-50 rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
          <div className="h-4 w-5/6 bg-gray-50 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
        </div>
      </motion.div>
    </div>
  )
})

export default function GoogleDocsApp({
  initialTitle = "Untitled Document",
  initialContent = "",
  onSave,
  readOnly = false,
  hideHeader = false,
  docId
}: {
  initialTitle?: string;
  initialContent?: string;
  onSave?: (data: { title: string, content: string }) => void;
  readOnly?: boolean;
  hideHeader?: boolean;
  docId?: string;
}) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Handle autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      // Logic for background autosave (e.g. to localStorage or DB)
      if (title && content) {
        setIsSaving(true)
        if (onSave) onSave({ title, content })

        // Mimic server delay for UI feedback
        setTimeout(() => setIsSaving(false), 500)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [title, content, onSave])

  // Load from props and set browser tab title
  useEffect(() => {
    setTitle(initialTitle)
    setContent(initialContent)
    document.title = `${initialTitle} - Magic Docs`
  }, [initialTitle, initialContent])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    document.title = `${newTitle} - Magic Docs`
  }, [])

  return (
    <div className="flex flex-col bg-[#f8f9fa] min-h-screen">
      {!hideHeader && (
        <div className="sticky top-0 z-[60] flex flex-col">
          <Header
            title={title}
            onTitleChange={handleTitleChange}
            isSaving={isSaving}
            readOnly={readOnly}
            docId={docId}
          />
          {!readOnly && <Toolbar editor={editor} />}
        </div>
      )}

      <main className="flex-1">
        <div className="flex justify-center py-2 sm:py-10 animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-forwards px-4">
          <EditorComponent
            content={content}
            onChange={setContent}
            onReady={setEditor}
            readOnly={readOnly}
          />
        </div>
      </main>

      <style jsx global>{`
        /* Global typography and editor specific styles */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #202124;
          transition: all 0.2s ease;
          white-space: pre-wrap;
          tab-size: 4;
          -moz-tab-size: 4;
        }

        .ProseMirror h1 { font-size: 24pt; font-weight: bold; margin-bottom: 24px; transition: color 0.2s; }
        .ProseMirror h2 { font-size: 18pt; font-weight: bold; margin-bottom: 18px; transition: color 0.2s; }
        .ProseMirror h3 { font-size: 14pt; font-weight: bold; margin-bottom: 14px; transition: color 0.2s; }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .ProseMirror li p {
          margin: 0;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #dadce0;
          padding-left: 1rem;
          color: #5f6368;
          font-style: italic;
          margin-bottom: 1rem;
        }
        
        /* Smooth selection color */
        ::selection {
          background: #c2dbff;
          color: #000;
        }

        /* Force underline to show on tab/whitespace characters */
        .ProseMirror u,
        .ProseMirror [data-type="tab"] {
          text-decoration-skip-ink: none;
          text-underline-position: under;
        }

        /* When tab node is inside an underline mark, force visible underline */
        .ProseMirror u span[data-type="tab"],
        .ProseMirror span[data-type="tab"] {
          text-decoration: inherit;
          text-decoration-skip-ink: none;
        }

        /* Custom scrollbar - thinner and smoother */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 20px;
          transition: background 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }

        @keyframes fadeIn {
          from { opacity: 0; scale: 0.98; }
          to { opacity: 1; scale: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media print {
          header, div[role="toolbar"] { display: none !important; }
          main { background: white !important; overflow: visible !important; }
          .bg-[#f8f9fa] { background: white !important; }
          .shadow-md { box-shadow: none !important; }
          .border { border: none !important; }
        }
      `}</style>
    </div>
  )
}
