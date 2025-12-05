'use client'

/**
 * BuilderSidebar Component
 *
 * Collapsible sidebar for the builder
 * - Sections: Pages, Components, Assets, Settings
 * - Add page button
 * - Upload image button
 */

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  FileText,
  Component,
  Image,
  Settings,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  Home,
  Trash2,
  Edit2,
  Copy,
  MoreVertical,
  Loader2,
  Folder,
  FolderOpen,
  FileCode,
  Palette,
  Globe,
  Lock,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BuilderPage, BuilderAsset, SidebarSection } from '@/types/builder'

interface BuilderSidebarProps {
  pages: BuilderPage[]
  assets: BuilderAsset[]
  currentPageId: string | null
  onPageSelect: (pageId: string) => void
  onPageAdd?: () => void
  onPageDelete?: (pageId: string) => void
  onPageRename?: (pageId: string, name: string) => void
  onAssetUpload?: (file: File) => Promise<void>
  onAssetDelete?: (assetId: string) => void
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

const COMPONENT_CATEGORIES = [
  { id: 'layout', name: 'تخطيط', icon: Component, items: ['Header', 'Footer', 'Section', 'Container'] },
  { id: 'content', name: 'محتوى', icon: FileText, items: ['Hero', 'Features', 'Testimonials', 'FAQ'] },
  { id: 'forms', name: 'نماذج', icon: FileCode, items: ['Contact Form', 'Newsletter', 'Login Form'] },
  { id: 'media', name: 'وسائط', icon: Image, items: ['Image Gallery', 'Video Player', 'Carousel'] },
]

export function BuilderSidebar({
  pages,
  assets,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageRename,
  onAssetUpload,
  onAssetDelete,
  isCollapsed = false,
  onCollapsedChange,
  className,
}: BuilderSidebarProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('pages')
  const [isUploading, setIsUploading] = useState(false)
  const [showAddPageDialog, setShowAddPageDialog] = useState(false)
  const [newPageName, setNewPageName] = useState('')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageName, setEditingPageName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onAssetUpload) return

