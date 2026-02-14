import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'sidebar-width'
const DEFAULT_WIDTH = 280
const MIN_WIDTH = 200
const MAX_WIDTH = 600

interface ResizablePanelProps {
  children: React.ReactNode
  className?: string
  storageKey?: string
}

export function ResizablePanel({ children, className, storageKey }: ResizablePanelProps) {
  const effectiveKey = storageKey ?? STORAGE_KEY

  const [width, setWidth] = useState(() => {
    const stored = localStorage.getItem(effectiveKey)
    if (stored) {
      const parsed = Number(stored)
      if (!Number.isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        return parsed
      }
    }
    return DEFAULT_WIDTH
  })

  const [isDragging, setIsDragging] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  // Toggle body classes during drag to prevent text selection and set cursor
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('select-none', 'cursor-col-resize')
    } else {
      document.body.classList.remove('select-none', 'cursor-col-resize')
    }
    return () => {
      document.body.classList.remove('select-none', 'cursor-col-resize')
    }
  }, [isDragging])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
    setWidth(newWidth)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
    localStorage.setItem(effectiveKey, width.toString())
  }

  return (
    <div
      className={`relative shrink-0 border-r border-border bg-sidebar ${className ?? ''}`}
      style={{ width }}
    >
      {/* Content area — fills the panel, clips slide animations */}
      <div className="absolute inset-0 flex flex-col overflow-x-hidden">
        {children}
      </div>

      {/* Resize handle */}
      <div
        ref={handleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`absolute right-0 top-0 bottom-0 z-10 w-1 cursor-col-resize transition-colors ${
          isDragging ? 'bg-primary/30' : 'hover:bg-primary/20'
        }`}
      />
    </div>
  )
}
