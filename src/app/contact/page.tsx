'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.errorAr || 'فشل إرسال الرسالة')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

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
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-700 mb-2 font-['Cairo']">
                    تم إرسال رسالتك بنجاح!
                  </h3>
                  <p className="text-gray-600 font-['Cairo']">
                    سنتواصل معك قريباً
                  </p>
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="mt-4 font-['Cairo']"
                  >
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-['Cairo']">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2 font-['Cairo']">
                      الاسم
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-['Cairo']"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 font-['Cairo']">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 font-['Cairo']">
                      رقم الهاتف
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-2 bg-slate-100 border rounded-lg text-slate-600 font-medium">
                        +965
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="12345678"
                        maxLength={8}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-['Cairo']">اختياري - 8 أرقام</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 font-['Cairo']">
                      الرسالة
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-['Cairo']"
                      placeholder="كيف يمكننا مساعدتك؟"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-['Cairo']"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      'إرسال الرسالة'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 mt-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© {new Date().getFullYear()} KW APPS - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
