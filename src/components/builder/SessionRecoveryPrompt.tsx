'use client'

/**
 * Session Recovery Prompt Component
 *
 * Shows "Continue where you left off?" dialog when resumable session is found.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowRight, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useSessionRecovery,
  formatTimeAgo,
  getStageNameAr,
} from '@/hooks/useSessionRecovery'

interface SessionRecoveryPromptProps {
  projectId?: string
  onResume: (sessionData: any) => void
  onDiscard?: () => void
  onDismiss?: () => void
}

export function SessionRecoveryPrompt({
  projectId,
  onResume,
  onDiscard,
  onDismiss,
}: SessionRecoveryPromptProps) {
  const {
    hasResumableSession,
    session,
    isLoading,
    error,
    resumeSession,
    discardSession,
    clearResumable,
  } = useSessionRecovery({ projectId })

  const [isResuming, setIsResuming] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)

  const handleResume = async () => {
    setIsResuming(true)
    const sessionData = await resumeSession()
    setIsResuming(false)

    if (sessionData) {
      onResume(sessionData)
    }
  }

  const handleDiscard = async () => {
    setIsDiscarding(true)
    const success = await discardSession()
    setIsDiscarding(false)

    if (success && onDiscard) {
      onDiscard()
    }
  }

  const handleDismiss = () => {
    clearResumable()
    onDismiss?.()
  }

  // Don't render if no resumable session or still loading initial check
  if (!hasResumableSession || !session) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <Card className="bg-slate-900 border-blue-500/30 shadow-xl shadow-blue-500/10 p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-400">
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">استكمال الجلسة السابقة</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Session Info */}
          <div className="bg-slate-800/50 rounded-lg p-3 mb-3 text-right">
            {session.originalPrompt && (
              <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                "{session.originalPrompt.substring(0, 100)}
                {session.originalPrompt.length > 100 ? '...' : ''}"
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(session.lastActivity)}
              </span>
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                {getStageNameAr(session.stage)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-400 mb-3 text-right">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={handleDiscard}
              disabled={isDiscarding || isResuming}
            >
              {isDiscarding ? 'جاري الحذف...' : 'حذف والبدء من جديد'}
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleResume}
              disabled={isResuming || isDiscarding}
            >
              {isResuming ? (
                'جاري الاستكمال...'
              ) : (
                <>
                  استكمال
                  <ArrowRight className="w-4 h-4 mr-1" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default SessionRecoveryPrompt
