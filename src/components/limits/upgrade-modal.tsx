'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, X, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  limitType?: 'prompts' | 'projects' | 'storage'
  currentUsed?: number
  currentLimit?: number
}

export function UpgradeModal({
  open,
  onOpenChange,
  limitType = 'prompts',
  currentUsed = 0,
  currentLimit = 3,
}: UpgradeModalProps) {
  const limitMessages = {
    prompts: {
      title: 'لقد وصلت إلى حد طلبات الذكاء الاصطناعي اليومية',
      description: `لقد استخدمت ${currentUsed} من ${currentLimit} طلبات متاحة اليوم.`,
      icon: <Zap className="w-12 h-12 text-orange-500" />,
    },
    projects: {
      title: 'لقد وصلت إلى الحد الأقصى للمشاريع',
      description: `لديك ${currentUsed} من ${currentLimit} مشاريع متاحة.`,
      icon: <Sparkles className="w-12 h-12 text-blue-500" />,
    },
    storage: {
      title: 'لقد وصلت إلى حد التخزين',
      description: `لقد استخدمت ${currentUsed} MB من ${currentLimit} MB متاحة.`,
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
    },
  }

  const currentMessage = limitMessages[limitType]

  const plans = [
    {
      name: 'بناء',
      nameEn: 'Builder',
      price: 33,
      features: [
        '30 طلب ذكاء اصطناعي يومياً',
        '10 مشاريع',
        '1 GB تخزين',
        'دومين مخصص',
        'دعم أولوية',
      ],
      notIncluded: ['تحليلات متقدمة', 'دعم VIP'],
      popular: true,
    },
    {
      name: 'احترافي',
      nameEn: 'Pro',
      price: 59,
      features: [
        '100 طلب ذكاء اصطناعي يومياً',
        '100 مشروع',
        '10 GB تخزين',
        'دومين مخصص',
        'دعم VIP',
        'تحليلات متقدمة',
        'أولوية في الميزات الجديدة',
      ],
      notIncluded: [],
      popular: false,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-4">
            {currentMessage.icon}
            <DialogTitle
              className="text-2xl font-bold mt-4 mb-2"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              {currentMessage.title}
            </DialogTitle>
            <p className="text-gray-600">{currentMessage.description}</p>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-center mb-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
            اختر خطة للمتابعة
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border-2 rounded-lg p-6 ${
                  plan.popular
                    ? 'border-primary bg-gradient-to-br from-blue-50 to-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    الأكثر شعبية
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600">د.ك / شهرياً</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/pricing?plan=${plan.nameEn.toLowerCase()}`} className="block">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    اختر {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              💡 يمكنك الإلغاء في أي وقت. لا توجد التزامات طويلة الأجل.
            </p>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                عرض جميع الخطط والأسعار
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