    setIsUploading(true)
    try {
      await onAssetUpload(file)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle add page
  const handleAddPage = () => {
    if (newPageName.trim()) {
      onPageAdd?.()
      setNewPageName('')
      setShowAddPageDialog(false)
    }
  }

  // Handle page rename
  const handlePageRename = (pageId: string) => {
    if (editingPageName.trim()) {
      onPageRename?.(pageId, editingPageName.trim())
    }
    setEditingPageId(null)
    setEditingPageName('')
  }

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div className={cn('w-12 bg-white border-l border-slate-200 flex flex-col', className)} dir="rtl">
        <div className="flex-1 py-2">
          <TooltipProvider>
            {/* Section buttons */}
            <div className="space-y-1 px-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'pages' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => {
                      setActiveSection('pages')
                      onCollapsedChange?.(false)
                    }}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">الصفحات</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'components' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => {
                      setActiveSection('components')
                      onCollapsedChange?.(false)
                    }}
                    className="w-full"
                  >
                    <Component className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">المكونات</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'assets' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => {
                      setActiveSection('assets')
                      onCollapsedChange?.(false)
                    }}
                    className="w-full"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">الملفات</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'settings' ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => {
                      setActiveSection('settings')
                      onCollapsedChange?.(false)
                    }}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">الإعدادات</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Expand button */}
        <div className="p-1.5 border-t border-slate-200">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onCollapsedChange?.(false)}
            className="w-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Expanded sidebar view
  return (
    <div className={cn('w-64 bg-white border-l border-slate-200 flex flex-col', className)} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 font-['Cairo']">المشروع</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onCollapsedChange?.(true)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSection('pages')}
          className={cn(
            'flex-1 py-2 text-xs font-medium font-[\'Cairo\'] transition-colors',
            activeSection === 'pages'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          الصفحات
        </button>
        <button
          onClick={() => setActiveSection('components')}
          className={cn(
            'flex-1 py-2 text-xs font-medium font-[\'Cairo\'] transition-colors',
            activeSection === 'components'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          المكونات
        </button>
        <button
          onClick={() => setActiveSection('assets')}
          className={cn(
            'flex-1 py-2 text-xs font-medium font-[\'Cairo\'] transition-colors',
            activeSection === 'assets'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          الملفات
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {/* Pages section */}
        {activeSection === 'pages' && (
          <div className="p-3 space-y-2">
            {/* Add page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPageDialog(true)}
              className="w-full justify-start gap-2 font-['Cairo'] text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة صفحة
            </Button>

            {/* Pages list */}
            <div className="space-y-1 mt-3">
              {pages.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-['Cairo']">لا توجد صفحات</p>
                </div>
              ) : (
                pages.map((page) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    isActive={page.id === currentPageId}
                    isEditing={editingPageId === page.id}
                    editingName={editingPageName}
                    onSelect={() => onPageSelect(page.id)}
                    onEdit={() => {
                      setEditingPageId(page.id)
                      setEditingPageName(page.name)
                    }}
                    onEditChange={setEditingPageName}
                    onEditSave={() => handlePageRename(page.id)}
                    onEditCancel={() => {
                      setEditingPageId(null)
                      setEditingPageName('')
                    }}
                    onDelete={() => onPageDelete?.(page.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Components section */}
        {activeSection === 'components' && (
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-3 font-['Cairo']">
              اسحب المكونات إلى المعاينة (قريباً)
            </p>

            <Accordion type="multiple" defaultValue={['layout']} className="space-y-1">
              {COMPONENT_CATEGORIES.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-none">
                  <AccordionTrigger className="py-2 px-2 hover:bg-slate-50 rounded-md text-sm font-['Cairo']">
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-slate-500" />
                      {category.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <div className="space-y-1 pr-6">
                      {category.items.map((item) => (
                        <button
                          key={item}
                          className="w-full text-right py-1.5 px-2 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-colors font-['Cairo']"
                          disabled
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Badge variant="outline" className="w-full justify-center mt-4 font-['Cairo']">
              قريباً
            </Badge>
          </div>
        )}

        {/* Assets section */}
        {activeSection === 'assets' && (
          <div className="p-3 space-y-2">
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full justify-start gap-2 font-['Cairo'] text-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              رفع صورة
            </Button>

            {/* Assets grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {assets.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-slate-400">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-['Cairo']">لا توجد ملفات</p>
                </div>
              ) : (
                assets.map((asset) => (
                  <AssetItem
                    key={asset.id}
                    asset={asset}
                    onDelete={() => onAssetDelete?.(asset.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings section */}
        {activeSection === 'settings' && (
          <div className="p-3 space-y-4">
            {/* SEO Settings */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2 font-['Cairo'] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                إعدادات SEO
              </h3>
              <div className="space-y-2">
                <Input
                  placeholder="عنوان الصفحة"
                  className="h-8 text-xs font-['Cairo']"
                  dir="rtl"
                />
                <Input
                  placeholder="وصف الصفحة"
                  className="h-8 text-xs font-['Cairo']"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Theme Settings */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2 font-['Cairo'] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                الألوان
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Badge variant="outline" className="w-full justify-center font-['Cairo']">
              المزيد قريباً
            </Badge>
          </div>
        )}
      </ScrollArea>

      {/* Add page dialog */}
      <Dialog open={showAddPageDialog} onOpenChange={setShowAddPageDialog}>
        <DialogContent className="font-['Cairo']" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة صفحة جديدة</DialogTitle>
            <DialogDescription>
              أدخل اسم الصفحة الجديدة
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="اسم الصفحة"
            className="font-['Cairo']"
            dir="rtl"
            onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAddPageDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddPage} disabled={!newPageName.trim()}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Page item component
function PageItem({
  page,
  isActive,
  isEditing,
  editingName,
  onSelect,
  onEdit,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: {
  page: BuilderPage
  isActive: boolean
  isEditing: boolean
  editingName: string
  onSelect: () => void
  onEdit: () => void
  onEditChange: (name: string) => void
  onEditSave: () => void
  onEditCancel: () => void
  onDelete: () => void
}) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 p-1.5 bg-slate-50 rounded-md">
        <Input
          value={editingName}
          onChange={(e) => onEditChange(e.target.value)}
          className="h-7 text-xs font-['Cairo']"
          dir="rtl"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSave()
            if (e.key === 'Escape') onEditCancel()
          }}
        />
        <Button variant="ghost" size="icon-sm" onClick={onEditSave}>
          <FileText className="w-3.5 h-3.5 text-green-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors group',
        isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
      )}
      onClick={onSelect}
    >
      {page.isHomePage ? (
        <Home className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span className="flex-1 text-xs font-['Cairo'] truncate">{page.name}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32 font-['Cairo'] text-right">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
            <Edit2 className="w-3.5 h-3.5 ml-2" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-red-600"
            disabled={page.isHomePage}
          >
            <Trash2 className="w-3.5 h-3.5 ml-2" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Asset item component
function AssetItem({
  asset,
  onDelete,
}: {
  asset: BuilderAsset
  onDelete: () => void
}) {
  return (
    <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
      {asset.type === 'image' ? (
        <img
          src={asset.url}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <Folder className="w-6 h-6 text-slate-400" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-white hover:text-red-400 hover:bg-white/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
        <p className="text-[10px] text-white truncate font-['Cairo']">{asset.name}</p>
      </div>
    </div>
  )
}
