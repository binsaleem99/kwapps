/**
 * Code Validation API Route
 *
 * POST /api/orchestrate/validate - Validate generated code
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateOrchestrationCost } from '@/lib/orchestration/orchestrator'

// Use global sessions map
declare global {
  var orchestratorSessions: Map<string, any>
}

if (!global.orchestratorSessions) {
  global.orchestratorSessions = new Map()
}

/**
 * POST /api/orchestrate/validate
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, code, tokensUsed } = body

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

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CODE',
            message: 'Code is required',
            messageAr: 'الكود مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Get orchestrator for session
    const orchestrator = global.orchestratorSessions.get(sessionId)

    if (!orchestrator) {
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

    // Validate code
    console.log('[API] Validating code for session:', sessionId)
    const result = await orchestrator.validateCode(code)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: 500 }
      )
    }

    // Calculate cost
    let cost = null
    if (tokensUsed) {
      cost = calculateOrchestrationCost(
        tokensUsed.geminiPro || 0,
        tokensUsed.deepseek || 0,
        tokensUsed.geminiFlash || 0
      )
    }

    // Clean up session if validation passed
    if (result.validationResult?.passed) {
      // Keep session for 5 minutes for potential retry
      setTimeout(() => {
        global.orchestratorSessions.delete(sessionId)
        console.log('[API] Cleaned up session:', sessionId)
      }, 5 * 60 * 1000)
    }

    return NextResponse.json({
      success: true,
      validation: result.validationResult,
      autoFixedCode: result.autoFixedCode,
      cost,
      stage: result.validationResult?.passed ? 'completed' : 'validating',
    })
  } catch (error) {
    console.error('[API] Error in validate:', error)
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate code',
          messageAr: 'فشل في التحقق من الكود',
        },
      },
      { status: 500 }
    )
  }
}
