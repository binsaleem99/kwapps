'use client'

import { Suspense } from 'react'
import { BuilderPageContentNew } from './builder-content-new'
import { Sparkles, Loader2 } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full">
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-gray-900 font-bold font-['Cairo'] mb-2">جاري تحميل المنشئ</p>
            <p className="text-sm text-gray-600 font-['Cairo']">يرجى الانتظار...</p>
          </div>
        </div>
      }
    >
      <BuilderPageContentNew />
    </Suspense>
  )
}
