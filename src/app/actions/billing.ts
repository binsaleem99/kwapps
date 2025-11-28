'use server'

import { createCRUDActions } from '@/lib/admin/crud-actions'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, canPerformAction, logAdminAction } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { Subscription, BillingEvent, UserPlan, SubscriptionStatus } from '@/types'

// Plan pricing in KWD
const PLAN_PRICING: Record<UserPlan, number> = {
  free: 0,
  builder: 33,
  pro: 59,
  hosting_only: 5,
}

// Extended Subscription type with user data
export interface SubscriptionWithUser extends Subscription {
  users?: {
    email: string
    display_name: string | null
  }
}

// Extended BillingEvent type with user data
export interface BillingEventWithUser extends BillingEvent {
  users?: {
    email: string
    display_name: string | null
    plan: UserPlan
  }
}

// Use CRUD factory for subscriptions with user join
const subscriptionsCrud = createCRUDActions<SubscriptionWithUser>({
  table: 'subscriptions',
  selectQuery: `
    *,
    users!inner(email, display_name)
  `,
  searchColumns: ['upayments_subscription_id', 'upayments_customer_id'],
  requiredPermission: 'billing.view',
  orderBy: { column: 'created_at', ascending: false },
  revalidatePaths: ['/admin/billing'],
})

// Use CRUD factory for billing events with user join
const billingEventsCrud = createCRUDActions<BillingEventWithUser>({
  table: 'billing_events',
  selectQuery: `
    *,
    users!inner(email, display_name, plan)
  `,
  searchColumns: ['event_type', 'upayments_event_id'],
  requiredPermission: 'billing.view',
  orderBy: { column: 'created_at', ascending: false },
  revalidatePaths: ['/admin/billing'],
})

// Export basic CRUD operations
export const getSubscriptions = subscriptionsCrud.getAll
export const getSubscriptionById = subscriptionsCrud.getById
export const updateSubscription = subscriptionsCrud.update

export const getBillingEvents = billingEventsCrud.getAll
export const getBillingEventById = billingEventsCrud.getById

/**
 * Get revenue statistics (MRR, ARR, Churn)
 */
export async function getRevenueStats(): Promise<{
  stats?: {
    mrr: number // Monthly Recurring Revenue
    arr: number // Annual Recurring Revenue
    activeSubscriptions: number
    churnRate: number // Percentage
    revenueByPlan: Record<UserPlan, { count: number; revenue: number }>
  }
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get all active subscriptions grouped by plan
    const { data: activeSubscriptions, error: activeError } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active')

    if (activeError) {
      console.error('Error fetching active subscriptions:', activeError)
      return { error: 'فشل في جلب الاشتراكات النشطة' }
    }

    // Get subscriptions that canceled this month for churn calculation
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: canceledThisMonth } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('updated_at', startOfMonth.toISOString())

    const { count: activeAtStartOfMonth } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .or(`status.eq.active,status.eq.canceled`)
      .gte('created_at', startOfMonth.toISOString())

    // Calculate revenue by plan
    const revenueByPlan: Record<UserPlan, { count: number; revenue: number }> = {
      free: { count: 0, revenue: 0 },
      builder: { count: 0, revenue: 0 },
      pro: { count: 0, revenue: 0 },
      hosting_only: { count: 0, revenue: 0 },
    }

    activeSubscriptions?.forEach((subscription) => {
      const plan = subscription.plan as UserPlan
      revenueByPlan[plan].count++
      revenueByPlan[plan].revenue += PLAN_PRICING[plan]
    })

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = Object.entries(revenueByPlan).reduce(
      (total, [plan, data]) => total + data.revenue,
      0
    )

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12

    // Calculate churn rate (canceled / total at start of month)
    const churnRate =
      activeAtStartOfMonth && activeAtStartOfMonth > 0
        ? ((canceledThisMonth || 0) / activeAtStartOfMonth) * 100
        : 0

    return {
      stats: {
        mrr,
        arr,
        activeSubscriptions: activeSubscriptions?.length || 0,
        churnRate: parseFloat(churnRate.toFixed(2)),
        revenueByPlan,
      },
    }
  } catch (error) {
    console.error('Error getting revenue stats:', error)
    return { error: 'حدث خطأ أثناء جلب الإحصائيات المالية' }
  }
}

/**
 * Get revenue trend (last 30 days)
 */
