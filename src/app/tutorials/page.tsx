'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  BookOpen,
  Code,
  Rocket,
  Palette,
  Database,
  Lock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const tutorials = [
  {
    id: 1,
    title: 'البدء مع KW APPS',
    description: 'تعرف على أساسيات المنصة وكيفية إنشاء أول تطبيق لك',
    duration: '5 دقائق',
    level: 'مبتدئ',
    levelColor: 'bg-green-100 text-green-700',
    icon: Sparkles,
    iconColor: 'text-blue-500',
  },
  {
    id: 2,
    title: 'كتابة وصف فعال للتطبيق',
    description: 'نصائح لكتابة وصف يساعد الذكاء الاصطناعي على فهم متطلباتك',
    duration: '8 دقائق',
    level: 'مبتدئ',
    levelColor: 'bg-green-100 text-green-700',
    icon: BookOpen,
    iconColor: 'text-purple-500',
  },
  {
    id: 3,
    title: 'تخصيص التصميم والألوان',
    description: 'كيفية تعديل الألوان والخطوط لتناسب علامتك التجارية',
    duration: '10 دقائق',
    level: 'متوسط',
    levelColor: 'bg-yellow-100 text-yellow-700',
    icon: Palette,
    iconColor: 'text-pink-500',
  },
  {
    id: 4,
    title: 'فهم الكود المولد',
    description: 'شرح مفصل للتقنيات المستخدمة في الكود المولد',
    duration: '15 دقيقة',
    level: 'متوسط',
    levelColor: 'bg-yellow-100 text-yellow-700',
    icon: Code,
    iconColor: 'text-blue-500',
  },
  {
    id: 5,
    title: 'نشر تطبيقك على الإنترنت',
    description: 'خطوات نشر تطبيقك وربطه بدومين خاص',
    duration: '12 دقيقة',
    level: 'متوسط',
    levelColor: 'bg-yellow-100 text-yellow-700',
    icon: Rocket,
    iconColor: 'text-orange-500',
  },
  {
    id: 6,
    title: 'إضافة قاعدة بيانات',
    description: 'كيفية طلب تطبيق مع قاعدة بيانات ونظام تسجيل دخول',
    duration: '20 دقيقة',
    level: 'متقدم',
    levelColor: 'bg-red-100 text-red-700',
    icon: Database,
    iconColor: 'text-green-500',
  },
  {
    id: 7,
    title: 'أمان التطبيقات',
    description: 'أفضل الممارسات لتأمين تطبيقك وحماية بيانات المستخدمين',
    duration: '18 دقيقة',
    level: 'متقدم',
    levelColor: 'bg-red-100 text-red-700',
    icon: Lock,
    iconColor: 'text-red-500',
  },
]

const quickTips = [
  'استخدم وصفاً واضحاً ومحدداً لتطبيقك',
  'حدد الألوان والخطوط المطلوبة في الوصف',
  'اذكر نوع التطبيق (متجر، مدونة، لوحة تحكم)',
  'وضح الصفحات والأقسام المطلوبة',
]

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white" dir="rtl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">KW APPS</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16" dir="rtl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" />
            الدروس التعليمية
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-['Cairo']">
            تعلم كيف تبني تطبيقاتك
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-['Cairo']">
            دروس تعليمية شاملة لمساعدتك على الاستفادة القصوى من KW APPS
          </p>
        </div>

        {/* Quick Tips */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="font-['Cairo'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                نصائح سريعة للنجاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {quickTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="font-['Cairo'] text-slate-700">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutorials Grid */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">جميع الدروس</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tutorials.map((tutorial) => (
              <Card
                key={tutorial.id}
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-102 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <tutorial.icon className={`w-6 h-6 ${tutorial.iconColor}`} />
                    </div>
                    <Badge className={tutorial.levelColor}>{tutorial.level}</Badge>
                  </div>
                  <CardTitle className="font-['Cairo']">{tutorial.title}</CardTitle>
                  <CardDescription className="font-['Cairo']">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-['Cairo']">{tutorial.duration}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="font-['Cairo']">
                      <Play className="w-4 h-4 ml-2" />
                      ابدأ الدرس
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-500 border-0">
            <CardContent className="p-10">
              <h2 className="text-3xl font-bold text-white mb-4 font-['Cairo']">
                جاهز للتطبيق العملي؟
              </h2>
              <p className="text-blue-100 mb-6 font-['Cairo']">
                ابدأ بإنشاء تطبيقك الأول الآن واختبر ما تعلمته
              </p>
              <Link href="/builder">
                <Button size="lg" variant="secondary" className="font-['Cairo'] font-bold">
                  <Rocket className="w-5 h-5 ml-2" />
                  ابدأ الإنشاء
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 mt-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© 2025 KW APPS - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
