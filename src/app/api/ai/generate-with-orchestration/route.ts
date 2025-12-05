/**
 * API Route: Generate Code with Full Orchestration
 *
 * POST /api/ai/generate-with-orchestration
 *
 * Complete orchestration pipeline:
 * 1. Takes detected parameters + user answers
 * 2. Constructs enhanced prompt
 * 3. Generates plan (if not already provided)
 * 4. Calls DeepSeek pipeline
 * 5. Validates output
 * 6. Returns code + validation results
 *
 * Target cost: ~$0.031 per generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { geminiClient, formatPlanForDeepSeek } from '@/lib/gemini/client'
import { mergeParameters } from '@/lib/gemini/parameter-detector'
import { constructPrompt } from '@/lib/gemini/prompt-constructor'
import { generateCompleteCode } from '@/lib/deepseek/client'
import { validateGeneratedCode } from '@/components/builder/validation-checklist'
import type { DetectedParameters } from '@/lib/gemini/parameter-detector'
import type { GeminiPlan } from '@/lib/gemini/types'

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
    const {
      arabicPrompt,
      detectedParameters,
      userAnswers = {},
      projectId,
      skipPlan = false,
    } = body as {
      arabicPrompt: string
      detectedParameters: DetectedParameters
      userAnswers?: Record<string, any>
      projectId?: string
      skipPlan?: boolean
    }

    if (!arabicPrompt || !detectedParameters) {
      return NextResponse.json(
        { error: 'Arabic prompt and detected parameters are required' },
        { status: 400 }
      )
    }

    // Check user subscription and credits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('credits_balance, tier_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      )
    }

    // Cost estimate: ~4 credits for page generation
    const requiredCredits = 4
    if (subscription.credits_balance < requiredCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: requiredCredits,
          available: subscription.credits_balance,
        },
        { status: 402 }
      )
    }

    let totalTokens = 0
    let totalCostUSD = 0

    // Step 1: Merge user answers with detected parameters
    const finalParameters = mergeParameters(detectedParameters, userAnswers)

    // Step 2: Generate plan (unless skipped or already high confidence)
    let plan: GeminiPlan | undefined

    if (!skipPlan && finalParameters.overallConfidence < 0.9) {
      const planResult = await geminiClient.planFromPrompt(arabicPrompt, {
        projectName: projectId,
      })

      if (planResult.success && planResult.data) {
        plan = planResult.data
        totalTokens += planResult.tokensUsed || 0
        totalCostUSD += ((planResult.tokensUsed || 0) / 1_000_000) * 0.075
      }
    }

    // Step 3: Construct enhanced prompt
    const constructedPrompt = constructPrompt(
      arabicPrompt,
      finalParameters,
      plan
    )

    // Step 4: Generate code with DeepSeek pipeline
    // This includes: translate → generate → RTL fix → security validation
    const generationResult = await generateCompleteCode(
      constructedPrompt.arabicPrompt,
      { generationType: 'client_app' }
    )

    totalTokens += generationResult.totalTokens
    // DeepSeek cost: ~$0.21 per 1M tokens
    totalCostUSD += (generationResult.totalTokens / 1_000_000) * 0.21

    // Step 5: Validate generated code
    const validationResults = await validateGeneratedCode(
      generationResult.code,
      arabicPrompt
    )

    const allPassed =
      validationResults.filter((r) => r.status === 'failed').length === 0

    // Step 6: Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_operation_type: 'page',
      p_metadata: {
        project_id: projectId,
        tokens_used: totalTokens,
        cost_usd: totalCostUSD,
        validation_passed: allPassed,
      },
    })

    // Step 7: Log AI usage
    await supabase.from('ai_usage_log').insert({
      user_id: user.id,
      model: 'gemini+deepseek',
      operation: 'full_orchestration',
      tokens_input: Math.floor(totalTokens * 0.4),
      tokens_output: Math.floor(totalTokens * 0.6),
      cost_usd: totalCostUSD,
      metadata: {
        project_id: projectId,
        complexity: constructedPrompt.complexity,
        validation_passed: allPassed,
        plan_generated: !!plan,
      },
    })

    // Step 8: Save generation to database (optional)
    if (projectId) {
      await supabase.from('generations').insert({
        user_id: user.id,
        project_id: projectId,
        prompt_arabic: arabicPrompt,
        prompt_english: generationResult.englishPrompt,
        generated_code: generationResult.code,
        parameters: finalParameters,
        plan: plan,
        validation_results: validationResults,
        tokens_used: totalTokens,
        cost_usd: totalCostUSD,
        status: allPassed ? 'completed' : 'needs_review',
      })
    }

    return NextResponse.json({
      success: true,
      code: generationResult.code,
      englishPrompt: generationResult.englishPrompt,
      plan,
      finalParameters,
      validationResults,
      validationPassed: allPassed,
      usage: {
        tokensUsed: totalTokens,
        costUSD: totalCostUSD,
        creditsDeducted: requiredCredits,
        remainingCredits: subscription.credits_balance - requiredCredits,
      },
      issues: generationResult.issues,
      vulnerabilities: generationResult.vulnerabilities,
    })
  } catch (error: any) {
    console.error('[API] generate-with-orchestration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check orchestration status/config
 */
export async function GET() {
  return NextResponse.json({
    available: true,
    features: [
      'parameter_detection',
      'clarifying_questions',
      'enhanced_prompts',
      'plan_generation',
      'validation_checklist',
    ],
    estimatedCostUSD: 0.031,
    estimatedCredits: 4,
    models: {
      planning: 'gemini-2.0-flash-exp',
      generation: 'deepseek-coder',
      validation: 'deepseek-chat',
    },
  })
}
