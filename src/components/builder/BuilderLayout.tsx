'use client'

/**
 * BuilderLayout Component
 *
 * Split panel layout with resizable divider
 * - Chat panel on the right (40%)
 * - Preview panel on the left (60%)
 * - Mobile: Tabs instead of split
 * - RTL support, Cairo font
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Eye, GripVertical } from 'lucide-react'

interface BuilderLayoutProps {
  chatPanel: React.ReactNode
  previewPanel: React.ReactNode
  toolbar?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

const MIN_PANEL_WIDTH = 280
const DEFAULT_CHAT_WIDTH = 40 // percentage

export function BuilderLayout({
  chatPanel,
  previewPanel,
  toolbar,
  sidebar,
  className,
}: BuilderLayoutProps) {
  const [chatWidthPercent, setChatWidthPercent] = useState(DEFAULT_CHAT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat')
  const containerRef = useRef<HTMLDivElement>(null)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Calculate from right edge for RTL
    const mouseX = e.clientX - containerRect.left
    const newChatWidth = ((containerWidth - mouseX) / containerWidth) * 100

    // Clamp to min/max values
    const minPercent = (MIN_PANEL_WIDTH / containerWidth) * 100
    const maxPercent = 100 - minPercent

    setChatWidthPercent(Math.max(minPercent, Math.min(maxPercent, newChatWidth)))
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Mobile layout with tabs
  if (isMobile) {
    return (
      <div className={cn('h-screen flex flex-col bg-slate-50', className)} dir="rtl">
        {/* Toolbar */}
        {toolbar && (
          <div className="flex-shrink-0 border-b bg-white shadow-sm">
            {toolbar}
          </div>
        )}

        {/* Main content with tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'chat' | 'preview')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="flex-shrink-0 grid grid-cols-2 mx-4 mt-2 bg-slate-100">
            <TabsTrigger
              value="chat"
              className="gap-2 font-['Cairo']"
            >
              <MessageSquare className="w-4 h-4" />
              المحادثة
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="gap-2 font-['Cairo']"
            >
              <Eye className="w-4 h-4" />
              المعاينة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-2">
            {chatPanel}
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden m-0 mt-2">
            {previewPanel}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop layout with resizable split
  return (
    <div className={cn('h-screen flex flex-col bg-slate-50', className)} dir="rtl">
      {/* Toolbar */}
      {toolbar && (
        <div className="flex-shrink-0 border-b bg-white shadow-sm">
          {toolbar}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden" ref={containerRef}>
        {/* Sidebar (optional, collapsible) */}
        {sidebar && (
          <div className="flex-shrink-0 w-64 border-l bg-white overflow-hidden">
            {sidebar}
          </div>
        )}

        {/* Preview Panel (Left side in RTL = larger portion) */}
        <div
          className="flex-1 flex flex-col bg-slate-100 overflow-hidden"
          style={{ width: `${100 - chatWidthPercent}%` }}
        >
          {previewPanel}
        </div>

        {/* Resizable Divider */}
        <div
          className={cn(
            'flex-shrink-0 w-1 bg-slate-200 hover:bg-blue-400 transition-colors cursor-col-resize relative group',
            isDragging && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
        >
          {/* Drag handle indicator */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-4 h-8 flex items-center justify-center',
              'bg-slate-200 group-hover:bg-blue-400 rounded-sm transition-colors',
              isDragging && 'bg-blue-500'
            )}
          >
            <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-white" />
          </div>
        </div>

        {/* Chat Panel (Right side in RTL = smaller portion) */}
        <div
          className="flex-shrink-0 flex flex-col bg-white overflow-hidden"
          style={{ width: `${chatWidthPercent}%` }}
        >
          {chatPanel}
        </div>
      </div>
    </div>
  )
}
