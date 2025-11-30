'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
      })

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setPendingVerification(true)
    } catch (err: any) {
      console.error('Sign up error:', err)
      setError(err.errors?.[0]?.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/onboarding')
      } else {
        setError('حدث خطأ أثناء التحقق')
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.errors?.[0]?.message || 'رمز التحقق غير صحيح')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return

    setLoading(true)
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      })
    } catch (err: any) {
      console.error('Google sign up error:', err)
      setError('فشل التسجيل بواسطة Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50" dir="rtl">
      <div className="w-full max-w-md p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl blur-md opacity-60" />
              <div className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center gap-2 shadow-glow">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                <span className="text-2xl font-black text-white">KW APPS</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Cairo']">
            {pendingVerification ? 'تحقق من بريدك الإلكتروني' : 'أنشئ حسابك'}
          </h1>
          <p className="text-slate-600 font-['Cairo']">
            {pendingVerification
              ? 'أدخل رمز التحقق المرسل إلى بريدك'
              : 'ابدأ رحلتك مع KW APPS اليوم'}
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-['Cairo']">{error}</p>
            </div>
          )}

          {!pendingVerification ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-slate-900 font-bold mb-2 font-['Cairo']">
                    الاسم الكامل
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أحمد محمد"
                      required
                      disabled={loading}
                      className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl font-['Cairo']"
                    />
                  </div>
                </div>

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
                      disabled={loading}
                      className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl font-['Cairo']"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-900 font-bold mb-2 font-['Cairo']">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      disabled={loading}
                      className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl font-['Cairo']"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 font-['Cairo']">
                    يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !isLoaded}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 font-['Cairo']"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب جديد'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-600 font-bold font-['Cairo']">أو</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={loading || !isLoaded}
                className="w-full h-12 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:scale-105 transition-all duration-300 font-bold font-['Cairo']"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <>
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    التسجيل بواسطة Google
                  </>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-slate-600 font-['Cairo']">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    href="/sign-in"
                    className="text-blue-600 hover:text-blue-700 font-black"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleVerification} className="space-y-5">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 font-['Cairo']">
                  تم إرسال رمز التحقق إلى
                  <br />
                  <span className="font-bold text-slate-900">{email}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="code" className="text-slate-900 font-bold mb-2 font-['Cairo']">
                  رمز التحقق
                </Label>
                <div className="relative">
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    required
                    disabled={loading}
                    className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-center text-2xl tracking-widest font-['Cairo']"
                    maxLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 font-['Cairo']"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  'تحقق وأكمل التسجيل'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setPendingVerification(false)}
                className="w-full text-sm text-slate-600 hover:text-slate-900 font-bold font-['Cairo']"
              >
                ← العودة للتسجيل
              </button>
            </form>
          )}
        </div>

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
