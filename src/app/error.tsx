'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (in production, send to error tracking service)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4" dir="rtl">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-50" />
              <div className="relative px-3 py-2 bg-gradient-primary rounded-lg">
                <span className="text-2xl font-black text-white">KW</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">KW APPS</div>
          </div>
        </div>

        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative p-6 bg-red-50 rounded-full border-4 border-red-100">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900">
            حدث خطأ ما!
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            عذراً، حدث خطأ غير متوقع أثناء معالجة طلبك.
            لا تقلق، فريقنا يعمل على حل المشكلة.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-right">
              <p className="text-sm font-bold text-red-900 mb-2">تفاصيل الخطأ (development only):</p>
              <code className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-gradient-primary text-white hover:shadow-glow transition-all px-8 py-6 text-lg font-black"
          >
            <RefreshCw className="w-5 h-5 ml-2" />
            إعادة المحاولة
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg font-bold hover:bg-blue-50 hover:border-blue-500 transition-all"
          >
            <Link href="/">
              <Home className="w-5 h-5 ml-2" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            إذا استمرت المشكلة، يرجى{' '}
            <Link href="/contact" className="text-blue-500 hover:underline font-medium">
              الاتصال بفريق الدعم
            </Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 opacity-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-400 to-red-600 blur-3xl" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-slate-500 blur-3xl" />
        </div>
      </div>
    </div>
  )
}
