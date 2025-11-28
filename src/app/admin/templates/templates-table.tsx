'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Star,
  Trash2,
  BarChart,
} from 'lucide-react'
import { Template, deleteTemplate, duplicateTemplate, toggleTemplatePremium } from '@/app/actions/templates'
import { TemplateDetailsModal } from './template-details-modal'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface TemplatesTableProps {
  templates: Template[]
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

const getCategoryColor = (category: string) => {
  const colors: Record<string, 'default' | 'secondary' | 'outline'> = {
    ecommerce: 'default',
    restaurant: 'secondary',
    saas: 'default',
    landing: 'outline',
    portfolio: 'secondary',
    booking: 'default',
    social: 'outline',
    dashboard: 'secondary',
  }
  return colors[category] || 'outline'
}

export function TemplatesTable({ templates }: TemplatesTableProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template)
    setDetailsOpen(true)
  }

  const handleDuplicate = async (template: Template) => {
    const result = await duplicateTemplate(template.id)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleTogglePremium = async (template: Template) => {
    const result = await toggleTemplatePremium(template.id)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleDelete = async (template: Template) => {
    if (!confirm(`هل أنت متأكد من حذف القالب "${template.name_ar}"؟`)) {
      return
    }

    const result = await deleteTemplate(template.id)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'thumbnail_url',
      header: 'معاينة',
      cell: ({ row }) => {
        const template = row.original
        return template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name_ar}
            className="w-16 h-16 object-cover rounded border"
          />
        ) : (
          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
            لا توجد صورة
          </div>
        )
      },
    },
    {
      accessorKey: 'name_ar',
      header: 'الاسم',
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{template.name_ar}</div>
            <div className="text-sm text-muted-foreground">
              {template.name_en}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'التصنيف',
      cell: ({ row }) => {
        const category = row.original.category
        return (
          <Badge variant={getCategoryColor(category)}>
            {getCategoryLabel(category)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'is_premium',
      header: 'الحالة',
      cell: ({ row }) => {
        const isPremium = row.original.is_premium
        return (
          <Badge variant={isPremium ? 'default' : 'outline'}>
            {isPremium ? 'مميز' : 'مجاني'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'usage_count',
      header: 'الاستخدامات',
      cell: ({ row }) => {
        const count = row.original.usage_count
        return (
          <span className="font-medium text-sm">
            {count || 0}
          </span>
        )
      },
    },
    {
      accessorKey: 'is_rtl',
      header: 'RTL',
      cell: ({ row }) => {
        const isRtl = row.original.is_rtl
        return (
          <Badge variant={isRtl ? 'default' : 'secondary'} className="text-xs">
            {isRtl ? 'نعم' : 'لا'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true, locale: ar })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const template = row.original

        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(template)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                <Copy className="ml-2 h-4 w-4" />
                تكرار القالب
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTogglePremium(template)}>
                <Star className="ml-2 h-4 w-4" />
                {template.is_premium ? 'إزالة التميز' : 'تعيين كمميز'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(template)}
                className="text-destructive"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={templates}
        searchKey="name_ar"
        searchPlaceholder="بحث في القوالب..."
      />

      {selectedTemplate && (
        <TemplateDetailsModal
          template={selectedTemplate}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  )
}
