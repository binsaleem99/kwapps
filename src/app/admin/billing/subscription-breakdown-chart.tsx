'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { UserPlan } from '@/types'

interface SubscriptionBreakdownChartProps {
  data: Record<UserPlan, { count: number; revenue: number }>
}

const PLAN_COLORS: Record<UserPlan, string> = {
  free: 'hsl(var(--muted))',
  builder: 'hsl(var(--primary))',
  pro: 'hsl(var(--chart-1))',
  hosting_only: 'hsl(var(--chart-2))',
}

const PLAN_LABELS: Record<UserPlan, string> = {
  free: 'مجاني',
  builder: 'مطور',
  pro: 'احترافي',
  hosting_only: 'استضافة فقط',
}

export function SubscriptionBreakdownChart({ data }: SubscriptionBreakdownChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data)
    .map(([plan, stats]) => ({
      plan: PLAN_LABELS[plan as UserPlan],
      planKey: plan,
      count: stats.count,
      revenue: stats.revenue,
    }))
    .filter((item) => item.count > 0) // Only show plans with subscriptions

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">توزيع الاشتراكات</CardTitle>
        <p className="text-sm text-muted-foreground">
          حسب الخطة - إجمالي الإيرادات: {totalRevenue.toFixed(3)} KWD/شهر
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="plan"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'عدد الاشتراكات', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium mb-2">{data.plan}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            عدد الاشتراكات: {data.count}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            الإيرادات الشهرية: {data.revenue.toFixed(3)} KWD
                          </p>
                          <p className="text-xs text-muted-foreground">
                            نسبة الإيرادات: {totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PLAN_COLORS[entry.planKey as UserPlan]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">لا توجد اشتراكات نشطة</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
