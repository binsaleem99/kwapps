/**
 * Generic FormBuilder Component
 *
 * Auto-generates forms from field definitions
 * Used for create/edit dialogs in admin dashboard
 *
 * Usage:
 * <FormBuilder
 *   fields={productFields}
 *   data={product}
 *   onSubmit={(data) => saveProduct(data)}
 * />
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FormField {
  id: string
  label: string
  labelAr: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'email' | 'url'
  required?: boolean
  placeholder?: string
  placeholderAr?: string
  options?: { value: string; label: string; labelAr: string }[]
  validation?: (value: any) => string | null
}

interface FormBuilderProps {
  fields: FormField[]
  data?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel?: () => void
  submitText?: string
  submitTextAr?: string
  className?: string
}

export function FormBuilder({
  fields,
  data = {},
  onSubmit,
  onCancel,
  submitText = 'Save',
  submitTextAr = 'حفظ',
  className = '',
}: FormBuilderProps) {
  const [formData, setFormData] = useState<Record<string, any>>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value })
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.id]

      // Required check
      if (field.required && !value) {
        newErrors[field.id] = `${field.labelAr} مطلوب`
        return
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value)
        if (error) {
          newErrors[field.id] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${className} space-y-4`} dir="rtl">
      {fields.map((field) => (
        <div key={field.id}>
          <Label>
            {field.labelAr}
            {field.required && <span className="text-red-500 ms-1">*</span>}
          </Label>

          {field.type === 'text' || field.type === 'email' || field.type === 'url' ? (
            <Input
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholderAr}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
          ) : field.type === 'number' ? (
            <Input
              type="number"
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, parseFloat(e.target.value))}
              placeholder={field.placeholderAr}
              className={errors[field.id] ? 'border-red-500' : ''}
              step="0.001"
            />
          ) : field.type === 'textarea' ? (
            <Textarea
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholderAr}
              rows={4}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
          ) : field.type === 'select' ? (
            <Select
              value={formData[field.id]}
              onValueChange={(value) => handleChange(field.id, value)}
            >
              <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholderAr} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'checkbox' ? (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => handleChange(field.id, checked)}
              />
              <span className="text-sm">{field.placeholderAr}</span>
            </div>
          ) : null}

          {errors[field.id] && (
            <p className="text-sm text-red-600 mt-1 text-end">{errors[field.id]}</p>
          )}
        </div>
      ))}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'جاري الحفظ...' : submitTextAr}
        </Button>
      </div>
    </form>
  )
}
