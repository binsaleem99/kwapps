'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Eye,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { Project, ProjectStatus, deleteProject } from '@/app/actions/admin-projects'
import { ProjectDetailsModal } from './project-details-modal'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ProjectsTableProps {
  projects: Project[]
}

const getStatusLabel = (status: ProjectStatus) => {
  const labels: Record<ProjectStatus, string> = {
    draft: 'مسودة',
    generating: 'قيد التوليد',
    preview: 'معاينة',
    published: 'منشور',
    error: 'خطأ',
  }
  return labels[status]
}

const getStatusVariant = (status: ProjectStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<ProjectStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    generating: 'secondary',
    preview: 'default',
    published: 'default',
    error: 'destructive',
  }
  return variants[status]
}

const getPlanBadge = (plan: string) => {
  const labels: Record<string, string> = {
    free: 'مجاني',
    builder: 'مطور',
    pro: 'احترافي',
    hosting_only: 'استضافة فقط',
  }

  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    free: 'outline',
    builder: 'default',
    pro: 'default',
    hosting_only: 'secondary',
  }

  return (
    <Badge variant={variants[plan] || 'outline'} className="text-xs">
      {labels[plan] || plan}
    </Badge>
  )
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setDetailsOpen(true)
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`هل أنت متأكد من حذف المشروع "${project.name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return
    }

    const result = await deleteProject(project.id)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'اسم المشروع',
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex flex-col gap-1 max-w-md">
            <div className="font-medium">{project.name}</div>
            {project.description && (
              <div className="text-sm text-muted-foreground truncate">
                {project.description.substring(0, 60)}
                {project.description.length > 60 ? '...' : ''}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'users.email',
      header: 'المستخدم',
      cell: ({ row }) => {
        const project = row.original
        const user = project.users
        if (!user) return <span className="text-muted-foreground">-</span>

        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              {user.display_name || user.email}
            </div>
            {getPlanBadge(user.plan)}
          </div>
        )
      },
    },
    {
      accessorKey: 'templates.name_ar',
      header: 'القالب',
      cell: ({ row }) => {
        const template = row.original.templates
        return template ? (
          <span className="text-sm">{template.name_ar}</span>
        ) : (
          <span className="text-sm text-muted-foreground">بدون قالب</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={getStatusVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'deployed_url',
      header: 'النشر',
      cell: ({ row }) => {
        const url = row.original.deployed_url
        return url ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true, locale: ar })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const project = row.original

        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                <Eye className="ml-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              {project.deployed_url && (
                <DropdownMenuItem asChild>
                  <a href={project.deployed_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="ml-2 h-4 w-4" />
                    فتح المشروع
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(project)}
                className="text-destructive"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        searchKey="name"
        searchPlaceholder="بحث في المشاريع..."
      />

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  )
}
