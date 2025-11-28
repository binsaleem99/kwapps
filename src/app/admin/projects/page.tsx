import { getProjects, getProjectStats } from '@/app/actions/admin-projects'
import { ProjectsTable } from './projects-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Activity, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const [projectsResult, statsResult] = await Promise.all([
    getProjects({ limit: 100 }),
    getProjectStats(),
  ])

  if (projectsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">مراقبة المشاريع</h1>
          <p className="text-destructive mt-2">{projectsResult.error}</p>
        </div>
      </div>
    )
  }

  const stats = statsResult.stats || {
    total: 0,
    activeToday: 0,
    errorCount: 0,
    publishedCount: 0,
    draftCount: 0,
    generatingCount: 0,
    errorRate: 0,
    byStatus: {
      draft: 0,
      generating: 0,
      preview: 0,
      published: 0,
      error: 0,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">مراقبة المشاريع</h1>
        <p className="text-muted-foreground mt-2">
          عرض وإدارة جميع مشاريع المستخدمين
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              جميع المشاريع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نشط اليوم</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              تم إنشاؤها اليوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم النشر</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.publishedCount / stats.total) * 100).toFixed(0) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أخطاء</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errorCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.errorRate}% معدل الخطأ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التوليد</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generatingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              يتم معالجتها الآن
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <ProjectsTable projects={projectsResult.items || []} />
    </div>
  )
}
