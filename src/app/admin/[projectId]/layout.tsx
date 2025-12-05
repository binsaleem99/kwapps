'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Image,
  DollarSign,
  HelpCircle,
  BookOpen,
  Phone,
  Briefcase,
  UserCircle,
  Quote,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Icon mapping for content types
const CONTENT_ICONS: Record<string, React.ElementType> = {
  products: Package,
  services: Briefcase,
  pages: FileText,
  forms: MessageSquare,
  testimonials: Quote,
  team_members: UserCircle,
  gallery: Image,
  pricing: DollarSign,
  faq: HelpCircle,
  blog: BookOpen,
  contact: Phone,
  users: Users,
}

// Arabic labels for content types
const CONTENT_LABELS: Record<string, string> = {
  products: 'المنتجات',
  services: 'الخدمات',
  pages: 'الصفحات',
  forms: 'النماذج',
  testimonials: 'الشهادات',
  team_members: 'فريق العمل',
  gallery: 'معرض الصور',
  pricing: 'الأسعار',
  faq: 'الأسئلة الشائعة',
  blog: 'المدونة',
  contact: 'الاتصال',
  users: 'المستخدمين',
}

interface AdminConfig {
  projectId: string
  projectName: string
  hasCode: boolean
  status: string
  adminConfig: {
    schema: {
      sections: Array<{ type: string; labelAr: string }>
      hasAuth: boolean
      hasEcommerce: boolean
    }
    theme: {
      primaryColor: string
      accentColor: string
    }
    enabled_sections: string[]
  } | null
  adminUrl: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [projectId])

  async function fetchConfig() {
    try {
      const res = await fetch(`/api/projects/${projectId}/admin`)
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load admin config')
      }
      const data = await res.json()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  // Build navigation items
  const navItems = [
    {
      label: 'لوحة التحكم',
      href: `/admin/${projectId}`,
      icon: LayoutDashboard,
    },
    ...(config?.adminConfig?.enabled_sections || []).map((type) => ({
      label: CONTENT_LABELS[type] || type,
      href: `/admin/${projectId}/${type}`,
      icon: CONTENT_ICONS[type] || FileText,
    })),
    {
      label: 'الإعدادات',
      href: `/admin/${projectId}/settings`,
      icon: Settings,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 font-cairo mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            العودة للوحة الرئيسية
          </Button>
        </div>
      </div>
    )
  }

  if (!config?.hasCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <div className="text-center max-w-md px-4">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-cairo mb-2">لم يتم إنشاء الموقع بعد</h2>
          <p className="text-slate-500 font-cairo mb-6">
            قم بإنشاء موقعك أولاً من خلال المُنشئ الذكي ثم عد هنا لإدارة المحتوى
          </p>
          <Button onClick={() => router.push(`/builder?project=${projectId}`)}>
            إنشاء الموقع
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-slate-900 text-white z-50 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold font-cairo truncate">
            {config?.projectName || 'لوحة التحكم'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-cairo',
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer links */}
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-slate-700 bg-slate-900 space-y-2">
          <Link
            href={`/preview/${projectId}`}
            target="_blank"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-cairo text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>معاينة الموقع</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-cairo text-sm"
          >
            <ChevronRight className="h-4 w-4" />
            <span>العودة للوحة الرئيسية</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-cairo">لوحة تحكم المشروع</span>
              {config?.status && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-cairo',
                    config.status === 'deployed'
                      ? 'bg-green-100 text-green-700'
                      : config.status === 'preview'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {config.status === 'deployed'
                    ? 'منشور'
                    : config.status === 'preview'
                      ? 'معاينة'
                      : 'مسودة'}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
