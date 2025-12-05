'use client'

/**
 * BuilderPageNew - AI Website Builder Visual Editor
 *
 * Main builder interface combining all new components:
 * - BuilderLayout (split panel with resizable divider)
 * - ChatPanel (message history, credit indicator, clarifying questions)
 * - PreviewPanel (device modes, refresh, open in new tab)
 * - BuilderToolbar (project name, save, publish, settings)
 * - BuilderSidebar (pages, components, assets, settings)
 *
 * Integration points (prepared but not fully implemented):
 * - POST /api/orchestrate for Gemini analysis
 * - POST /api/generate for DeepSeek code
 * - Existing credit deduction API
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { BuilderLayout } from '@/components/builder/BuilderLayout'
import { ChatPanel } from '@/components/builder/ChatPanel'
import { PreviewPanel } from '@/components/builder/PreviewPanel'
import { BuilderToolbar } from '@/components/builder/BuilderToolbar'
import { BuilderSidebar } from '@/components/builder/BuilderSidebar'
import { BuilderErrorBoundary } from '@/components/builder/error-boundary'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import type { BuilderPage, BuilderAsset, BuilderProject } from '@/types/builder'

// Mock template data for ?template=slug feature
const MOCK_TEMPLATES: Record<string, { name: string; code: string }> = {
  restaurant: {
    name: 'قالب المطعم',
    code: `function RestaurantPage() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      <header className="bg-gradient-to-r from-amber-600 to-orange-500 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center font-['Cairo']">مطعم الشرق</h1>
          <p className="text-center text-amber-100 mt-2 font-['Cairo']">أشهى المأكولات العربية</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-['Cairo']">مرحباً بكم</h2>
          <p className="text-slate-300 max-w-2xl mx-auto font-['Cairo']">
            نقدم لكم أشهى المأكولات العربية الأصيلة بأجواء فريدة
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          {['المقبلات', 'الأطباق الرئيسية', 'الحلويات'].map((category, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-6 text-center hover:bg-slate-700 transition-colors">
              <h3 className="text-xl font-bold mb-3 text-amber-500 font-['Cairo']">{category}</h3>
              <p className="text-slate-400 font-['Cairo']">اكتشف قائمتنا المميزة</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-slate-950 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 font-['Cairo']">© 2024 مطعم الشرق - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

export default RestaurantPage;`,
  },
  portfolio: {
    name: 'قالب المعرض الشخصي',
    code: `function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white" dir="rtl">
      <header className="py-8 border-b border-blue-800/30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-['Cairo']">أحمد المصور</h1>
          <nav className="flex gap-6">
            <a href="#" className="text-blue-300 hover:text-white transition font-['Cairo']">الرئيسية</a>
            <a href="#" className="text-blue-300 hover:text-white transition font-['Cairo']">الأعمال</a>
            <a href="#" className="text-blue-300 hover:text-white transition font-['Cairo']">تواصل</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 font-['Cairo'] bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            مصور محترف
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto font-['Cairo']">
            أوثق اللحظات الجميلة بعدستي
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="aspect-square bg-slate-800 rounded-xl overflow-hidden group cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-4xl opacity-30">📷</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="py-8 border-t border-blue-800/30 mt-16">
        <p className="text-center text-blue-300 font-['Cairo']">© 2024 أحمد المصور</p>
      </footer>
    </div>
  );
}

export default PortfolioPage;`,
  },
  landing: {
    name: 'صفحة هبوط',
    code: `function LandingPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="py-6 px-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <span className="text-xl font-bold font-['Cairo']">تطبيقي</span>
          </div>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-['Cairo']">
            ابدأ الآن
          </button>
        </div>
      </header>

      <main>
        <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-['Cairo'] text-slate-900">
              أفضل تطبيق لإدارة مهامك
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-['Cairo']">
              نظم حياتك وزد إنتاجيتك مع تطبيقنا السهل والبسيط
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-500 text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-600 transition font-['Cairo']">
                تجربة مجانية
              </button>
              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl text-lg hover:border-blue-500 transition font-['Cairo']">
                شاهد الفيديو
              </button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 font-['Cairo']">المميزات</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {['سهولة الاستخدام', 'أمان عالي', 'دعم فني متواصل'].map((feature, i) => (
                <div key={i} className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-blue-50 transition">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">{'⚡📱🎯'[i]}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-['Cairo']">{feature}</h3>
                  <p className="text-slate-600 font-['Cairo']">وصف قصير للميزة</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© 2024 تطبيقي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;`,
  },
}

export function BuilderPageNew() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isLoaded } = useAuth()

  // URL params
  const projectIdParam = searchParams.get('project')
  const templateSlug = searchParams.get('template')

  // Project state
  const [project, setProject] = useState<BuilderProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Builder state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [pages, setPages] = useState<BuilderPage[]>([
    { id: 'home', name: 'الصفحة الرئيسية', slug: '/', code: '', isHomePage: true },
  ])
  const [assets, setAssets] = useState<BuilderAsset[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // Load project on mount
  useEffect(() => {
    if (isLoaded) {
      initializeBuilder()
    }
  }, [isLoaded, projectIdParam, templateSlug, userId])

  const initializeBuilder = async () => {
    // Check auth
    if (!userId) {
      router.push('/sign-in?redirect_url=/builder')
      return
    }

    try {
      const supabase = createClient()

      // If template param, load template code
      if (templateSlug && MOCK_TEMPLATES[templateSlug]) {
        const template = MOCK_TEMPLATES[templateSlug]
        setGeneratedCode(template.code)

        // Create new project with template
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name: template.name,
            status: 'draft',
            generated_code: template.code,
          })
          .select('id, name, generated_code, status, created_at')
          .single()

        if (createError) {
          throw createError
        }

        if (newProject) {
          setProject({
            id: newProject.id,
            name: newProject.name,
            status: newProject.status,
            generated_code: newProject.generated_code,
            created_at: newProject.created_at,
          })
          router.replace(`/builder?project=${newProject.id}`)
        }
      }
      // If project ID param, load existing project
      else if (projectIdParam) {
        const { data: existingProject, error: fetchError } = await supabase
          .from('projects')
          .select('id, name, generated_code, status, deployment_url, created_at, updated_at')
          .eq('id', projectIdParam)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          console.error('Project load error:', fetchError)
          await createNewProject()
        } else if (existingProject) {
          setProject({
            id: existingProject.id,
            name: existingProject.name,
            status: existingProject.status,
            generated_code: existingProject.generated_code,
            deployment_url: existingProject.deployment_url,
            created_at: existingProject.created_at,
            updated_at: existingProject.updated_at,
          })
          setGeneratedCode(existingProject.generated_code)
        } else {
          await createNewProject()
        }
      }
      // No params, create new project
      else {
        await createNewProject()
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Builder init error:', err)
      setError('حدث خطأ أثناء تحميل المشروع')
      setIsLoading(false)
    }
  }

  const createNewProject = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const projectName = `مشروع ${new Date().toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`

      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: projectName,
          status: 'draft',
        })
        .select('id, name, status, created_at')
        .single()

      if (createError) {
        throw createError
      }

      if (newProject) {
        setProject({
          id: newProject.id,
          name: newProject.name,
          status: newProject.status,
          generated_code: null,
          created_at: newProject.created_at,
        })
        router.replace(`/builder?project=${newProject.id}`)
      }
    } catch (err) {
      console.error('Create project error:', err)
      setError('فشل إنشاء المشروع')
    }
  }

  // Handle code generated from chat
  const handleCodeGenerated = useCallback((code: string) => {
    console.log('[Builder] Code generated, length:', code.length)
    setGeneratedCode(code)

    // Update project in DB
    if (project?.id) {
      const supabase = createClient()
      supabase
        .from('projects')
        .update({
          generated_code: code,
          status: 'preview',
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .then(({ error }) => {
          if (error) console.error('Save code error:', error)
        })
    }
  }, [project?.id])

  // Handle project name change
  const handleProjectNameChange = useCallback(async (name: string) => {
    if (!project?.id) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', project.id)

      if (!error) {
        setProject(prev => prev ? { ...prev, name } : null)
      }
    } catch (err) {
      console.error('Rename error:', err)
    }
  }, [project?.id])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!project?.id || !generatedCode) return

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
        .eq('id', project.id)

      if (error) throw error
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }, [project?.id, generatedCode])

  // Handle page operations
  const handlePageAdd = useCallback(() => {
    const newPage: BuilderPage = {
      id: Date.now().toString(),
      name: 'صفحة جديدة',
      slug: `/page-${pages.length}`,
      code: '',
    }
    setPages(prev => [...prev, newPage])
    setCurrentPageId(newPage.id)
  }, [pages.length])

  const handlePageDelete = useCallback((pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId))
    if (currentPageId === pageId) {
      setCurrentPageId('home')
    }
  }, [currentPageId])

  const handlePageRename = useCallback((pageId: string, name: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name } : p))
  }, [])

  // Handle asset operations
  const handleAssetUpload = useCallback(async (file: File) => {
    // TODO: Implement file upload to Supabase storage
    const newAsset: BuilderAsset = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'other',
      size: file.size,
      created_at: new Date().toISOString(),
    }
    setAssets(prev => [...prev, newAsset])
  }, [])

  const handleAssetDelete = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId))
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-900 font-bold font-['Cairo'] mb-2">جاري تحميل المنشئ</p>
          <p className="text-sm text-gray-600 font-['Cairo']">يرجى الانتظار...</p>
        </div>
      </div>
    )
  }

  // Error state
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
                initializeBuilder()
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

  // No project state
  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <p className="text-lg text-red-600 font-['Cairo']">حدث خطأ في تحميل المشروع</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4 font-['Cairo']">
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  // Main builder interface
  return (
    <BuilderLayout
      toolbar={
        <BuilderToolbar
          projectId={project.id}
          projectName={project.name}
          onProjectNameChange={handleProjectNameChange}
          hasCode={!!generatedCode}
          isSaving={isSaving}
          onSave={handleSave}
          deploymentUrl={project.deployment_url}
        />
      }
      sidebar={
        <BuilderSidebar
          pages={pages}
          assets={assets}
          currentPageId={currentPageId}
          onPageSelect={setCurrentPageId}
          onPageAdd={handlePageAdd}
          onPageDelete={handlePageDelete}
          onPageRename={handlePageRename}
          onAssetUpload={handleAssetUpload}
          onAssetDelete={handleAssetDelete}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      }
      chatPanel={
        <BuilderErrorBoundary fallbackMessage="حدث خطأ في لوحة المحادثة.">
          <ChatPanel
            projectId={project.id}
            onCodeGenerated={handleCodeGenerated}
            currentCode={generatedCode || undefined}
          />
        </BuilderErrorBoundary>
      }
      previewPanel={
        <BuilderErrorBoundary fallbackMessage="حدث خطأ في معاينة التطبيق.">
          <PreviewPanel
            code={generatedCode}
            isLoading={false}
          />
        </BuilderErrorBoundary>
      }
    />
  )
}
