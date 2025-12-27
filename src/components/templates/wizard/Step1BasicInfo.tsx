/**
 * Step 1: Basic Business Information
 */

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GCCPhoneInput } from '@/components/gcc/GCCPhoneInput'
import { Template } from '@/lib/templates/types'

interface Step1Props {
  data: any
  onChange: (data: any) => void
  template: Template
}

export function Step1BasicInfo({ data, onChange, template }: Step1Props) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">المعلومات الأساسية</h2>
        <p className="text-gray-600 dark:text-gray-400">
          أدخل معلومات نشاطك التجاري
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>اسم النشاط <span className="text-red-500">*</span></Label>
          <Input
            value={data.businessName}
            onChange={(e) => onChange({ ...data, businessName: e.target.value })}
            placeholder="مثال: صالون الأناقة"
          />
        </div>

        <div>
          <Label>رقم الهاتف <span className="text-red-500">*</span></Label>
          <GCCPhoneInput
            value={data.phone}
            onChange={(val) => onChange({ ...data, phone: val })}
            country={data.country}
            allowCountryChange
          />
        </div>

        <div>
          <Label>البريد الإلكتروني <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="info@business.com"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  )
}
