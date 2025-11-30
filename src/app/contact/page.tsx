'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Phone, ArrowRight } from 'lucide-react'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Simple Header without auth hooks */}
      <header className="border-b bg-white" dir="rtl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            KW APPS
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 font-['Cairo']">
            اتصل بنا
          </h1>
          <p className="text-center text-gray-600 mb-12 font-['Cairo']">
            نحن هنا لمساعدتك. اختر الطريقة المناسبة للتواصل معنا
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Mail className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="font-['Cairo']">البريد الإلكتروني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-['Cairo']">admin@kwapps.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle className="font-['Cairo']">الدعم الفني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-['Cairo']">متوفر على مدار الساعة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle className="font-['Cairo']">الهاتف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-['Cairo']">قريباً</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-['Cairo']">أرسل رسالة</CardTitle>
              <CardDescription className="font-['Cairo']">
                سنرد عليك في أقرب وقت ممكن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Cairo']">
                    الاسم
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Cairo']">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 font-['Cairo']">
                    الرسالة
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="كيف يمكننا مساعدتك؟"
                  />
                </div>
                <Button className="w-full font-['Cairo']">
                  إرسال الرسالة
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 mt-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© 2024 KW APPS - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
