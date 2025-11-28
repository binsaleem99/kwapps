'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export type AdminRole = 'owner' | 'support' | 'content' | 'readonly'

export interface AdminUser {
  id: string
  email: string
  is_admin: boolean
  admin_role: AdminRole | null
}

/**
 * Get the current session (cached per request)
 * SECURITY: Uses getUser() to validate session with Supabase Auth server
 */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get session after validating user
  const { data: { session } } = await supabase.auth.getSession()
  return session
})

/**
 * Get the current user with admin info
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) return null

  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, email, is_admin, admin_role')
    .eq('id', session.user.id)
    .single()

  return user as AdminUser | null
})

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Require admin access - redirect if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth()
  const user = await getCurrentUser()

  if (!user?.is_admin) {
    redirect('/dashboard')
  }

  return { session, user }
}

/**
 * Check if admin has specific role
 */
export async function hasAdminRole(requiredRole: AdminRole): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user?.is_admin || !user.admin_role) {
    return false
  }

  // Owner has all permissions
  if (user.admin_role === 'owner') {
    return true
  }

  // Check specific role
  return user.admin_role === requiredRole
}

/**
 * Require specific admin role - redirect if insufficient permissions
 */
export async function requireAdminRole(requiredRole: AdminRole) {
  const { session, user } = await requireAdmin()

  // Owner always has access
  if (user.admin_role === 'owner') {
    return { session, user }
  }

  // Check if user has the required role
  if (user.admin_role !== requiredRole) {
    redirect('/admin?error=insufficient_permissions')
  }

  return { session, user }
}

/**
 * Check if user has permission for a specific action
 */
export async function canPerformAction(action: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user?.is_admin || !user.admin_role) {
    return false
  }

  // Owner can do everything
  if (user.admin_role === 'owner') {
    return true
  }

  // Define permissions per role
  const permissions: Record<AdminRole, string[]> = {
    owner: ['*'], // All permissions
    support: [
      'users.view',
      'users.ban',
      'users.reset_limits',
      'users.impersonate',
      'users.add_notes',
      'projects.view',
      'projects.delete',
      'health.view',
      'logs.view',
    ],
    content: [
      'users.view',
      'templates.create',
      'templates.edit',
      'templates.delete',
      'projects.view',
      'content.create',
      'content.edit',
      'content.delete',
      'announcements.create',
    ],
    readonly: [
      'users.view',
      'projects.view',
      'templates.view',
      'health.view',
      'logs.view',
    ],
  }

  const rolePermissions = permissions[user.admin_role] || []
  return rolePermissions.includes(action) || rolePermissions.includes('*')
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction({
  action,
  resourceType,
  resourceId,
  details = {},
  ipAddress,
}: {
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
}) {
  const user = await getCurrentUser()
  if (!user?.is_admin) return

  const supabase = await createClient()

  await supabase.from('admin_audit_log').insert({
    admin_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
  })
}

/**
 * Start impersonation session
 */
export async function startImpersonation(targetUserId: string) {
  const { user } = await requireAdmin()

  // Check permission
  const canImpersonate = await canPerformAction('users.impersonate')
  if (!canImpersonate) {
    throw new Error('Insufficient permissions to impersonate users')
  }

  const supabase = await createClient()

  // Log the impersonation
  const { data: logEntry } = await supabase
    .from('impersonation_log')
    .insert({
      admin_id: user.id,
      target_user_id: targetUserId,
    })
    .select()
    .single()

  // Log audit action
  await logAdminAction({
    action: 'user.impersonate.start',
    resourceType: 'user',
    resourceId: targetUserId,
    details: { impersonation_log_id: logEntry?.id },
  })

  return logEntry
}

/**
 * End impersonation session
 */
export async function endImpersonation(impersonationLogId: string) {
  const supabase = await createClient()

  const endedAt = new Date()
  const { data: log } = await supabase
    .from('impersonation_log')
    .select('started_at, target_user_id')
    .eq('id', impersonationLogId)
    .single()

  if (log) {
    const durationMinutes = Math.round(
      (endedAt.getTime() - new Date(log.started_at).getTime()) / 60000
    )

    await supabase
      .from('impersonation_log')
      .update({
        ended_at: endedAt.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', impersonationLogId)

    // Log audit action
    await logAdminAction({
      action: 'user.impersonate.end',
      resourceType: 'user',
      resourceId: log.target_user_id,
      details: { duration_minutes: durationMinutes },
    })
  }
}
