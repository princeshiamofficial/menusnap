"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface RulerProps {
    onMarginsChange?: (margins: { left: number, right: number, indent: number, tabStops: any[] }) => void
}

export default function Ruler({ onMarginsChange }: RulerProps) {
    // Current positions in px relative to the 816px page
    const [leftMargin, setLeftMargin] = useState(56) // ~1.5 units * PX_PER_UNIT
    const [rightMargin, setRightMargin] = useState(760) // ~16.5 units * PX_PER_UNIT
    const [firstLineIndent, setFirstLineIndent] = useState(56)

    const [isDraggingLeft, setIsDraggingLeft] = useState(false)
    const [isDraggingRight, setIsDraggingRight] = useState(false)
    const [isDraggingIndent, setIsDraggingIndent] = useState(false)
    const [tabStops, setTabStops] = useState<{ id: string, position: number, type: 'left' | 'center' | 'right' }[]>([])
    const [activeTabDrag, setActiveTabDrag] = useState<string | null>(null)

    const rulerRef = useRef<HTMLDivElement>(null)

    const PAGE_WIDTH = 816
    const PX_PER_UNIT = PAGE_WIDTH / 18

    // Handle margin updates to parent
    useEffect(() => {
        onMarginsChange?.({
            left: leftMargin,
            right: PAGE_WIDTH - rightMargin,
            indent: firstLineIndent - leftMargin,
            tabStops: tabStops
        })
    }, [leftMargin, rightMargin, firstLineIndent, tabStops, onMarginsChange])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!rulerRef.current) return

        const rect = rulerRef.current.getBoundingClientRect()
        const relativeX = e.clientX - rect.left

        // Constraints
        const MIN_DISTANCE = 20
        const PADDING = 0

        if (isDraggingLeft) {
            const newPos = Math.max(PADDING, Math.min(relativeX, rightMargin - MIN_DISTANCE))
            setLeftMargin(newPos)
            setFirstLineIndent(newPos + (firstLineIndent - leftMargin)) // move indent with margin
        } else if (isDraggingRight) {
            const newPos = Math.max(leftMargin + MIN_DISTANCE, Math.min(relativeX, PAGE_WIDTH - PADDING))
            setRightMargin(newPos)
        } else if (isDraggingIndent) {
            const newPos = Math.max(PADDING, Math.min(relativeX, rightMargin - MIN_DISTANCE))
            setFirstLineIndent(newPos)
        } else if (activeTabDrag) {
            const newPos = Math.max(leftMargin, Math.min(relativeX, rightMargin))
            setTabStops(prev => prev.map(t => t.id === activeTabDrag ? { ...t, position: newPos } : t))
        }
    }, [isDraggingLeft, isDraggingRight, isDraggingIndent, activeTabDrag, leftMargin, rightMargin, firstLineIndent])

    const handleMouseUp = useCallback(() => {
        setIsDraggingLeft(false)
        setIsDraggingRight(false)
        setIsDraggingIndent(false)
        setActiveTabDrag(null)
    }, [])

    useEffect(() => {
        if (isDraggingLeft || isDraggingRight || isDraggingIndent || activeTabDrag) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        } else {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingLeft, isDraggingRight, isDraggingIndent, activeTabDrag, handleMouseMove, handleMouseUp])

    const handleRulerClick = (e: React.MouseEvent) => {
        if (!rulerRef.current) return
        const rect = rulerRef.current.getBoundingClientRect()
        const relativeX = e.clientX - rect.left

        // Don't add if already dragging something
        if (isDraggingLeft || isDraggingRight || isDraggingIndent || activeTabDrag) return

        // Check if we clicked near an existing tab stop to delete it (simple implementation)
        const existingIndex = tabStops.findIndex(t => Math.abs(t.position - relativeX) < 10)
        if (existingIndex !== -1) {
            if (e.button === 2) { // Right click to delete
                e.preventDefault()
                setTabStops(prev => prev.filter((_, i) => i !== existingIndex))
                return
            }
            // Cycle type on click
            const types: ('left' | 'center' | 'right')[] = ['left', 'center', 'right']
            const nextType = types[(types.indexOf(tabStops[existingIndex].type) + 1) % types.length]
            setTabStops(prev => prev.map((t, i) => i === existingIndex ? { ...t, type: nextType } : t))
            return
        }

        // Add new tab stop
        const newStop = {
            id: Math.random().toString(36).substr(2, 9),
            position: relativeX,
            type: 'left' as const
        }
        setTabStops(prev => [...prev, newStop])
    }

    // Scale marks generation
    const marks = []
    for (let i = 0; i <= 72; i++) { // 18 units * 4 marks/unit
        marks.push(i)
    }

    return (
        <div className="w-full bg-[#f8f9fa] border-b border-gray-300 relative select-none overflow-visible" style={{ height: '32px' }}>
            <div
                ref={rulerRef}
                className="mx-auto relative h-full flex items-end cursor-crosshair"
                style={{ width: `${PAGE_WIDTH}px` }}
                onClick={handleRulerClick}
                onContextMenu={(e) => {
                    e.preventDefault()
                    handleRulerClick(e as any)
                }}
            >
                {/* The scale markers */}
                {marks.map((m) => {
                    const unitValue = m / 4
                    const isFullUnit = m % 4 === 0
                    const isHalfUnit = m % 2 === 0
                    const position = unitValue * PX_PER_UNIT

                    return (
                        <div key={m} className="absolute bottom-1" style={{ left: `${position}px` }}>
                            {isFullUnit ? (
                                <>
                                    <div className="w-[1px] h-3 bg-gray-600" />
                                    {unitValue !== 0 && unitValue !== 18 && (
                                        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-600">
                                            {unitValue}
                                        </span>
                                    )}
                                </>
                            ) : isHalfUnit ? (
                                <div className="w-[1px] h-2 bg-gray-400" />
                            ) : (
                                <div className="w-[1px] h-1.5 bg-gray-300" />
                            )}
                        </div>
                    )
                })}

                {/* Left Margin Markers */}
                <div
                    className="absolute bottom-0 z-20 flex flex-col items-center cursor-ew-resize group"
                    style={{ left: `${leftMargin}px` }}
                >
                    {/* First Line Indent (Top Small Rectangle) */}
                    <div
                        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingIndent(true); }}
                        className="w-3 h-1.5 bg-[#4285f4] hover:bg-blue-600 mb-[1px] -mt-[4px]"
                        style={{ position: 'absolute', top: '-18px', left: `${firstLineIndent - leftMargin - 6}px` }}
                    />
                    {/* Left Margin (Bottom Pointer Up) */}
                    <div
                        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingLeft(true); }}
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#4285f4] hover:border-b-blue-600"
                    />
                </div>

                {/* Right Margin Marker */}
                <div
                    onMouseDown={() => setIsDraggingRight(true)}
                    className="absolute bottom-0 z-20 -translate-x-1/2 cursor-ew-resize group"
                    style={{ left: `${rightMargin}px` }}
                >
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#4285f4] hover:border-b-blue-600" />
                </div>

                {/* Tab Stops */}
                {tabStops.map(t => (
                    <div
                        key={t.id}
                        onMouseDown={(e) => { e.stopPropagation(); setActiveTabDrag(t.id); }}
                        className="absolute bottom-1 z-30 cursor-grab active:cursor-grabbing"
                        style={{ left: `${t.position}px` }}
                    >
                        {t.type === 'left' && (
                            <div className="w-0.5 h-3 bg-[#4285f4] relative">
                                <div className="absolute top-0 left-0 w-2 h-0.5 bg-[#4285f4]" />
                            </div>
                        )}
                        {t.type === 'center' && (
                            <div className="w-0.5 h-3 bg-[#4285f4] relative flex justify-center">
                                <div className="absolute top-0 w-2 h-0.5 bg-[#4285f4]" />
                            </div>
                        )}
                        {t.type === 'right' && (
                            <div className="w-0.5 h-3 bg-[#4285f4] relative">
                                <div className="absolute top-0 right-0 w-2 h-0.5 bg-[#4285f4]" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Dragging Guides */}
                {(isDraggingLeft || isDraggingIndent || activeTabDrag) && (
                    <div className="absolute top-0 bottom-[-1000px] w-[1px] border-l border-dashed border-[#4285f4] z-50 pointer-events-none"
                        style={{ left: `${isDraggingLeft ? leftMargin : isDraggingIndent ? firstLineIndent : tabStops.find(t => t.id === activeTabDrag)?.position}px` }}
                    />
                )}
                {isDraggingRight && (
                    <div className="absolute top-0 bottom-[-1000px] w-[1px] border-l border-dashed border-[#4285f4] z-50 pointer-events-none" style={{ left: `${rightMargin}px` }} />
                )}
            </div>
        </div>
    )
}
