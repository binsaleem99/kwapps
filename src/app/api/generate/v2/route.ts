// ==============================================
// KW APPS - Code Generation API v2
// ==============================================
// POST /api/generate/v2
// Non-streaming generation with credit system
// Receives structured prompts from orchestrator
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CodeGenerator,
  getCreditCost,
  mapToOperationType,
  type StructuredPrompt,
  type GenerationResult,
} from '@/lib/deepseek/code-generator'
import { detectGenerationType } from '@/lib/deepseek/templates'

// Configure route
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Request body interface
 */
interface GenerateRequest {
  prompt: StructuredPrompt
  projectId?: string
  mode?: 'fast' | 'quality' // fast = deepseek-chat, quality = deepseek-coder
}

/**
 * Response interface
 */
interface GenerateResponse {
  success: boolean
  code?: string
  generationType?: string
  tokensUsed?: number
  creditsUsed?: number
  creditsRemaining?: number
  validation?: {
    security: { isValid: boolean; violations: string[] }
    rtl: { isValid: boolean; issues: string[] }
  }
  error?: string
  errorAr?: string
}

/**
 * POST /api/generate/v2
 * Generate code with credit deduction
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { prompt, projectId, mode = 'quality' } = body

    // Validate prompt
    if (!prompt || !prompt.userPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
          errorAr: 'الوصف مطلوب',
        },
        { status: 400 }
      )
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          errorAr: 'غير مصرح',
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check DeepSeek API key
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured',
          errorAr: 'خدمة الذكاء الاصطناعي غير مهيأة',
        },
        { status: 500 }
      )
    }

    // Get user subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        credits_balance,
        status,
        tier:subscription_tiers(name, credits_per_month)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Active subscription required',
          errorAr: 'يجب أن يكون لديك اشتراك فعال للاستخدام',
        },
        { status: 403 }
      )
    }

    // Detect generation type and calculate credits
    const generationType = prompt.generationType || detectGenerationType(prompt.userPrompt)
    const creditCost = getCreditCost(generationType)

    // Check credits
    if (subscription.credits_balance < creditCost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient credits. Required: ${creditCost}, Available: ${subscription.credits_balance}`,
          errorAr: `رصيدك غير كافٍ. المطلوب: ${creditCost} رصيد، المتاح: ${subscription.credits_balance} رصيد`,
          creditsRemaining: subscription.credits_balance,
        },
        { status: 402 }
      )
    }

    // Initialize generator
    const generator = new CodeGenerator(mode === 'fast' ? 'chat' : 'coder')

    // Generate based on type
    let result: GenerationResult

    switch (generationType) {
      case 'website':
      case 'landing':
        result = await generator.generateWebsite(prompt)
        break

      case 'edit':
        if (!prompt.existingCode) {
          return NextResponse.json(
            {
              success: false,
              error: 'Existing code required for edit',
              errorAr: 'الكود الحالي مطلوب للتعديل',
            },
            { status: 400 }
          )
        }
        result = await generator.editCode(prompt.existingCode, prompt.userPrompt)
        break

      default:
        result = await generator.generateComponent(prompt)
    }

    // Deduct credits
    const operationType = mapToOperationType(generationType)
    const newBalance = subscription.credits_balance - creditCost

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Credit update error:', updateError)
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      subscription_id: subscription.id,
      transaction_type: 'debit',
      amount: -creditCost,
      balance_after: newBalance,
      operation_type: operationType,
      operation_metadata: {
        generation_type: generationType,
        tokens_used: result.tokensUsed,
        project_id: projectId,
        mode,
      },
      description_ar: `إنشاء ${getArabicTypeName(generationType)}`,
      description_en: `Generated ${generationType}`,
    })

    // Save to project if provided
    if (projectId) {
      await supabase
        .from('projects')
        .update({
          generated_code: result.code,
          status: 'preview',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      // Save to generated_code table
      await supabase.from('generated_code').insert({
        project_id: projectId,
        user_id: userId,
        code: result.code,
        language: 'tsx',
      })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      code: result.code,
      generationType: result.generationType,
      tokensUsed: result.tokensUsed,
      creditsUsed: creditCost,
      creditsRemaining: newBalance,
      validation: result.validationResult,
    })
  } catch (error) {
    console.error('Generate v2 error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
        errorAr: 'فشل في إنشاء الكود',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint - check credits and limits
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        credits_balance,
        credits_allocated_this_period,
        credits_bonus_earned,
        credits_rollover,
        status,
        current_period_end,
        tier:subscription_tiers(name, credits_per_month, daily_bonus_credits)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        credits: 0,
        message: 'No active subscription',
        messageAr: 'لا يوجد اشتراك فعال',
      })
    }

    // Get credit costs for reference
    const costs = {
      component: getCreditCost('component'),
      page: getCreditCost('website'),
      complex: getCreditCost('dashboard'),
      edit: getCreditCost('edit'),
    }

    return NextResponse.json({
      hasSubscription: true,
      credits: {
        balance: subscription.credits_balance,
        allocated: subscription.credits_allocated_this_period,
        bonus: subscription.credits_bonus_earned,
        rollover: subscription.credits_rollover,
      },
      tier: subscription.tier,
      periodEnd: subscription.current_period_end,
      operationCosts: costs,
    })
  } catch (error) {
    console.error('GET /api/generate/v2 error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get Arabic type name
 */
function getArabicTypeName(type: string): string {
  const names: Record<string, string> = {
    component: 'مكون',
    website: 'موقع',
    landing: 'صفحة هبوط',
    ecommerce: 'متجر إلكتروني',
    dashboard: 'لوحة تحكم',
    form: 'نموذج',
    edit: 'تعديل',
  }
  return names[type] || 'كود'
}
