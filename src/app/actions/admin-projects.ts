'use server'

import { createCRUDActions } from '@/lib/admin/crud-actions'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, canPerformAction, logAdminAction } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export type ProjectStatus = 'draft' | 'generating' | 'preview' | 'published' | 'error'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  arabic_prompt: string | null
  english_prompt: string | null
  generated_code: string | null
  template_id: string | null
  status: ProjectStatus
  active_version: number
  deployed_url: string | null
  created_at: string
  updated_at: string
  users?: {
    email: string
    display_name: string | null
    plan: string
  }
  templates?: {
    name_ar: string
    category: string
  }
}

// Use CRUD factory with joins for user and template data
const crud = createCRUDActions<Project>({
  table: 'projects',
  selectQuery: `
    *,
    users!inner(email, display_name, plan),
    templates(name_ar, category)
  `,
  searchColumns: ['name', 'description'],
  requiredPermission: 'projects.view',
  orderBy: { column: 'created_at', ascending: false },
  revalidatePaths: ['/admin/projects'],
})

// Export basic CRUD operations
export const getProjects = crud.getAll
export const getProjectById = crud.getById
export const updateProject = crud.update

/**
 * Delete a project (admin override)
 */
export async function deleteProject(projectId: string): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    await requireAdmin()

    const canDelete = await canPerformAction('projects.delete')
    if (!canDelete) {
      return { error: 'ليس لديك صلاحية لحذف المشاريع' }
    }

    const supabase = await createClient()

    // Get project info for logging
    const { data: project } = await supabase
      .from('projects')
      .select('name, user_id')
      .eq('id', projectId)
      .single()

    const { error } = await supabase.from('projects').delete().eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return { error: 'فشل في حذف المشروع' }
    }

    await logAdminAction({
      action: 'project.delete',
      resourceType: 'project',
      resourceId: projectId,
      details: { name: project?.name, user_id: project?.user_id },
    })

    revalidatePath('/admin/projects')

    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { error: 'حدث خطأ أثناء حذف المشروع' }
  }
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: ProjectStatus): Promise<{
  projects?: Project[]
  count?: number
  error?: string
}> {
  try {
    const result = await getProjects({ status, limit: 100 })
    return {
      projects: result.items,
      count: result.count,
      error: result.error,
    }
  } catch (error) {
    console.error('Error getting projects by status:', error)
    return { error: 'حدث خطأ أثناء جلب المشاريع' }
  }
}

/**
 * Get recent projects activity
 */
export async function getRecentProjects(limit: number = 20): Promise<{
  projects?: Project[]
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users!inner(email, display_name, plan),
        templates(name_ar, category)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error getting recent projects:', error)
      return { error: 'فشل في جلب المشاريع الأخيرة' }
    }

    return { projects: (data as unknown) as Project[] }
  } catch (error) {
    console.error('Error in getRecentProjects:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get project statistics for dashboard
 */
export async function getProjectStats(): Promise<{
  stats?: {
    total: number
    activeToday: number
    errorCount: number
    publishedCount: number
    draftCount: number
    generatingCount: number
    errorRate: number
    byStatus: Record<ProjectStatus, number>
  }
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get total count
    const { count: total } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Get today's projects
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: activeToday } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get counts by status
    const { count: errorCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'error')

    const { count: publishedCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    const { count: draftCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    const { count: generatingCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'generating')

    const errorRate = total && total > 0 ? ((errorCount || 0) / total) * 100 : 0

    return {
      stats: {
        total: total || 0,
        activeToday: activeToday || 0,
        errorCount: errorCount || 0,
        publishedCount: publishedCount || 0,
        draftCount: draftCount || 0,
        generatingCount: generatingCount || 0,
        errorRate: parseFloat(errorRate.toFixed(1)),
        byStatus: {
          draft: draftCount || 0,
          generating: generatingCount || 0,
          preview: 0, // Calculate if needed
          published: publishedCount || 0,
          error: errorCount || 0,
        },
      },
    }
  } catch (error) {
    console.error('Error getting project stats:', error)
    return { error: 'حدث خطأ أثناء جلب الإحصائيات' }
  }
}

/**
 * Get projects with errors for error tracking
 */
export async function getErrorProjects(limit: number = 50): Promise<{
  projects?: Project[]
  count?: number
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('projects')
      .select(
        `
        *,
        users!inner(email, display_name, plan),
        templates(name_ar, category)
      `,
        { count: 'exact' }
      )
      .eq('status', 'error')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error getting error projects:', error)
      return { error: 'فشل في جلب المشاريع ذات الأخطاء' }
    }

    return {
      projects: (data as unknown) as Project[],
      count: count || 0,
    }
  } catch (error) {
    console.error('Error in getErrorProjects:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get template usage statistics (which templates are most used)
 */
export async function getTemplateUsageStats(): Promise<{
  stats?: Array<{
    template_id: string
    template_name: string
    project_count: number
  }>
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(`
        template_id,
        templates!inner(name_ar)
      `)
      .not('template_id', 'is', null)

    if (error) {
      console.error('Error getting template usage:', error)
      return { error: 'فشل في جلب إحصائيات القوالب' }
    }

    // Group by template_id and count
    const templateCounts: Record<string, { name: string; count: number }> = {}

    data?.forEach((project: any) => {
      const templateId = project.template_id
      const templateName = project.templates?.name_ar || 'غير معروف'

      if (!templateCounts[templateId]) {
        templateCounts[templateId] = { name: templateName, count: 0 }
      }
      templateCounts[templateId].count++
    })

    const stats = Object.entries(templateCounts)
      .map(([id, { name, count }]) => ({
        template_id: id,
        template_name: name,
        project_count: count,
      }))
      .sort((a, b) => b.project_count - a.project_count)

    return { stats }
  } catch (error) {
    console.error('Error in getTemplateUsageStats:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get project creation trend (last 30 days)
 */
export async function getProjectTrend(days: number = 30): Promise<{
  trend?: Array<{
    date: string
    count: number
  }>
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('projects')
      .select('created_at')
      .gte('created_at', startDate.toISOString())

    if (error) {
      console.error('Error getting project trend:', error)
      return { error: 'فشل في جلب اتجاه المشاريع' }
    }

    // Group by date
    const dateCount: Record<string, number> = {}

    data?.forEach((project) => {
      const date = new Date(project.created_at).toISOString().split('T')[0]
      dateCount[date] = (dateCount[date] || 0) + 1
    })

    const trend = Object.entries(dateCount)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return { trend }
  } catch (error) {
    console.error('Error in getProjectTrend:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}
