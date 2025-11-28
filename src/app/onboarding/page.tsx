'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard immediately
    // TODO: Add proper onboarding flow in the future
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-600 text-lg" dir="rtl">
          جاري التحميل...
        </p>
      </div>
    </div>
  )
}
