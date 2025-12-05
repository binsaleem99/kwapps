'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  FolderKanban,
  FileText,
  DollarSign,
  BookOpen,
  Activity,
  Settings,
  LogOut,
  LayoutDashboard,
  Flag,
  Megaphone,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'

const navigation = [
  {
    name: 'لوحة التحكم',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'إدارة المستخدمين',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'مراقبة المشاريع',
    href: '/admin/projects',
    icon: FolderKanban,
  },
  {
    name: 'إدارة القوالب',
    href: '/admin/templates',
    icon: FileText,
  },
  {
    name: 'الفواتير والإيرادات',
    href: '/admin/billing',
    icon: DollarSign,
  },
  {
    name: 'إدارة المدونة',
    href: '/admin/blog',
    icon: BookOpen,
  },
  {
    name: 'صحة النظام',
    href: '/admin/health',
    icon: Activity,
  },
  {
    name: 'الميزات التجريبية',
    href: '/admin/feature-flags',
    icon: Flag,
  },
  {
    name: 'الإعلانات',
    href: '/admin/announcements',
    icon: Megaphone,
  },
  {
    name: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-l lg:border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0F172A] to-[#3B82F6] bg-clip-text text-transparent">
          كي دبليو آبس
        </h1>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6]/10 to-[#60A5FA]/10 text-[#3B82F6]'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}
