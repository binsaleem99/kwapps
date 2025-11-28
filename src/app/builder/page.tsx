'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ChatPanel from '@/components/builder/chat-panel'
import PreviewPanel from '@/components/builder/preview-panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Code, ArrowLeft } from 'lucide-react'
import { DeployButton } from '@/components/deploy/DeployButton'

export default function BuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdParam = searchParams.get('project')

  const [projectId, setProjectId] = useState<string | null>(projectIdParam)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>('مشروع جديد')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadProject()
  }, [projectIdParam])

  async function checkAuthAndLoadProject() {
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
        .single()

      if (!projectError && project) {
        setProjectId(project.id)
        setProjectName(project.name)
        setGeneratedCode(project.generated_code || null)
      } else {
        // Project not found or doesn't belong to user, create new one
        await createNewProject(user.id)
      }
    } else {
      // No project ID, create new project
      await createNewProject(user.id)
    }

    setIsLoading(false)
  }

  async function createNewProject(userId: string) {
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
      .single()

    if (!error && newProject) {
      setProjectId(newProject.id)
      setProjectName(newProject.name)
      // Update URL with new project ID
      router.replace(`/builder?project=${newProject.id}`)
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
          <PreviewPanel code={generatedCode} isLoading={false} />
        </div>

        {/* Chat Panel - Right Side (30% width) */}
        <div className="w-[30%] flex flex-col">
          <ChatPanel
            projectId={projectId}
            onCodeGenerated={handleCodeGenerated}
            currentCode={generatedCode || undefined}
          />
        </div>
      </div>
    </div>
  )
}
