'use client'

/**
 * Widget Panel Component
 *
 * Builder panel for managing project widgets
 * - Add/edit/delete widgets (WhatsApp, Telegram, etc.)
 * - Live preview of widget appearance
 * - Copy embed code functionality
 *
 * Arabic-first, RTL, Cairo font
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import {
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  MessageCircleIcon,
  SendIcon,
  InstagramIcon,
  PhoneIcon,
  Loader2Icon,
  EyeIcon,
  SettingsIcon,
  CodeIcon,
  PaletteIcon,
} from 'lucide-react'
import type {
  WidgetType,
  WidgetPosition,
  WidgetSize,
  WidgetAnimation,
  AnyWidgetConfig,
  ProjectWidget,
} from '@/lib/widgets'
import {
  WIDGET_LABELS_AR,
  WIDGET_COLORS,
  DEFAULT_MESSAGES_AR,
  DEFAULT_WIDGET_STYLE,
} from '@/lib/widgets'

interface WidgetPanelProps {
  projectId: string
  onWidgetChange?: (widgets: ProjectWidget[]) => void
}

// Widget type icons
const WIDGET_TYPE_ICONS: Record<WidgetType, React.ReactNode> = {
  whatsapp: <MessageCircleIcon className="h-5 w-5" />,
  telegram: <SendIcon className="h-5 w-5" />,
  instagram: <InstagramIcon className="h-5 w-5" />,
  facebook_messenger: <MessageCircleIcon className="h-5 w-5" />,
  custom_chat: <MessageCircleIcon className="h-5 w-5" />,
  callback_request: <PhoneIcon className="h-5 w-5" />,
}

// Position labels
const POSITION_LABELS_AR: Record<WidgetPosition, string> = {
  'bottom-right': 'أسفل يمين',
  'bottom-left': 'أسفل يسار',
  'top-right': 'أعلى يمين',
  'top-left': 'أعلى يسار',
}

// Size labels
const SIZE_LABELS_AR: Record<WidgetSize, string> = {
  small: 'صغير',
  medium: 'متوسط',
  large: 'كبير',
}

// Animation labels
const ANIMATION_LABELS_AR: Record<WidgetAnimation, string> = {
  none: 'بدون',
  bounce: 'قفز',
  pulse: 'نبض',
  shake: 'اهتزاز',
  'fade-in': 'ظهور تدريجي',
}

export default function WidgetPanel({ projectId, onWidgetChange }: WidgetPanelProps) {
  const { toast } = useToast()
  const [widgets, setWidgets] = useState<ProjectWidget[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<ProjectWidget | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [combinedSnippet, setCombinedSnippet] = useState<string | null>(null)

  // New widget form state
  const [newWidgetType, setNewWidgetType] = useState<WidgetType>('whatsapp')
  const [newWidgetConfig, setNewWidgetConfig] = useState<Partial<AnyWidgetConfig>>({})

  // Fetch widgets on mount
  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/widgets/${projectId}`)
      const data = await response.json()

      if (data.success) {
        setWidgets(data.widgets || [])
        setCombinedSnippet(data.combinedSnippet?.snippet || null)
        onWidgetChange?.(data.widgets || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error?.messageAr || 'فشل جلب الويدجت',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [projectId, onWidgetChange, toast])

  useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  // Create new widget
  const handleCreateWidget = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/widgets/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_type: newWidgetType,
          config: newWidgetConfig,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء الويدجت بنجاح',
        })
        setShowAddDialog(false)
        setNewWidgetConfig({})
        fetchWidgets()
      } else {
        toast({
          title: 'خطأ',
          description: data.error?.messageAr || 'فشل إنشاء الويدجت',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Update widget
  const handleUpdateWidget = async (widgetId: string, updates: { is_active?: boolean; config?: AnyWidgetConfig } | Partial<AnyWidgetConfig>) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/widgets/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_id: widgetId,
          ...updates,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الويدجت بنجاح',
        })
        fetchWidgets()
      } else {
        toast({
          title: 'خطأ',
          description: data.error?.messageAr || 'فشل تحديث الويدجت',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete widget
  const handleDeleteWidget = async (widgetId: string) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/widgets/${projectId}?widget_id=${widgetId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'تم الحذف',
          description: 'تم حذف الويدجت بنجاح',
        })
        setSelectedWidget(null)
        fetchWidgets()
      } else {
        toast({
          title: 'خطأ',
          description: data.error?.messageAr || 'فشل حذف الويدجت',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Copy snippet to clipboard
  const handleCopySnippet = async (snippet: string, id: string) => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopiedId(id)
      toast({
        title: 'تم النسخ',
        description: 'تم نسخ الكود للحافظة',
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل النسخ',
        variant: 'destructive',
      })
    }
  }

  // Render widget type selector
  const renderWidgetTypeSelector = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {(Object.keys(WIDGET_LABELS_AR) as WidgetType[]).map((type) => (
        <button
          key={type}
          onClick={() => setNewWidgetType(type)}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
            ${newWidgetType === type
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300'
            }
          `}
          style={{ backgroundColor: newWidgetType === type ? `${WIDGET_COLORS[type]}15` : undefined }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: WIDGET_COLORS[type] }}
          >
            <span className="text-white">{WIDGET_TYPE_ICONS[type]}</span>
          </div>
          <span className="text-sm font-medium">{WIDGET_LABELS_AR[type]}</span>
        </button>
      ))}
    </div>
  )

  // Render widget config form
  const renderConfigForm = (type: WidgetType, config: Partial<AnyWidgetConfig>, onChange: (c: Partial<AnyWidgetConfig>) => void) => {
    switch (type) {
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف (مع رمز البلد)</Label>
              <Input
                id="phone"
                dir="ltr"
                placeholder="+96512345678"
                value={(config as any).phoneNumber || ''}
                onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="welcome">رسالة الترحيب</Label>
              <Textarea
                id="welcome"
                placeholder={DEFAULT_MESSAGES_AR.welcomeMessage}
                value={(config as any).welcomeMessage || ''}
                onChange={(e) => onChange({ ...config, welcomeMessage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="button">نص الزر</Label>
              <Input
                id="button"
                placeholder={DEFAULT_MESSAGES_AR.buttonText}
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      case 'telegram':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">اسم المستخدم (بدون @)</Label>
              <Input
                id="username"
                dir="ltr"
                placeholder="my_business"
                value={(config as any).username || ''}
                onChange={(e) => onChange({ ...config, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="button">نص الزر</Label>
              <Input
                id="button"
                placeholder="تواصل عبر تيليجرام"
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      case 'instagram':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">اسم المستخدم (بدون @)</Label>
              <Input
                id="username"
                dir="ltr"
                placeholder="my_business"
                value={(config as any).username || ''}
                onChange={(e) => onChange({ ...config, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="button">نص الزر</Label>
              <Input
                id="button"
                placeholder="تابعنا على انستجرام"
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      case 'facebook_messenger':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageId">معرف الصفحة</Label>
              <Input
                id="pageId"
                dir="ltr"
                placeholder="123456789"
                value={(config as any).pageId || ''}
                onChange={(e) => onChange({ ...config, pageId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="button">نص الزر</Label>
              <Input
                id="button"
                placeholder="تواصل عبر ماسنجر"
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      case 'callback_request':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button">عنوان النموذج</Label>
              <Input
                id="button"
                placeholder="اطلب اتصال"
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      case 'custom_chat':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint">رابط API</Label>
              <Input
                id="endpoint"
                dir="ltr"
                placeholder="https://api.example.com/chat"
                value={(config as any).endpointUrl || ''}
                onChange={(e) => onChange({ ...config, endpointUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="button">نص الزر</Label>
              <Input
                id="button"
                placeholder="دردشة مباشرة"
                value={(config as any).buttonText || ''}
                onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render style settings
  const renderStyleSettings = (style: Partial<AnyWidgetConfig['style']>, onChange: (s: Partial<AnyWidgetConfig['style']>) => void) => (
    <div className="space-y-4">
      <div>
        <Label>الموضع</Label>
        <Select
          value={style?.position || 'bottom-right'}
          onValueChange={(v) => onChange({ ...style, position: v as WidgetPosition })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(POSITION_LABELS_AR) as WidgetPosition[]).map((pos) => (
              <SelectItem key={pos} value={pos}>
                {POSITION_LABELS_AR[pos]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>الحجم</Label>
        <Select
          value={style?.size || 'medium'}
          onValueChange={(v) => onChange({ ...style, size: v as WidgetSize })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SIZE_LABELS_AR) as WidgetSize[]).map((size) => (
              <SelectItem key={size} value={size}>
                {SIZE_LABELS_AR[size]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>الحركة</Label>
        <Select
          value={style?.animation || 'pulse'}
          onValueChange={(v) => onChange({ ...style, animation: v as WidgetAnimation })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ANIMATION_LABELS_AR) as WidgetAnimation[]).map((anim) => (
              <SelectItem key={anim} value={anim}>
                {ANIMATION_LABELS_AR[anim]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>المسافة من الأسفل ({style?.bottomOffset || 20}px)</Label>
        <Slider
          value={[style?.bottomOffset || 20]}
          onValueChange={([v]) => onChange({ ...style, bottomOffset: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>

      <div>
        <Label>المسافة من الجانب ({style?.sideOffset || 20}px)</Label>
        <Slider
          value={[style?.sideOffset || 20]}
          onValueChange={([v]) => onChange({ ...style, sideOffset: v })}
          min={0}
          max={100}
          step={5}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
        <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
        <span className="mr-3 text-slate-600">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">الويدجت</h2>
          <p className="text-sm text-slate-500">
            إضافة أدوات التواصل لموقعك
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة ويدجت
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <DialogHeader className="text-right">
              <DialogTitle>إضافة ويدجت جديد</DialogTitle>
              <DialogDescription>
                اختر نوع الويدجت وقم بتخصيصه
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="type" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="type">النوع</TabsTrigger>
                <TabsTrigger value="config">الإعدادات</TabsTrigger>
                <TabsTrigger value="style">المظهر</TabsTrigger>
              </TabsList>

              <TabsContent value="type" className="mt-4">
                {renderWidgetTypeSelector()}
              </TabsContent>

              <TabsContent value="config" className="mt-4">
                {renderConfigForm(newWidgetType, newWidgetConfig, setNewWidgetConfig)}
              </TabsContent>

              <TabsContent value="style" className="mt-4">
                {renderStyleSettings(
                  newWidgetConfig.style || {},
                  (s) => setNewWidgetConfig({ ...newWidgetConfig, style: s as any })
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex-row-reverse gap-2 sm:gap-2">
              <Button onClick={handleCreateWidget} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin ml-2" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الويدجت'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Widgets List */}
      {widgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircleIcon className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              لا توجد ويدجت
            </h3>
            <p className="text-slate-400 text-center mb-4">
              أضف ويدجت واتساب أو تيليجرام لتسهيل التواصل مع عملائك
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة أول ويدجت
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {widgets.map((widget) => (
            <Card key={widget.id} className={!widget.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: WIDGET_COLORS[widget.widget_type as WidgetType] }}
                    >
                      <span className="text-white">
                        {WIDGET_TYPE_ICONS[widget.widget_type as WidgetType]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {WIDGET_LABELS_AR[widget.widget_type as WidgetType]}
                      </CardTitle>
                      <CardDescription>
                        {(widget.config as any)?.phoneNumber ||
                         (widget.config as any)?.username ||
                         (widget.config as any)?.pageId ||
                         'بدون تكوين'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={widget.is_active ? 'default' : 'secondary'}>
                      {widget.is_active ? 'مفعّل' : 'معطّل'}
                    </Badge>
                    <Switch
                      checked={widget.is_active}
                      onCheckedChange={(checked) =>
                        handleUpdateWidget(widget.id, { is_active: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between pt-3 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWidget(widget)}
                  >
                    <SettingsIcon className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopySnippet(
                        widget.generated_snippet || '',
                        widget.id
                      )
                    }
                    disabled={!widget.generated_snippet}
                  >
                    {copiedId === widget.id ? (
                      <CheckIcon className="h-4 w-4 ml-1" />
                    ) : (
                      <CopyIcon className="h-4 w-4 ml-1" />
                    )}
                    نسخ الكود
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteWidget(widget.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Combined Snippet */}
      {combinedSnippet && widgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5" />
              كود التضمين الموحد
            </CardTitle>
            <CardDescription>
              أضف هذا الكود لموقعك لعرض جميع الويدجت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap break-all" dir="ltr">
                {combinedSnippet.length > 500
                  ? combinedSnippet.slice(0, 500) + '...'
                  : combinedSnippet}
              </pre>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handleCopySnippet(combinedSnippet, 'combined')}
              className="w-full"
            >
              {copiedId === 'combined' ? (
                <>
                  <CheckIcon className="h-4 w-4 ml-2" />
                  تم النسخ!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4 ml-2" />
                  نسخ الكود الموحد
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Edit Widget Dialog */}
      {selectedWidget && (
        <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
          <DialogContent className="sm:max-w-lg" dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <DialogHeader className="text-right">
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: WIDGET_COLORS[selectedWidget.widget_type as WidgetType] }}
                >
                  <span className="text-white text-sm">
                    {WIDGET_TYPE_ICONS[selectedWidget.widget_type as WidgetType]}
                  </span>
                </div>
                تعديل {WIDGET_LABELS_AR[selectedWidget.widget_type as WidgetType]}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">
                  <SettingsIcon className="h-4 w-4 ml-1" />
                  الإعدادات
                </TabsTrigger>
                <TabsTrigger value="style">
                  <PaletteIcon className="h-4 w-4 ml-1" />
                  المظهر
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                {renderConfigForm(
                  selectedWidget.widget_type as WidgetType,
                  selectedWidget.config as Partial<AnyWidgetConfig>,
                  (c) => setSelectedWidget({ ...selectedWidget, config: c as AnyWidgetConfig })
                )}
              </TabsContent>

              <TabsContent value="style" className="mt-4">
                {renderStyleSettings(
                  (selectedWidget.config as AnyWidgetConfig).style || {},
                  (s) =>
                    setSelectedWidget({
                      ...selectedWidget,
                      config: { ...selectedWidget.config, style: s } as AnyWidgetConfig,
                    })
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex-row-reverse gap-2 sm:gap-2">
              <Button
                onClick={() => {
                  handleUpdateWidget(selectedWidget.id, { config: selectedWidget.config })
                  setSelectedWidget(null)
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
              <Button variant="outline" onClick={() => setSelectedWidget(null)}>
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
