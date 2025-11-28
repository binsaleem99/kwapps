'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin, canPerformAction, logAdminAction } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import type { AdminRole } from '@/types/database'

export async function getUsers(params?: {
  search?: string
  plan?: string
  is_admin?: boolean
  limit?: number
  offset?: number
}) {
  await requireAdmin()

  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('*, subscriptions(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (params?.search) {
    query = query.or(`email.ilike.%${params.search}%,display_name.ilike.%${params.search}%`)
  }

  if (params?.plan) {
    query = query.eq('plan', params.plan)
  }

  if (params?.is_admin !== undefined) {
    query = query.eq('is_admin', params.is_admin)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  return { users: data, count }
}

export async function getUserById(userId: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .eq('id', userId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { user: data }
}

export async function updateUser(userId: string, updates: {
  display_name?: string
  plan?: string
  tags?: string[]
  internal_notes?: string
  is_admin?: boolean
  admin_role?: AdminRole | null
}) {
  const { user: admin } = await requireAdmin()

  // Check permissions
  if (updates.is_admin !== undefined || updates.admin_role !== undefined) {
    const canManageAdmins = await canPerformAction('users.manage_admins')
    if (!canManageAdmins) {
      return { error: 'ليس لديك صلاحية لإدارة المسؤولين' }
    }
  }

  const canEdit = await canPerformAction('users.edit')
  if (!canEdit) {
    return { error: 'ليس لديك صلاحية لتعديل المستخدمين' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.update',
    resourceType: 'user',
    resourceId: userId,
    details: { updates },
  })

  revalidatePath('/admin/users')

  return { user: data }
}

export async function banUser(userId: string) {
  const canBan = await canPerformAction('users.ban')
  if (!canBan) {
    return { error: 'ليس لديك صلاحية لحظر المستخدمين' }
  }

  const supabase = await createClient()

  // In Supabase, we typically disable auth access rather than deleting
  // For now, we'll add a "banned" tag
  const { data, error } = await supabase
    .from('users')
    .update({
      tags: supabase.rpc('array_append', { arr: 'tags', elem: 'banned' }),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.ban',
    resourceType: 'user',
    resourceId: userId,
  })

  revalidatePath('/admin/users')

  return { user: data }
}

export async function unbanUser(userId: string) {
  const canBan = await canPerformAction('users.ban')
  if (!canBan) {
    return { error: 'ليس لديك صلاحية لإلغاء حظر المستخدمين' }
  }

  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('tags')
    .eq('id', userId)
    .single()

  const newTags = (user?.tags || []).filter((tag: string) => tag !== 'banned')

  const { data, error } = await supabase
    .from('users')
    .update({ tags: newTags })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.unban',
    resourceType: 'user',
    resourceId: userId,
  })

  revalidatePath('/admin/users')

  return { user: data }
}

export async function resetUserLimits(userId: string) {
  const canReset = await canPerformAction('users.reset_limits')
  if (!canReset) {
    return { error: 'ليس لديك صلاحية لإعادة تعيين حدود المستخدمين' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('usage_limits')
    .delete()
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0])

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.reset_limits',
    resourceType: 'user',
    resourceId: userId,
  })

  revalidatePath('/admin/users')

  return { success: true }
}

export async function getUserActivity(userId: string, limit = 10) {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .or(`resource_id.eq.${userId},admin_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { activity: data }
}

export async function addUserNote(userId: string, note: string) {
  const canAddNotes = await canPerformAction('users.add_notes')
  if (!canAddNotes) {
    return { error: 'ليس لديك صلاحية لإضافة ملاحظات' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update({ internal_notes: note })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.add_note',
    resourceType: 'user',
    resourceId: userId,
    details: { note_preview: note.substring(0, 100) },
  })

  revalidatePath('/admin/users')

  return { user: data }
}

export async function addUserTag(userId: string, tag: string) {
  const canEdit = await canPerformAction('users.edit')
  if (!canEdit) {
    return { error: 'ليس لديك صلاحية لتعديل المستخدمين' }
  }

  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('tags')
    .eq('id', userId)
    .single()

  const tags = user?.tags || []
  if (!tags.includes(tag)) {
    tags.push(tag)
  }

  const { data, error } = await supabase
    .from('users')
    .update({ tags })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.add_tag',
    resourceType: 'user',
    resourceId: userId,
    details: { tag },
  })

  revalidatePath('/admin/users')

  return { user: data }
}

export async function removeUserTag(userId: string, tag: string) {
  const canEdit = await canPerformAction('users.edit')
  if (!canEdit) {
    return { error: 'ليس لديك صلاحية لتعديل المستخدمين' }
  }

  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('tags')
    .eq('id', userId)
    .single()

  const tags = (user?.tags || []).filter((t: string) => t !== tag)

  const { data, error } = await supabase
    .from('users')
    .update({ tags })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction({
    action: 'user.remove_tag',
    resourceType: 'user',
    resourceId: userId,
    details: { tag },
  })

  revalidatePath('/admin/users')

  return { user: data }
}
