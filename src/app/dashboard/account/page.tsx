'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin, Building, Save, Loader2, Key, Bell, Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company: string | null
  location: string | null
  avatar_url: string | null
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notifications, setNotifications] = useState({
    email_updates: true,
    project_notifications: true,
    marketing_emails: false,
    billing_alerts: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/sign-in'
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        phone: profileData?.phone || '',
        company: profileData?.company || '',
        location: profileData?.location || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          company: profile.company,
          location: profile.location,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('تم حفظ التغييرات بنجاح')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('فشل حفظ التغييرات')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordReset() {
    if (!profile?.email) return

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) throw error

      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    } catch (error) {
      console.error('Error sending password reset:', error)
      toast.error('فشل إرسال رابط إعادة تعيين كلمة المرور')
    }
  }

  async function handleDeleteAccount() {
    if (!profile) return

    setIsDeleting(true)
    try {
      // Call API to delete account
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('فشل حذف الحساب')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('فشل حذف الحساب')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Cairo, sans-serif' }}>
              <User className="w-8 h-8 text-blue-400" />
              الحساب
            </h1>
            <p className="text-slate-400 mt-1">إدارة معلومات حسابك الشخصية</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ التغييرات
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">الملف الشخصي</CardTitle>
            <CardDescription className="text-slate-400">معلوماتك الشخصية الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  تغيير الصورة
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  الاسم الكامل
                </Label>
                <Input
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(profile ? {...profile, full_name: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-slate-700/50 border-slate-600 text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف
                </Label>
                <Input
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(profile ? {...profile, phone: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="+965 XXXX XXXX"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  الشركة
                </Label>
                <Input
                  value={profile?.company || ''}
                  onChange={(e) => setProfile(profile ? {...profile, company: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="اسم الشركة (اختياري)"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  الموقع
                </Label>
                <Input
                  value={profile?.location || ''}
                  onChange={(e) => setProfile(profile ? {...profile, location: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="المدينة، الدولة"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              الأمان
            </CardTitle>
            <CardDescription className="text-slate-400">إدارة كلمة المرور وإعدادات الأمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">كلمة المرور</h4>
                <p className="text-slate-400 text-sm">تغيير كلمة المرور الخاصة بحسابك</p>
              </div>
              <Button
                onClick={handlePasswordReset}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                <Key className="w-4 h-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              الإشعارات
            </CardTitle>
            <CardDescription className="text-slate-400">تحكم في الإشعارات التي تصلك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">تحديثات المشاريع</h4>
                <p className="text-slate-400 text-sm">إشعارات عند تحديث أو نشر مشاريعك</p>
              </div>
              <Switch
                checked={notifications.project_notifications}
                onCheckedChange={(checked) => setNotifications({...notifications, project_notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">تنبيهات الفوترة</h4>
                <p className="text-slate-400 text-sm">إشعارات الدفع والاشتراك</p>
              </div>
              <Switch
                checked={notifications.billing_alerts}
                onCheckedChange={(checked) => setNotifications({...notifications, billing_alerts: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">تحديثات المنصة</h4>
                <p className="text-slate-400 text-sm">أخبار وميزات جديدة</p>
              </div>
              <Switch
                checked={notifications.email_updates}
                onCheckedChange={(checked) => setNotifications({...notifications, email_updates: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <h4 className="text-white font-medium">رسائل تسويقية</h4>
                <p className="text-slate-400 text-sm">عروض وخصومات حصرية</p>
              </div>
              <Switch
                checked={notifications.marketing_emails}
                onCheckedChange={(checked) => setNotifications({...notifications, marketing_emails: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              منطقة الخطر
            </CardTitle>
            <CardDescription className="text-red-300/70">إجراءات لا يمكن التراجع عنها</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الحساب نهائياً
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-slate-700" dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك نهائياً مع جميع مشاريعك وبياناتك.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                    إلغاء
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 ml-2" />
                    )}
                    نعم، احذف حسابي
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
