'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Template, getTemplateUsage } from '@/app/actions/templates'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ExternalLink, Copy, Star } from 'lucide-react'

interface TemplateDetailsModalProps {
  template: Template
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    ecommerce: 'متجر إلكتروني',
    restaurant: 'مطعم',
    saas: 'SaaS',
    landing: 'صفحة هبوط',
    portfolio: 'معرض أعمال',
    booking: 'حجوزات',
    social: 'شبكة اجتماعية',
    dashboard: 'لوحة تحكم',
  }
  return labels[category] || category
}

export function TemplateDetailsModal({
  template,
  open,
  onOpenChange,
}: TemplateDetailsModalProps) {
  const [usage, setUsage] = useState<{
    projects: Array<{ id: string; name: string; user_email: string; created_at: string }>
    count: number
  } | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsageData()
    }
  }, [open, template.id])

  const loadUsageData = async () => {
    setLoadingUsage(true)
    const result = await getTemplateUsage(template.id)
    if (!result.error) {
      setUsage({
        projects: result.projects || [],
        count: result.count || 0,
      })
    }
    setLoadingUsage(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل القالب</DialogTitle>
          <DialogDescription>{template.name_ar}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" dir="rtl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">المعلومات</TabsTrigger>
            <TabsTrigger value="code">الكود</TabsTrigger>
            <TabsTrigger value="customization">التخصيص</TabsTrigger>
            <TabsTrigger value="usage">الاستخدام</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم بالعربية</Label>
                    <p className="font-medium mt-1">{template.name_ar}</p>
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية</Label>
                    <p className="font-medium mt-1">{template.name_en}</p>
                  </div>
                  <div>
                    <Label>التصنيف</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>الحالة</Label>
                    <div className="mt-1 flex gap-2">
                      {template.is_premium && (
                        <Badge variant="default">
                          <Star className="ml-1 h-3 w-3" />
                          مميز
                        </Badge>
                      )}
                      {template.is_rtl && (
                        <Badge variant="outline">RTL</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {template.description_ar && (
                  <div>
                    <Label>الوصف بالعربية</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description_ar}
                    </p>
                  </div>
                )}

                {template.description_en && (
                  <div>
                    <Label>الوصف بالإنجليزية</Label>
                    <p className="text-sm text-muted-foreground mt-1 text-left" dir="ltr">
                      {template.description_en}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label>مرات الاستخدام</Label>
                    <p className="text-2xl font-bold mt-1">{template.usage_count}</p>
                  </div>
                  <div>
                    <Label>تاريخ الإنشاء</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(template.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                  <div>
                    <Label>معاينة</Label>
                    {template.preview_url ? (
                      <Button variant="outline" size="sm" className="mt-1" asChild>
                        <a href={template.preview_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="ml-2 h-3 w-3" />
                          فتح
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">-</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {template.thumbnail_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">صورة المعاينة</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={template.thumbnail_url}
                    alt={template.name_ar}
                    className="w-full max-h-96 object-contain rounded border"
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">كود القالب</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={template.base_code}
                  readOnly
                  rows={20}
                  className="font-mono text-xs"
                  dir="ltr"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(template.base_code)
                    alert('تم نسخ الكود')
                  }}
                >
                  <Copy className="ml-2 h-4 w-4" />
                  نسخ الكود
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الأقسام القابلة للتخصيص</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={
                    template.customizable_sections
                      ? JSON.stringify(template.customizable_sections, null, 2)
                      : '{}'
                  }
                  readOnly
                  rows={10}
                  className="font-mono text-xs"
                  dir="ltr"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نظام الألوان</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={
                    template.color_scheme
                      ? JSON.stringify(template.color_scheme, null, 2)
                      : '{}'
                  }
                  readOnly
                  rows={6}
                  className="font-mono text-xs"
                  dir="ltr"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  إحصائيات الاستخدام ({usage?.count || 0} مشروع)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsage ? (
                  <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                ) : usage && usage.projects.length > 0 ? (
                  <div className="space-y-2">
                    {usage.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex justify-between items-center p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.user_email}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(project.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </p>
                      </div>
                    ))}
                    {usage.count > usage.projects.length && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        عرض {usage.projects.length} من {usage.count} مشروع
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    لم يتم استخدام هذا القالب بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
