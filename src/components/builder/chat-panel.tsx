'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used?: number
  created_at: string
}

interface ChatPanelProps {
  projectId: string
  onCodeGenerated: (code: string) => void
  currentCode?: string
}

export default function ChatPanel({ projectId, onCodeGenerated, currentCode }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState({ current: 0, limit: 3, remaining: 3 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch message history on mount
  useEffect(() => {
    fetchMessages()
    fetchUsage()
  }, [projectId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/projects/${projectId}/messages`)
      if (!response.ok) {
        console.error(`Failed to fetch messages: ${response.status}`)
        setMessages([])
        return
      }
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setMessages([])
    }
  }

  async function fetchUsage() {
    try {
      const response = await fetch('/api/generate')
      if (!response.ok) {
        console.error(`Failed to fetch usage: ${response.status}`)
        setUsage({ current: 0, limit: 3, remaining: 3 })
        return
      }
      const data = await response.json()
      if (data.today) {
        setUsage({
          current: data.today.used || 0,
          limit: data.today.limit || 3,
          remaining: data.today.remaining || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err)
      setUsage({ current: 0, limit: 3, remaining: 3 })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!prompt.trim()) return
    if (isGenerating) return
    if (usage.remaining <= 0) {
      setError('لقد تجاوزت الحد اليومي للتوليد. قم بالترقية للمتابعة.')
      return
    }

    setIsGenerating(true)
    setError(null)

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setPrompt('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.content,
          project_id: projectId,
          current_code: currentCode,
        }),
      })

      // Check response status BEFORE parsing
      if (!response.ok) {
        let errorMessage = 'فشل إنشاء الكود'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Response wasn't JSON, try reading as text
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Only parse JSON if response was successful
      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'تم إنشاء التطبيق بنجاح! ✓',
        tokens_used: data.tokens_used,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update usage (now expects correct structure)
      if (data.usage) {
        setUsage(data.usage)
      }

      // Notify parent component with generated code
      onCodeGenerated(data.code)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء التطبيق')
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200" dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 font-['Cairo']">
            محادثة المشروع
          </h2>
          <div className="text-sm text-gray-600 font-['Cairo']">
            {usage.remaining} / {usage.limit} متبقي
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 font-['Cairo']">
            <p className="text-lg mb-2">ابدأ بإنشاء تطبيقك</p>
            <p className="text-sm">اكتب وصفاً لما تريد إنشاءه بالأسفل</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap font-['Cairo']">{message.content}</p>
              {message.tokens_used && (
                <p className="text-xs mt-1 opacity-70 font-['Cairo']">
                  {message.tokens_used.toLocaleString()} رمز
                </p>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600 font-['Cairo']">جاري الإنشاء...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-['Cairo']">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب وصفاً لتطبيقك هنا... (مثال: أريد موقع لمطعم مع قائمة الطعام)"
            className="flex-1 min-h-[80px] resize-none font-['Cairo'] text-right"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim() || usage.remaining <= 0}
            className="self-end"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right font-['Cairo']">
          اضغط Enter للإرسال، Shift+Enter لسطر جديد
        </p>
      </form>
    </div>
  )
}
