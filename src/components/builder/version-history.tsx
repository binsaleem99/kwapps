'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  History,
  RotateCcw,
  Clock,
  Check,
  Eye,
  Loader2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CodeVersion {
  id: string
  version: number
  code: string
  description: string | null
  is_active: boolean
  created_at: string
}

interface VersionHistoryProps {
  projectId: string
  userId: string
  onRestore: (code: string) => void
  onPreview: (code: string) => void
}

export function VersionHistory({
  projectId,
  userId,
  onRestore,
  onPreview,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchVersions()
    }
  }, [isOpen, projectId])

  async function fetchVersions() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('generated_code')
        .select('id, version, code, description, is_active, created_at')
        .eq('project_id', projectId)
        .order('version', { ascending: false })
        .limit(50)

      if (error) throw error
      setVersions(data || [])
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRestore(version: CodeVersion) {
    setIsRestoring(version.id)
    try {
      const supabase = createClient()

      // Call the restore function
      const { data, error } = await supabase.rpc('restore_code_version', {
        p_version_id: version.id,
        p_user_id: userId,
      })

      if (error) throw error

      // Update local state
      onRestore(version.code)

      // Refresh versions list
      await fetchVersions()
    } catch (error) {
      console.error('Error restoring version:', error)
      alert('فشل استعادة الإصدار')
    } finally {
      setIsRestoring(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ar-KW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return formatDate(dateString)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-['Cairo'] border-2 gap-2"
          title="سجل الإصدارات"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">الإصدارات</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-96 font-['Cairo']" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            سجل الإصدارات
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>لا توجد إصدارات سابقة</p>
              <p className="text-sm mt-2">سيتم حفظ الإصدارات تلقائياً</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-3 pl-4">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      version.is_active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Version indicator line */}
                    {index < versions.length - 1 && (
                      <div className="absolute right-7 top-full w-0.5 h-3 bg-slate-200" />
                    )}

                    {/* Version header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            version.is_active ? 'text-blue-600' : 'text-slate-700'
                          }`}
                        >
                          v{version.version}
                        </span>
                        {version.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                            الحالي
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(version.created_at)}
                      </div>
                    </div>

                    {/* Description */}
                    {version.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {version.description}
                      </p>
                    )}

                    {/* Code preview */}
                    <div className="bg-slate-100 rounded p-2 mb-3">
                      <pre className="text-xs text-slate-600 line-clamp-3 overflow-hidden" dir="ltr">
                        {version.code.substring(0, 200)}...
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onPreview(version.code)}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 ml-1" />
                              معاينة
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>معاينة هذا الإصدار</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {!version.is_active && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRestore(version)}
                                disabled={isRestoring === version.id}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                {isRestoring === version.id ? (
                                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3 h-3 ml-1" />
                                )}
                                استعادة
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>استعادة هذا الإصدار كإصدار جديد</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
