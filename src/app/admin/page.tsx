import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, DollarSign, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: activeSubscriptions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).neq('plan', 'free'),
  ])

  const stats = [
    {
      title: 'إجمالي المستخدمين',
      value: totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'إجمالي المشاريع',
      value: totalProjects || 0,
      icon: FolderKanban,
      color: 'from-slate-500 to-slate-600',
    },
    {
      title: 'الاشتراكات المدفوعة',
      value: activeSubscriptions || 0,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'معدل التحويل',
      value: totalUsers ? `${Math.round(((activeSubscriptions || 0) / totalUsers) * 100)}%` : '0%',
      icon: Activity,
      color: 'from-blue-400 to-blue-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">مرحباً بك في لوحة التحكم الإدارية</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>نشاط المستخدمين الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">سيتم عرض نشاط المستخدمين هنا</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المشاريع الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">سيتم عرض المشاريع الأخيرة هنا</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
