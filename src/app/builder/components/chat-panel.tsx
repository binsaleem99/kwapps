'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Send,
  Sparkles,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react'

interface ChatPanelProps {
  onGenerate: (prompt: string, projectId?: string) => Promise<void>
  isGenerating: boolean
  error: string | null
  generatedCode: {
    projectId: string
    englishPrompt: string
    tokensUsed: number
    cost: number
  } | null
}

interface UsageStats {
  plan: string
  today: { used: number; limit: number; remaining: number }
  month: { used: number; limit: number; remaining: number }
}

const EXAMPLE_PROMPTS = [
  'موقع لمطعم فاخر مع قائمة الطعام ونظام الحجوزات',
  'صفحة هبوط لتطبيق جوال مع عرض الميزات والأسعار',
  'متجر إلكتروني لبيع الملابس مع عرض المنتجات وسلة التسوق',
  'موقع شخصي للمصور مع معرض الأعمال ومعلومات التواصل',
]

export function ChatPanel({
  onGenerate,
  isGenerating,
  error,
  generatedCode,
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load usage stats
    fetchUsage()
  }, [generatedCode])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/generate')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return

    await onGenerate(prompt, generatedCode?.projectId)
    // Don't clear prompt on success - user might want to iterate
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Usage Stats */}
      {usage && (
        <div className="p-4 bg-white border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              خطة {usage.plan === 'free' ? 'مجاني' : usage.plan === 'builder' ? 'مطور' : 'احترافي'}
            </span>
            <Badge variant={usage.today.remaining > 0 ? 'default' : 'destructive'}>
              {usage.today.remaining} متبقي اليوم
            </Badge>
          </div>
          <div className="flex gap-4 text-xs text-slate-600">
            <div>
              <span className="font-medium">{usage.today.used}</span>
              <span> / {usage.today.limit} اليوم</span>
            </div>
            <div>
              <span className="font-medium">{usage.month.used}</span>
              <span> / {usage.month.limit} هذا الشهر</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">كيف يعمل؟</p>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• صف موقعك بالعربية بأكبر قدر من التفاصيل</li>
              <li>• سنقوم بترجمة وصفك وإنشاء كود React احترافي</li>
              <li>• المعاينة المباشرة تظهر على اليسار</li>
              <li>• يمكنك تعديل الوصف وإعادة الإنشاء</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-right">{error}</AlertDescription>
        </Alert>
      )}

      {/* Generation Info */}
      {generatedCode && (
        <Card className="m-4 p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">تم الإنشاء بنجاح!</p>
              <div className="text-xs text-green-800 space-y-1">
                <p>الوصف بالإنجليزية: {generatedCode.englishPrompt}</p>
                <p>
                  الرموز المستخدمة: {generatedCode.tokensUsed.toLocaleString()} (~$
                  {generatedCode.cost.toFixed(4)})
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Example Prompts */}
        {!generatedCode && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              أمثلة سريعة:
            </h3>
            <div className="grid gap-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="text-right p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-slate-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-slate-700 mb-2 text-right"
            >
              صف موقعك بالتفصيل
            </label>
            <Textarea
              ref={textareaRef}
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="مثال: أريد موقع لمطعم فاخر في الكويت، مع قائمة الطعام والأسعار، صور جذابة، قسم للحجوزات، معلومات التواصل مع خريطة الموقع..."
              className="text-right min-h-[200px] resize-none"
              disabled={isGenerating}
              dir="rtl"
            />
            <p className="text-xs text-slate-500 mt-2 text-right">
              اضغط Ctrl+Enter أو Cmd+Enter للإرسال
            </p>
          </div>

          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Send className="ml-2 h-5 w-5" />
                {generatedCode ? 'إعادة الإنشاء' : 'إنشاء الموقع'}
              </>
            )}
          </Button>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            نصائح للحصول على أفضل النتائج:
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>✓ كن محدداً في الوصف (الألوان، الأقسام، المحتوى)</li>
            <li>✓ اذكر نوع الموقع (مطعم، متجر، صفحة هبوط، إلخ)</li>
            <li>✓ حدد الميزات المطلوبة (نماذج، معرض صور، قائمة)</li>
            <li>✓ اذكر إذا كنت تريد تصميماً معيناً (كلاسيكي، عصري، إلخ)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
