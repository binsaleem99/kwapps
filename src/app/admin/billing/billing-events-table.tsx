'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { BillingEventWithUser } from '@/app/actions/billing'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface BillingEventsTableProps {
  events: BillingEventWithUser[]
}

const getEventTypeLabel = (eventType: string) => {
  const labels: Record<string, string> = {
    subscription_created: 'إنشاء اشتراك',
    subscription_updated: 'تحديث اشتراك',
    subscription_canceled: 'إلغاء اشتراك',
    payment_success: 'دفع ناجح',
    payment_failed: 'فشل الدفع',
    renewal: 'تجديد',
    refund: 'استرداد',
  }
  return labels[eventType] || eventType
}

const getEventTypeVariant = (eventType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (eventType.includes('success') || eventType.includes('created') || eventType.includes('renewal')) {
    return 'default'
  }
  if (eventType.includes('failed') || eventType.includes('canceled')) {
    return 'destructive'
  }
  if (eventType.includes('refund')) {
    return 'outline'
  }
  return 'secondary'
}

const getPlanLabel = (plan: string) => {
  const labels: Record<string, string> = {
    free: 'مجاني',
    builder: 'مطور',
    pro: 'احترافي',
    hosting_only: 'استضافة فقط',
  }
  return labels[plan] || plan
}

export function BillingEventsTable({ events }: BillingEventsTableProps) {
  const columns: ColumnDef<BillingEventWithUser>[] = [
    {
      accessorKey: 'event_type',
      header: 'نوع الحدث',
      cell: ({ row }) => {
        const eventType = row.original.event_type
        return (
          <Badge variant={getEventTypeVariant(eventType)}>
            {getEventTypeLabel(eventType)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'users.email',
      header: 'المستخدم',
      cell: ({ row }) => {
        const user = row.original.users
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              {user?.display_name || user?.email || '-'}
            </div>
            {user?.plan && (
              <Badge variant="outline" className="text-xs w-fit">
                {getPlanLabel(user.plan)}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'amount_kwd',
      header: 'المبلغ',
      cell: ({ row }) => {
        const amount = row.original.amount_kwd
        return amount ? (
          <span className="font-medium">{amount.toFixed(3)} KWD</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'upayments_event_id',
      header: 'معرف الحدث',
      cell: ({ row }) => {
        const eventId = row.original.upayments_event_id
        return eventId ? (
          <span className="text-xs font-mono text-muted-foreground">
            {eventId.substring(0, 12)}...
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'data',
      header: 'البيانات',
      cell: ({ row }) => {
        const data = row.original.data
        if (!data || Object.keys(data).length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <div className="text-xs text-muted-foreground max-w-md truncate">
            {JSON.stringify(data).substring(0, 50)}...
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'التاريخ',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm">
              {formatDistanceToNow(date, { addSuffix: true, locale: ar })}
            </span>
            <span className="text-xs text-muted-foreground">
              {date.toLocaleDateString('ar-KW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={events}
      searchKey="event_type"
      searchPlaceholder="بحث في الأحداث المالية..."
    />
  )
}
