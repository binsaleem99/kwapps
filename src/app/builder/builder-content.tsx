'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ChatPanel from '@/components/builder/chat-panel'
import PreviewPanel from '@/components/builder/preview-panel'
import { BuilderErrorBoundary } from '@/components/builder/error-boundary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Code, ArrowLeft, AlertCircle } from 'lucide-react'
import { DeployButton } from '@/components/deploy/DeployButton'

export function BuilderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('project')

  const [projectId, setProjectId] = useState<string | null>(projectIdParam)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>('مشروع جديد')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadProject()
  }, [projectIdParam])

  async function checkAuthAndLoadProject() {
    try {
      const supabase = createClient()

      // SECURITY: Use getUser() to validate with Auth server
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login?redirectTo=/builder')
        return
      }

      // If project ID provided, load existing project
      if (projectIdParam) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id, name, generated_code, status')
          .eq('id', projectIdParam)
          .eq('user_id', user.id)
          .maybeSingle()

        if (projectError) {
          console.error('Error loading project:', projectError)
          await createNewProject(user.id)
        } else if (project) {
          setProjectId(project.id)
          setProjectName(project.name)
          setGeneratedCode(project.generated_code || null)
        } else {
          // Project not found, create new one
          await createNewProject(user.id)
        }
      } else {
        // No project ID, create new project
        await createNewProject(user.id)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load builder:', error)
      setIsLoading(false)
      setError('حدث خطأ أثناء تحميل المشروع. يرجى المحاولة مرة أخرى.')
    }
  }

  async function createNewProject(userId: string) {
    try {
      const supabase = createClient()

      const newProjectName = `مشروع ${new Date().toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: newProjectName,
          status: 'draft',
        })
        .select('id, name')
        .maybeSingle()

      if (error) {
        console.error('Failed to create project:', error)
        setError('فشل إنشاء المشروع. يرجى المحاولة مرة أخرى.')
        return
      }

      if (newProject) {
        setProjectId(newProject.id)
        setProjectName(newProject.name)
        // Update URL with new project ID
        router.replace(`/builder?project=${newProject.id}`)
      }
    } catch (error) {
      console.error('Unexpected error creating project:', error)
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
    }
  }

  function handleCodeGenerated(code: string) {
    setGeneratedCode(code)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600 font-['Cairo']">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 font-['Cairo'] mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                checkAuthAndLoadProject()
              }}
              className="font-['Cairo']"
            >
              إعادة المحاولة
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="font-['Cairo']"
            >
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!projectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-red-600 font-['Cairo']">حدث خطأ في تحميل المشروع</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-['Cairo']">{projectName}</h1>
            <p className="text-sm text-slate-600 font-['Cairo']">منشئ المواقع بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {generatedCode && (
            <Badge className="bg-green-500 text-white font-['Cairo']">
              <Code className="w-3 h-3 ml-1" />
              تم الإنشاء
            </Badge>
          )}
          <DeployButton
            projectId={projectId}
            hasCode={!!generatedCode}
          />
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="font-['Cairo']"
          >
            لوحة التحكم
          </Button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel - Left Side (70% width) */}
        <div className="w-[70%] flex flex-col bg-slate-100">
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في معاينة التطبيق.">
            <PreviewPanel code={generatedCode} isLoading={false} />
          </BuilderErrorBoundary>
        </div>

        {/* Chat Panel - Right Side (30% width) */}
        <div className="w-[30%] flex flex-col">
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في لوحة المحادثة.">
            <ChatPanel
              projectId={projectId}
              onCodeGenerated={handleCodeGenerated}
              currentCode={generatedCode || undefined}
            />
          </BuilderErrorBoundary>
        </div>
      </div>
    </div>
  )
}
