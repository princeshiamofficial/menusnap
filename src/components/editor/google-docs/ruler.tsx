"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface RulerProps {
    onMarginsChange?: (margins: { left: number, right: number, indent: number }) => void
}

export default function Ruler({ onMarginsChange }: RulerProps) {
    // Current positions in px relative to the 816px page
    const [leftMargin, setLeftMargin] = useState(56) // ~1.5 units * PX_PER_UNIT
    const [rightMargin, setRightMargin] = useState(760) // ~16.5 units * PX_PER_UNIT
    const [firstLineIndent, setFirstLineIndent] = useState(56)

    const [isDraggingLeft, setIsDraggingLeft] = useState(false)
    const [isDraggingRight, setIsDraggingRight] = useState(false)
    const [isDraggingIndent, setIsDraggingIndent] = useState(false)

    const rulerRef = useRef<HTMLDivElement>(null)

    const PAGE_WIDTH = 816
    const PX_PER_UNIT = PAGE_WIDTH / 18

    // Handle margin updates to parent
    useEffect(() => {
        onMarginsChange?.({
            left: leftMargin,
            right: PAGE_WIDTH - rightMargin,
            indent: firstLineIndent - leftMargin
        })
    }, [leftMargin, rightMargin, firstLineIndent, onMarginsChange])

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
        }
    }, [isDraggingLeft, isDraggingRight, isDraggingIndent, leftMargin, rightMargin, firstLineIndent])

    const handleMouseUp = useCallback(() => {
        setIsDraggingLeft(false)
        setIsDraggingRight(false)
        setIsDraggingIndent(false)
    }, [])

    useEffect(() => {
        if (isDraggingLeft || isDraggingRight || isDraggingIndent) {
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
    }, [isDraggingLeft, isDraggingRight, isDraggingIndent, handleMouseMove, handleMouseUp])

    // Scale marks generation
    const marks = []
    for (let i = 0; i <= 72; i++) { // 18 units * 4 marks/unit
        marks.push(i)
    }

    return (
        <div className="w-full bg-[#f8f9fa] border-b border-gray-300 relative select-none overflow-visible" style={{ height: '32px' }}>
            <div
                ref={rulerRef}
                className="mx-auto relative h-full flex items-end"
                style={{ width: `${PAGE_WIDTH}px` }}
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

                {/* Dragging Guides */}
                {(isDraggingLeft || isDraggingIndent) && (
                    <div className="absolute top-0 bottom-[-1000px] w-[1px] border-l border-dashed border-[#4285f4] z-50 pointer-events-none" style={{ left: `${isDraggingLeft ? leftMargin : firstLineIndent}px` }} />
                )}
                {isDraggingRight && (
                    <div className="absolute top-0 bottom-[-1000px] w-[1px] border-l border-dashed border-[#4285f4] z-50 pointer-events-none" style={{ left: `${rightMargin}px` }} />
                )}
            </div>
        </div>
    )
}
