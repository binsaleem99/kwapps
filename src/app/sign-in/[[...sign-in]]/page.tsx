'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth/translate-error'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true)

  // Get redirect params for checkout flow
  const redirectUrl = searchParams.get('redirect')
  const tierParam = searchParams.get('tier')
  const trialParam = searchParams.get('trial')
  const errorParam = searchParams.get('error')

  // Handle OAuth error from callback
  useEffect(() => {
    if (errorParam === 'oauth_failed') {
      setError(translateAuthError('oauth_failed'))
    }
  }, [errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Redirect based on checkout params or default to dashboard
      if (tierParam) {
        // Redirect to checkout page which handles payment with established session
        router.push(`/checkout?tier=${tierParam}&trial=${trialParam || 'false'}`)
      } else {
        router.push(redirectUrl || '/dashboard')
      }
      router.refresh()
    } catch (err: any) {
      console.error('Sign in error:', err)
      const translatedError = translateAuthError(err.message || '')
      setError(translatedError)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Include tier info in callback URL for checkout after OAuth
      let callbackUrl = `${window.location.origin}/auth/callback`
      if (tierParam) {
        callbackUrl += `?tier=${tierParam}&trial=${trialParam || 'false'}`
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Google sign in error:', err)
      const translatedError = translateAuthError(err.message || '')
      setError(translatedError || 'فشل تسجيل الدخول بواسطة Google')
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
            مرحباً بعودتك
          </h1>
          <p className="text-slate-600 font-['Cairo']">
            سجل الدخول للمتابعة إلى لوحة التحكم
          </p>
          {/* Trial Badge - Show when coming from trial flow */}
          {trialParam === 'true' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-500 rounded-full">
              <span className="text-green-700 font-bold font-['Cairo']">🎉 تجربة أسبوع بدينار واحد فقط!</span>
            </div>
          )}
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-['Cairo']">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="بريدك@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl font-['Cairo'] transition-all"
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
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="pr-10 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl font-['Cairo'] transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-bold font-['Cairo']"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 font-['Cairo']"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
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

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
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
                تسجيل الدخول بواسطة Google
              </>
            )}
          </Button>

          {/* Sign Up Link - Preserve query params for trial flow */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 font-['Cairo']">
              ليس لديك حساب؟{' '}
              <Link
                href={`/sign-up${tierParam ? `?tier=${tierParam}&trial=${trialParam || 'false'}` : ''}`}
                className="text-blue-600 hover:text-blue-700 font-black"
              >
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
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
