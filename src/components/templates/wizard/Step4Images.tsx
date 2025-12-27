/**
 * Step 4: Image Upload
 */

'use client'

import { Template } from '@/lib/templates/types'

interface Step4Props {
  data: Record<string, string | string[]>
  onChange: (data: Record<string, string | string[]>) => void
  template: Template
}

export function Step4Images({ data, onChange, template }: Step4Props) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">الصور</h2>
        <p className="text-gray-600 dark:text-gray-400">
          أضف الصور لموقعك (اختياري - يمكنك إضافتها لاحقاً)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template.imageRequirements.map((req) => (
          <div key={req.id} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">📷</div>
            <h3 className="font-bold mb-1">{req.labelAr}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {req.dimensions} • {req.required ? 'مطلوبة' : 'اختيارية'}
            </p>
            <button className="text-sm text-primary hover:underline">
              تحميل الصورة
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        💡 <strong>نصيحة:</strong> يمكنك تخطي هذه الخطوة وإضافة الصور لاحقاً عبر المحرر المرئي
      </div>
    </div>
  )
}
