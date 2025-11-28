import { getTemplates, getTemplateStats } from '@/app/actions/templates'
import { TemplatesTable } from './templates-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Star, BarChart, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const [templatesResult, statsResult] = await Promise.all([
    getTemplates({ limit: 100 }),
    getTemplateStats(),
  ])

  if (templatesResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة القوالب</h1>
          <p className="text-destructive mt-2">{templatesResult.error}</p>
        </div>
      </div>
    )
  }

  const stats = statsResult.stats || {
    total: 0,
    premium: 0,
    free: 0,
    mostUsed: null,
    totalUsage: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إدارة القوالب</h1>
        <p className="text-muted-foreground mt-2">
          إدارة قوالب التطبيقات وتصنيفاتها ومحتواها
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القوالب</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.free} مجاني، {stats.premium} مميز
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القوالب المميزة</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.premium / stats.total) * 100).toFixed(0) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأكثر استخداماً</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.mostUsed?.name_ar || '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.mostUsed?.usage_count || 0} مرة استخدام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الاستخدامات</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              عبر جميع القوالب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <TemplatesTable templates={templatesResult.items || []} />
    </div>
  )
}
