'use client'

/**
 * ChatPanel Component
 *
 * AI chat interface for the builder
 * - Message history display
 * - Input with send button
 * - Shows Gemini clarifying questions
 * - Loading states with Arabic text
 * - Credit cost indicator per message
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  Send,
  Loader2,
  AlertCircle,
  Square,
  Sparkles,
  Coins,
  Bot,
  User,
  CheckCircle2,
  Circle,
  Info,
} from 'lucide-react'
import type {
  BuilderMessage,
  ClarifyingQuestionItem,
  GenerationProgress,
  CREDIT_COSTS,
} from '@/types/builder'

interface ChatPanelProps {
  projectId: string
  onCodeGenerated: (code: string) => void
  currentCode?: string
  className?: string
}

const EXAMPLE_PROMPTS = [
  'موقع لمطعم فاخر مع قائمة الطعام ونظام الحجوزات',
  'صفحة هبوط لتطبيق جوال مع عرض الميزات والأسعار',
  'متجر إلكتروني لبيع الملابس مع عرض المنتجات',
  'موقع شخصي للمصور مع معرض الأعمال',
]

export function ChatPanel({
  projectId,
  onCodeGenerated,
  currentCode,
  className,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<BuilderMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState({ balance: 100, used: 0 })
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestionItem[] | null>(null)
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch message history on mount
  useEffect(() => {
    fetchMessages()
    fetchCredits()
  }, [projectId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, clarifyingQuestions])

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

  async function fetchCredits() {
    try {
      const response = await fetch('/api/credits')
      if (response.ok) {
        const data = await response.json()
        setCredits({
          balance: data.balance || 100,
          used: data.used || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err)
    }
  }

  // Handle sending message for orchestration (Gemini analysis)
  const handleOrchestrate = useCallback(async (userPrompt: string) => {
    setIsGenerating(true)
    setError(null)
    setProgress({ stage: 'analyzing', percent: 10, message: 'جاري تحليل طلبك...' })

    // Add user message
    const userMessage: BuilderMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setPrompt('')

    try {
      // Call orchestration API (Gemini)
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          project_id: projectId,
          current_code: currentCode,
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في تحليل الطلب')
      }

      const data = await response.json()

      if (data.type === 'clarifying_questions' && data.questions?.length > 0) {
        // Show clarifying questions
        setClarifyingQuestions(data.questions)
        setProgress(null)
        setIsGenerating(false)

        // Add assistant message about questions
        const assistantMsg: BuilderMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'لدي بعض الأسئلة لفهم طلبك بشكل أفضل:',
          created_at: new Date().toISOString(),
          metadata: { type: 'question', questions: data.questions },
        }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        // Ready to generate
        await handleGenerate(userPrompt, data.parameters)
      }
    } catch (err: any) {
      console.error('Orchestration error:', err)
      setError(err.message || 'حدث خطأ أثناء تحليل الطلب')
      setIsGenerating(false)
      setProgress(null)
    }
  }, [projectId, currentCode])

  // Handle code generation (DeepSeek)
  const handleGenerate = useCallback(async (userPrompt: string, parameters?: Record<string, any>) => {
    setProgress({ stage: 'generating', percent: 30, message: 'جاري إنشاء الكود...' })

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          project_id: projectId,
          current_code: currentCode,
          parameters,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Generate error:', errorText)
        throw new Error('فشل إنشاء الكود')
      }

      // Handle SSE stream
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

              case 'code_chunk':
                accumulatedCode += event.data
                break

              case 'complete':
                totalTokens = event.data.tokens
                accumulatedCode = event.data.code

                // Add success message
                const assistantMessage: BuilderMessage = {
                  id: (Date.now() + 2).toString(),
                  role: 'assistant',
                  content: 'تم إنشاء التطبيق بنجاح!',
                  tokens_used: totalTokens,
                  credit_cost: 5,
                  created_at: new Date().toISOString(),
                  metadata: { type: 'code' },
                }
                setMessages(prev => [...prev, assistantMessage])

                // Notify parent
                onCodeGenerated(accumulatedCode)
                await fetchCredits()
                break

              case 'error':
                throw new Error(event.data.messageAr || event.data.message)
            }
          } catch (parseError) {
            console.error('Parse error:', parseError)
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('تم إيقاف التوليد')
      } else {
        setError(err.message || 'حدث خطأ أثناء إنشاء التطبيق')
      }
    } finally {
      setIsGenerating(false)
      setProgress(null)
      setClarifyingQuestions(null)
      setQuestionAnswers({})
      abortControllerRef.current = null
    }
  }, [projectId, currentCode, onCodeGenerated])

  // Handle clarifying questions submission
  const handleQuestionsSubmit = useCallback(() => {
    if (!clarifyingQuestions) return

    // Find the original prompt from messages
    const userMessages = messages.filter(m => m.role === 'user')
    const originalPrompt = userMessages[userMessages.length - 1]?.content || ''

    // Add answers as message
    const answersText = Object.entries(questionAnswers)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n')

    const answerMessage: BuilderMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: answersText || 'تم الإجابة على الأسئلة',
      created_at: new Date().toISOString(),
      metadata: { type: 'answer' },
    }
    setMessages(prev => [...prev, answerMessage])

    // Generate with parameters
    setIsGenerating(true)
    handleGenerate(originalPrompt, questionAnswers)
  }, [clarifyingQuestions, questionAnswers, messages, handleGenerate])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return

    handleOrchestrate(prompt.trim())
  }

  // Handle stop generation
  const handleStopGeneration = () => {
    abortControllerRef.current?.abort()
  }

  // Handle example prompt click
  const handleExampleClick = (example: string) => {
    setPrompt(example)
    textareaRef.current?.focus()
  }

  // Handle question answer change
  const handleAnswerChange = (key: string, value: any) => {
    setQuestionAnswers(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={cn('flex flex-col h-full bg-white', className)} dir="rtl">
      {/* Header with credits */}
      <div className="flex-shrink-0 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 font-['Cairo']">
              المحادثة
            </h2>
          </div>
          <Badge variant="outline" className="gap-1.5 font-['Cairo']">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-700">{credits.balance}</span>
            <span className="text-slate-400">رصيد</span>
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && !clarifyingQuestions && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1 font-['Cairo']">
                ابدأ بإنشاء موقعك
              </h3>
              <p className="text-sm text-slate-500 mb-6 font-['Cairo']">
                صف ما تريد إنشاءه بالعربية
              </p>

              {/* Example prompts */}
              <div className="space-y-2 max-w-sm mx-auto">
                <p className="text-xs text-slate-400 font-['Cairo'] mb-2">أمثلة:</p>
                {EXAMPLE_PROMPTS.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-right p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-slate-700 font-['Cairo']"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Clarifying Questions */}
          {clarifyingQuestions && clarifyingQuestions.length > 0 && (
            <ClarifyingQuestionsInline
              questions={clarifyingQuestions}
              answers={questionAnswers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleQuestionsSubmit}
              isLoading={isGenerating}
            />
          )}

          {/* Progress indicator */}
          {isGenerating && progress && (
            <div className="flex justify-start">
              <Card className="p-3 w-full max-w-sm bg-slate-50 border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 font-['Cairo']">
                      {progress.message}
                    </span>
                    <span className="text-xs text-slate-500 font-['Cairo']">
                      {progress.percent}%
                    </span>
                  </div>
                  <Progress value={progress.percent} className="h-1.5" />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error alert */}
      {error && (
        <div className="flex-shrink-0 px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-['Cairo']">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input form */}
      <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-slate-50">
        {/* Credit cost indicator */}
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 font-['Cairo']">
          <Info className="w-3.5 h-3.5" />
          <span>تكلفة الرسالة: 1 رصيد | الإنشاء: 5 رصيد</span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب وصفاً لموقعك هنا..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none font-['Cairo'] text-right text-sm"
            disabled={isGenerating || !!clarifyingQuestions}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          {isGenerating ? (
            <Button
              type="button"
              onClick={handleStopGeneration}
              variant="destructive"
              size="icon"
              className="self-end h-10 w-10"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!prompt.trim() || !!clarifyingQuestions}
              size="icon"
              className="self-end h-10 w-10 bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>

        <p className="text-xs text-slate-400 mt-1.5 text-right font-['Cairo']">
          Enter للإرسال | Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  )
}

// Message bubble component
function MessageBubble({ message }: { message: BuilderMessage }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-['Cairo']">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-start' : 'justify-start flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-500' : 'bg-slate-200'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-slate-600" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-3 py-2',
          isUser ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap font-['Cairo']">{message.content}</p>

        {/* Token/credit info */}
        {(message.tokens_used || message.credit_cost) && (
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/20">
            {message.tokens_used && (
              <span className="text-xs opacity-70 font-['Cairo']">
                {message.tokens_used.toLocaleString()} رمز
              </span>
            )}
            {message.credit_cost && (
              <span className="text-xs opacity-70 font-['Cairo']">
                -{message.credit_cost} رصيد
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Inline clarifying questions component
function ClarifyingQuestionsInline({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  isLoading,
}: {
  questions: ClarifyingQuestionItem[]
  answers: Record<string, any>
  onAnswerChange: (key: string, value: any) => void
  onSubmit: () => void
  isLoading: boolean
}) {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id || index} className="space-y-2">
            <p className="text-sm font-medium text-slate-900 font-['Cairo']">
              {question.question_ar}
            </p>

            {/* Multiple choice options */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="grid gap-1.5">
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.key] === option.value
                  return (
                    <button
                      key={optIndex}
                      onClick={() => onAnswerChange(question.key, option.value)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border text-right transition-colors text-sm',
                        isSelected
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className="flex-1 font-['Cairo']">{option.label_ar}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Checkbox options */}
            {question.type === 'checkboxes' && question.options && (
              <div className="grid gap-1.5">
                {question.options.map((option, optIndex) => {
                  const currentAnswers: string[] = answers[question.key] || []
                  const isSelected = currentAnswers.includes(option.value)
                  return (
                    <button
                      key={optIndex}
                      onClick={() => {
                        const newAnswers = isSelected
                          ? currentAnswers.filter(v => v !== option.value)
                          : [...currentAnswers, option.value]
                        onAnswerChange(question.key, newAnswers)
                      }}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border text-right transition-colors text-sm',
                        isSelected
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className="flex-1 font-['Cairo']">{option.label_ar}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text input */}
            {question.type === 'text' && (
              <Textarea
                value={answers[question.key] || ''}
                onChange={(e) => onAnswerChange(question.key, e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                className="min-h-[60px] text-right font-['Cairo'] text-sm"
              />
            )}
          </div>
        ))}

        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 font-['Cairo']"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري الإنشاء...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              ابدأ الإنشاء
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
