'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import ChatPanelNew from '@/components/builder/chat-panel-new'
import PreviewPanel from '@/components/builder/preview-panel'
import { BuilderNav } from '@/components/builder/builder-nav'
import { BuilderErrorBoundary } from '@/components/builder/error-boundary'
import { Button } from '@/components/ui/button'
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react'

export function BuilderPageContentNew() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isLoaded } = useAuth()
  const projectIdParam = searchParams.get('project')

  const [projectId, setProjectId] = useState<string | null>(projectIdParam)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>('مشروع جديد')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      checkAuthAndLoadProject()
    }
  }, [projectIdParam, isLoaded, userId])

  async function checkAuthAndLoadProject() {
    if (!userId) {
      router.push('/sign-in?redirect_url=/builder')
      return
    }

    try {
      const supabase = createClient()

      // If project ID provided, load existing project
      if (projectIdParam) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id, name, generated_code, status')
          .eq('id', projectIdParam)
          .eq('user_id', userId)
          .maybeSingle()

        if (projectError) {
          console.error('Error loading project:', projectError)
          await createNewProject(userId)
        } else if (project) {
          setProjectId(project.id)
          setProjectName(project.name)
          setGeneratedCode(project.generated_code || null)
        } else {
          // Project not found, create new one
          await createNewProject(userId)
        }
      } else {
        // No project ID, create new project
        await createNewProject(userId)
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
    console.log('[BuilderContent] handleCodeGenerated called with code length:', code?.length)
    setGeneratedCode(code)
    setHasUnsavedChanges(true)
  }

  async function handleSave() {
    if (!projectId || !generatedCode) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({
          generated_code: generatedCode,
          status: 'preview',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (error) throw error

      setHasUnsavedChanges(false)
      // Show success toast here if you have one
    } catch (error) {
      console.error('Save error:', error)
      alert('فشل حفظ المشروع')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeploy() {
    if (!projectId) return

    setIsDeploying(true)
    try {
      // Call deployment API
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) throw new Error('Deployment failed')

      const data = await response.json()
      // Show success with deployment URL
      alert(`تم النشر بنجاح! ${data.url || ''}`)
    } catch (error) {
      console.error('Deploy error:', error)
      alert('فشل النشر. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsDeploying(false)
    }
  }

  async function handleNewProject() {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('لديك تغييرات غير محفوظة. هل تريد المتابعة؟')
      if (!confirm) return
    }

    if (userId) {
      await createNewProject(userId)
      setGeneratedCode(null)
      setHasUnsavedChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600 font-['Cairo']">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
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
      {/* Top Navigation */}
      <BuilderNav
        projectName={projectName}
        onSave={handleSave}
        onDeploy={handleDeploy}
        onNewProject={handleNewProject}
        isSaving={isSaving}
        isDeploying={isDeploying}
        hasChanges={hasUnsavedChanges}
      />

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel - LEFT (70% width) */}
        <div className="w-[70%] flex flex-col border-l border-gray-200">
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في معاينة التطبيق.">
            <PreviewPanel code={generatedCode} isLoading={false} />
          </BuilderErrorBoundary>
        </div>

        {/* Chat Panel - RIGHT (30% width) */}
        <div className="w-[30%] flex flex-col">
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في لوحة المحادثة.">
            <ChatPanelNew
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
