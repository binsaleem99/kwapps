'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Valid content types
const VALID_CONTENT_TYPES = [
  'products',
  'services',
  'pages',
  'forms',
  'testimonials',
  'team',
  'gallery',
  'pricing',
  'faq',
  'blog',
  'contact',
  'users',
]

// Page titles in Arabic
const PAGE_TITLES: Record<string, string> = {
  products: 'المنتجات',
  services: 'الخدمات',
  pages: 'الصفحات',
  forms: 'النماذج والرسائل',
  testimonials: 'الشهادات والآراء',
  team: 'فريق العمل',
  gallery: 'معرض الصور',
  pricing: 'الأسعار والباقات',
  faq: 'الأسئلة الشائعة',
  blog: 'المدونة',
  contact: 'رسائل الاتصال',
  users: 'المستخدمين',
}

// Field configurations for each content type
const FIELD_CONFIGS: Record<string, Array<{
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'image' | 'email'
  required?: boolean
  tableColumn?: boolean
}>> = {
  products: [
    { key: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true, tableColumn: true },
    { key: 'name', label: 'الاسم (إنجليزي)', type: 'text' },
    { key: 'description_ar', label: 'الوصف (عربي)', type: 'textarea' },
    { key: 'description', label: 'الوصف (إنجليزي)', type: 'textarea' },
    { key: 'price', label: 'السعر', type: 'number', required: true, tableColumn: true },
    { key: 'original_price', label: 'السعر الأصلي', type: 'number' },
    { key: 'image', label: 'الصورة', type: 'image', tableColumn: true },
    { key: 'category', label: 'التصنيف', type: 'text' },
    { key: 'in_stock', label: 'متوفر', type: 'boolean', tableColumn: true },
    { key: 'featured', label: 'مميز', type: 'boolean', tableColumn: true },
  ],
  services: [
    { key: 'name_ar', label: 'الاسم (عربي)', type: 'text', required: true, tableColumn: true },
    { key: 'name', label: 'الاسم (إنجليزي)', type: 'text' },
    { key: 'description_ar', label: 'الوصف (عربي)', type: 'textarea', tableColumn: true },
    { key: 'price', label: 'السعر', type: 'number', tableColumn: true },
    { key: 'icon', label: 'الأيقونة', type: 'text' },
    { key: 'featured', label: 'مميز', type: 'boolean', tableColumn: true },
  ],
  pages: [
    { key: 'title_ar', label: 'العنوان (عربي)', type: 'text', required: true, tableColumn: true },
    { key: 'title', label: 'العنوان (إنجليزي)', type: 'text' },
    { key: 'slug', label: 'الرابط', type: 'text', tableColumn: true },
    { key: 'content_ar', label: 'المحتوى (عربي)', type: 'textarea' },
    { key: 'meta_title', label: 'عنوان SEO', type: 'text' },
    { key: 'meta_description', label: 'وصف SEO', type: 'textarea' },
    { key: 'published', label: 'منشور', type: 'boolean', tableColumn: true },
  ],
  forms: [
    { key: 'name', label: 'الاسم', type: 'text', tableColumn: true },
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', tableColumn: true },
    { key: 'phone', label: 'الهاتف', type: 'text', tableColumn: true },
    { key: 'message', label: 'الرسالة', type: 'textarea' },
    { key: 'read', label: 'تمت القراءة', type: 'boolean', tableColumn: true },
  ],
  testimonials: [
    { key: 'name', label: 'الاسم', type: 'text', required: true, tableColumn: true },
    { key: 'content', label: 'المحتوى', type: 'textarea', required: true, tableColumn: true },
    { key: 'role', label: 'المنصب', type: 'text' },
    { key: 'image', label: 'الصورة', type: 'image' },
    { key: 'rating', label: 'التقييم', type: 'number', tableColumn: true },
    { key: 'featured', label: 'مميز', type: 'boolean', tableColumn: true },
  ],
  team: [
    { key: 'name', label: 'الاسم', type: 'text', required: true, tableColumn: true },
    { key: 'role', label: 'المنصب', type: 'text', tableColumn: true },
    { key: 'bio', label: 'نبذة', type: 'textarea' },
    { key: 'image', label: 'الصورة', type: 'image', tableColumn: true },
    { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
  ],
  gallery: [
    { key: 'title', label: 'العنوان', type: 'text', tableColumn: true },
    { key: 'image', label: 'الصورة', type: 'image', required: true, tableColumn: true },
    { key: 'category', label: 'التصنيف', type: 'text', tableColumn: true },
    { key: 'description', label: 'الوصف', type: 'textarea' },
  ],
  pricing: [
    { key: 'name', label: 'الاسم', type: 'text', required: true, tableColumn: true },
    { key: 'price', label: 'السعر', type: 'number', required: true, tableColumn: true },
    { key: 'period', label: 'الفترة', type: 'text' },
    { key: 'features', label: 'المميزات', type: 'textarea', tableColumn: true },
    { key: 'featured', label: 'مميز', type: 'boolean', tableColumn: true },
  ],
  faq: [
    { key: 'question', label: 'السؤال', type: 'text', required: true, tableColumn: true },
    { key: 'answer', label: 'الإجابة', type: 'textarea', required: true },
    { key: 'order', label: 'الترتيب', type: 'number', tableColumn: true },
  ],
  blog: [
    { key: 'title', label: 'العنوان', type: 'text', required: true, tableColumn: true },
    { key: 'excerpt', label: 'المقتطف', type: 'textarea' },
    { key: 'content', label: 'المحتوى', type: 'textarea' },
    { key: 'image', label: 'الصورة', type: 'image', tableColumn: true },
    { key: 'published', label: 'منشور', type: 'boolean', tableColumn: true },
  ],
  contact: [
    { key: 'name', label: 'الاسم', type: 'text', tableColumn: true },
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', tableColumn: true },
    { key: 'phone', label: 'الهاتف', type: 'text', tableColumn: true },
    { key: 'message', label: 'الرسالة', type: 'textarea' },
    { key: 'read', label: 'تمت القراءة', type: 'boolean', tableColumn: true },
  ],
  users: [
    { key: 'email', label: 'البريد الإلكتروني', type: 'email', tableColumn: true },
    { key: 'name', label: 'الاسم', type: 'text', tableColumn: true },
    { key: 'role', label: 'الدور', type: 'text', tableColumn: true },
  ],
}

interface Item {
  id: string
  [key: string]: unknown
  created_at: string
}

export default function ContentTypePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const contentType = params.contentType as string

  // Validate content type
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    notFound()
  }

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Item | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [saving, setSaving] = useState(false)

  const pageTitle = PAGE_TITLES[contentType] || contentType
  const fields = FIELD_CONFIGS[contentType] || []
  const tableColumns = fields.filter(f => f.tableColumn)
  const isReadOnly = contentType === 'forms' || contentType === 'contact'
  const limit = 20

  useEffect(() => {
    fetchItems()
  }, [projectId, contentType, page])

  async function fetchItems() {
    setLoading(true)
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const res = await fetch(
        `/api/projects/${projectId}/admin/content/${contentType}?page=${page}&limit=${limit}${searchParam}`
      )
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
        setHasMore(data.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(itemData: Record<string, unknown>) {
    setSaving(true)
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem ? { id: editingItem.id, ...itemData } : itemData

      const res = await fetch(`/api/projects/${projectId}/admin/content/${contentType}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        fetchItems()
        setIsDialogOpen(false)
        setEditingItem(null)
      } else {
        const data = await res.json()
        alert(data.errorAr || data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('حدث خطأ في حفظ العنصر')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return

    try {
      const res = await fetch(
        `/api/projects/${projectId}/admin/content/${contentType}?id=${id}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        fetchItems()
      } else {
        const data = await res.json()
        alert(data.errorAr || data.error || 'حدث خطأ')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await fetch(`/api/projects/${projectId}/admin/content/${contentType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      fetchItems()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  function handleSearch() {
    setPage(1)
    fetchItems()
  }

  function exportToCSV() {
    const headers = fields.map(f => f.label)
    const rows = items.map(item =>
      fields.map(f => {
        const value = item[f.key]
        if (typeof value === 'boolean') return value ? 'نعم' : 'لا'
        return String(value || '')
      })
    )

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${contentType}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      fields.some(f => {
        const value = item[f.key]
        return value && String(value).toLowerCase().includes(query)
      })
    )
  }, [items, searchQuery, fields])

  const unreadCount = items.filter(item => item.read === false).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 font-cairo">{pageTitle}</h2>
          {(contentType === 'forms' || contentType === 'contact') && unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} جديد</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={items.length === 0}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          {!isReadOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="font-cairo">
                    {editingItem ? 'تعديل' : 'إضافة جديد'}
                  </DialogTitle>
                </DialogHeader>
                <ItemForm
                  fields={fields}
                  item={editingItem}
                  onSave={handleSave}
                  onCancel={() => setIsDialogOpen(false)}
                  saving={saving}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10 font-cairo"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          بحث
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-cairo">
              لا توجد عناصر
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((field) => (
                      <TableHead key={field.key} className="text-right font-cairo">
                        {field.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-cairo">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        (contentType === 'forms' || contentType === 'contact') &&
                          !item.read &&
                          'bg-blue-50'
                      )}
                    >
                      {tableColumns.map((field) => (
                        <TableCell key={field.key} className="font-cairo">
                          {renderCellValue(item[field.key], field.type)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isReadOnly ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingItem(item)
                                  if (!item.read) handleMarkAsRead(item.id)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-cairo">
            عرض {(page - 1) * limit + 1} - {Math.min(page * limit, total)} من {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-cairo">{page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Dialog (for read-only types) */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-cairo">تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="text-sm text-slate-500 font-cairo">
                {new Date(viewingItem.created_at).toLocaleString('ar-KW')}
              </div>
              {fields.map((field) => {
                const value = viewingItem[field.key]
                if (value === undefined || value === null || value === '') return null
                return (
                  <div key={field.key} className="border-b pb-2">
                    <div className="text-sm font-medium text-slate-500 font-cairo">
                      {field.label}
                    </div>
                    <div className="font-cairo whitespace-pre-wrap">{String(value)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper to render cell values
function renderCellValue(value: unknown, type: string): React.ReactNode {
  if (value === undefined || value === null) return '-'

  if (type === 'boolean') {
    return value ? (
      <Badge variant="default" className="bg-green-500">نعم</Badge>
    ) : (
      <Badge variant="secondary">لا</Badge>
    )
  }

  if (type === 'image') {
    if (!value) {
      return (
        <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-slate-400" />
        </div>
      )
    }
    return (
      <img
        src={String(value)}
        alt=""
        className="h-10 w-10 object-cover rounded"
        onError={(e) => {
          (e.target as HTMLImageElement).src = ''
          ;(e.target as HTMLImageElement).className = 'hidden'
        }}
      />
    )
  }

  if (type === 'number') {
    return (
      <span className="font-mono">
        {typeof value === 'number' ? value.toLocaleString('ar-KW') : String(value)}
      </span>
    )
  }

  const strValue = String(value)
  if (strValue.length > 50) {
    return strValue.substring(0, 50) + '...'
  }
  return strValue
}

// Item Form Component
function ItemForm({
  fields,
  item,
  onSave,
  onCancel,
  saving,
}: {
  fields: Array<{
    key: string
    label: string
    type: string
    required?: boolean
  }>
  item: Item | null
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const field of fields) {
      initial[field.key] = item?.[field.key] ?? (field.type === 'boolean' ? false : field.type === 'number' ? 0 : '')
    }
    return initial
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          {field.type === 'boolean' ? (
            <div className="flex items-center gap-2">
              <Switch
                checked={Boolean(formData[field.key])}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, [field.key]: checked })
                }
              />
              <Label className="font-cairo">{field.label}</Label>
            </div>
          ) : (
            <>
              <Label className="font-cairo">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={String(formData[field.key] || '')}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="font-cairo"
                  rows={3}
                  required={field.required}
                />
              ) : field.type === 'number' ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData[field.key] as number}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: parseFloat(e.target.value) || 0 })
                  }
                  required={field.required}
                />
              ) : (
                <Input
                  type={field.type === 'email' ? 'email' : 'text'}
                  value={String(formData[field.key] || '')}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className={cn('font-cairo', field.type === 'image' && 'dir-ltr')}
                  placeholder={field.type === 'image' ? 'https://...' : ''}
                  required={field.required}
                />
              )}
            </>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          إلغاء
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : item ? (
            'حفظ التغييرات'
          ) : (
            'إضافة'
          )}
        </Button>
      </div>
    </form>
  )
}
