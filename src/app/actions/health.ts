'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

export interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    connections: number
  }
  api: {
    status: 'healthy' | 'degraded' | 'down'
    uptime: number
  }
  storage: {
    status: 'healthy' | 'degraded' | 'down'
    usedSpace: number
    totalSpace: number
  }
}

export interface SystemStats {
  users: {
    total: number
    active24h: number
    active7d: number
    newToday: number
  }
  projects: {
    total: number
    createdToday: number
    published: number
  }
  usage: {
    promptsToday: number
    promptsThisWeek: number
    avgPromptsPerUser: number
  }
  revenue: {
    mrr: number
    arr: number
    newSubscriptionsToday: number
  }
}

export async function getSystemHealth(): Promise<{ data?: SystemHealth; error?: string }> {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    const startTime = Date.now()

    // Test database connection
    const { data: dbTest, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    const responseTime = Date.now() - startTime

    // Get active connections (this is a simplified version)
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const health: SystemHealth = {
      database: {
        status: dbError ? 'down' : responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        connections: userCount || 0,
      },
      api: {
        status: 'healthy',
        uptime: process.uptime(),
      },
      storage: {
        status: 'healthy',
        usedSpace: 0, // This would need to be fetched from Supabase Storage API
        totalSpace: 1000000000, // 1GB example
      },
    }

    return { data: health }
  } catch (error) {
    console.error('Error fetching system health:', error)
    return { error: 'فشل في جلب حالة النظام' }
  }
}

export async function getSystemStats(): Promise<{ data?: SystemStats; error?: string }> {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    const oneDayAgoISO = oneDayAgo.toISOString()

    // Fetch users stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: active24h } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', oneDayAgoISO)

    const { count: active7d } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', sevenDaysAgoISO)

    const { count: newToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    // Fetch projects stats
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    const { count: createdToday } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    const { count: published } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Fetch usage stats
    const { data: usageData } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'prompt_generated')
      .gte('created_at', todayISO)

    const promptsToday = usageData?.length || 0

    const { data: weekUsageData } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'prompt_generated')
      .gte('created_at', sevenDaysAgoISO)

    const promptsThisWeek = weekUsageData?.length || 0

    // Fetch revenue stats
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active')

    const planPrices = {
      builder: 33,
      pro: 59,
      hosting_only: 5,
    }

    const mrr = subscriptions?.reduce((sum, sub) => {
      const price = planPrices[sub.plan as keyof typeof planPrices] || 0
      return sum + price
    }, 0) || 0

    const { count: newSubscriptionsToday } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    const stats: SystemStats = {
      users: {
        total: totalUsers || 0,
        active24h: active24h || 0,
        active7d: active7d || 0,
        newToday: newToday || 0,
      },
      projects: {
        total: totalProjects || 0,
        createdToday: createdToday || 0,
        published: published || 0,
      },
      usage: {
        promptsToday,
        promptsThisWeek,
        avgPromptsPerUser: totalUsers ? promptsToday / totalUsers : 0,
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        newSubscriptionsToday: newSubscriptionsToday || 0,
      },
    }

    return { data: stats }
  } catch (error) {
    console.error('Error fetching system stats:', error)
    return { error: 'فشل في جلب إحصائيات النظام' }
  }
}

export async function getAuditLogs(params?: {
  limit?: number
  userId?: string
  action?: string
}) {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    let query = supabase
      .from('admin_audit_log')
      .select(`
        *,
        users:admin_user_id (
          email,
          display_name
        ),
        target_users:target_user_id (
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(params?.limit || 100)

    if (params?.userId) {
      query = query.eq('admin_user_id', params.userId)
    }

    if (params?.action) {
      query = query.eq('action', params.action)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return { error: 'فشل في جلب سجلات التدقيق' }
    }

    return { data }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return { error: 'فشل في جلب سجلات التدقيق' }
  }
}

export async function getAnalyticsEvents(params?: {
  limit?: number
  eventName?: string
  userId?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    let query = supabase
      .from('analytics_events')
      .select(`
        *,
        users (
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(params?.limit || 100)

    if (params?.eventName) {
      query = query.eq('event_name', params.eventName)
    }

    if (params?.userId) {
      query = query.eq('user_id', params.userId)
    }

    if (params?.startDate) {
      query = query.gte('created_at', params.startDate)
    }

    if (params?.endDate) {
      query = query.lte('created_at', params.endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching analytics events:', error)
      return { error: 'فشل في جلب الأحداث التحليلية' }
    }

    return { data }
  } catch (error) {
    console.error('Error fetching analytics events:', error)
    return { error: 'فشل في جلب الأحداث التحليلية' }
  }
}
