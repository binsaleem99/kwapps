import { getSystemHealth, getSystemStats } from '@/app/actions/health'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Database,
  HardDrive,
  Server,
  Users,
  FolderKanban,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { HealthStatusCard } from './health-status-card'
import { StatsCard } from './stats-card'

export const dynamic = 'force-dynamic'

export default async function SystemHealthPage() {
  const [healthResult, statsResult] = await Promise.all([
    getSystemHealth(),
    getSystemStats(),
  ])

  if (healthResult.error || statsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">صحة النظام</h1>
          <p className="text-muted-foreground">مراقبة أداء وحالة النظام</p>
        </div>
        <div className="text-destructive">
          {healthResult.error || statsResult.error}
        </div>
      </div>
    )
  }

  const health = healthResult.data!
  const stats = statsResult.data!

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}ي ${hours}س ${minutes}د`
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / 1000000000
    return `${gb.toFixed(2)} GB`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">صحة النظام</h1>
        <p className="text-muted-foreground">مراقبة أداء وحالة النظام في الوقت الفعلي</p>
      </div>

      {/* System Health Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <HealthStatusCard
          title="قاعدة البيانات"
          status={health.database.status}
          icon={Database}
          metrics={[
            { label: 'وقت الاستجابة', value: `${health.database.responseTime}ms` },
            { label: 'الاتصالات النشطة', value: health.database.connections.toString() },
          ]}
        />
        <HealthStatusCard
          title="واجهة برمجة التطبيقات"
          status={health.api.status}
          icon={Server}
          metrics={[
            { label: 'وقت التشغيل', value: formatUptime(health.api.uptime) },
          ]}
        />
        <HealthStatusCard
          title="التخزين"
          status={health.storage.status}
          icon={HardDrive}
          metrics={[
            {
              label: 'المساحة المستخدمة',
              value: `${formatBytes(health.storage.usedSpace)} / ${formatBytes(health.storage.totalSpace)}`
            },
          ]}
        />
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">المستخدمون</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats.users.total}
            icon={Users}
            trend={stats.users.newToday > 0 ? 'up' : 'stable'}
            subtitle={`${stats.users.newToday} مستخدم جديد اليوم`}
          />
          <StatsCard
            title="نشط خلال 24 ساعة"
            value={stats.users.active24h}
            icon={Activity}
            subtitle={`${((stats.users.active24h / stats.users.total) * 100).toFixed(1)}% من الإجمالي`}
          />
          <StatsCard
            title="نشط خلال 7 أيام"
            value={stats.users.active7d}
            icon={Activity}
            subtitle={`${((stats.users.active7d / stats.users.total) * 100).toFixed(1)}% من الإجمالي`}
          />
          <StatsCard
            title="مستخدمون جدد اليوم"
            value={stats.users.newToday}
            icon={TrendingUp}
            trend={stats.users.newToday > 0 ? 'up' : 'stable'}
          />
        </div>
      </div>

      {/* Projects Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">المشاريع</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="إجمالي المشاريع"
            value={stats.projects.total}
            icon={FolderKanban}
            trend={stats.projects.createdToday > 0 ? 'up' : 'stable'}
            subtitle={`${stats.projects.createdToday} مشروع جديد اليوم`}
          />
          <StatsCard
            title="المشاريع المنشورة"
            value={stats.projects.published}
            icon={Zap}
            subtitle={`${((stats.projects.published / stats.projects.total) * 100).toFixed(1)}% من الإجمالي`}
          />
          <StatsCard
            title="مشاريع جديدة اليوم"
            value={stats.projects.createdToday}
            icon={TrendingUp}
            trend={stats.projects.createdToday > 0 ? 'up' : 'stable'}
          />
        </div>
      </div>

      {/* Usage Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">الاستخدام</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="الأوامر اليوم"
            value={stats.usage.promptsToday}
            icon={Zap}
            trend={stats.usage.promptsToday > 0 ? 'up' : 'stable'}
          />
          <StatsCard
            title="الأوامر هذا الأسبوع"
            value={stats.usage.promptsThisWeek}
            icon={Activity}
          />
          <StatsCard
            title="متوسط الأوامر لكل مستخدم"
            value={stats.usage.avgPromptsPerUser.toFixed(1)}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">الإيرادات</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="الإيرادات الشهرية المتكررة"
            value={`${stats.revenue.mrr} د.ك`}
            icon={DollarSign}
            trend="up"
          />
          <StatsCard
            title="الإيرادات السنوية المتوقعة"
            value={`${stats.revenue.arr} د.ك`}
            icon={TrendingUp}
          />
          <StatsCard
            title="اشتراكات جديدة اليوم"
            value={stats.revenue.newSubscriptionsToday}
            icon={DollarSign}
            trend={stats.revenue.newSubscriptionsToday > 0 ? 'up' : 'stable'}
          />
        </div>
      </div>
    </div>
  )
}
