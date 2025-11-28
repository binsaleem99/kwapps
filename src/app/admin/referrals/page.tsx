'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Copy, Check, TrendingUp, Users, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralCode {
  id: string
  code: string
  influencer_name: string
  influencer_email: string | null
  discount_percentage: number
  commission_percentage: number
  total_uses: number
  total_revenue_kwd: number
  is_active: boolean
  created_at: string
  expires_at: string | null
}

export default function ReferralsAdminPage() {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCode, setSelectedCode] = useState<ReferralCode | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    influencer_name: '',
    influencer_email: '',
    discount_percentage: '0',
    commission_percentage: '30',
    expires_at: '',
  })

  useEffect(() => {
    fetchReferralCodes()
  }, [])

  async function fetchReferralCodes() {
    const supabase = createClient()
    setIsLoading(true)

    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referral codes:', error)
      toast.error('فشل تحميل رموز الإحالة')
    } else {
      setReferralCodes(data || [])
    }

    setIsLoading(false)
  }

  function openCreateDialog() {
    setIsEditing(false)
    setSelectedCode(null)
    setFormData({
      code: generateRandomCode(),
      influencer_name: '',
      influencer_email: '',
      discount_percentage: '0',
      commission_percentage: '30',
      expires_at: '',
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(code: ReferralCode) {
    setIsEditing(true)
    setSelectedCode(code)
    setFormData({
      code: code.code,
      influencer_name: code.influencer_name,
      influencer_email: code.influencer_email || '',
      discount_percentage: code.discount_percentage.toString(),
      commission_percentage: code.commission_percentage.toString(),
      expires_at: code.expires_at ? code.expires_at.split('T')[0] : '',
    })
    setIsDialogOpen(true)
  }

  function generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async function handleSubmit() {
    const supabase = createClient()

    const payload = {
      code: formData.code.toUpperCase(),
      influencer_name: formData.influencer_name,
      influencer_email: formData.influencer_email || null,
      discount_percentage: parseInt(formData.discount_percentage),
      commission_percentage: parseInt(formData.commission_percentage),
      expires_at: formData.expires_at || null,
    }

    if (isEditing && selectedCode) {
      const { error } = await supabase
        .from('referral_codes')
        .update(payload)
        .eq('id', selectedCode.id)

      if (error) {
        console.error('Error updating referral code:', error)
        toast.error('فشل تحديث رمز الإحالة')
      } else {
        toast.success('تم تحديث رمز الإحالة بنجاح')
        setIsDialogOpen(false)
        fetchReferralCodes()
      }
    } else {
      const { error } = await supabase.from('referral_codes').insert([payload])

      if (error) {
        console.error('Error creating referral code:', error)
        toast.error('فشل إنشاء رمز الإحالة')
      } else {
        toast.success('تم إنشاء رمز الإحالة بنجاح')
        setIsDialogOpen(false)
        fetchReferralCodes()
      }
    }
  }

  async function toggleCodeStatus(code: ReferralCode) {
    const supabase = createClient()

    const { error } = await supabase
      .from('referral_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id)

    if (error) {
      console.error('Error toggling code status:', error)
      toast.error('فشل تحديث حالة الرمز')
    } else {
      toast.success(code.is_active ? 'تم تعطيل الرمز' : 'تم تفعيل الرمز')
      fetchReferralCodes()
    }
  }

  async function deleteCode(codeId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الرمز؟')) return

    const supabase = createClient()

    const { error } = await supabase.from('referral_codes').delete().eq('id', codeId)

    if (error) {
      console.error('Error deleting referral code:', error)
      toast.error('فشل حذف رمز الإحالة')
    } else {
      toast.success('تم حذف رمز الإحالة بنجاح')
      fetchReferralCodes()
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('تم نسخ الرمز')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const totalRevenue = referralCodes.reduce((sum, code) => sum + Number(code.total_revenue_kwd), 0)
  const totalUses = referralCodes.reduce((sum, code) => sum + code.total_uses, 0)
  const activeCodesCount = referralCodes.filter((c) => c.is_active).length

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-['Cairo']">رموز الإحالة</h1>
            <p className="text-gray-600 mt-2 font-['Cairo']">
              إدارة رموز الإحالة للمؤثرين مع عمولات مدى الحياة
            </p>
          </div>
          <Button onClick={openCreateDialog} className="font-['Cairo']">
            <Plus className="w-4 h-4 ml-2" />
            إنشاء رمز جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-['Cairo']">الرموز النشطة</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-['Cairo']">{activeCodesCount}</div>
              <p className="text-xs text-muted-foreground font-['Cairo']">
                من أصل {referralCodes.length} رمز
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-['Cairo']">إجمالي الاستخدامات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-['Cairo']">{totalUses}</div>
              <p className="text-xs text-muted-foreground font-['Cairo']">مستخدم جديد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-['Cairo']">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-['Cairo']">{totalRevenue.toFixed(3)} KWD</div>
              <p className="text-xs text-muted-foreground font-['Cairo']">من جميع الإحالات</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Cairo']">جميع رموز الإحالة</CardTitle>
            <CardDescription className="font-['Cairo']">
              قائمة بجميع رموز الإحالة وإحصائياتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 font-['Cairo']">جاري التحميل...</div>
            ) : referralCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-['Cairo']">
                لا توجد رموز إحالة بعد
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-['Cairo']">الرمز</TableHead>
                    <TableHead className="text-right font-['Cairo']">المؤثر</TableHead>
                    <TableHead className="text-right font-['Cairo']">الخصم</TableHead>
                    <TableHead className="text-right font-['Cairo']">العمولة</TableHead>
                    <TableHead className="text-right font-['Cairo']">الاستخدامات</TableHead>
                    <TableHead className="text-right font-['Cairo']">الإيرادات</TableHead>
                    <TableHead className="text-right font-['Cairo']">الحالة</TableHead>
                    <TableHead className="text-right font-['Cairo']">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold font-['Cairo']">
                        <div className="flex items-center gap-2">
                          {code.code}
                          <button
                            onClick={() => copyCode(code.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="font-['Cairo']">
                        <div>
                          <div className="font-medium">{code.influencer_name}</div>
                          {code.influencer_email && (
                            <div className="text-xs text-gray-500">{code.influencer_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-['Cairo']">{code.discount_percentage}%</TableCell>
                      <TableCell className="font-['Cairo']">{code.commission_percentage}%</TableCell>
                      <TableCell className="font-['Cairo']">{code.total_uses}</TableCell>
                      <TableCell className="font-['Cairo']">
                        {code.total_revenue_kwd.toFixed(3)} KWD
                      </TableCell>
                      <TableCell>
                        <Badge variant={code.is_active ? 'default' : 'secondary'} className="font-['Cairo']">
                          {code.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(code)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCodeStatus(code)}
                          >
                            <Badge variant={code.is_active ? 'destructive' : 'default'} className="font-['Cairo']">
                              {code.is_active ? 'تعطيل' : 'تفعيل'}
                            </Badge>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCode(code.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-['Cairo']">
                {isEditing ? 'تعديل رمز الإحالة' : 'إنشاء رمز إحالة جديد'}
              </DialogTitle>
              <DialogDescription className="font-['Cairo']">
                {isEditing
                  ? 'تحديث معلومات رمز الإحالة'
                  : 'إنشاء رمز إحالة جديد للمؤثر مع عمولة مدى الحياة'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code" className="font-['Cairo']">الرمز</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="AHMED2024"
                    className="font-['Cairo'] text-right"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                    className="font-['Cairo']"
                  >
                    توليد
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="influencer_name" className="font-['Cairo']">اسم المؤثر</Label>
                <Input
                  id="influencer_name"
                  value={formData.influencer_name}
                  onChange={(e) => setFormData({ ...formData, influencer_name: e.target.value })}
                  placeholder="أحمد الكويتي"
                  className="font-['Cairo'] text-right"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="influencer_email" className="font-['Cairo']">
                  البريد الإلكتروني (اختياري)
                </Label>
                <Input
                  id="influencer_email"
                  type="email"
                  value={formData.influencer_email}
                  onChange={(e) => setFormData({ ...formData, influencer_email: e.target.value })}
                  placeholder="ahmed@example.com"
                  className="font-['Cairo'] text-right"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount" className="font-['Cairo']">نسبة الخصم (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_percentage: e.target.value })
                    }
                    className="font-['Cairo'] text-right"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="commission" className="font-['Cairo']">نسبة العمولة (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_percentage}
                    onChange={(e) =>
                      setFormData({ ...formData, commission_percentage: e.target.value })
                    }
                    className="font-['Cairo'] text-right"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expires_at" className="font-['Cairo']">
                  تاريخ الانتهاء (اختياري)
                </Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="font-['Cairo'] text-right"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-['Cairo']">
                إلغاء
              </Button>
              <Button onClick={handleSubmit} className="font-['Cairo']">
                {isEditing ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
