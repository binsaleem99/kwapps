'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Zap,
  Save,
  Download,
  Eye,
  LogIn,
  LogOut,
  UserPlus,
  CreditCard,
  Settings,
} from 'lucide-react'

interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_name: string
  event_data: any
  created_at: string
  users: {
    email: string
    display_name: string | null
  } | null
}

interface AnalyticsEventsTableProps {
  events: AnalyticsEvent[]
}

const eventIcons: Record<string, any> = {
  prompt_generated: Zap,
  project_created: Save,
  project_saved: Save,
  project_published: Download,
  template_viewed: Eye,
  user_login: LogIn,
  user_logout: LogOut,
  user_signup: UserPlus,
  subscription_created: CreditCard,
  subscription_cancelled: CreditCard,
  settings_updated: Settings,
}

const eventLabels: Record<string, string> = {
  prompt_generated: 'توليد أمر',
  project_created: 'إنشاء مشروع',
  project_saved: 'حفظ مشروع',
  project_published: 'نشر مشروع',
  template_viewed: 'عرض قالب',
  user_login: 'تسجيل دخول',
  user_logout: 'تسجيل خروج',
  user_signup: 'تسجيل جديد',
  subscription_created: 'اشتراك جديد',
  subscription_cancelled: 'إلغاء اشتراك',
  settings_updated: 'تحديث إعدادات',
}

const eventColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  prompt_generated: 'default',
  project_created: 'default',
  project_saved: 'secondary',
  project_published: 'default',
  template_viewed: 'outline',
  user_login: 'default',
  user_logout: 'secondary',
  user_signup: 'default',
  subscription_created: 'default',
  subscription_cancelled: 'destructive',
  settings_updated: 'secondary',
}

export function AnalyticsEventsTable({ events }: AnalyticsEventsTableProps) {
  const columns: ColumnDef<AnalyticsEvent>[] = [
    {
      accessorKey: 'created_at',
      header: 'التاريخ',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <div className="text-sm">
            <div>{format(date, 'dd MMM yyyy', { locale: ar })}</div>
            <div className="text-muted-foreground text-xs">
              {format(date, 'HH:mm:ss')}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'event_name',
      header: 'الحدث',
      cell: ({ row }) => {
        const eventName = row.original.event_name
        const Icon = eventIcons[eventName] || Settings
        const label = eventLabels[eventName] || eventName
        const variant = eventColors[eventName] || 'outline'

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'user_id',
      header: 'المستخدم',
      cell: ({ row }) => {
        const user = row.original.users
        if (!user) return <span className="text-muted-foreground">-</span>

        return (
          <div className="text-sm">
            <div className="font-medium">
              {user.display_name || user.email}
            </div>
            {user.display_name && (
              <div className="text-muted-foreground text-xs">{user.email}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'event_data',
      header: 'البيانات',
      cell: ({ row }) => {
        const data = row.original.event_data
        if (!data) return <span className="text-muted-foreground">-</span>

        if (typeof data === 'object') {
          const entries = Object.entries(data)
          if (entries.length === 0) return <span className="text-muted-foreground">-</span>

          return (
            <div className="text-sm space-y-1 max-w-md">
              {entries.slice(0, 2).map(([key, value]) => (
                <div key={key} className="text-muted-foreground truncate">
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'object'
                    ? JSON.stringify(value).substring(0, 50)
                    : String(value).substring(0, 50)}
                </div>
              ))}
              {entries.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{entries.length - 2} أكثر
                </div>
              )}
            </div>
          )
        }

        return (
          <div className="text-sm text-muted-foreground max-w-md truncate">
            {String(data)}
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={events}
      searchKey="event_name"
      searchPlaceholder="البحث عن الأحداث..."
    />
  )
}
