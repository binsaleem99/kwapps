'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PreviewIframe } from '@/components/preview-iframe'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Code,
  Eye,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TEST_PROMPTS = [
  {
    title: 'موقع مطعم',
    prompt:
      'أريد موقع لمطعم كويتي فاخر، مع قائمة الطعام والأسعار بالدينار الكويتي، قسم للحجوزات، معلومات التواصل مع خريطة، صور جذابة للأطباق',
  },
  {
    title: 'صفحة هبوط',
    prompt:
      'صفحة هبوط لتطبيق جوال لإدارة المهام، مع عرض الميزات الرئيسية، قسم الأسعار (مجاني، احترافي، مؤسسات)، زر تحميل من App Store و Google Play',
  },
  {
    title: 'متجر إلكتروني',
    prompt:
      'متجر إلكتروني لبيع الملابس النسائية، مع عرض المنتجات في شبكة، فلاتر حسب الفئة والسعر، أيقونة سلة التسوق، قسم للعروض الخاصة',
  },
  {
    title: 'موقع شخصي',
    prompt:
      'موقع شخصي لمصور فوتوغرافي، مع معرض أعمال يعرض الصور بشكل جميل، قسم عني، خدماتي، معلومات التواصل مع نموذج للتواصل',
  },
]

interface TestResult {
  success: boolean
  code?: string
  projectId?: string
  englishPrompt?: string
  tokensUsed?: number
  cost?: number
  issues?: string[]
  vulnerabilities?: string[]
  error?: string
  errorAr?: string
  verificationResults?: VerificationResult[]
}

interface VerificationResult {
  check: string
  passed: boolean
  details?: string
}

