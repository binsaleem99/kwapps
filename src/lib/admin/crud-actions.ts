import { createClient } from '@/lib/supabase/server'
import { requireAdmin, canPerformAction, logAdminAction } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export interface FilterParams {
  search?: string
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
  [key: string]: any // Allow additional filters
}

export interface CRUDConfig {
  table: string
  selectQuery?: string
  searchColumns?: string[]
  requiredPermission?: string
  orderBy?: { column: string; ascending: boolean }
  revalidatePaths?: string[]
}

export function createCRUDActions<T extends { id: string }>(config: CRUDConfig) {
  const {
    table,
    selectQuery = '*',
    searchColumns = [],
    requiredPermission,
    orderBy = { column: 'created_at', ascending: false },
    revalidatePaths = [`/admin/${table}`],
  } = config

  /**
   * Get all items with filtering, search, and pagination
   */
  async function getAll(params?: FilterParams): Promise<{
    items?: T[]
    count?: number
    error?: string
  }> {
    try {
      await requireAdmin()

      if (requiredPermission) {
        const hasPermission = await canPerformAction(requiredPermission)
        if (!hasPermission) {
          return { error: 'ليس لديك صلاحية للوصول إلى هذه البيانات' }
        }
      }

      const supabase = await createClient()
      let query = supabase
        .from(table)
        .select(selectQuery, { count: 'exact' })

      // Apply search across specified columns
      if (params?.search && searchColumns.length > 0) {
        const searchConditions = searchColumns
          .map((col) => `${col}.ilike.%${params.search}%`)
          .join(',')
        query = query.or(searchConditions)
      }

      // Apply additional filters (e.g., status, category, etc.)
      Object.keys(params || {}).forEach((key) => {
        if (
          key !== 'search' &&
          key !== 'limit' &&
          key !== 'offset' &&
          key !== 'orderBy' &&
          key !== 'ascending' &&
          params![key] !== undefined &&
          params![key] !== '' &&
          params![key] !== null
        ) {
          query = query.eq(key, params![key])
        }
      })

      // Apply ordering
      const orderColumn = params?.orderBy || orderBy.column
      const isAscending = params?.ascending !== undefined ? params.ascending : orderBy.ascending
      query = query.order(orderColumn, { ascending: isAscending })

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit)
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error(`Error fetching ${table}:`, error)
        return { error: `فشل في جلب البيانات: ${error.message}` }
      }

      return { items: (data as unknown) as T[], count: count || 0 }
    } catch (error) {
      console.error(`Error in getAll for ${table}:`, error)
      return { error: 'حدث خطأ غير متوقع' }
    }
  }

  /**
   * Get a single item by ID
   */
  async function getById(id: string): Promise<{
    item?: T
    error?: string
  }> {
    try {
      await requireAdmin()

      if (requiredPermission) {
        const hasPermission = await canPerformAction(requiredPermission)
        if (!hasPermission) {
          return { error: 'ليس لديك صلاحية للوصول إلى هذه البيانات' }
        }
      }

      const supabase = await createClient()
      const { data, error } = await supabase
        .from(table)
        .select(selectQuery)
        .eq('id', id)
        .single()

      if (error) {
        console.error(`Error fetching ${table} by ID:`, error)
        return { error: `فشل في جلب البيانات: ${error.message}` }
      }

      return { item: (data as unknown) as T }
    } catch (error) {
      console.error(`Error in getById for ${table}:`, error)
      return { error: 'حدث خطأ غير متوقع' }
    }
  }

  /**
   * Create a new item
   */
  async function create(data: Partial<T>): Promise<{
    item?: T
    error?: string
  }> {
    try {
      const admin = await requireAdmin()

      const createPermission = requiredPermission?.replace('.view', '.create') || 'admin'
      const hasPermission = await canPerformAction(createPermission)
      if (!hasPermission) {
        return { error: 'ليس لديك صلاحية لإنشاء عنصر جديد' }
      }

      const supabase = await createClient()
      const { data: newItem, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error(`Error creating ${table}:`, error)
        return { error: `فشل في إنشاء العنصر: ${error.message}` }
      }

      // Log admin action
      await logAdminAction({
        action: `${table}.create`,
        resourceType: table,
        resourceId: newItem.id,
        details: { data },
      })

      // Revalidate paths
      revalidatePaths.forEach((path) => revalidatePath(path))

      return { item: (newItem as unknown) as T }
    } catch (error) {
      console.error(`Error in create for ${table}:`, error)
      return { error: 'حدث خطأ غير متوقع' }
    }
  }

  /**
   * Update an existing item
   */
  async function update(
    id: string,
    updates: Partial<T>
  ): Promise<{
    item?: T
    error?: string
  }> {
    try {
      const admin = await requireAdmin()

      const editPermission = requiredPermission?.replace('.view', '.edit') || 'admin'
      const hasPermission = await canPerformAction(editPermission)
      if (!hasPermission) {
        return { error: 'ليس لديك صلاحية لتعديل هذا العنصر' }
      }

      const supabase = await createClient()
      const { data: updatedItem, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${table}:`, error)
        return { error: `فشل في تحديث العنصر: ${error.message}` }
      }

      // Log admin action
      await logAdminAction({
        action: `${table}.update`,
        resourceType: table,
        resourceId: id,
        details: { updates },
      })

      // Revalidate paths
      revalidatePaths.forEach((path) => revalidatePath(path))

      return { item: (updatedItem as unknown) as T }
    } catch (error) {
      console.error(`Error in update for ${table}:`, error)
      return { error: 'حدث خطأ غير متوقع' }
    }
  }

  /**
   * Delete an item
   */
  async function remove(id: string): Promise<{
    success?: boolean
    error?: string
  }> {
    try {
      const admin = await requireAdmin()

      const deletePermission = requiredPermission?.replace('.view', '.delete') || 'admin'
      const hasPermission = await canPerformAction(deletePermission)
      if (!hasPermission) {
        return { error: 'ليس لديك صلاحية لحذف هذا العنصر' }
      }

      const supabase = await createClient()
      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) {
        console.error(`Error deleting ${table}:`, error)
        return { error: `فشل في حذف العنصر: ${error.message}` }
      }

      // Log admin action
      await logAdminAction({
        action: `${table}.delete`,
        resourceType: table,
        resourceId: id,
      })

      // Revalidate paths
      revalidatePaths.forEach((path) => revalidatePath(path))

      return { success: true }
    } catch (error) {
      console.error(`Error in remove for ${table}:`, error)
      return { error: 'حدث خطأ غير متوقع' }
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    delete: remove,
  }
}
