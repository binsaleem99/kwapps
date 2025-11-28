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
  XCircle,
} from 'lucide-react'
import { SubscriptionWithUser, cancelSubscription } from '@/app/actions/billing'
import { SubscriptionStatus, UserPlan } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithUser[]
}

const getStatusLabel = (status: SubscriptionStatus) => {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'نشط',
    canceled: 'ملغي',
    past_due: 'متأخر',
    paused: 'متوقف',
  }
  return labels[status]
}

const getStatusVariant = (status: SubscriptionStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<SubscriptionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    canceled: 'destructive',
    past_due: 'destructive',
    paused: 'secondary',
  }
  return variants[status]
}

const getPlanLabel = (plan: UserPlan) => {
  const labels: Record<UserPlan, string> = {
    free: 'مجاني',
    builder: 'مطور',
    pro: 'احترافي',
    hosting_only: 'استضافة فقط',
  }
  return labels[plan]
}

const getPlanPrice = (plan: UserPlan) => {
  const prices: Record<UserPlan, number> = {
    free: 0,
    builder: 33,
    pro: 59,
    hosting_only: 5,
  }
  return prices[plan]
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const router = useRouter()

  const handleCancelSubscription = async (subscription: SubscriptionWithUser) => {
    if (!confirm(`هل أنت متأكد من إلغاء اشتراك المستخدم "${subscription.users?.email}"؟\n\nالخطة: ${getPlanLabel(subscription.plan)}\n\nهذا الإجراء سيتم تطبيقه في نهاية فترة الفوترة الحالية.`)) {
      return
    }

    const result = await cancelSubscription(subscription.id)
    if (result.error) {
      alert(result.error)
    } else {
      alert('تم إلغاء الاشتراك بنجاح')
      router.refresh()
    }
  }

  const columns: ColumnDef<SubscriptionWithUser>[] = [
    {
      accessorKey: 'users.email',
      header: 'المستخدم',
      cell: ({ row }) => {
        const user = row.original.users
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">
              {user?.display_name || user?.email || '-'}
            </div>
            {user?.display_name && (
              <div className="text-xs text-muted-foreground">{user.email}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'plan',
      header: 'الخطة',
      cell: ({ row }) => {
        const plan = row.original.plan
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="default">{getPlanLabel(plan)}</Badge>
            <span className="text-xs text-muted-foreground">
              {getPlanPrice(plan)} KWD/شهر
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={getStatusVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'current_period_start',
      header: 'الفترة الحالية',
      cell: ({ row }) => {
        const start = row.original.current_period_start
        const end = row.original.current_period_end
        if (!start || !end) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div>
              {new Date(start).toLocaleDateString('ar-KW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="text-muted-foreground">
              إلى {new Date(end).toLocaleDateString('ar-KW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'cancel_at_period_end',
      header: 'الإلغاء',
      cell: ({ row }) => {
        const cancelAtEnd = row.original.cancel_at_period_end
        return cancelAtEnd ? (
          <Badge variant="outline" className="text-xs">
            سيتم الإلغاء
          </Badge>
        ) : null
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
        const subscription = row.original

        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleCancelSubscription(subscription)}
                    className="text-destructive"
                  >
                    <XCircle className="ml-2 h-4 w-4" />
                    إلغاء الاشتراك
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={subscriptions}
      searchKey="users.email"
      searchPlaceholder="بحث في الاشتراكات..."
    />
  )
}
