'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
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
  ArrowLeft,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Icon mapping
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

// Arabic labels
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

// Description for each content type
const CONTENT_DESCRIPTIONS: Record<string, string> = {
  products: 'إدارة المنتجات والأسعار والمخزون',
  services: 'إدارة الخدمات المقدمة',
  pages: 'تعديل محتوى الصفحات',
  forms: 'عرض رسائل النماذج',
  testimonials: 'إدارة آراء العملاء',
  team_members: 'إدارة أعضاء الفريق',
  gallery: 'إدارة الصور والألبومات',
  pricing: 'إدارة الباقات والأسعار',
  faq: 'إدارة الأسئلة الشائعة',
  blog: 'إدارة المقالات والأخبار',
  contact: 'عرض رسائل الاتصال',
  users: 'إدارة المستخدمين',
}

interface ContentStats {
  type: string
  count: number
  recentCount?: number
}

interface AdminConfig {
  projectId: string
  projectName: string
  adminConfig: {
    schema: {
      sections: Array<{ type: string; labelAr: string }>
      hasAuth: boolean
      hasEcommerce: boolean
    }
    enabled_sections: string[]
  } | null
}

export default function AdminDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [stats, setStats] = useState<ContentStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [projectId])

  async function fetchData() {
    try {
      // Fetch config
      const configRes = await fetch(`/api/projects/${projectId}/admin`)
      if (configRes.ok) {
        const configData = await configRes.json()
        setConfig(configData)

        // Fetch stats for each content type
        if (configData.adminConfig?.enabled_sections) {
          const statsPromises = configData.adminConfig.enabled_sections.map(
            async (type: string) => {
              try {
                const res = await fetch(
                  `/api/projects/${projectId}/admin/content/${type}?limit=1`
                )
                if (res.ok) {
                  const data = await res.json()
                  return { type, count: data.total || 0 }
                }
              } catch {
                // Ignore errors for missing tables
              }
              return { type, count: 0 }
            }
          )
          const statsResults = await Promise.all(statsPromises)
          setStats(statsResults)
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const sections = config?.adminConfig?.enabled_sections || []

  // Calculate total items
  const totalItems = stats.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-cairo">نظرة عامة</h1>
          <p className="text-slate-500 font-cairo mt-1">
            إدارة محتوى موقعك من مكان واحد
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-cairo">
              إجمالي العناصر
            </CardTitle>
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-cairo">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-cairo">
              الأقسام النشطة
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-cairo">{sections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-cairo">
              الزوار اليوم
            </CardTitle>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-cairo">-</div>
            <p className="text-xs text-slate-400 font-cairo">قريباً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-cairo">
              آخر تحديث
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-cairo text-slate-600">
              {new Date().toLocaleDateString('ar-KW')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-cairo mb-4">إدارة المحتوى</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((type) => {
            const Icon = CONTENT_ICONS[type] || FileText
            const stat = stats.find((s) => s.type === type)

            return (
              <Link key={type} href={`/admin/${projectId}/${type}`}>
                <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          type === 'products'
                            ? 'bg-blue-100'
                            : type === 'forms'
                              ? 'bg-green-100'
                              : type === 'pages'
                                ? 'bg-purple-100'
                                : 'bg-slate-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            type === 'products'
                              ? 'text-blue-600'
                              : type === 'forms'
                                ? 'text-green-600'
                                : type === 'pages'
                                  ? 'text-purple-600'
                                  : 'text-slate-600'
                          )}
                        />
                      </div>
                      {stat && stat.count > 0 && (
                        <span className="text-sm font-medium text-slate-500">
                          {stat.count}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-cairo text-lg mt-3">
                      {CONTENT_LABELS[type] || type}
                    </CardTitle>
                    <CardDescription className="font-cairo">
                      {CONTENT_DESCRIPTIONS[type] || 'إدارة المحتوى'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* No sections message */}
      {sections.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <LayoutDashboard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold font-cairo mb-2">
              لم يتم اكتشاف أقسام قابلة للإدارة
            </h3>
            <p className="text-slate-500 font-cairo mb-4">
              قم بإنشاء موقعك مع محتوى ديناميكي (منتجات، خدمات، إلخ) لتفعيل لوحة التحكم
            </p>
            <Button onClick={() => router.push(`/builder?project=${projectId}`)}>
              تعديل الموقع
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-cairo mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/preview/${projectId}`} target="_blank">
              <Eye className="h-4 w-4 ml-2" />
              معاينة الموقع
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/builder?project=${projectId}`}>
              <FileText className="h-4 w-4 ml-2" />
              تعديل التصميم
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/${projectId}/settings`}>
              <BarChart3 className="h-4 w-4 ml-2" />
              إعدادات لوحة التحكم
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
