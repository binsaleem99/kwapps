'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, BarChart } from '@/components/admin/charts'
import { useMemo } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_name: string
  event_data: any
  created_at: string
  users: {
    email: string
    display_name: string | null
  } | null
}

interface AnalyticsChartsProps {
  events: AnalyticsEvent[]
}

export function AnalyticsCharts({ events }: AnalyticsChartsProps) {
  // Process events by day for the last 7 days
  const eventsByDay = useMemo(() => {
    const days = 7
    const now = new Date()
    const dayData: Record<string, number> = {}

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const day = subDays(now, i)
      const dateKey = format(day, 'yyyy-MM-dd')
      dayData[dateKey] = 0
    }

    // Count events per day
    events.forEach((event) => {
      const date = parseISO(event.created_at)
      const dateKey = format(date, 'yyyy-MM-dd')
      if (dateKey in dayData) {
        dayData[dateKey]++
      }
    })

    // Convert to array format for charts
    return Object.entries(dayData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: format(parseISO(date), 'dd MMM', { locale: ar }),
        value: count,
      }))
  }, [events])

  // Process events by type
  const eventsByType = useMemo(() => {
    const typeCount: Record<string, number> = {}

    events.forEach((event) => {
      typeCount[event.event_name] = (typeCount[event.event_name] || 0) + 1
    })

    const eventLabels: Record<string, string> = {
      prompt_generated: 'توليد أمر',
      project_created: 'إنشاء مشروع',
      project_saved: 'حفظ مشروع',
      project_published: 'نشر مشروع',
      template_viewed: 'عرض قالب',
      user_login: 'تسجيل دخول',
      user_logout: 'تسجيل خروج',
      user_signup: 'تسجيل جديد',
      subscription_created: 'اشتراك جديد',
      subscription_cancelled: 'إلغاء اشتراك',
      settings_updated: 'تحديث إعدادات',
    }

    return Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 events
      .map(([type, count]) => ({
        name: eventLabels[type] || type,
        value: count,
      }))
  }, [events])

  // Process user activity
  const activeUsers = useMemo(() => {
    const days = 7
    const now = new Date()
    const dayData: Record<string, Set<string>> = {}

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const day = subDays(now, i)
      const dateKey = format(day, 'yyyy-MM-dd')
      dayData[dateKey] = new Set()
    }

    // Count unique users per day
    events.forEach((event) => {
      if (event.user_id) {
        const date = parseISO(event.created_at)
        const dateKey = format(date, 'yyyy-MM-dd')
        if (dateKey in dayData) {
          dayData[dateKey].add(event.user_id)
        }
      }
    })

    // Convert to array format
    return Object.entries(dayData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({
        date: format(parseISO(date), 'dd MMM', { locale: ar }),
        value: users.size,
      }))
  }, [events])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>الأحداث اليومية (آخر 7 أيام)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={eventsByDay}
            xKey="date"
            yKey="value"
            color="#3B82F6"
            height={300}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمون النشطون (آخر 7 أيام)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={activeUsers}
            xKey="date"
            yKey="value"
            color="#60A5FA"
            height={300}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>أهم الأحداث</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={eventsByType}
            xKey="name"
            yKey="value"
            color="#3B82F6"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  )
}
