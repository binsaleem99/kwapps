'use client'

/**
 * DeploymentStatus Component
 *
 * Real-time deployment status indicator
 * Shows:
 * - Current deployment state
 * - Build logs (expandable)
 * - Retry button on error
 * - Quick actions (view site, copy URL)
 */

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  AlertCircle,
} from 'lucide-react'

// Deployment states
type DeploymentState = 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'not_deployed'

interface DeploymentLog {
  id: string
  type: 'stdout' | 'stderr' | 'command'
  text: string
  createdAt: number
}

interface DeploymentStatusProps {
  projectId: string
  deploymentUrl?: string | null
  deploymentId?: string | null
  status?: string
  deployedAt?: string | null
  onRetry?: () => void
  className?: string
  compact?: boolean
}

export function DeploymentStatus({
  projectId,
  deploymentUrl,
  deploymentId,
  status: initialStatus,
  deployedAt,
  onRetry,
  className,
  compact = false,
}: DeploymentStatusProps) {
  // State
  const [status, setStatus] = useState<DeploymentState>(
    (initialStatus as DeploymentState) || 'not_deployed'
  )
  const [logs, setLogs] = useState<DeploymentLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch deployment status
  const fetchStatus = useCallback(async () => {
    if (!deploymentId) return

    try {
      const response = await fetch(`/api/projects/${projectId}/publish`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status || 'not_deployed')
      }
    } catch (error) {
      console.error('Failed to fetch deployment status:', error)
    }
  }, [projectId, deploymentId])

  // Auto-refresh while building
  useEffect(() => {
    if (status === 'QUEUED' || status === 'BUILDING') {
      const interval = setInterval(fetchStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [status, fetchStatus])

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchStatus()
    setIsRefreshing(false)
  }

  // Copy URL
  const copyUrl = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Get status icon and color
  const getStatusConfig = (state: DeploymentState) => {
    switch (state) {
      case 'READY':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'منشور',
          labelAr: 'منشور',
        }
      case 'BUILDING':
        return {
          icon: Loader2,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'جارٍ البناء',
          labelAr: 'جارٍ البناء',
          animate: true,
        }
      case 'QUEUED':
        return {
          icon: Clock,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          label: 'في الانتظار',
          labelAr: 'في الانتظار',
        }
      case 'ERROR':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'فشل',
          labelAr: 'فشل',
        }
      case 'CANCELED':
        return {
          icon: AlertCircle,
          color: 'text-slate-500',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'ملغي',
          labelAr: 'ملغي',
        }
      default:
        return {
          icon: Globe,
          color: 'text-slate-400',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'غير منشور',
          labelAr: 'غير منشور',
        }
    }
  }

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon

  // Compact version (for toolbar)
  if (compact) {
    if (status === 'not_deployed') {
      return null
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md',
              statusConfig.bgColor,
              className
            )}>
              <StatusIcon className={cn(
                'w-3.5 h-3.5',
                statusConfig.color,
                statusConfig.animate && 'animate-spin'
              )} />
              <span className={cn('text-xs font-medium', statusConfig.color)}>
                {statusConfig.labelAr}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-['Cairo']" dir="rtl">
            <p className="text-sm">{statusConfig.labelAr}</p>
            {deploymentUrl && (
              <p className="text-xs text-slate-400 mt-1" dir="ltr">
                {deploymentUrl}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full version
  return (
    <div className={cn(
      'border rounded-lg p-4 font-["Cairo"]',
      statusConfig.bgColor,
      statusConfig.borderColor,
      className
    )} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            status === 'READY' ? 'bg-green-100' :
            status === 'BUILDING' || status === 'QUEUED' ? 'bg-blue-100' :
            status === 'ERROR' ? 'bg-red-100' : 'bg-slate-100'
          )}>
            <StatusIcon className={cn(
              'w-5 h-5',
              statusConfig.color,
              statusConfig.animate && 'animate-spin'
            )} />
          </div>
          <div>
            <h4 className={cn('font-semibold', statusConfig.color)}>
              {statusConfig.labelAr}
            </h4>
            {deployedAt && status === 'READY' && (
              <p className="text-xs text-slate-500">
                تم النشر: {new Date(deployedAt).toLocaleDateString('ar-SA')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {(status === 'BUILDING' || status === 'QUEUED') && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn(
                'w-4 h-4',
                isRefreshing && 'animate-spin'
              )} />
            </Button>
          )}

          {status === 'ERROR' && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>

      {/* URL section (when deployed) */}
      {status === 'READY' && deploymentUrl && (
        <div className="mt-4 flex items-center gap-2 p-2 bg-white/50 rounded-md">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          <a
            href={deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-blue-600 hover:underline truncate"
            dir="ltr"
          >
            {deploymentUrl}
          </a>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={copyUrl}>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>نسخ الرابط</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => window.open(deploymentUrl, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>فتح الموقع</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Build logs (expandable) */}
      {(status === 'BUILDING' || status === 'ERROR') && logs.length > 0 && (
        <Collapsible open={showLogs} onOpenChange={setShowLogs} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                سجل البناء
              </span>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                showLogs && 'rotate-180'
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-48 mt-2 rounded-md bg-slate-900 p-3">
              <div className="space-y-1 font-mono text-xs" dir="ltr">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'whitespace-pre-wrap',
                      log.type === 'stderr' ? 'text-red-400' :
                      log.type === 'command' ? 'text-blue-400' : 'text-slate-300'
                    )}
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Error message */}
      {status === 'ERROR' && (
        <div className="mt-4 p-3 bg-red-100 rounded-md text-sm text-red-700">
          <p className="font-medium">حدث خطأ أثناء النشر</p>
          <p className="mt-1 text-xs">يرجى المحاولة مرة أخرى أو التواصل مع الدعم</p>
        </div>
      )}
    </div>
  )
}

/**
 * Inline status badge for use in lists/cards
 */
export function DeploymentStatusBadge({
  status,
  url,
  className,
}: {
  status?: string
  url?: string | null
  className?: string
}) {
  const state = (status as DeploymentState) || 'not_deployed'

  const config: Record<DeploymentState, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'READY': { label: 'منشور', variant: 'default' },
    'BUILDING': { label: 'جارٍ البناء', variant: 'secondary' },
    'QUEUED': { label: 'في الانتظار', variant: 'secondary' },
    'ERROR': { label: 'فشل', variant: 'destructive' },
    'CANCELED': { label: 'ملغي', variant: 'outline' },
    'not_deployed': { label: 'غير منشور', variant: 'outline' },
  }

  const { label, variant } = config[state] || config['not_deployed']

  return (
    <Badge variant={variant} className={cn("font-['Cairo']", className)}>
      {state === 'BUILDING' && <Loader2 className="w-3 h-3 ml-1 animate-spin" />}
      {state === 'READY' && url && <Globe className="w-3 h-3 ml-1" />}
      {label}
    </Badge>
  )
}
