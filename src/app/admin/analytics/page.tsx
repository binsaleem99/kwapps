import { getAnalyticsEvents } from '@/app/actions/health'
import { AnalyticsEventsTable } from './analytics-events-table'
import { AnalyticsCharts } from './analytics-charts'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const result = await getAnalyticsEvents({ limit: 500 })

  if (result.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">التحليلات والأحداث</h1>
          <p className="text-muted-foreground">تتبع نشاط المستخدمين والأحداث</p>
        </div>
        <div className="text-destructive">{result.error}</div>
      </div>
    )
  }

  const events = result.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">التحليلات والأحداث</h1>
        <p className="text-muted-foreground">
          تتبع نشاط المستخدمين والأحداث في الوقت الفعلي
        </p>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts events={events} />

      {/* Events Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">الأحداث الأخيرة</h2>
        <AnalyticsEventsTable events={events} />
      </div>
    </div>
  )
}
