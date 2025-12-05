'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, AlertCircle, Square, Sparkles, MessageSquare, Zap, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ClarificationPanel } from './clarification-panel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { GenerationMode, GeminiPlan } from '@/lib/gemini/types'

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
  onPlanGenerated?: (plan: GeminiPlan) => void
  currentCode?: string
}

interface ProgressState {
  stage: 'analyzing' | 'planning' | 'translating' | 'generating' | 'verifying' | 'securing' | 'complete'
  percent: number
  message: string
}

interface Question {
  id: string
  question: string
  options: {
    value: string
    label: string
    description: string
  }[]
}

export default function ChatPanelNew({ projectId, onCodeGenerated, onPlanGenerated, currentCode }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState({ current: 0, limit: 3, remaining: 3 })
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [clarificationQuestions, setClarificationQuestions] = useState<Question[]>([])
  const [showClarification, setShowClarification] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState('')
  const [generationMode, setGenerationMode] = useState<GenerationMode>('standard')
  const [currentPlan, setCurrentPlan] = useState<GeminiPlan | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch message history on mount
  useEffect(() => {
    fetchMessages()
    fetchUsage()
  }, [projectId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [prompt])

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
    if (isGenerating || isAnalyzing) return
    if (usage.remaining <= 0) {
      setError('لقد تجاوزت الحد اليومي للتوليد. قم بالترقية للمتابعة.')
      return
    }

    // Step 1: Analyze prompt for clarification needs
    setIsAnalyzing(true)
    setError(null)
    setPendingPrompt(prompt)

    try {
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!analyzeResponse.ok) {
        throw new Error('فشل تحليل الطلب')
      }

      const analysis = await analyzeResponse.json()

      if (analysis.needsClarification && analysis.questions && analysis.questions.length > 0) {
        // Show clarification panel
        setClarificationQuestions(analysis.questions)
        setShowClarification(true)
        setIsAnalyzing(false)
      } else {
        // No clarification needed, proceed directly
        setIsAnalyzing(false)
        await generateCode(prompt, {})
      }
    } catch (err: any) {
      console.error('Analysis error:', err)
      setIsAnalyzing(false)
      // Proceed with generation anyway
      await generateCode(prompt, {})
    }
  }

  async function handleClarificationConfirm(answers: Record<string, string>) {
    setShowClarification(false)
    await generateCode(pendingPrompt, answers)
    setPendingPrompt('')
  }

  async function handleClarificationSkip() {
    setShowClarification(false)
    await generateCode(pendingPrompt, {})
    setPendingPrompt('')
  }

  async function generateCode(userPrompt: string, clarifications: Record<string, string>) {
    setIsGenerating(true)
    setError(null)
    setProgress(null)
    setCurrentPlan(null) // Reset plan for new generation

    // Build enhanced prompt with clarifications
    let enhancedPrompt = userPrompt
    if (Object.keys(clarifications).length > 0) {
      const clarificationText = Object.entries(clarifications)
        .map(([questionId, answer]) => {
          const question = clarificationQuestions.find((q) => q.id === questionId)
          const option = question?.options.find((o) => o.value === answer)
          return option && question ? `${question.question} → ${option.label}` : ''
        })
        .filter(Boolean)
        .join('\n')

      enhancedPrompt = `${userPrompt}\n\nالتفاصيل المحددة:\n${clarificationText}`
    }

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('')

    // Create abort controller for stopping generation
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      console.log('[ChatPanel] Starting generation request...', { mode: generationMode })
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          project_id: projectId,
          current_code: currentCode,
          mode: generationMode,
        }),
        signal: abortController.signal,
      })

      console.log('[ChatPanel] Response received:', {
        ok: response.ok,
        status: response.status,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ChatPanel] Response not OK:', errorText)
        throw new Error('فشل إنشاء الكود')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let accumulatedCode = ''
      let totalTokens = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          const data = line.substring(6)
          try {
            const event = JSON.parse(data)

            switch (event.type) {
              case 'progress':
                setProgress(event.data)
                break

              case 'plan':
                // Smart mode: Gemini plan received
                if (event.data?.plan) {
                  console.log('[ChatPanel] Gemini plan received:', event.data.plan.summary)
                  setCurrentPlan(event.data.plan)
                  if (onPlanGenerated) {
                    onPlanGenerated(event.data.plan)
                  }
                }
                break

              case 'code_chunk':
                accumulatedCode += event.data
                break

              case 'complete':
                totalTokens = event.data.tokens
                accumulatedCode = event.data.code

                console.log('[ChatPanel] ========== GENERATION COMPLETE ==========')
                console.log('[ChatPanel] Total tokens:', totalTokens)
                console.log('[ChatPanel] Accumulated code length:', accumulatedCode?.length)
                console.log('[ChatPanel] Code preview:', accumulatedCode?.substring(0, 200))

                // Add assistant message
                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: 'تم إنشاء التطبيق بنجاح! ✓',
                  tokens_used: totalTokens,
                  created_at: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, assistantMessage])

                // Notify parent component
                console.log('[ChatPanel] Calling onCodeGenerated callback...')
                onCodeGenerated(accumulatedCode)
                console.log('[ChatPanel] onCodeGenerated callback completed')
                console.log('[ChatPanel] ==============================================')

                // Refresh usage stats
                await fetchUsage()
                break

              case 'error':
                console.error('[ChatPanel] Error event:', event.data)
                throw new Error(event.data.messageAr || event.data.message)
            }
          } catch (parseError) {
            console.error('[ChatPanel] Error parsing SSE event:', parseError)
          }
        }
      }
    } catch (err: any) {
      console.error('[ChatPanel] Generation error:', err)
      if (err.name === 'AbortError') {
        setError('تم إيقاف التوليد')
      } else {
        setError(err.message || 'حدث خطأ أثناء إنشاء التطبيق')
      }
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsGenerating(false)
      setProgress(null)
      abortControllerRef.current = null
    }
  }

  function handleStopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 font-['Cairo']">محادثة المشروع</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <TooltipProvider>
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setGenerationMode('standard')}
                      disabled={isGenerating || isAnalyzing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-['Cairo'] ${
                        generationMode === 'standard'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>قياسي</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-['Cairo']">
                    <p>توليد سريع باستخدام DeepSeek فقط</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setGenerationMode('smart')}
                      disabled={isGenerating || isAnalyzing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-['Cairo'] ${
                        generationMode === 'smart'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>ذكي</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-['Cairo']">
                    <p>تخطيط Gemini + توليد DeepSeek = نتائج أفضل</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Usage Counter */}
            <div className="text-sm text-gray-600 font-['Cairo'] bg-blue-50 px-3 py-1 rounded-full">
              <span className="font-bold text-blue-600">{usage.remaining}</span>
              <span className="mx-1">/</span>
              <span>{usage.limit}</span>
              <span className="mr-1">متبقي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 to-white">
        {messages.length === 0 && !showClarification && (
          <div className="text-center text-gray-500 mt-16">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-400 opacity-50" />
            <p className="text-lg mb-2 font-['Cairo'] font-semibold">ابدأ بإنشاء تطبيقك</p>
            <p className="text-sm font-['Cairo']">اكتب وصفاً لما تريد إنشاءه بالأسفل</p>
          </div>
        )}

        {messages.map((message) => {
          const isCodeMessage = message.role === 'assistant' && message.content.length > 500
          const displayContent = isCodeMessage ? 'تم إنشاء التطبيق بنجاح! ✓' : message.content

          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                    : 'bg-white border-2 border-slate-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap font-['Cairo']">{displayContent}</p>
                {message.tokens_used && (
                  <p className="text-xs mt-2 opacity-70 font-['Cairo'] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {message.tokens_used.toLocaleString()} رمز
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Clarification Panel */}
        {showClarification && (
          <ClarificationPanel
            questions={clarificationQuestions}
            onConfirm={handleClarificationConfirm}
            onSkip={handleClarificationSkip}
          />
        )}

        {/* Smart Mode Plan Card */}
        {isGenerating && currentPlan && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl px-4 py-4 w-full max-w-md shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800 font-['Cairo']">خطة Gemini</p>
              </div>
              <p className="text-sm text-gray-700 font-['Cairo'] mb-2">{currentPlan.summary}</p>
              <div className="flex flex-wrap gap-2">
                {currentPlan.sections?.slice(0, 4).map((section) => (
                  <span
                    key={section.id}
                    className="text-xs bg-white text-emerald-700 px-2 py-1 rounded-full border border-emerald-200 font-['Cairo']"
                  >
                    {section.name}
                  </span>
                ))}
                {currentPlan.sections && currentPlan.sections.length > 4 && (
                  <span className="text-xs text-emerald-600 font-['Cairo']">
                    +{currentPlan.sections.length - 4} أقسام أخرى
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && progress && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-blue-200 rounded-2xl px-4 py-4 w-full max-w-md shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-gray-900 font-['Cairo']">{progress.message}</p>
              </div>
              <Progress value={progress.percent} className="h-2" />
              <p className="text-xs text-gray-500 mt-2 font-['Cairo']">{progress.percent}%</p>
            </div>
          </div>
        )}

        {/* Analyzing Status */}
        {isAnalyzing && (
          <div className="flex justify-center">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl px-6 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-blue-900 font-['Cairo']">جاري تحليل الطلب...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-['Cairo']">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="صف التطبيق الذي تريد إنشاءه أو التعديل الذي تريده..."
            disabled={isGenerating || isAnalyzing}
            className="min-h-[80px] max-h-[200px] resize-none border-2 border-slate-200 focus:border-blue-500 rounded-xl font-['Cairo'] text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          <div className="flex gap-2">
            {isGenerating ? (
              <Button
                type="button"
                onClick={handleStopGeneration}
                variant="destructive"
                className="flex-1 h-12 font-bold font-['Cairo']"
              >
                <Square className="w-4 h-4 ml-2" />
                إيقاف التوليد
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!prompt.trim() || isGenerating || isAnalyzing || usage.remaining <= 0}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-['Cairo']"
              >
                <Send className="w-4 h-4 ml-2" />
                {currentCode ? 'تحديث التطبيق' : 'توليد التطبيق'}
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-gray-500 font-['Cairo']">
            اضغط Ctrl+Enter للإرسال
          </p>
        </form>
      </div>
    </div>
  )
}
