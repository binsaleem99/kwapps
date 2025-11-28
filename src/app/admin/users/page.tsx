import { getUsers } from '@/app/actions/users'
import { UsersTable } from './users-table'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const result = await getUsers({ limit: 100 })

  if (result.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-red-600 mt-2">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-600 mt-2">
          إدارة المستخدمين والاشتراكات والصلاحيات
        </p>
      </div>

      <UsersTable users={result.users || []} />
    </div>
  )
}
