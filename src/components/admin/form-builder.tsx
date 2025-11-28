'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FieldSchema {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'file' | 'json' | 'email' | 'password' | 'url'
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string }>
  rows?: number // For textarea
  accept?: string // For file input
  min?: number // For number input
  max?: number // For number input
  description?: string
}

export interface FormBuilderProps {
  schema: FieldSchema[]
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => Promise<void> | void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  dir?: 'rtl' | 'ltr'
}

export function FormBuilder({
  schema,
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  onCancel,
  dir = 'rtl',
}: FormBuilderProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    schema.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} مطلوب`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const renderField = (field: FieldSchema) => {
    const value = formData[field.name] ?? ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
        return (
          <Input
            type={field.type}
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isLoading}
            dir={dir}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isLoading}
            min={field.min}
            max={field.max}
            dir={dir}
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isLoading}
            rows={field.rows || 4}
            dir={dir}
          />
        )

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleChange(field.name, newValue)}
            disabled={isLoading}
          >
            <SelectTrigger id={field.name} dir={dir}>
              <SelectValue placeholder={field.placeholder || 'اختر...'} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id={field.name}
              checked={value === true}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={isLoading}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </Label>
          </div>
        )

      case 'file':
        return (
          <Input
            type="file"
            id={field.name}
            onChange={(e) => {
              const file = e.target.files?.[0]
              handleChange(field.name, file)
            }}
            accept={field.accept}
            required={field.required}
            disabled={isLoading}
          />
        )

      case 'json':
        return (
          <Textarea
            id={field.name}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleChange(field.name, parsed)
              } catch {
                // Keep as string if invalid JSON
                handleChange(field.name, e.target.value)
              }
            }}
            placeholder={field.placeholder || '{}'}
            required={field.required}
            disabled={isLoading}
            rows={field.rows || 6}
            className="font-mono text-xs"
            dir="ltr"
          />
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={dir}>
      {schema.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type !== 'checkbox' && (
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </Label>
          )}

          {renderField(field)}

          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}

          {errors[field.name] && (
            <p className="text-sm text-red-500">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'جاري الحفظ...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  )
}
