/**
 * Orchestration API Route
 *
 * Handles the Gemini Pro orchestration pipeline
 * Sessions are stored in Supabase to persist across Vercel deployments
 *
 * POST /api/orchestrate - Analyze prompt and detect parameters
 * GET /api/orchestrate - Get session state or check for resumable session
 * DELETE /api/orchestrate - Delete a session
 *
 * SECURITY: All endpoints require authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeminiOrchestrator, createOrchestrator, calculateOrchestrationCost } from '@/lib/orchestration/orchestrator'
import { getSessionManager, getOrCreateSession, hasResumableSession } from '@/lib/orchestration/session-manager'
import { getUserCreditBalance } from '@/lib/billing'
import type { OrchestrationSession } from '@/lib/orchestration/session-manager'
import type { ClarifyingAnswers } from '@/lib/orchestration/types'

/**
 * Authentication helper - ensures user is logged in and has an active subscription
 */
async function authenticateRequest(): Promise<{
  success: boolean
  userId?: string
  error?: NextResponse
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يجب تسجيل الدخول للاستخدام',
          },
        },
        { status: 401 }
      ),
    }
  }

  // Verify user has an active subscription (orchestration is free, but only for subscribers)
  const creditBalance = await getUserCreditBalance(user.id)
  if (!creditBalance) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'Active subscription required',
            messageAr: 'يجب أن يكون لديك اشتراك فعال للاستخدام',
          },
        },
        { status: 403 }
      ),
    }
  }

  return { success: true, userId: user.id }
}

