'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Code, Globe, Zap } from 'lucide-react'
import { User as UserType } from '@/types'

interface ProfileTabProps {
  userEmail: string
}

export function ProfileTab({ userEmail }: ProfileTabProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    publishedProjects: 0,
    generationsToday: 0,
    generationsThisMonth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchStats()
  }, [])

  const fetchUserData = async () => {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single<UserType>()

      if (data) {
        setUser(data)
      }
    }
  }

  const fetchStats = async () => {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return

    // Get today and month start dates
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString().split('T')[0]

    // OPTIMIZATION: Run all queries in PARALLEL instead of sequential
    const [projectsResult, todayUsageResult, monthUsageResult] = await Promise.all([
      supabase
        .from('projects')
        .select('id, status')
        .eq('user_id', authUser.id),
      supabase
        .from('usage_limits')
        .select('prompt_count')
        .eq('user_id', authUser.id)
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('usage_limits')
        .select('prompt_count')
        .eq('user_id', authUser.id)
        .gte('date', startOfMonth)
    ])

    // Process results
    const allProjects = projectsResult.data || []
    const totalProjects = allProjects.length
    const publishedProjects = allProjects.filter((p) => p.status === 'published').length

    const generationsToday = todayUsageResult.data?.prompt_count || 0
    const generationsThisMonth =
      monthUsageResult.data?.reduce((sum, record) => sum + record.prompt_count, 0) || 0

    setStats({
      totalProjects,
      publishedProjects,
      generationsToday,
      generationsThisMonth,
    })
    setIsLoading(false)
  }

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      free: 'مجاني',
      builder: 'مطور',
      pro: 'احترافي',
      hosting_only: 'استضافة فقط',
    }
    return labels[plan] || plan
  }

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      free: 'bg-slate-100 text-slate-700 border-slate-300',
      builder: 'bg-blue-100 text-blue-700 border-blue-300',
      pro: 'bg-blue-100 text-blue-700 border-blue-300',
      hosting_only: 'bg-green-100 text-green-700 border-green-300',
    }
    return colors[plan] || 'bg-slate-100 text-slate-700'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-pulse">
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-12 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-200 rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-slate-200 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Info Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            معلومات الملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-900 text-lg">{userEmail}</p>
            </div>
          </div>

          {/* Plan */}
          {user && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                الخطة الحالية
              </label>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Badge className={`text-base px-4 py-2 ${getPlanColor(user.plan)}`}>
                  {getPlanLabel(user.plan)}
                </Badge>
              </div>
            </div>
          )}

          {/* Join Date */}
          {user && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                تاريخ الانضمام
              </label>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-900">
                  {new Date(user.created_at).toLocaleDateString('ar-KW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Projects */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                إجمالي المشاريع
              </span>
              <Code className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {stats.totalProjects}
            </p>
          </div>

          {/* Published Projects */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">
                المواقع المنشورة
              </span>
              <Globe className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-900">
              {stats.publishedProjects}
            </p>
          </div>

          {/* Generations Today */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                إنشاءات اليوم
              </span>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {stats.generationsToday}
            </p>
          </div>

          {/* Generations This Month */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">
                إنشاءات هذا الشهر
              </span>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {stats.generationsThisMonth}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
