import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthStatusCardProps {
  title: string
  status: 'healthy' | 'degraded' | 'down'
  icon: LucideIcon
  metrics?: Array<{
    label: string
    value: string
  }>
}

export function HealthStatusCard({
  title,
  status,
  icon: Icon,
  metrics = [],
}: HealthStatusCardProps) {
  const statusConfig = {
    healthy: {
      label: 'سليم',
      color: 'bg-green-500',
      badgeVariant: 'default' as const,
    },
    degraded: {
      label: 'متدهور',
      color: 'bg-yellow-500',
      badgeVariant: 'secondary' as const,
    },
    down: {
      label: 'معطل',
      color: 'bg-red-500',
      badgeVariant: 'destructive' as const,
    },
  }

  const config = statusConfig[status]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn('h-3 w-3 rounded-full', config.color)} />
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </div>
        {metrics.length > 0 && (
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}:</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
