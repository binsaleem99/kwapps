/**
 * Step 3: Content Input
 */

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Template } from '@/lib/templates/types'

interface Step3Props {
  data: Record<string, string>
  onChange: (data: Record<string, string>) => void
  template: Template
}

export function Step3Content({ data, onChange, template }: Step3Props) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">محتوى الموقع</h2>
        <p className="text-gray-600 dark:text-gray-400">
          أضف المحتوى النصي لموقعك
        </p>
      </div>

      <div className="space-y-4">
        {template.contentRequirements.map((req) => (
          <div key={req.field}>
            <Label>
              {req.labelAr}
              {req.required && <span className="text-red-500 ms-1">*</span>}
            </Label>
            {req.type === 'textarea' ? (
              <Textarea
                value={data[req.field] || ''}
                onChange={(e) => handleChange(req.field, e.target.value)}
                placeholder={req.placeholderAr}
                rows={5}
              />
            ) : (
              <Input
                value={data[req.field] || ''}
                onChange={(e) => handleChange(req.field, e.target.value)}
                placeholder={req.placeholderAr}
                maxLength={req.maxLength}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
