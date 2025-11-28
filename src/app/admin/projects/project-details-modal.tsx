'use client'

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
import { Project, ProjectStatus } from '@/app/actions/admin-projects'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ExternalLink, Copy, User } from 'lucide-react'

interface ProjectDetailsModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusLabel = (status: ProjectStatus) => {
  const labels: Record<ProjectStatus, string> = {
    draft: 'مسودة',
    generating: 'قيد التوليد',
    preview: 'معاينة',
    published: 'منشور',
    error: 'خطأ',
  }
  return labels[status]
}

const getStatusVariant = (status: ProjectStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<ProjectStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    generating: 'secondary',
    preview: 'default',
    published: 'default',
    error: 'destructive',
  }
  return variants[status]
}

export function ProjectDetailsModal({
  project,
  open,
  onOpenChange,
}: ProjectDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل المشروع</DialogTitle>
          <DialogDescription>{project.name}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" dir="rtl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">المعلومات</TabsTrigger>
            <TabsTrigger value="code">الكود</TabsTrigger>
            <TabsTrigger value="prompts">الأوامر</TabsTrigger>
            <TabsTrigger value="user">المستخدم</TabsTrigger>
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
                    <Label>اسم المشروع</Label>
                    <p className="font-medium mt-1">{project.name}</p>
                  </div>
                  <div>
                    <Label>الحالة</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>القالب</Label>
                    <p className="text-sm mt-1">
                      {project.templates?.name_ar || 'بدون قالب'}
                    </p>
                  </div>
                  <div>
                    <Label>النسخة النشطة</Label>
                    <p className="text-sm mt-1">v{project.active_version}</p>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <Label>الوصف</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                  </div>
                )}

                {project.deployed_url && (
                  <div>
                    <Label>رابط النشر</Label>
                    <div className="mt-1">
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.deployed_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="ml-2 h-4 w-4" />
                          فتح المشروع
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>تاريخ الإنشاء</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(project.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                  <div>
                    <Label>آخر تحديث</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(project.updated_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الكود المولّد</CardTitle>
              </CardHeader>
              <CardContent>
                {project.generated_code ? (
                  <>
                    <Textarea
                      value={project.generated_code}
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
                        navigator.clipboard.writeText(project.generated_code!)
                        alert('تم نسخ الكود')
                      }}
                    >
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ الكود
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    لم يتم توليد الكود بعد
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-4">
            {project.arabic_prompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الأمر بالعربية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={project.arabic_prompt}
                    readOnly
                    rows={8}
                    dir="rtl"
                  />
                </CardContent>
              </Card>
            )}

            {project.english_prompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الأمر بالإنجليزية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={project.english_prompt}
                    readOnly
                    rows={8}
                    dir="ltr"
                  />
                </CardContent>
              </Card>
            )}

            {!project.arabic_prompt && !project.english_prompt && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-sm text-muted-foreground text-center">
                    لا توجد أوامر محفوظة
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* User Tab */}
          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <User className="inline-block ml-2 h-5 w-5" />
                  معلومات المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.users ? (
                  <>
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <p className="font-medium mt-1">{project.users.email}</p>
                    </div>
                    {project.users.display_name && (
                      <div>
                        <Label>الاسم</Label>
                        <p className="font-medium mt-1">{project.users.display_name}</p>
                      </div>
                    )}
                    <div>
                      <Label>الخطة</Label>
                      <div className="mt-1">
                        <Badge variant="default">
                          {project.users.plan === 'free' && 'مجاني'}
                          {project.users.plan === 'builder' && 'مطور'}
                          {project.users.plan === 'pro' && 'احترافي'}
                          {project.users.plan === 'hosting_only' && 'استضافة فقط'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>معرف المستخدم</Label>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {project.user_id}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    معلومات المستخدم غير متاحة
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات تقنية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label>معرف المشروع</Label>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {project.id}
                  </p>
                </div>
                {project.template_id && (
                  <div>
                    <Label>معرف القالب</Label>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {project.template_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
