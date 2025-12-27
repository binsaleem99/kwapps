/**
 * VisualEditorLayout - Split-Panel Visual Editor
 *
 * Left Panel: Arabic chat interface
 * Right Panel: Live preview with element selection
 *
 * Features:
 * - Real-time code preview
 * - Element highlighting on hover
 * - Click to select elements
 * - Undo/redo (50 steps, FREE)
 * - Credit display
 * - Suggested actions
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Undo2, Redo2, Save, Eye, Code, Smartphone, Monitor } from 'lucide-react'
import { UndoRedoManager } from '@/lib/visual-editor/undo-redo-manager'
import { domAnalyzer } from '@/lib/visual-editor/dom-analyzer'
import { codeModifier } from '@/lib/visual-editor/code-modifier'

interface VisualEditorLayoutProps {
  projectId: string
  initialCode: string
  onSave: (code: string) => Promise<void>
}

export function VisualEditorLayout({
  projectId,
  initialCode,
  onSave,
}: VisualEditorLayoutProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [currentCode, setCurrentCode] = useState(initialCode)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [undoManager, setUndoManager] = useState<UndoRedoManager | null>(null)

  const previewRef = useRef<HTMLIFrameElement>(null)

  // Initialize session
  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    // Create editor session
    const response = await fetch('/api/visual-editor/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, initialCode }),
    })

    const data = await response.json()
    setSessionId(data.sessionId)
    setCreditsRemaining(data.creditsRemaining)

    // Initialize undo/redo manager
    const manager = new UndoRedoManager(data.sessionId)
    setUndoManager(manager)

    // Save initial snapshot
    await manager.saveSnapshot(initialCode, 'الحالة الأولية', 0)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsSending(true)

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, creditsUsed: 0 },
    ])

    try {
      // 1. Analyze request with Gemini
      const analysis = await domAnalyzer.analyze({
        projectCode: currentCode,
        userRequest: userMessage,
        currentPage: 'main',
        previousChanges: [],
      })

      if (!analysis.understood || analysis.clarificationNeeded) {
        // Ask for clarification
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: analysis.clarificationNeeded || 'لم أفهم الطلب، يرجى التوضيح',
            creditsUsed: 0,
          },
        ])
        return
      }

      // 2. Modify code with DeepSeek
      const modification = await codeModifier.modifyCode({
        projectCode: currentCode,
        changes: analysis.suggestedChanges,
        validateRTL: true,
      })

      if (!modification.success) {
        throw new Error(modification.error || 'فشل التعديل')
      }

      // 3. Update code and preview
      setCurrentCode(modification.newCode)
      updatePreview(modification.newCode)

      // 4. Save snapshot for undo
      if (undoManager) {
        await undoManager.saveSnapshot(
          modification.newCode,
          analysis.suggestedChanges[0]?.descriptionAr || 'تعديل',
          modification.creditsUsed
        )
      }

      // 5. Update credits
      setCreditsRemaining((prev) => prev - modification.creditsUsed)

      // 6. Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `✓ ${analysis.interpretation}\n\n💎 استخدم ${modification.creditsUsed} رصيد`,
          creditsUsed: modification.creditsUsed,
        },
      ])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ خطأ: ${error.message}`,
          creditsUsed: 0,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleUndo = async () => {
    if (!undoManager) return

    const previous = await undoManager.undo()
    if (previous) {
      setCurrentCode(previous.code)
      updatePreview(previous.code)

      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `↶ تراجع: ${previous.descriptionAr}`,
          creditsUsed: 0,
        },
      ])
    }
  }

  const handleRedo = async () => {
    if (!undoManager) return

    const next = await undoManager.redo()
    if (next) {
      setCurrentCode(next.code)
      updatePreview(next.code)

      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `↷ إعادة: ${next.descriptionAr}`,
          creditsUsed: 0,
        },
      ])
    }
  }

  const handleSave = async () => {
    await onSave(currentCode)
    alert('تم الحفظ بنجاح!')
  }

  const updatePreview = (code: string) => {
    if (previewRef.current) {
      const iframe = previewRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(code)
        doc.close()
      }
    }
  }

  return (
    <div className="flex h-screen" dir="rtl">
      {/* Left Panel: Chat */}
      <div className="w-1/3 border-e border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">المحرر المرئي</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💎 {creditsRemaining} رصيد متبقي
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-white ms-8'
                  : 'bg-gray-100 dark:bg-gray-800 me-8'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب التعديل المطلوب..."
              disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending}>
              إرسال
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleUndo} title="تراجع (مجاني)">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo} title="إعادة (مجاني)">
              <Redo2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 me-2" />
              حفظ
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={deviceView === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceView === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceView('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Iframe */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            className={`mx-auto bg-white rounded-lg shadow-2xl overflow-hidden ${
              deviceView === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}
          >
            <iframe
              ref={previewRef}
              className="w-full h-full min-h-[800px] border-0"
              title="معاينة"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  creditsUsed: number
}
