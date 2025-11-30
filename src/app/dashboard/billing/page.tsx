import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Calendar, TrendingUp, Package, HardDrive, Zap, AlertCircle } from 'lucide-react'
import { UpgradePlanButton } from '@/components/billing/upgrade-plan-button'
import { CancelSubscriptionButton } from '@/components/billing/cancel-subscription-button'

export default async function BillingPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in?redirectTo=/dashboard/billing')
  }

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', user.id)
    .single()

  // Get usage data
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const plan = subscription?.plan as any
  const currentUsage = usage || {
    prompts_used_today: 0,
    projects_count: 0,
    storage_used_mb: 0,
  }

  const planLimits = plan
    ? {
        max_projects: plan.max_projects,
        max_storage_mb: plan.max_storage_mb,
        max_prompts_per_day: plan.max_prompts_per_day,
      }
    : {
        max_projects: 1,
        max_storage_mb: 100,
        max_prompts_per_day: 3,
      }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; text: string }> = {
      active: { variant: 'default', text: 'نشط' },
      canceled: { variant: 'secondary', text: 'ملغي' },
      past_due: { variant: 'destructive', text: 'متأخر' },
      paused: { variant: 'secondary', text: 'متوقف مؤقتاً' },
    }
    const config = variants[status] || { variant: 'secondary', text: status }
    return (
      <Badge variant={config.variant as any}>{config.text}</Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
          الفواتير والاشتراك
        </h1>
        <p className="text-gray-600">إدارة اشتراكك والفواتير والاستخدام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                الخطة الحالية
              </span>
              {subscription && getStatusBadge(subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {plan?.name_ar || 'مجاني'}
                  </span>
                  <span className="text-xl text-gray-600">
                    {plan?.price_monthly > 0 ? `${plan.price_monthly} د.ك/شهرياً` : 'مجاناً'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {plan?.name === 'free' && 'خطة مجانية مع ميزات محدودة'}
                  {plan?.name === 'builder' && 'مثالية للمطورين والمشاريع الصغيرة'}
                  {plan?.name === 'pro' && 'للشركات والمشاريع الكبيرة'}
                  {plan?.name === 'hosting' && 'استضافة فقط للمشاريع الموجودة'}
                </p>
              </div>

              {subscription && (
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">بداية الفترة</div>
                    <div className="font-medium">
                      {formatDate(subscription.current_period_start)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">نهاية الفترة</div>
                    <div className="font-medium">
                      {formatDate(subscription.current_period_end)}
                    </div>
                  </div>
                  {subscription.next_payment_date && (
                    <>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">الدفع القادم</div>
                        <div className="font-medium">
                          {formatDate(subscription.next_payment_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">المبلغ</div>
                        <div className="font-medium text-primary">
                          {subscription.last_payment_amount} د.ك
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <UpgradePlanButton currentPlan={plan?.name || 'free'} />
                {subscription && subscription.status === 'active' && plan?.name !== 'free' && (
                  <CancelSubscriptionButton subscriptionId={subscription.id} />
                )}
              </div>

              {subscription?.cancel_at_period_end && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <strong>تم إلغاء الاشتراك.</strong> سيظل نشطاً حتى{' '}
                    {formatDate(subscription.current_period_end)}، ثم سيتم تخفيضه إلى الخطة
                    المجانية.
                  </div>
                </div>
              )}

              {subscription?.card_last_four && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>
                    بطاقة منتهية بـ {subscription.card_last_four} (
                    {subscription.card_type === 'knet' ? 'K-Net' : 'بطاقة ائتمان'})
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الاستخدام
            </CardTitle>
            <CardDescription>استهلاكك الحالي من الموارد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Projects Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  المشاريع
                </span>
                <span className="font-medium">
                  {currentUsage.projects_count} / {planLimits.max_projects}
                </span>
              </div>
              <Progress
                value={(currentUsage.projects_count / planLimits.max_projects) * 100}
                className="h-2"
              />
            </div>

            {/* Storage Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  التخزين
                </span>
                <span className="font-medium">
                  {currentUsage.storage_used_mb} MB / {planLimits.max_storage_mb} MB
                </span>
              </div>
              <Progress
                value={(currentUsage.storage_used_mb / planLimits.max_storage_mb) * 100}
                className="h-2"
              />
            </div>

            {/* AI Prompts Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  طلبات AI (اليوم)
                </span>
                <span className="font-medium">
                  {currentUsage.prompts_used_today} / {planLimits.max_prompts_per_day}
                </span>
              </div>
              <Progress
                value={(currentUsage.prompts_used_today / planLimits.max_prompts_per_day) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-3 border-t text-xs text-gray-500">
              يتم إعادة تعيين حدود الاستخدام اليومية في منتصف الليل (UTC+3)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            سجل المدفوعات
          </CardTitle>
          <CardDescription>آخر 10 معاملات</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد معاملات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead className="border-b">
                  <tr className="text-right">
                    <th className="p-3 text-sm font-semibold">التاريخ</th>
                    <th className="p-3 text-sm font-semibold">النوع</th>
                    <th className="p-3 text-sm font-semibold">المبلغ</th>
                    <th className="p-3 text-sm font-semibold">الحالة</th>
                    <th className="p-3 text-sm font-semibold">رقم الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{formatDate(tx.created_at)}</td>
                      <td className="p-3 text-sm">
                        {tx.transaction_type === 'initial_subscription' && 'اشتراك جديد'}
                        {tx.transaction_type === 'recurring_charge' && 'تجديد شهري'}
                        {tx.transaction_type === 'upgrade' && 'ترقية'}
                        {tx.transaction_type === 'one_time' && 'دفعة واحدة'}
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {tx.amount} {tx.currency}
                      </td>
                      <td className="p-3 text-sm">
                        {tx.status === 'success' && (
                          <Badge variant="default" className="bg-green-600">
                            نجح
                          </Badge>
                        )}
                        {tx.status === 'pending' && <Badge variant="secondary">قيد الانتظار</Badge>}
                        {tx.status === 'failed' && (
                          <Badge variant="destructive">فشل</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600 font-mono text-xs">
                        {tx.upayments_order_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
