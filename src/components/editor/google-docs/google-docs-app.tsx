"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Header from './header'
import Toolbar from './toolbar'
import Ruler from './ruler'
import FindReplace from './find-replace'
import FindReplaceDialog from './find-replace-dialog'
import { Editor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { getRandomColor, getGuestName } from './editor'

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
  docId,
  showWatermark = false,
  customPaperHeader,
}: {
  initialTitle?: string;
  initialContent?: string;
  onSave?: (data: { title: string, content: string }) => void;
  readOnly?: boolean;
  hideHeader?: boolean;
  docId?: string;
  showWatermark?: boolean;
  customPaperHeader?: React.ReactNode;
}) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isFindOpen, setIsFindOpen] = useState(false)
  const [isFindReplaceDialogOpen, setIsFindReplaceDialogOpen] = useState(false)
  const [margins, setMargins] = useState({ left: 56, right: 56, indent: 0, tabStops: [] as any[] })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [remoteCursors, setRemoteCursors] = useState<Record<string, any>>({})

  // Socket initialization
  useEffect(() => {
    if (!docId) return
    
    // Determine the socket URL
    // In production, we connect to the same domain (root) and let the /socket path handle the proxy
    const isProd = process.env.NODE_ENV === 'production';
    const socketUrl = isProd 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'http://localhost:1234');

    // For CyberPanel/LiteSpeed, we allow polling as a fallback 
    // but keep websocket as the primary goal.
    const socketInstance = io(socketUrl, {
        path: '/socket.io',
        transports: ['polling', 'websocket'], 
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
    });
    
    const user = { name: getGuestName(), color: getRandomColor() };
    
    socketInstance.on('connect', () => {
        socketInstance.emit('join-room', { docId, user })
    })

    socketInstance.on('users-update', (users: any[]) => {
        setOnlineUsers(users)
    })

    socketInstance.on('mouse-update', (data: any) => {
        setRemoteCursors(prev => ({
            ...prev,
            [data.userId]: {
                ...data,
                lastUpdate: Date.now()
            }
        }))
    })

    setSocket(socketInstance)

    // Cleanup idle cursors
    const interval = setInterval(() => {
        const now = Date.now()
        setRemoteCursors(prev => {
            const next = { ...prev }
            let changed = false
            for (const id in next) {
                if (now - next[id].lastUpdate > 5000) {
                    delete next[id]
                    changed = true
                }
            }
            return changed ? next : prev
        })
    }, 2000)

    return () => {
        socketInstance.disconnect()
        clearInterval(interval)
    }
  }, [docId])

  // Handle Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setIsFindOpen(true)
      }
      if (e.key === 'Escape') {
        setIsFindOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  // Set initial browser tab title and update on title change
  useEffect(() => {
    document.title = `${title} - Magic Docs`
  }, [title])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    document.title = `${newTitle} - Magic Docs`
  }, [])

  return (
    <div
      className="flex flex-col bg-[#f8f9fa] min-h-screen"
      style={{
        '--editor-left-margin': `${margins.left}px`,
        '--editor-right-margin': `${margins.right}px`,
        '--editor-first-line-indent': `${margins.indent}px`,
      } as React.CSSProperties}
    >
      {!hideHeader && (
        <div className="sticky top-0 z-[60] flex flex-col">
          <Header
            title={title}
            onTitleChange={handleTitleChange}
            isSaving={isSaving}
            readOnly={readOnly}
            docId={docId}
            onlineUsers={onlineUsers}
          />
          {!readOnly && (
            <>
              <Toolbar editor={editor} title={title} />
              <Ruler onMarginsChange={setMargins} />
            </>
          )}
        </div>
      )}

      <main className="flex-1">
        <div className="flex justify-center py-10 px-4">
          <EditorComponent
            content={content}
            onChange={setContent}
            onReady={setEditor}
            readOnly={readOnly}
            showWatermark={showWatermark}
            customPaperHeader={customPaperHeader}
            tabStops={margins.tabStops}
            docId={docId}
            socket={socket}
            onlineUsers={onlineUsers}
            remoteCursors={remoteCursors}
          />
        </div>
      </main>

      <AnimatePresence>
        {isFindOpen && (
          <FindReplace
            isOpen={isFindOpen}
            onClose={() => setIsFindOpen(false)}
            editor={editor}
            onOpenDialog={() => {
              setIsFindOpen(false)
              setIsFindReplaceDialogOpen(true)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFindReplaceDialogOpen && (
          <FindReplaceDialog
            isOpen={isFindReplaceDialogOpen}
            onClose={() => setIsFindReplaceDialogOpen(false)}
            editor={editor}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        /* Global typography and editor specific styles */
        .search-result {
          background-color: #ceead6;
          color: black;
          border-radius: 2px;
        }

        .search-result-current {
          background-color: #f7e200;
          color: black;
          border-radius: 2px;
          box-shadow: 0 0 0 1px #fbc02d;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror {
          padding-left: var(--editor-left-margin, 56px);
          padding-right: var(--editor-right-margin, 56px);
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #202124;
          transition: all 0.2s ease;
          white-space: pre-wrap;
          tab-size: 4;
          -moz-tab-size: 4;
        }

        @media (max-width: 640px) {
          .ProseMirror {
             padding-left: 16px !important;
             padding-right: 16px !important;
          }
          
          /* Responsive Name-Price Alignment */
          /* Only apply flex if the paragraph contains a tab node (used as a spacer/separator) */
          .ProseMirror p:has(span[data-type="tab"]) {
            display: flex;
            flex-wrap: nowrap;
            align-items: baseline;
            gap: 4px;
            width: 100%;
          }
          
          .ProseMirror p:has(span[data-type="tab"]) span[data-type="tab"] {
            flex-grow: 1;
            width: auto !important;
            min-width: 8px;
            display: inline-block;
          }
          
          /* The last child (usually the price) goes to the right */
          .ProseMirror p:has(span[data-type="tab"]) > *:last-child {
            white-space: nowrap;
            margin-left: auto;
            flex-shrink: 0;
          }
        }

        .ProseMirror p {
          text-indent: var(--editor-first-line-indent, 0px);
          margin-bottom: 0.5rem;
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
