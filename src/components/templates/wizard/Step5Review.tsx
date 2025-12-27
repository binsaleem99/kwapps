/**
 * Step 5: Review & Confirm
 */

'use client'

import { Template, TemplateCustomization } from '@/lib/templates/types'

interface Step5Props {
  customization: TemplateCustomization
  template: Template
}

export function Step5Review({ customization, template }: Step5Props) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">مراجعة التخصيصات</h2>
        <p className="text-gray-600 dark:text-gray-400">
          تأكد من صحة المعلومات قبل توليد الموقع
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-2">المعلومات الأساسية</h3>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-600">النشاط:</span> <strong>{customization.basicInfo.businessName}</strong></div>
            <div><span className="text-gray-600">الهاتف:</span> {customization.basicInfo.phone}</div>
            <div><span className="text-gray-600">البريد:</span> {customization.basicInfo.email}</div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-2">نظام الألوان</h3>
          <div className="text-sm">
            {customization.colorScheme.preset && (
              <span>{template.colorSchemes.find((s) => s.id === customization.colorScheme.preset)?.nameAr}</span>
            )}
          </div>
        </div>

        {/* Content */}
        {Object.keys(customization.content).length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">المحتوى</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(customization.content).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-600">{key}:</span> {value.substring(0, 100)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Final Note */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-center">
          ✓ جاهز! سيتم توليد موقعك في 30-60 ثانية
        </p>
      </div>
    </div>
  )
}