export async function getRevenueTrend(days: number = 30): Promise<{
  trend?: Array<{
    date: string
    revenue: number
    subscriptions: number
  }>
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get billing events for revenue calculation
    const { data: events, error } = await supabase
      .from('billing_events')
      .select('created_at, amount_kwd, event_type')
      .gte('created_at', startDate.toISOString())
      .in('event_type', ['subscription_created', 'payment_success', 'renewal'])

    if (error) {
      console.error('Error getting revenue trend:', error)
      return { error: 'فشل في جلب اتجاه الإيرادات' }
    }

    // Group by date
    const dateRevenue: Record<string, { revenue: number; subscriptions: number }> = {}

    events?.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!dateRevenue[date]) {
        dateRevenue[date] = { revenue: 0, subscriptions: 0 }
      }
      dateRevenue[date].revenue += event.amount_kwd || 0
      if (event.event_type === 'subscription_created') {
        dateRevenue[date].subscriptions++
      }
    })

    const trend = Object.entries(dateRevenue)
      .map(([date, data]) => ({
        date,
        revenue: parseFloat(data.revenue.toFixed(3)),
        subscriptions: data.subscriptions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { trend }
  } catch (error) {
    console.error('Error in getRevenueTrend:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get subscription breakdown by status
 */
export async function getSubscriptionBreakdown(): Promise<{
  breakdown?: {
    total: number
    byStatus: Record<SubscriptionStatus, number>
    byPlan: Record<UserPlan, number>
  }
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('status, plan')

    if (error) {
      console.error('Error getting subscription breakdown:', error)
      return { error: 'فشل في جلب تفاصيل الاشتراكات' }
    }

    const byStatus: Record<SubscriptionStatus, number> = {
      active: 0,
      canceled: 0,
      past_due: 0,
      paused: 0,
    }

    const byPlan: Record<UserPlan, number> = {
      free: 0,
      builder: 0,
      pro: 0,
      hosting_only: 0,
    }

    subscriptions?.forEach((sub) => {
      byStatus[sub.status as SubscriptionStatus]++
      byPlan[sub.plan as UserPlan]++
    })

    return {
      breakdown: {
        total: subscriptions?.length || 0,
        byStatus,
        byPlan,
      },
    }
  } catch (error) {
    console.error('Error in getSubscriptionBreakdown:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get recent billing events
 */
export async function getRecentBillingEvents(limit: number = 50): Promise<{
  events?: BillingEventWithUser[]
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('billing_events')
      .select(`
        *,
        users!inner(email, display_name, plan)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error getting recent billing events:', error)
      return { error: 'فشل في جلب الأحداث المالية الأخيرة' }
    }

    return { events: (data as unknown) as BillingEventWithUser[] }
  } catch (error) {
    console.error('Error in getRecentBillingEvents:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get billing statistics for dashboard
 */
export async function getBillingStats(): Promise<{
  stats?: {
    totalRevenue: number
    monthlyRevenue: number
    totalSubscriptions: number
    activeSubscriptions: number
    recentEvents: number
    topPlan: string
  }
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get total revenue from all billing events
    const { data: allEvents } = await supabase
      .from('billing_events')
      .select('amount_kwd')
      .in('event_type', ['subscription_created', 'payment_success', 'renewal'])

    const totalRevenue = allEvents?.reduce((sum, event) => sum + (event.amount_kwd || 0), 0) || 0

    // Get this month's revenue
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthEvents } = await supabase
      .from('billing_events')
      .select('amount_kwd')
      .in('event_type', ['subscription_created', 'payment_success', 'renewal'])
      .gte('created_at', startOfMonth.toISOString())

    const monthlyRevenue = monthEvents?.reduce((sum, event) => sum + (event.amount_kwd || 0), 0) || 0

    // Get subscription counts
    const { count: totalSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })

    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get recent events count (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { count: recentEvents } = await supabase
      .from('billing_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())

    // Get most popular plan
    const { data: planCounts } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active')

    const planCount: Record<string, number> = {}
    planCounts?.forEach((sub) => {
      planCount[sub.plan] = (planCount[sub.plan] || 0) + 1
    })

    const topPlan = Object.entries(planCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'free'

    return {
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(3)),
        monthlyRevenue: parseFloat(monthlyRevenue.toFixed(3)),
        totalSubscriptions: totalSubscriptions || 0,
        activeSubscriptions: activeSubscriptions || 0,
        recentEvents: recentEvents || 0,
        topPlan,
      },
    }
  } catch (error) {
    console.error('Error getting billing stats:', error)
    return { error: 'حدث خطأ أثناء جلب الإحصائيات' }
  }
}

/**
 * Cancel a subscription (admin override)
 */
export async function cancelSubscription(subscriptionId: string): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    await requireAdmin()

    const canEdit = await canPerformAction('billing.edit')
    if (!canEdit) {
      return { error: 'ليس لديك صلاحية لإلغاء الاشتراكات' }
    }

    const supabase = await createClient()

    // Get subscription info for logging
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, plan')
      .eq('id', subscriptionId)
      .single()

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)

    if (error) {
      console.error('Error canceling subscription:', error)
      return { error: 'فشل في إلغاء الاشتراك' }
    }

    await logAdminAction({
      action: 'subscription.cancel',
      resourceType: 'subscription',
      resourceId: subscriptionId,
      details: { user_id: subscription?.user_id, plan: subscription?.plan },
    })

    revalidatePath('/admin/billing')

    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { error: 'حدث خطأ أثناء إلغاء الاشتراك' }
  }
}