export default function TestPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const handleGenerate = async (testPrompt?: string) => {
    const promptToUse = testPrompt || prompt
    if (!promptToUse.trim()) return

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToUse,
          projectName: `Test - ${new Date().toLocaleTimeString('ar-KW')}`,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setResult({
          success: false,
          error: data.error,
          errorAr: data.errorAr,
        })
        return
      }

      // Verify the generated code
      const verificationResults = verifyCode(data.code)

      setResult({
        success: true,
        code: data.code,
        projectId: data.projectId,
        englishPrompt: data.englishPrompt,
        tokensUsed: data.tokensUsed,
        cost: data.cost,
        issues: data.issues,
        vulnerabilities: data.vulnerabilities,
        verificationResults,
      })
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const verifyCode = (code: string): VerificationResult[] => {
    const checks: VerificationResult[] = []

    // Check 1: RTL directive
    checks.push({
      check: 'dir="rtl" on root element',
      passed: code.includes('dir="rtl"'),
      details: code.includes('dir="rtl"')
        ? 'Found RTL directive'
        : 'Missing dir="rtl"',
    })

    // Check 2: Arabic text
    const hasArabic = /[\u0600-\u06FF]/.test(code)
    checks.push({
      check: 'Contains Arabic text',
      passed: hasArabic,
      details: hasArabic
        ? 'Arabic characters detected'
        : 'No Arabic text found',
    })

    // Check 3: Cairo font
    checks.push({
      check: 'Uses Cairo font',
      passed: code.includes('Cairo'),
      details: code.includes('Cairo')
        ? 'Cairo font referenced'
        : 'Cairo font not found',
    })

    // Check 4: text-right class
    checks.push({
      check: 'RTL text alignment (text-right)',
      passed: code.includes('text-right'),
      details: code.includes('text-right')
        ? 'Found text-right classes'
        : 'Missing text-right classes',
    })

    // Check 5: No 21st.dev components
    checks.push({
      check: 'No 21st.dev components',
      passed: !code.includes('21st.dev') && !code.includes('21stdev'),
      details:
        !code.includes('21st.dev') && !code.includes('21stdev')
          ? 'Only MIT components used'
          : 'Found 21st.dev references',
    })

    // Check 6: shadcn/ui imports
    checks.push({
      check: 'Uses shadcn/ui components',
      passed: code.includes('@/components/ui/'),
      details: code.includes('@/components/ui/')
        ? 'shadcn imports found'
        : 'No shadcn imports',
    })

    // Check 7: No purple gradients (AI slop check)
    const hasPurpleGradient =
      code.includes('purple') && code.includes('gradient')
    checks.push({
      check: 'No purple gradients (AI slop check)',
      passed: !hasPurpleGradient,
      details: hasPurpleGradient
        ? 'Found purple gradient - AI slop detected'
        : 'Clean color palette',
    })

    // Check 8: No security issues
    const hasSecurityIssues =
      code.includes('eval(') ||
      code.includes('dangerouslySetInnerHTML') ||
      code.includes('Function(')
    checks.push({
      check: 'No security vulnerabilities',
      passed: !hasSecurityIssues,
      details: hasSecurityIssues
        ? 'Security issues detected'
        : 'No security issues',
    })

    return checks
  }

  const passedChecks = result?.verificationResults?.filter((r) => r.passed).length || 0
  const totalChecks = result?.verificationResults?.length || 0
  const allPassed = passedChecks === totalChecks

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            صفحة اختبار إنشاء الكود
          </h1>
          <p className="text-slate-600">
            اختبر توليد الكود بالذكاء الاصطناعي وتحقق من الامتثال لـ RTL والعربية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Test Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أمثلة اختبار سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TEST_PROMPTS.map((test, i) => (
                  <Button
                    key={i}
                    onClick={() => {
                      setPrompt(test.prompt)
                      handleGenerate(test.prompt)
                    }}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full text-right justify-start h-auto py-3"
                  >
                    <div className="text-right">
                      <div className="font-medium">{test.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {test.prompt.substring(0, 80)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Custom Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اختبار مخصص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="اكتب وصفاً مخصصاً للاختبار..."
                  className="min-h-[150px] text-right"
                  dir="rtl"
                />
                <Button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Code className="ml-2 h-5 w-5" />
                      اختبار التوليد
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    نتائج الاختبار
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.success ? (
                    <>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-slate-100 rounded">
                          <div className="text-slate-600 text-xs">الرموز</div>
                          <div className="font-semibold">
                            {result.tokensUsed?.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-100 rounded">
                          <div className="text-slate-600 text-xs">التكلفة</div>
                          <div className="font-semibold">
                            ${result.cost?.toFixed(4)}
                          </div>
                        </div>
                      </div>

                      {/* English Prompt */}
                      {result.englishPrompt && (
                        <div>
                          <div className="text-xs text-slate-600 mb-1">
                            الترجمة الإنجليزية:
                          </div>
                          <div className="text-sm p-2 bg-slate-100 rounded">
                            {result.englishPrompt}
                          </div>
                        </div>
                      )}

                      {/* Verification Results */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            التحقق من الجودة
                          </span>
                          <Badge
                            variant={allPassed ? 'default' : 'destructive'}
                          >
                            {passedChecks} / {totalChecks}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {result.verificationResults?.map((check, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded"
                            >
                              {check.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="font-medium">{check.check}</div>
                                {check.details && (
                                  <div className="text-xs text-slate-600">
                                    {check.details}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Issues */}
                      {result.issues && result.issues.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="text-sm font-medium mb-1">
                              مشاكل RTL تم إصلاحها:
                            </div>
                            <ul className="text-xs space-y-1">
                              {result.issues.map((issue, i) => (
                                <li key={i}>• {issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.errorAr || result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Section */}
          <div>
            <Card className="h-[800px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  معاينة مباشرة
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                {isGenerating ? (
                  <div className="h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        جاري إنشاء الكود...
                      </p>
                    </div>
                  </div>
                ) : result?.code ? (
                  <Tabs defaultValue="preview" className="h-full flex flex-col">
                    <TabsList className="mx-4">
                      <TabsTrigger value="preview">معاينة</TabsTrigger>
                      <TabsTrigger value="code">الكود</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="flex-1 mt-0">
                      <PreviewIframe code={result.code} />
                    </TabsContent>
                    <TabsContent
                      value="code"
                      className="flex-1 mt-0 overflow-auto"
                    >
                      <pre className="p-4 text-xs bg-slate-900 text-slate-100 h-full overflow-auto">
                        <code>{result.code}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center text-slate-400">
                      <Code className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">اختر مثالاً أو اكتب وصفاً للاختبار</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
