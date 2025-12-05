'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Project {
  id: string
  name: string
  status: string
  updated_at: string
  created_at: string
}

interface ProjectSidebarProps {
  selectedProjectId: string | null
  onSelectProject: (projectId: string) => void
  onNewProject: () => void
  userId: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ProjectSidebar({
  selectedProjectId,
  onSelectProject,
  onNewProject,
  userId,
  isCollapsed = false,
  onToggleCollapse,
}: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)

  useEffect(() => {
    if (userId) {
      fetchProjects()
    }
  }, [userId])

  async function fetchProjects() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status, updated_at, created_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRename() {
    if (!editingProject || !newName.trim()) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({ name: newName.trim() })
        .eq('id', editingProject.id)

      if (error) throw error

      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id ? { ...p, name: newName.trim() } : p
        )
      )
      setEditingProject(null)
      setNewName('')
    } catch (error) {
      console.error('Error renaming project:', error)
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteConfirm.id)

      if (error) throw error

      setProjects((prev) => prev.filter((p) => p.id !== deleteConfirm.id))

      // If deleting current project, create new one
      if (deleteConfirm.id === selectedProjectId) {
        onNewProject()
      }

      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-KW', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-l border-slate-700 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-white hover:bg-slate-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewProject}
          className="text-white hover:bg-slate-800"
          title="مشروع جديد"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-['Cairo']">المشاريع</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewProject}
                className="text-white hover:bg-slate-800"
                title="مشروع جديد"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="text-white hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-['Cairo']"
              dir="rtl"
            />
          </div>
        </div>

        {/* Projects List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-['Cairo']">
                  {searchQuery ? 'لا توجد نتائج' : 'لا توجد مشاريع'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedProjectId === project.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <FolderOpen className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate font-['Cairo']">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                            selectedProjectId === project.id
                              ? 'hover:bg-blue-500 text-white'
                              : 'hover:bg-slate-700 text-slate-400'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-['Cairo']">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProject(project)
                            setNewName(project.name)
                          }}
                        >
                          <Edit2 className="w-4 h-4 ml-2" />
                          إعادة تسمية
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(project)
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Project Count */}
        <div className="p-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center font-['Cairo']">
            {projects.length} مشروع
          </p>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="font-['Cairo']" dir="rtl">
          <DialogHeader>
            <DialogTitle>إعادة تسمية المشروع</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم المشروع"
            className="mt-4"
            dir="rtl"
          />
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingProject(null)}>
              إلغاء
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="font-['Cairo']" dir="rtl">
          <DialogHeader>
            <DialogTitle>حذف المشروع</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 mt-2">
            هل أنت متأكد من حذف "{deleteConfirm?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
