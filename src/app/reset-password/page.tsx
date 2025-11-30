'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl blur-md opacity-60" />
              <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center gap-2 shadow-glow">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                <span className="text-2xl font-black text-white font-['Cairo']">KW APPS</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Cairo']">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-slate-600 font-['Cairo']">
            أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
          </p>
        </div>

        {/* Reset Form */}
        <Card className="border-2 border-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center font-['Cairo']">
              نسيت كلمة المرور؟
            </CardTitle>
            <CardDescription className="text-center font-['Cairo']">
              سنرسل لك رابطاً لإعادة تعيين كلمة المرور
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-['Cairo']">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-['Cairo']">
                  تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-900 font-bold mb-2 font-['Cairo']">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading || success}
                    className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl font-['Cairo']"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 font-['Cairo']"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال رابط إعادة التعيين'
                )}
              </Button>
            </form>

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-bold font-['Cairo']"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900 font-bold font-['Cairo']"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
