import { getAuditLogs } from '@/app/actions/health'
import { AuditLogsTable } from './audit-logs-table'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
  const result = await getAuditLogs({ limit: 100 })

  if (result.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">سجلات التدقيق</h1>
          <p className="text-muted-foreground">عرض جميع الإجراءات الإدارية</p>
        </div>
        <div className="text-destructive">{result.error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">سجلات التدقيق</h1>
        <p className="text-muted-foreground">
          عرض جميع الإجراءات الإدارية والتغييرات التي تمت على النظام
        </p>
      </div>

      <AuditLogsTable logs={result.data || []} />
    </div>
  )
}
