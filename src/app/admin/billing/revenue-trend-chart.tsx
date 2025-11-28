'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RevenueTrendChartProps {
  data: Array<{
    date: string
    revenue: number
    subscriptions: number
  }>
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  // Format data for display
  const chartData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('ar-KW', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">اتجاه الإيرادات</CardTitle>
        <p className="text-sm text-muted-foreground">آخر 30 يوم</p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="displayDate"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'KWD', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium mb-1">
                          {payload[0].payload.displayDate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          الإيرادات: {payload[0].value} KWD
                        </p>
                        <p className="text-xs text-muted-foreground">
                          اشتراكات جديدة: {payload[0].payload.subscriptions}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
