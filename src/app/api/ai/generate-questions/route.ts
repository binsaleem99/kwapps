/**
 * API Route: Generate Clarifying Questions
 *
 * POST /api/ai/generate-questions
 *
 * Generates Arabic clarifying questions for missing parameters.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateClarifyingQuestions } from '@/lib/gemini/parameter-detector'
import type { DetectedParameters } from '@/lib/gemini/parameter-detector'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { parameters } = body as { parameters: DetectedParameters }

    if (!parameters || typeof parameters !== 'object') {
      return NextResponse.json(
        { error: 'Parameters object is required' },
        { status: 400 }
      )
    }

    // Generate clarifying questions using Gemini
    const result = await generateClarifyingQuestions(parameters)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate questions' },
        { status: 500 }
      )
    }

    // Log usage for billing
    if (result.tokensUsed) {
      await supabase.from('ai_usage_log').insert({
        user_id: user.id,
        model: 'gemini-2.0-flash-exp',
        operation: 'question_generation',
        tokens_input: result.tokensUsed,
        tokens_output: 0,
        cost_usd: (result.tokensUsed / 1_000_000) * 0.075,
      })
    }

    return NextResponse.json({
      success: true,
      questions: result.questions,
      tokensUsed: result.tokensUsed,
    })
  } catch (error: any) {
    console.error('[API] generate-questions error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
