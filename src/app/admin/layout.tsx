import { requireAdmin } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is admin (will redirect if not)
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar />
      <div className="lg:mr-64">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
