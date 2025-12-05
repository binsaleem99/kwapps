'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import ChatPanelNew from '@/components/builder/chat-panel-new'
import PreviewPanel from '@/components/builder/preview-panel'
import { BuilderNav } from '@/components/builder/builder-nav'
import { BuilderErrorBoundary } from '@/components/builder/error-boundary'
import { ProjectSidebar } from '@/components/builder/project-sidebar'
import { VersionHistory } from '@/components/builder/version-history'
import { Button } from '@/components/ui/button'
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import type { GeminiPlan, GeminiAnnotations } from '@/lib/gemini/types'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [previewCode, setPreviewCode] = useState<string | null>(null) // For version preview
  const [annotations, setAnnotations] = useState<GeminiAnnotations | null>(null)
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<GeminiPlan | null>(null)

  useEffect(() => {
    if (isLoaded) {
      checkAuthAndLoadProject()
    }
  }, [projectIdParam, isLoaded, userId])

  // Debug: Track when generatedCode changes
  useEffect(() => {
    console.log('[BuilderContent] ========== GENERATED CODE STATE CHANGED ==========')
    console.log('[BuilderContent] generatedCode length:', generatedCode?.length)
    console.log('[BuilderContent] generatedCode exists:', !!generatedCode)
    if (generatedCode) {
      console.log('[BuilderContent] First 200 chars:', generatedCode.substring(0, 200))
    }
    console.log('[BuilderContent] ===================================================')
  }, [generatedCode])

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

  async function handleCodeGenerated(code: string) {
    console.log('[BuilderContent] ========== CODE GENERATED ==========')
    console.log('[BuilderContent] Code length:', code?.length)
    console.log('[BuilderContent] Code preview:', code?.substring(0, 200))
    console.log('[BuilderContent] Previous generatedCode:', generatedCode?.substring(0, 50))
    setGeneratedCode(code)
    setPreviewCode(null) // Clear any version preview
    setAnnotations(null) // Clear annotations for new code
    setHasUnsavedChanges(true)
    console.log('[BuilderContent] State updated, new code set')
    console.log('[BuilderContent] =====================================')

    // Save version to database
    if (projectId && userId) {
      try {
        const supabase = createClient()
        await supabase.rpc('save_code_version', {
          p_project_id: projectId,
          p_user_id: userId,
          p_code: code,
          p_description: 'Generated code',
        })
        console.log('[BuilderContent] Version saved to database')
      } catch (error) {
        console.error('[BuilderContent] Failed to save version:', error)
      }
    }
  }

  function handleVersionPreview(code: string) {
    setPreviewCode(code)
  }

  function handleVersionRestore(code: string) {
    setGeneratedCode(code)
    setPreviewCode(null)
    setHasUnsavedChanges(false) // Version restore auto-saves
  }

  function handleSelectProject(newProjectId: string) {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('لديك تغييرات غير محفوظة. هل تريد المتابعة؟')
      if (!confirm) return
    }
    router.push(`/builder?project=${newProjectId}`)
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
      setAnnotations(null) // Clear annotations for new project
      setCurrentPlan(null) // Clear plan for new project
    }
  }

  function handlePlanGenerated(plan: GeminiPlan) {
    console.log('[BuilderContent] Plan received from Gemini:', plan.summary)
    setCurrentPlan(plan)
  }

  async function handleRequestAnnotations() {
    if (!projectId || !generatedCode) return

    setIsAnnotating(true)
    try {
      const response = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          code: generatedCode,
        }),
      })

      if (!response.ok) {
        throw new Error('Annotation request failed')
      }

      const data = await response.json()

      if (data.success && data.annotations) {
        console.log('[BuilderContent] Annotations received:', data.annotations)
        setAnnotations(data.annotations)
      } else {
        console.error('[BuilderContent] Annotation error:', data.error)
        alert(data.error?.messageAr || 'فشل تحليل الكود')
      }
    } catch (error) {
      console.error('[BuilderContent] Annotation error:', error)
      alert('فشل تحليل الكود. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsAnnotating(false)
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

  // Determine which code to show in preview (version preview or current)
  const displayCode = previewCode || generatedCode

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
        versionHistory={
          projectId && userId ? (
            <VersionHistory
              projectId={projectId}
              userId={userId}
              onRestore={handleVersionRestore}
              onPreview={handleVersionPreview}
            />
          ) : undefined
        }
      />

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Sidebar - RIGHT (collapsible) */}
        {userId && (
          <ProjectSidebar
            selectedProjectId={projectId}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            userId={userId}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Preview Panel - CENTER (flexible width) */}
        <div className="flex-1 flex flex-col border-l border-gray-200 min-w-0">
          {/* Version Preview Banner */}
          {previewCode && (
            <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between">
              <span className="text-amber-800 text-sm font-['Cairo']">
                معاينة إصدار سابق - هذا ليس الإصدار الحالي
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreviewCode(null)}
                className="text-amber-800 border-amber-400 hover:bg-amber-200"
              >
                إغلاق المعاينة
              </Button>
            </div>
          )}
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في معاينة التطبيق.">
            <PreviewPanel
              code={displayCode}
              isLoading={false}
              annotations={annotations}
              onRequestAnnotations={handleRequestAnnotations}
              isAnnotating={isAnnotating}
            />
          </BuilderErrorBoundary>
        </div>

        {/* Chat Panel - LEFT (30% width) */}
        <div className="w-[30%] flex flex-col border-l border-gray-200">
          <BuilderErrorBoundary fallbackMessage="حدث خطأ في لوحة المحادثة.">
            <ChatPanelNew
              projectId={projectId}
              onCodeGenerated={handleCodeGenerated}
              onPlanGenerated={handlePlanGenerated}
              currentCode={generatedCode || undefined}
            />
          </BuilderErrorBoundary>
        </div>
      </div>
    </div>
  )
}
