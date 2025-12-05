'use client'

/**
 * BuilderToolbar Component
 *
 * Top toolbar for the builder with integrated publish flow
 * - Project name (editable)
 * - Save button (with credit cost)
 * - Publish button with PublishModal
 * - Deployment status indicator
 * - Settings dropdown
 * - Undo/Redo (future)
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sparkles,
  ArrowRight,
  Save,
  Rocket,
  Settings,
  MoreVertical,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Copy,
  FileCode,
  Pencil,
  Check,
  X,
  Loader2,
  Coins,
  ExternalLink,
  LayoutDashboard,
  Eye,
  Globe,
} from 'lucide-react'
import { PublishModal } from './PublishModal'
import { DeploymentStatus } from './DeploymentStatus'
import { CREDIT_COSTS } from '@/types/builder'

interface BuilderToolbarProps {
  projectId: string
  projectName: string
  onProjectNameChange?: (name: string) => void
  hasCode: boolean
  isSaving?: boolean
  onSave?: () => Promise<void>
  deploymentUrl?: string | null
  deploymentId?: string | null
  deploymentStatus?: string
  subdomain?: string | null
  userCredits?: number
  username?: string
  className?: string
}

export function BuilderToolbar({
  projectId,
  projectName,
  onProjectNameChange,
  hasCode,
  isSaving,
  onSave,
  deploymentUrl,
  deploymentId,
  deploymentStatus,
  subdomain,
  userCredits = 0,
  username,
  className,
}: BuilderToolbarProps) {
  const router = useRouter()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(projectName)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isCreatingPreview, setIsCreatingPreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  // Update editedName when projectName changes
  useEffect(() => {
    setEditedName(projectName)
  }, [projectName])

  // Handle name save
  const handleNameSave = () => {
    if (editedName.trim() && editedName !== projectName) {
      onProjectNameChange?.(editedName.trim())
    }
    setIsEditingName(false)
  }

  // Handle name cancel
  const handleNameCancel = () => {
    setEditedName(projectName)
    setIsEditingName(false)
  }

  // Handle key down in name input
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      handleNameCancel()
    }
  }

  // Handle project delete
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle duplicate project
  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        router.push(`/builder?project=${data.project.id}`)
      }
    } catch (err) {
      console.error('Duplicate error:', err)
    }
  }

  // Handle export code
  const handleExportCode = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName.replace(/\s+/g, '-')}-code.zip`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  // Handle create preview
  const handleCreatePreview = async () => {
    if (!hasCode) return

    setIsCreatingPreview(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/preview`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setPreviewUrl(data.previewUrl)
        // Open in new tab
        window.open(data.previewUrl, '_blank')
      }
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setIsCreatingPreview(false)
    }
  }

  return (
    <>
      <div className={cn('px-4 py-3 flex items-center justify-between', className)} dir="rtl">
        {/* Left side: Logo, back button, project name */}
        <div className="flex items-center gap-3">
          {/* Back to dashboard */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard')}
                  className="ml-1"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>العودة للوحة التحكم</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 font-['Cairo'] leading-tight">
                KW APPS
              </h1>
              <p className="text-xs text-slate-500 font-['Cairo']">منشئ المواقع</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />

          {/* Project name */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={nameInputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className="h-8 w-48 text-sm font-['Cairo']"
                  dir="rtl"
                />
                <Button variant="ghost" size="icon-sm" onClick={handleNameSave}>
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={handleNameCancel}>
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors group"
              >
                <span className="text-base font-semibold text-slate-900 font-['Cairo']">
                  {projectName}
                </span>
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Code generated badge */}
            {hasCode && (
              <Badge className="bg-green-500/10 text-green-700 border-green-200 font-['Cairo']">
                <FileCode className="w-3 h-3 ml-1" />
                تم الإنشاء
              </Badge>
            )}

            {/* Deployment status (compact) */}
            {deploymentStatus && deploymentStatus !== 'not_deployed' && (
              <DeploymentStatus
                projectId={projectId}
                deploymentUrl={deploymentUrl}
                deploymentId={deploymentId}
                status={deploymentStatus}
                compact
              />
            )}
          </div>
        </div>

        {/* Center: Undo/Redo (future) */}
        <div className="hidden md:flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" disabled>
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تراجع (قريباً)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" disabled>
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>إعادة (قريباً)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Credit balance */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-semibold font-['Cairo']">{userCredits}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-['Cairo']">رصيدك الحالي</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Save button */}
          {onSave && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving || !hasCode}
                    className="gap-1.5 font-['Cairo']"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">حفظ</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>حفظ المشروع</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Preview button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreatePreview}
                  disabled={!hasCode || isCreatingPreview}
                  className="gap-1.5 font-['Cairo']"
                >
                  {isCreatingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">معاينة</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>معاينة مجانية (24 ساعة)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Publish button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => setShowPublishModal(true)}
                  disabled={!hasCode}
                  className="gap-1.5 font-['Cairo'] bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Rocket className="w-4 h-4" />
                  <span className="hidden sm:inline">نشر</span>
                  <Badge variant="secondary" className="mr-1.5 bg-white/20 text-white text-xs px-1.5 py-0">
                    1
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-['Cairo']">
                نشر الموقع (1 رصيد)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* View deployed site */}
          {deploymentUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(deploymentUrl, '_blank')}
                    className="gap-1.5 font-['Cairo']"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">عرض</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>فتح الموقع المنشور</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 font-['Cairo'] text-right">
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="w-4 h-4 ml-2" />
                لوحة التحكم
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDuplicate} disabled={!hasCode}>
                <Copy className="w-4 h-4 ml-2" />
                تكرار المشروع
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleExportCode} disabled={!hasCode}>
                <Download className="w-4 h-4 ml-2" />
                تصدير الكود
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف المشروع
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="font-['Cairo']" dir="rtl">
            <DialogHeader>
              <DialogTitle>حذف المشروع</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف "{projectName}"؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Trash2 className="w-4 h-4 ml-2" />
                )}
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Publish Modal */}
      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        projectId={projectId}
        projectName={projectName}
        hasCode={hasCode}
        userCredits={userCredits}
        username={username}
        existingSubdomain={subdomain || undefined}
        existingUrl={deploymentUrl || undefined}
      />
    </>
  )
}