/**
 * POST /api/orchestrate
 * Analyze prompt and detect parameters
 *
 * Sessions are now stored in Supabase for persistence across deployments
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticateRequest()
    if (!auth.success) {
      return auth.error!
    }

    // 2. Parse request body
    const body = await req.json()
    const { prompt, sessionId, projectId } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PROMPT',
            message: 'Prompt is required',
            messageAr: 'الطلب مطلوب',
          },
        },
        { status: 400 }
      )
    }

    const sessionManager = getSessionManager()

    // 3. Get or create Supabase session
    let session: OrchestrationSession

    if (sessionId) {
      // Try to get existing session
      const existingSession = await sessionManager.getSession(sessionId)
      if (existingSession && existingSession.user_id === auth.userId) {
        session = existingSession
      } else {
        // Session not found or doesn't belong to user, create new
        session = await getOrCreateSession(auth.userId!, projectId, prompt)
      }
    } else {
      // Create new session or get active one
      session = await getOrCreateSession(auth.userId!, projectId, prompt)
    }

    // 4. Create orchestrator and analyze prompt
    const orchestrator = new GeminiOrchestrator()
    console.log('[API] Analyzing prompt for user:', auth.userId, prompt.substring(0, 100))
    const result = await orchestrator.analyzePrompt(prompt)

    if (!result.success) {
      // Update session with error
      await sessionManager.failSession(session.id, result.error || {
        code: 'ANALYSIS_FAILED',
        message: 'Failed to analyze prompt',
        messageAr: 'فشل في تحليل الطلب',
      })

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // 5. Update session with detected state
    const state = orchestrator.getState()
    await sessionManager.updateSession(session.id, {
      stage: state.stage,
      detectedParams: state.detectedParams,
      clarifyingQuestions: state.clarifyingQuestions,
      context: {
        confidence: result.confidence,
        lastPrompt: prompt,
      },
    })

    // 6. Add user message to session history
    await sessionManager.addMessage(session.id, {
      role: 'user',
      content: prompt,
    })

    // 7. Return result with session ID
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      needsClarification: result.needsClarification,
      questions: result.questions,
      confidence: result.confidence,
      stage: 'detection',
    })
  } catch (error) {
    console.error('[API] Error in orchestrate:', error)
    return NextResponse.json(
      {
        error: {
          code: 'ORCHESTRATION_ERROR',
          message: 'Failed to orchestrate',
          messageAr: 'فشل في التنسيق',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orchestrate
 * Get current orchestration state or check for resumable session
 *
 * Query params:
 * - sessionId: Get specific session state
 * - projectId: Filter by project
 * - checkResumable: Check if user has a resumable session
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticateRequest()
    if (!auth.success) {
      return auth.error!
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const projectId = searchParams.get('projectId')
    const checkResumable = searchParams.get('checkResumable') === 'true'

    const sessionManager = getSessionManager()

    // 2. Check for resumable session (for "Continue where you left off?" prompt)
    if (checkResumable) {
      const { hasSession, session } = await hasResumableSession(
        auth.userId!,
        projectId || undefined
      )

      return NextResponse.json({
        success: true,
        hasResumableSession: hasSession,
        session: hasSession ? {
          id: session!.id,
          stage: session!.stage,
          originalPrompt: session!.original_prompt,
          lastActivity: session!.last_activity_at,
          expiresAt: session!.expires_at,
        } : null,
      })
    }

    // 3. Get specific session state
    if (sessionId) {
      const session = await sessionManager.getSession(sessionId)

      if (!session) {
        return NextResponse.json(
          {
            error: {
              code: 'SESSION_NOT_FOUND',
              message: 'Session not found or expired',
              messageAr: 'الجلسة غير موجودة أو منتهية الصلاحية',
            },
          },
          { status: 404 }
        )
      }

      // Verify ownership
      if (session.user_id !== auth.userId) {
        return NextResponse.json(
          {
            error: {
              code: 'SESSION_ACCESS_DENIED',
              message: 'You do not have access to this session',
              messageAr: 'ليس لديك صلاحية الوصول لهذه الجلسة',
            },
          },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          stage: session.stage,
          hasParameters: !!session.detected_params,
          hasQuestions: session.clarifying_questions.length > 0,
          hasAnswers: Object.keys(session.answers).length > 0,
          hasPrompt: !!session.deepseek_prompt,
          hasValidation: !!session.validation_result,
          originalPrompt: session.original_prompt,
          detectedParams: session.detected_params,
          clarifyingQuestions: session.clarifying_questions,
          answers: session.answers,
          messages: session.messages,
          context: session.context,
          createdAt: session.created_at,
          lastActivity: session.last_activity_at,
          expiresAt: session.expires_at,
        },
      })
    }

    // 4. Get user's recent sessions
    const sessions = await sessionManager.getUserSessions(auth.userId!, 5)

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        stage: s.stage,
        originalPrompt: s.original_prompt?.substring(0, 100),
        projectId: s.project_id,
        createdAt: s.created_at,
        lastActivity: s.last_activity_at,
        expiresAt: s.expires_at,
      })),
    })
  } catch (error) {
    console.error('[API] Error in GET orchestrate:', error)
    return NextResponse.json(
      {
        error: {
          code: 'STATE_ERROR',
          message: 'Failed to get state',
          messageAr: 'فشل في الحصول على الحالة',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/orchestrate
 * Delete a session
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await authenticateRequest()
    if (!auth.success) {
      return auth.error!
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SESSION',
            message: 'Session ID is required',
            messageAr: 'معرف الجلسة مطلوب',
          },
        },
        { status: 400 }
      )
    }

    const sessionManager = getSessionManager()
    const session = await sessionManager.getSession(sessionId)

    // Verify ownership
    if (session && session.user_id !== auth.userId) {
      return NextResponse.json(
        {
          error: {
            code: 'SESSION_ACCESS_DENIED',
            message: 'You do not have access to this session',
            messageAr: 'ليس لديك صلاحية الوصول لهذه الجلسة',
          },
        },
        { status: 403 }
      )
    }

    const deleted = await sessionManager.deleteSession(sessionId)

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Session deleted' : 'Failed to delete session',
    })
  } catch (error) {
    console.error('[API] Error in DELETE orchestrate:', error)
    return NextResponse.json(
      {
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete session',
          messageAr: 'فشل في حذف الجلسة',
        },
      },
      { status: 500 }
    )
  }
}
