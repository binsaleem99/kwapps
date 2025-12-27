/**
 * Step 2: Color Scheme Selection
 */

'use client'

import { Template } from '@/lib/templates/types'

interface Step2Props {
  data: any
  onChange: (data: any) => void
  template: Template
}

export function Step2ColorScheme({ data, onChange, template }: Step2Props) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">اختر نظام الألوان</h2>
        <p className="text-gray-600 dark:text-gray-400">
          اختر من الأنظمة الجاهزة أو أنشئ نظاماً مخصصاً
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {template.colorSchemes.map((scheme) => (
          <div
            key={scheme.id}
            onClick={() => onChange({ preset: scheme.id, custom: undefined })}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              data.preset === scheme.id
                ? 'border-primary shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="flex gap-2 mb-4">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: scheme.primary }} />
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: scheme.secondary }} />
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: scheme.accent }} />
            </div>
            <h3 className="font-bold mb-1">{scheme.nameAr}</h3>
            <p className="text-sm text-gray-500">{scheme.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
