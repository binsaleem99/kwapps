'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SSOCallback() {
  const router = useRouter()

  useEffect(() => {
    // Clerk handles OAuth redirects automatically
    // This page is just a loading state while authentication completes
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <p className="text-lg text-gray-600 font-['Cairo']">جاري تسجيل الدخول...</p>
      </div>
    </div>
  )
}
