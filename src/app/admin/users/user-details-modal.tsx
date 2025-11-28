'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/database'
import { addUserNote, addUserTag, removeUserTag, updateUser } from '@/app/actions/users'
import { useRouter } from 'next/navigation'
import { X, Plus, Save } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface UserDetailsModalProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsModal({ user, open, onOpenChange }: UserDetailsModalProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(user.internal_notes || '')
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotes = async () => {
    setIsSaving(true)
    const result = await addUserNote(user.id, notes)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    const result = await addUserTag(user.id, newTag.trim())
    if (result.error) {
      alert(result.error)
    } else {
      setNewTag('')
      router.refresh()
      onOpenChange(false)
      setTimeout(() => onOpenChange(true), 100)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    const result = await removeUserTag(user.id, tag)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
      onOpenChange(false)
      setTimeout(() => onOpenChange(true), 100)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل المستخدم</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">البريد الإلكتروني</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">الاسم</Label>
                  <p className="font-medium">{user.display_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">الخطة</Label>
                  <p className="font-medium">{user.plan}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">اللغة</Label>
                  <p className="font-medium">{user.language === 'ar' ? 'العربية' : 'English'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">تاريخ التسجيل</Label>
                  <p className="font-medium text-sm">
                    {format(new Date(user.created_at), 'PPP', { locale: ar })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">آخر ظهور</Label>
                  <p className="font-medium text-sm">
                    {user.last_seen_at
                      ? format(new Date(user.last_seen_at), 'PPP', { locale: ar })
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الوسوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {user.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!user.tags || user.tags.length === 0) && (
                  <p className="text-sm text-muted-foreground">لا توجد وسوم</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="إضافة وسم جديد..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملاحظات داخلية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="إضافة ملاحظات خاصة بالمستخدم..."
                rows={4}
              />
              <Button onClick={handleSaveNotes} disabled={isSaving} size="sm">
                <Save className="ml-2 h-4 w-4" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
