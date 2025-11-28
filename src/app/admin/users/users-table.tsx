'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, Ban, RotateCcw, StickyNote, Tag, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { User } from '@/types/database'
import { UserDetailsModal } from './user-details-modal'
import { banUser, unbanUser, resetUserLimits } from '@/app/actions/users'
import { useRouter } from 'next/navigation'

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      free: 'outline',
      builder: 'secondary',
      pro: 'default',
      hosting_only: 'outline',
    }

    const labels: Record<string, string> = {
      free: 'مجاني',
      builder: 'منشئ',
      pro: 'احترافي',
      hosting_only: 'استضافة فقط',
    }

    return (
      <Badge variant={variants[plan] || 'outline'}>
        {labels[plan] || plan}
      </Badge>
    )
  }

  const handleBanUser = async (user: User) => {
    if (confirm(`هل أنت متأكد من حظر ${user.email}؟`)) {
      const result = await banUser(user.id)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    }
  }

  const handleUnbanUser = async (user: User) => {
    const result = await unbanUser(user.id)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const handleResetLimits = async (user: User) => {
    if (confirm(`إعادة تعيين حدود الاستخدام لـ ${user.email}؟`)) {
      const result = await resetUserLimits(user.id)
      if (result.error) {
        alert(result.error)
      } else {
        alert('تم إعادة تعيين الحدود بنجاح')
        router.refresh()
      }
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'البريد الإلكتروني',
      cell: ({ row }) => {
        const user = row.original
        const isBanned = user.tags?.includes('banned')

        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{user.email}</div>
            {user.display_name && (
              <div className="text-sm text-muted-foreground">
                {user.display_name}
              </div>
            )}
            {isBanned && (
              <Badge variant="destructive" className="w-fit text-xs">
                محظور
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'plan',
      header: 'الخطة',
      cell: ({ row }) => getPlanBadge(row.original.plan),
    },
    {
      accessorKey: 'is_admin',
      header: 'الصلاحيات',
      cell: ({ row }) => {
        const user = row.original
        if (user.is_admin) {
          const roleLabels: Record<string, string> = {
            owner: 'مالك',
            support: 'دعم فني',
            content: 'محتوى',
            readonly: 'قراءة فقط',
          }
          return (
            <Badge variant="default" className="gap-1">
              <Shield className="h-3 w-3" />
              {roleLabels[user.admin_role || ''] || 'مسؤول'}
            </Badge>
          )
        }
        return <span className="text-sm text-muted-foreground">مستخدم</span>
      },
    },
    {
      accessorKey: 'tags',
      header: 'الوسوم',
      cell: ({ row }) => {
        const tags = row.original.tags?.filter((t) => t !== 'banned') || []
        if (tags.length === 0) return '-'

        return (
          <div className="flex gap-1 flex-wrap">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ التسجيل',
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
      accessorKey: 'last_seen_at',
      header: 'آخر ظهور',
      cell: ({ row }) => {
        const lastSeen = row.original.last_seen_at
        if (!lastSeen) return <span className="text-sm text-muted-foreground">-</span>

        const date = new Date(lastSeen)
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
        const user = row.original
        const isBanned = user.tags?.includes('banned')

        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleResetLimits(user)}>
                <RotateCcw className="ml-2 h-4 w-4" />
                إعادة تعيين الحدود
              </DropdownMenuItem>
              {!isBanned ? (
                <DropdownMenuItem
                  onClick={() => handleBanUser(user)}
                  className="text-red-600"
                >
                  <Ban className="ml-2 h-4 w-4" />
                  حظر المستخدم
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUnbanUser(user)}>
                  <Shield className="ml-2 h-4 w-4" />
                  إلغاء الحظر
                </DropdownMenuItem>
              )}
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
        data={users}
        searchKey="email"
        searchPlaceholder="بحث عن مستخدم..."
      />

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </>
  )
}
