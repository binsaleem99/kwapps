'use client'

import { Suspense } from 'react'
import { BuilderPageContent } from './builder-content'
import { Sparkles } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600 font-['Cairo']">جاري التحميل...</p>
        </div>
      </div>
    }>
      <BuilderPageContent />
    </Suspense>
  )
}
