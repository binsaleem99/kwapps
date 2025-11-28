import { getCurrentUser } from '@/lib/auth/session'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export async function AdminHeader() {
  const user = await getCurrentUser()

  const getInitials = (name?: string) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'owner':
        return { label: 'مالك', variant: 'default' as const }
      case 'support':
        return { label: 'دعم فني', variant: 'secondary' as const }
      case 'content':
        return { label: 'محتوى', variant: 'outline' as const }
      case 'readonly':
        return { label: 'قراءة فقط', variant: 'outline' as const }
      default:
        return { label: 'مسؤول', variant: 'default' as const }
    }
  }

  const roleBadge = getRoleBadge(user?.admin_role || undefined)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">لوحة التحكم الإدارية</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {user?.email}
            </p>
            <Badge variant={roleBadge.variant} className="mt-1">
              {roleBadge.label}
            </Badge>
          </div>
          <Avatar>
            <AvatarFallback className="bg-gradient-to-r from-[#0F172A] to-[#3B82F6] text-white">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
