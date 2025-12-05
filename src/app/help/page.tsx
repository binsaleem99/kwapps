'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Search,
  ArrowRight,
  BookOpen,
  MessageCircle,
  HelpCircle,
  FileText,
  Zap,
  CreditCard,
  Settings,
  Code,
  Rocket,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

const helpCategories = [
  {
    icon: Zap,
    title: 'البدء السريع',
    description: 'كيف تبدأ مع KW APPS',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: Code,
    title: 'إنشاء التطبيقات',
    description: 'دليل استخدام منشئ التطبيقات',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: CreditCard,
    title: 'الفوترة والاشتراكات',
    description: 'معلومات عن الأسعار والدفع',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Settings,
    title: 'إعدادات الحساب',
    description: 'إدارة حسابك وتفضيلاتك',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Rocket,
    title: 'النشر والاستضافة',
    description: 'كيفية نشر تطبيقك',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: HelpCircle,
    title: 'استكشاف الأخطاء',
    description: 'حل المشاكل الشائعة',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
]

const faqs = [
  {
    question: 'كيف أبدأ بإنشاء تطبيق؟',
    answer:
      'بعد تسجيل الدخول، اذهب إلى صفحة "إنشاء تطبيق" واكتب وصفاً لتطبيقك باللغة العربية. سيقوم الذكاء الاصطناعي بإنشاء الكود تلقائياً.',
  },
  {
    question: 'ما هي الخطط المتوفرة؟',
    answer:
      'نوفر ثلاث خطط: المجانية (3 طلبات يومياً)، المطور (33 د.ك شهرياً - 30 طلب يومياً)، والاحترافي (59 د.ك شهرياً - 100 طلب يومياً).',
  },
  {
    question: 'هل يمكنني تصدير الكود؟',
    answer:
      'نعم، يمكنك تصدير الكود المولد واستخدامه خارج المنصة. هذه الميزة متاحة في خطة المطور والاحترافي.',
  },
  {
    question: 'كيف يمكنني نشر تطبيقي؟',
    answer:
      'بمجرد الانتهاء من إنشاء تطبيقك، اضغط على زر "نشر" وسيتم استضافة تطبيقك تلقائياً على خوادمنا.',
  },
  {
    question: 'هل بياناتي آمنة؟',
    answer:
      'نعم، نستخدم أحدث تقنيات التشفير وسياسات أمان صارمة لحماية بياناتك ومشاريعك.',
  },
  {
    question: 'كيف يمكنني إلغاء اشتراكي؟',
    answer:
      'يمكنك إلغاء اشتراكك في أي وقت من صفحة الإعدادات > الفوترة. ستستمر في الوصول حتى نهاية فترة الاشتراك الحالية.',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" />
            مركز المساعدة
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-['Cairo']">
            كيف يمكننا مساعدتك؟
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-['Cairo'] mb-8">
            ابحث في قاعدة المعرفة أو تصفح الفئات للعثور على إجابات لأسئلتك
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="ابحث عن مساعدة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-14 text-lg border-2 border-slate-200 rounded-xl font-['Cairo']"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">تصفح حسب الفئة</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {helpCategories.map((category, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-3`}
                  >
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <CardTitle className="font-['Cairo']">{category.title}</CardTitle>
                  <CardDescription className="font-['Cairo']">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">الأسئلة الشائعة</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="font-['Cairo'] text-right font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="font-['Cairo'] text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 font-['Cairo']">لم تجد ما تبحث عنه؟</h2>
              <p className="text-slate-600 mb-6 font-['Cairo']">
                فريق الدعم لدينا جاهز لمساعدتك على مدار الساعة
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <Button className="font-['Cairo']">
                    <MessageCircle className="w-4 h-4 ml-2" />
                    تواصل معنا
                  </Button>
                </Link>
                <Link href="/tutorials">
                  <Button variant="outline" className="font-['Cairo']">
                    <BookOpen className="w-4 h-4 ml-2" />
                    الدروس التعليمية
                  </Button>
                </Link>
              </div>
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
