/**
 * Session Recovery Hook
 *
 * Checks for resumable orchestration sessions on builder load.
 * Shows "Continue where you left off?" prompt if found.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface ResumableSession {
  id: string
  stage: string
  originalPrompt: string | null
  lastActivity: string
  expiresAt: string
}

interface UseSessionRecoveryOptions {
  projectId?: string
  autoCheck?: boolean
}

interface UseSessionRecoveryReturn {
  hasResumableSession: boolean
  session: ResumableSession | null
  isLoading: boolean
  error: string | null
  checkForSession: () => Promise<void>
  resumeSession: () => Promise<ResumableSession | null>
  discardSession: () => Promise<boolean>
  clearResumable: () => void
}

export function useSessionRecovery(
  options: UseSessionRecoveryOptions = {}
): UseSessionRecoveryReturn {
  const { projectId, autoCheck = true } = options

  const [hasResumableSession, setHasResumableSession] = useState(false)
  const [session, setSession] = useState<ResumableSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Check if user has a resumable session
   */
  const checkForSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ checkResumable: 'true' })
      if (projectId) params.set('projectId', projectId)

      const response = await fetch(`/api/orchestrate?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setHasResumableSession(data.hasResumableSession)
        setSession(data.session || null)
      } else {
        setError(data.error?.messageAr || 'Failed to check for session')
      }
    } catch (err) {
      setError('حدث خطأ أثناء البحث عن جلسة سابقة')
      console.error('[SessionRecovery] Error checking for session:', err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  /**
   * Resume the session and return full session data
   */
  const resumeSession = useCallback(async (): Promise<ResumableSession | null> => {
    if (!session?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orchestrate?sessionId=${session.id}`)
      const data = await response.json()

      if (data.success && data.session) {
        // Clear the resumable state since we're resuming
        setHasResumableSession(false)
        return data.session
      } else {
        setError(data.error?.messageAr || 'Failed to resume session')
        return null
      }
    } catch (err) {
      setError('حدث خطأ أثناء استعادة الجلسة')
      console.error('[SessionRecovery] Error resuming session:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session?.id])

  /**
   * Discard/delete the resumable session
   */
  const discardSession = useCallback(async (): Promise<boolean> => {
    if (!session?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orchestrate?sessionId=${session.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        setHasResumableSession(false)
        setSession(null)
        return true
      } else {
        setError(data.error?.messageAr || 'Failed to discard session')
        return false
      }
    } catch (err) {
      setError('حدث خطأ أثناء حذف الجلسة')
      console.error('[SessionRecovery] Error discarding session:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session?.id])

  /**
   * Clear resumable state without deleting (user dismissed)
   */
  const clearResumable = useCallback(() => {
    setHasResumableSession(false)
    setSession(null)
  }, [])

  // Auto-check on mount
  useEffect(() => {
    if (autoCheck) {
      checkForSession()
    }
  }, [autoCheck, checkForSession])

  return {
    hasResumableSession,
    session,
    isLoading,
    error,
    checkForSession,
    resumeSession,
    discardSession,
    clearResumable,
  }
}

/**
 * Format time since last activity for display
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return `منذ ${Math.floor(diffHours / 24)} يوم`
}

/**
 * Get Arabic stage name
 */
export function getStageNameAr(stage: string): string {
  const stageNames: Record<string, string> = {
    detection: 'تحليل الطلب',
    clarifying: 'أسئلة توضيحية',
    constructing: 'بناء الطلب',
    generating: 'توليد الكود',
    validating: 'التحقق',
    completed: 'مكتمل',
    failed: 'فشل',
  }
  return stageNames[stage] || stage
}
