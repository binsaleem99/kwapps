/**
 * Submit Clarifying Answers API Route
 *
 * POST /api/orchestrate/answers - Submit user answers to clarifying questions
 *
 * Sessions are stored in Supabase to persist across Vercel deployments
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GeminiOrchestrator } from '@/lib/orchestration/orchestrator'
import { getSessionManager } from '@/lib/orchestration/session-manager'
import { mergeAnswersWithParameters } from '@/lib/orchestration/clarifying-questions'
import { constructDeepSeekPrompt } from '@/lib/orchestration/prompt-constructor'
import { calculateConfidence } from '@/lib/orchestration/parameter-detector'
import { getUserCreditBalance } from '@/lib/billing'
import type { ClarifyingAnswers, DetectedParameters } from '@/lib/orchestration/types'

/**
 * POST /api/orchestrate/answers
 * Submit user answers to clarifying questions
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يجب تسجيل الدخول للاستخدام',
          },
        },
        { status: 401 }
      )
    }

    // Verify active subscription
    const creditBalance = await getUserCreditBalance(user.id)
    if (!creditBalance) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'Active subscription required',
            messageAr: 'يجب أن يكون لديك اشتراك فعال للاستخدام',
          },
        },
        { status: 403 }
      )
    }

    // 2. Parse request
    const body = await req.json()
    const { sessionId, answers } = body

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

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ANSWERS',
            message: 'Answers are required',
            messageAr: 'الإجابات مطلوبة',
          },
        },
        { status: 400 }
      )
    }

    // 3. Get session from Supabase
    const sessionManager = getSessionManager()
    const session = await sessionManager.getSession(sessionId)

    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or expired',
            messageAr: 'الجلسة غير موجودة أو منتهية',
          },
        },
        { status: 404 }
      )
    }

    // 4. Verify ownership
    if (session.user_id !== user.id) {
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

    // 5. Verify session has detected parameters
    if (!session.detected_params) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PARAMETERS',
            message: 'Session has no detected parameters',
            messageAr: 'لا توجد معاملات مكتشفة في الجلسة',
          },
        },
        { status: 400 }
      )
    }

    console.log('[API] Submitting answers for session:', sessionId)

    // 6. Merge answers with detected parameters
    const mergedParams = mergeAnswersWithParameters(
      session.detected_params as DetectedParameters,
      answers as ClarifyingAnswers
    )

    // 7. Calculate new confidence
    const confidence = calculateConfidence(mergedParams)
    const readyForGeneration = confidence >= 0.8

    // 8. Build DeepSeek prompt if ready
    let deepseekPrompt = null
    if (readyForGeneration) {
      deepseekPrompt = constructDeepSeekPrompt(mergedParams, session.original_prompt || undefined)
    }

    // 9. Update session in Supabase
    await sessionManager.updateSession(sessionId, {
      stage: readyForGeneration ? 'constructing' : 'clarifying',
      detectedParams: mergedParams,
      answers: { ...session.answers, ...answers },
      deepseekPrompt: deepseekPrompt,
      context: {
        ...session.context,
        confidence,
      },
    })

    // 10. Add system message about answers
    await sessionManager.addMessage(sessionId, {
      role: 'system',
      content: `User submitted ${Object.keys(answers).length} answers. Confidence: ${(confidence * 100).toFixed(0)}%`,
    })

    return NextResponse.json({
      success: true,
      readyForGeneration,
      confidence,
      deepseekPrompt,
      stage: readyForGeneration ? 'constructing' : 'clarifying',
    })
  } catch (error) {
    console.error('[API] Error in submit answers:', error)
    return NextResponse.json(
      {
        error: {
          code: 'SUBMIT_ERROR',
          message: 'Failed to process answers',
          messageAr: 'فشل في معالجة الإجابات',
        },
      },
      { status: 500 }
    )
  }
}
