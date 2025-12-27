/**
 * WhatsApp Widget Configuration
 *
 * Configure floating WhatsApp button for websites
 * Features:
 * - GCC phone validation
 * - Pre-filled message customization
 * - Position selection (4 corners)
 * - Styling options
 * - Working hours support
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GCCPhoneInput } from '@/components/gcc/GCCPhoneInput'
import { Switch } from '@/components/ui/switch'
import { MessageCircle } from 'lucide-react'

export interface WhatsAppWidgetConfig {
  phoneNumber: string
  country: string
  welcomeMessage: string
  buttonText: string
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  primaryColor: string
  showOnMobile: boolean
  showOnDesktop: boolean
  workingHours?: {
    enabled: boolean
    start: string // "09:00"
    end: string // "18:00"
    timezone: string
  }
}

interface WhatsAppWidgetConfigProps {
  projectId: string
  initialConfig?: Partial<WhatsAppWidgetConfig>
  onSave: (config: WhatsAppWidgetConfig) => Promise<void>
}

export function WhatsAppWidgetConfig({
  projectId,
  initialConfig,
  onSave,
}: WhatsAppWidgetConfigProps) {
  const [config, setConfig] = useState<WhatsAppWidgetConfig>({
    phoneNumber: '',
    country: 'KW',
    welcomeMessage: 'مرحباً، أريد الاستفسار عن...',
    buttonText: 'تواصل معنا',
    position: 'bottom-left', // RTL default
    primaryColor: '#25D366', // WhatsApp green
    showOnMobile: true,
    showOnDesktop: true,
    ...initialConfig,
  })

  const [phoneValid, setPhoneValid] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handlePhoneChange = (value: string, isValid: boolean) => {
    setConfig({ ...config, phoneNumber: value })
    setPhoneValid(isValid)
  }

  const handleSave = async () => {
    if (!phoneValid) {
      alert('يرجى إدخال رقم هاتف صحيح')
      return
    }

    setIsSaving(true)
    try {
      await onSave(config)
      alert('تم حفظ إعدادات واتساب بنجاح!')
    } catch (error) {
      alert('حدث خطأ في الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">إعدادات زر واتساب</h2>
        <p className="text-gray-600 dark:text-gray-400">
          أضف زر واتساب عائم لموقعك للتواصل السريع
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <Label>رقم واتساب <span className="text-red-500">*</span></Label>
        <GCCPhoneInput
          value={config.phoneNumber}
          onChange={handlePhoneChange}
          country={config.country as any}
          allowCountryChange
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          الرقم الذي سيتم التواصل معه عبر واتساب
        </p>
      </div>

      {/* Welcome Message */}
      <div>
        <Label>الرسالة الافتتاحية</Label>
        <Textarea
          value={config.welcomeMessage}
          onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
          placeholder="مرحباً، أريد الاستفسار عن..."
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          الرسالة التي ستظهر عند فتح واتساب
        </p>
      </div>

      {/* Button Text */}
      <div>
        <Label>نص الزر</Label>
        <Input
          value={config.buttonText}
          onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
          placeholder="تواصل معنا"
        />
      </div>

      {/* Position */}
      <div>
        <Label className="mb-3 block">موقع الزر</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'bottom-left', label: 'أسفل اليمين', labelEn: '(RTL: Bottom Right)' },
            { value: 'bottom-right', label: 'أسفل اليسار', labelEn: '(Bottom Left)' },
            { value: 'top-left', label: 'أعلى اليمين', labelEn: '(Top Right)' },
            { value: 'top-right', label: 'أعلى اليسار', labelEn: '(Top Left)' },
          ].map((pos) => (
            <div
              key={pos.value}
              onClick={() => setConfig({ ...config, position: pos.value as any })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                config.position === pos.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{pos.label}</div>
              <div className="text-xs text-gray-500">{pos.labelEn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-3">
        <Label>الظهور</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm">عرض على الجوال</span>
          <Switch
            checked={config.showOnMobile}
            onCheckedChange={(checked) => setConfig({ ...config, showOnMobile: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">عرض على الكمبيوتر</span>
          <Switch
            checked={config.showOnDesktop}
            onCheckedChange={(checked) => setConfig({ ...config, showOnDesktop: checked })}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed">
        <p className="text-sm font-medium mb-4">معاينة:</p>
        <div className="relative w-full h-40 bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
          <div
            className={`absolute ${
              config.position === 'bottom-left'
                ? 'bottom-4 start-4'
                : config.position === 'bottom-right'
                ? 'bottom-4 end-4'
                : config.position === 'top-left'
                ? 'top-4 start-4'
                : 'top-4 end-4'
            }`}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: config.primaryColor }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{config.buttonText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!phoneValid || isSaving} className="flex-1">
          {isSaving ? 'جاري الحفظ...' : 'حفظ وإضافة إلى الموقع'}
        </Button>
      </div>
    </div>
  )
}
