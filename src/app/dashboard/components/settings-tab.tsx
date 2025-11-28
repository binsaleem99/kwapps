'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Bell, Globe, Palette, Save } from 'lucide-react'
import { User } from '@/types'

export function SettingsTab() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single<User>()

      if (data) {
        setUser(data)
        setDisplayName(data.display_name || '')
        setLanguage(data.language)
      }
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        display_name: displayName.trim() || null,
        language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setIsSaving(false)

    if (error) {
      setSaveMessage('فشل في حفظ الإعدادات')
    } else {
      setSaveMessage('تم حفظ الإعدادات بنجاح')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>
            قم بتخصيص تجربتك في KW APPS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">الاسم المعروض (اختياري)</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل اسمك"
              className="text-right"
              dir="rtl"
            />
            <p className="text-sm text-slate-500">
              سيظهر هذا الاسم في لوحة التحكم الخاصة بك
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              اللغة المفضلة
            </Label>
            <Select value={language} onValueChange={(val) => setLanguage(val as 'ar' | 'en')}>
              <SelectTrigger id="language" className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              لغة واجهة المستخدم والمحتوى المُنشأ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            الإشعارات
          </CardTitle>
          <CardDescription>
            إدارة إشعاراتك وتفضيلات البريد الإلكتروني
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="emailNotifications" className="text-base font-medium">
                إشعارات البريد الإلكتروني
              </Label>
              <p className="text-sm text-slate-500">
                تلقي تحديثات حول مشاريعك والميزات الجديدة
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                إشعارات المتصفح
              </Label>
              <p className="text-sm text-slate-500">
                إشعارات فورية عند اكتمال عمليات الإنشاء
              </p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            المظهر
          </CardTitle>
          <CardDescription>
            تخصيص مظهر التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>السمة (قريباً)</Label>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 border-2 border-blue-500 rounded-lg bg-white">
                <div className="w-full h-12 bg-white border border-slate-200 rounded mb-2" />
                <p className="text-sm font-medium">فاتح</p>
              </button>
              <button className="p-4 border-2 border-transparent rounded-lg bg-white hover:border-slate-300">
                <div className="w-full h-12 bg-slate-800 rounded mb-2" />
                <p className="text-sm font-medium text-slate-500">داكن</p>
              </button>
              <button className="p-4 border-2 border-transparent rounded-lg bg-white hover:border-slate-300">
                <div className="w-full h-12 bg-gradient-to-r from-white to-slate-800 rounded mb-2" />
                <p className="text-sm font-medium text-slate-500">تلقائي</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          {saveMessage && (
            <p
              className={`text-sm font-medium ${
                saveMessage.includes('نجاح') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isSaving ? (
            <>جاري الحفظ...</>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
