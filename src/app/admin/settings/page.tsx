'use client'

import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-['Cairo']">
              إعدادات النظام
            </h1>
            <p className="text-slate-600 font-['Cairo']">
              إعدادات المنصة والتكوينات العامة
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Cairo']">
            قريباً
          </h2>
          <p className="text-slate-600 font-['Cairo']">
            لوحة إعدادات النظام قيد التطوير
          </p>
        </div>
      </div>
    </div>
  )
}
