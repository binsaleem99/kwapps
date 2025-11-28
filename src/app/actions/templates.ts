'use server'

import { createCRUDActions } from '@/lib/admin/crud-actions'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, canPerformAction, logAdminAction } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export type TemplateCategory =
  | 'ecommerce'
  | 'restaurant'
  | 'saas'
  | 'landing'
  | 'portfolio'
  | 'booking'
  | 'social'
  | 'dashboard'

export interface Template {
  id: string
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  category: TemplateCategory
  preview_url: string | null
  thumbnail_url: string | null
  base_code: string
  customizable_sections: Record<string, any> | null
  color_scheme: Record<string, any> | null
  is_rtl: boolean
  is_premium: boolean
  usage_count: number
  created_at: string
}

// Use CRUD factory for basic operations
const crud = createCRUDActions<Template>({
  table: 'templates',
  selectQuery: '*',
  searchColumns: ['name_ar', 'name_en', 'description_ar', 'description_en'],
  requiredPermission: 'templates.view',
  orderBy: { column: 'created_at', ascending: false },
  revalidatePaths: ['/admin/templates'],
})

// Export basic CRUD operations
export const getTemplates = crud.getAll
export const getTemplateById = crud.getById
export const createTemplate = crud.create
export const updateTemplate = crud.update
export const deleteTemplate = crud.delete

/**
 * Duplicate an existing template
 */
export async function duplicateTemplate(templateId: string): Promise<{
  template?: Template
  error?: string
}> {
  try {
    await requireAdmin()

    const canCreate = await canPerformAction('templates.create')
    if (!canCreate) {
      return { error: 'ليس لديك صلاحية لإنشاء قالب جديد' }
    }

    const { item: template, error: fetchError } = await getTemplateById(templateId)
    if (fetchError || !template) {
      return { error: fetchError || 'فشل في جلب القالب' }
    }

    // Create new template with "(نسخة)" suffix
    const newTemplate = {
      name_ar: `${template.name_ar} (نسخة)`,
      name_en: `${template.name_en} (Copy)`,
      description_ar: template.description_ar,
      description_en: template.description_en,
      category: template.category,
      base_code: template.base_code,
      customizable_sections: template.customizable_sections,
      color_scheme: template.color_scheme,
      is_rtl: template.is_rtl,
      is_premium: false, // Reset premium status
      usage_count: 0, // Reset usage count
      preview_url: null,
      thumbnail_url: null,
    }

    const { item, error } = await createTemplate(newTemplate)

    if (error) {
      return { error }
    }

    await logAdminAction({
      action: 'template.duplicate',
      resourceType: 'template',
      resourceId: item!.id,
      details: { source_template_id: templateId },
    })

    return { template: item }
  } catch (error) {
    console.error('Error duplicating template:', error)
    return { error: 'حدث خطأ أثناء تكرار القالب' }
  }
}

/**
 * Toggle premium status of a template
 */
export async function toggleTemplatePremium(templateId: string): Promise<{
  template?: Template
  error?: string
}> {
  try {
    await requireAdmin()

    const canEdit = await canPerformAction('templates.edit')
    if (!canEdit) {
      return { error: 'ليس لديك صلاحية لتعديل القوالب' }
    }

    const supabase = await createClient()

    // Get current premium status
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('is_premium')
      .eq('id', templateId)
      .single()

    if (fetchError) {
      return { error: 'فشل في جلب القالب' }
    }

    // Toggle premium status
    const { data: updated, error: updateError } = await supabase
      .from('templates')
      .update({ is_premium: !template.is_premium })
      .eq('id', templateId)
      .select()
      .single()

    if (updateError) {
      return { error: 'فشل في تحديث القالب' }
    }

    await logAdminAction({
      action: 'template.toggle_premium',
      resourceType: 'template',
      resourceId: templateId,
      details: { is_premium: !template.is_premium },
    })

    revalidatePath('/admin/templates')

    return { template: updated as Template }
  } catch (error) {
    console.error('Error toggling template premium:', error)
    return { error: 'حدث خطأ أثناء تحديث القالب' }
  }
}

/**
 * Get templates usage statistics
 */
export async function getTemplateUsage(templateId: string): Promise<{
  projects?: Array<{
    id: string
    name: string
    user_email: string
    created_at: string
  }>
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
        id,
        name,
        created_at,
        users!inner(email)
      `,
        { count: 'exact' }
      )
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching template usage:', error)
      return { error: 'فشل في جلب إحصائيات الاستخدام' }
    }

    const projects = data?.map((p: any) => ({
      id: p.id,
      name: p.name,
      user_email: p.users.email,
      created_at: p.created_at,
    }))

    return { projects, count: count || 0 }
  } catch (error) {
    console.error('Error in getTemplateUsage:', error)
    return { error: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Get template statistics for dashboard
 */
export async function getTemplateStats(): Promise<{
  stats?: {
    total: number
    premium: number
    free: number
    mostUsed: { id: string; name_ar: string; usage_count: number } | null
    totalUsage: number
  }
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = await createClient()

    // Get total count
    const { count: total } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })

    // Get premium count
    const { count: premium } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)

    // Get most used template
    const { data: mostUsedData } = await supabase
      .from('templates')
      .select('id, name_ar, usage_count')
      .order('usage_count', { ascending: false })
      .limit(1)
      .single()

    // Get total usage across all templates
    const { data: allTemplates } = await supabase
      .from('templates')
      .select('usage_count')

    const totalUsage = allTemplates?.reduce((sum, t) => sum + (t.usage_count || 0), 0) || 0

    return {
      stats: {
        total: total || 0,
        premium: premium || 0,
        free: (total || 0) - (premium || 0),
        mostUsed: mostUsedData,
        totalUsage,
      },
    }
  } catch (error) {
    console.error('Error getting template stats:', error)
    return { error: 'حدث خطأ أثناء جلب الإحصائيات' }
  }
}

/**
 * Increment usage count when template is used to create a project
 */
export async function incrementTemplateUsage(templateId: string): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment', {
      row_id: templateId,
      table_name: 'templates',
      column_name: 'usage_count',
    })

    if (error) {
      // Fallback: manual increment
      const { data: template } = await supabase
        .from('templates')
        .select('usage_count')
        .eq('id', templateId)
        .single()

      if (template) {
        await supabase
          .from('templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', templateId)
      }
    }

    revalidatePath('/admin/templates')

    return { success: true }
  } catch (error) {
    console.error('Error incrementing template usage:', error)
    return { error: 'فشل في تحديث عداد الاستخدام' }
  }
}
