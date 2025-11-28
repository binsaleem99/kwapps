'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Shield,
  UserX,
  UserCheck,
  Tag,
  FileText,
  RefreshCw,
  Eye,
  Settings,
} from 'lucide-react'

interface AuditLog {
  id: string
  admin_user_id: string
  action: string
  target_user_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  users: {
    email: string
    display_name: string | null
  } | null
  target_users: {
    email: string
    display_name: string | null
  } | null
}

interface AuditLogsTableProps {
  logs: AuditLog[]
}

const actionIcons: Record<string, any> = {
  user_banned: UserX,
  user_unbanned: UserCheck,
  user_role_changed: Shield,
  user_tag_added: Tag,
  user_tag_removed: Tag,
  user_note_added: FileText,
  usage_reset: RefreshCw,
  impersonation_started: Eye,
  impersonation_ended: Eye,
  settings_updated: Settings,
}

const actionLabels: Record<string, string> = {
  user_banned: 'حظر مستخدم',
  user_unbanned: 'إلغاء حظر مستخدم',
  user_role_changed: 'تغيير دور المستخدم',
  user_tag_added: 'إضافة وسم',
  user_tag_removed: 'إزالة وسم',
  user_note_added: 'إضافة ملاحظة',
  usage_reset: 'إعادة تعيين الحد',
  impersonation_started: 'بدء التجسد',
  impersonation_ended: 'إنهاء التجسد',
  settings_updated: 'تحديث الإعدادات',
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const columns: ColumnDef<AuditLog>[] = [
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
      accessorKey: 'action',
      header: 'الإجراء',
      cell: ({ row }) => {
        const action = row.original.action
        const Icon = actionIcons[action] || Settings
        const label = actionLabels[action] || action

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{label}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'admin_user_id',
      header: 'المسؤول',
      cell: ({ row }) => {
        const admin = row.original.users
        if (!admin) return <span className="text-muted-foreground">-</span>

        return (
          <div className="text-sm">
            <div className="font-medium">
              {admin.display_name || admin.email}
            </div>
            {admin.display_name && (
              <div className="text-muted-foreground text-xs">{admin.email}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'target_user_id',
      header: 'المستخدم المستهدف',
      cell: ({ row }) => {
        const target = row.original.target_users
        if (!target) return <span className="text-muted-foreground">-</span>

        return (
          <div className="text-sm">
            <div className="font-medium">
              {target.display_name || target.email}
            </div>
            {target.display_name && (
              <div className="text-muted-foreground text-xs">{target.email}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'details',
      header: 'التفاصيل',
      cell: ({ row }) => {
        const details = row.original.details
        if (!details) return <span className="text-muted-foreground">-</span>

        // Format details based on action type
        if (typeof details === 'object') {
          const entries = Object.entries(details)
          if (entries.length === 0) return <span className="text-muted-foreground">-</span>

          return (
            <div className="text-sm space-y-1">
              {entries.slice(0, 2).map(([key, value]) => (
                <div key={key} className="text-muted-foreground">
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
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

        return <div className="text-sm text-muted-foreground">{String(details)}</div>
      },
    },
    {
      accessorKey: 'ip_address',
      header: 'عنوان IP',
      cell: ({ row }) => {
        const ip = row.original.ip_address
        if (!ip) return <span className="text-muted-foreground">-</span>
        return <code className="text-xs bg-muted px-1 py-0.5 rounded">{ip}</code>
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={logs}
      searchKey="action"
      searchPlaceholder="البحث عن الإجراءات..."
    />
  )
}
