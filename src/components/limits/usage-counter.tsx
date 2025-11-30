'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Zap, HardDrive, Folder, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface UsageData {
  prompts: { used: number; limit: number; percentage: number }
  projects: { used: number; limit: number; percentage: number }
  storage: { used: number; limit: number; percentage: number }
  planName: string
}

interface UsageCounterProps {
  compact?: boolean // Compact mode for builder header
  showUpgradeButton?: boolean // Show upgrade CTA
}

export function UsageCounter({ compact = false, showUpgradeButton = true }: UsageCounterProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!usage) return null

  // Compact mode for header
  if (compact) {
    const isNearLimit = usage.prompts.percentage >= 80
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border text-right"
        dir="rtl"
      >
        <Zap className={`w-4 h-4 ${isNearLimit ? 'text-orange-500' : 'text-primary'}`} />
        <span className="text-sm font-semibold" style={{ fontFamily: 'Cairo, sans-serif' }}>
          استخدمت {usage.prompts.used} من {usage.prompts.limit}
        </span>
        {isNearLimit && (
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="h-7 text-xs mr-2">
              ترقية
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // Full mode for dashboard
  const isPromptsLimitReached = usage.prompts.used >= usage.prompts.limit
  const isProjectsLimitReached = usage.projects.used >= usage.projects.limit

  return (
    <div dir="rtl">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
              استخدامك اليوم
            </h3>
            <p className="text-sm text-gray-600">
              الخطة الحالية: <strong className="text-primary">{usage.planName}</strong>
            </p>
          </div>
          {showUpgradeButton && usage.planName !== 'pro' && (
            <Link href="/pricing">
              <Button size="sm" variant="outline">
                <TrendingUp className="w-4 h-4 ml-2" />
                ترقية الخطة
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {/* AI Prompts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap
                  className={`w-5 h-5 ${isPromptsLimitReached ? 'text-red-500' : 'text-primary'}`}
                />
                <span className="font-semibold">طلبات الذكاء الاصطناعي</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.prompts.used} / {usage.prompts.limit}
              </span>
            </div>
            <Progress value={usage.prompts.percentage} className="h-2" />
            {isPromptsLimitReached && (
              <p className="text-xs text-red-600 mt-1">
                لقد وصلت إلى الحد اليومي! قم بالترقية للحصول على طلبات إضافية.
              </p>
            )}
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Folder
                  className={`w-5 h-5 ${isProjectsLimitReached ? 'text-red-500' : 'text-blue-500'}`}
                />
                <span className="font-semibold">المشاريع</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.projects.used} / {usage.projects.limit}
              </span>
            </div>
            <Progress value={usage.projects.percentage} className="h-2" />
            {isProjectsLimitReached && (
              <p className="text-xs text-red-600 mt-1">
                لقد وصلت إلى الحد الأقصى للمشاريع! قم بالترقية لإنشاء المزيد.
              </p>
            )}
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="font-semibold">التخزين</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.storage.used} MB / {usage.storage.limit} MB
              </span>
            </div>
            <Progress value={usage.storage.percentage} className="h-2" />
          </div>
        </div>

        {/* Plan Comparison */}
        {(isPromptsLimitReached || isProjectsLimitReached) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-sm mb-2">📈 قارن الخطط</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">مجاني</div>
                <div className="text-gray-600">3 طلبات/يوم</div>
              </div>
              <div className="text-center bg-blue-100 rounded p-1">
                <div className="font-semibold text-blue-700">بناء</div>
                <div className="text-blue-600">30 طلب/يوم</div>
                <div className="text-blue-800 font-bold">33 د.ك</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">احترافي</div>
                <div className="text-gray-600">100 طلب/يوم</div>
                <div className="font-bold">59 د.ك</div>
              </div>
            </div>
            <Link href="/pricing" className="block mt-3">
              <Button size="sm" className="w-full">
                عرض جميع الخطط
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
