import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
}: StatsCardProps) {
  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-green-500',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-500',
    },
    stable: {
      icon: Minus,
      color: 'text-gray-500',
    },
  }

  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {TrendIcon && (
            <TrendIcon className={cn('h-4 w-4', trendInfo?.color)} />
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
