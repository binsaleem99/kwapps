import { getBillingStats, getRevenueStats, getRevenueTrend, getSubscriptions, getBillingEvents } from '@/app/actions/billing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, Activity, CreditCard, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionsTable } from './subscriptions-table'
import { BillingEventsTable } from './billing-events-table'
import { RevenueTrendChart } from './revenue-trend-chart'
import { SubscriptionBreakdownChart } from './subscription-breakdown-chart'

export const dynamic = 'force-dynamic'

const getPlanLabel = (plan: string) => {
  const labels: Record<string, string> = {
    free: 'مجاني',
    builder: 'مطور',
    pro: 'احترافي',
    hosting_only: 'استضافة فقط',
  }
  return labels[plan] || plan
}

export default async function BillingPage() {
  const [statsResult, revenueResult, trendResult, subscriptionsResult, eventsResult] = await Promise.all([
    getBillingStats(),
    getRevenueStats(),
    getRevenueTrend(30),
    getSubscriptions({ limit: 100 }),
    getBillingEvents({ limit: 100 }),
  ])

  if (statsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">التحليلات المالية</h1>
          <p className="text-destructive mt-2">{statsResult.error}</p>
        </div>
      </div>
    )
  }

  const stats = statsResult.stats || {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    recentEvents: 0,
    topPlan: 'free',
  }

  const revenueStats = revenueResult.stats || {
    mrr: 0,
    arr: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    revenueByPlan: {
      free: { count: 0, revenue: 0 },
      builder: { count: 0, revenue: 0 },
      pro: { count: 0, revenue: 0 },
      hosting_only: { count: 0, revenue: 0 },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">التحليلات المالية</h1>
        <p className="text-muted-foreground mt-2">
          متابعة الإيرادات والاشتراكات والمدفوعات
        </p>
      </div>

      {/* Stats Cards - Row 1: Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(3)} KWD</div>
            <p className="text-xs text-muted-foreground mt-1">
              جميع الأوقات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.toFixed(3)} KWD</div>
            <p className="text-xs text-muted-foreground mt-1">
              الشهر الحالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.mrr.toFixed(3)} KWD</div>
            <p className="text-xs text-muted-foreground mt-1">
              الإيرادات الشهرية المتكررة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.arr.toFixed(3)} KWD</div>
            <p className="text-xs text-muted-foreground mt-1">
              الإيرادات السنوية المتكررة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Row 2: Subscription Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاشتراكات النشطة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {stats.totalSubscriptions} إجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإلغاء</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueStats.churnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              الشهر الحالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخطة الأكثر شيوعًا</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPlanLabel(stats.topPlan)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              الأكثر اشتراكًا
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأحداث الأخيرة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              آخر 7 أيام
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueTrendChart data={trendResult.trend || []} />
        <SubscriptionBreakdownChart data={revenueStats.revenueByPlan} />
      </div>

      {/* Tables */}
      <Tabs defaultValue="subscriptions" dir="rtl">
        <TabsList>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="events">الأحداث المالية</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionsTable subscriptions={subscriptionsResult.items || []} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <BillingEventsTable events={eventsResult.items || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
