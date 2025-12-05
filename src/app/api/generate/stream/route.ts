// ==============================================
// KW APPS - Streaming Code Generation API
// ==============================================
// POST /api/generate/stream
// Server-Sent Events (SSE) for real-time code preview
// Integrates with credit reservation system
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CodeGenerator,
  getCreditCost,
  mapToOperationType,
  type StructuredPrompt,
} from '@/lib/deepseek/code-generator'
import { detectGenerationType } from '@/lib/deepseek/templates'
import { reserveCredits, commitCredits, releaseCredits } from '@/lib/billing'
import type { OperationType } from '@/types/billing'

// Configure for streaming
export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for streaming

/**
 * SSE Event Types
 */
interface SSEProgressEvent {
  type: 'progress'
  stage: 'planning' | 'generating' | 'validating' | 'complete'
  percent: number
  message: string
}

interface SSECodeChunkEvent {
  type: 'code_chunk'
  content: string
  tokensUsed: number
}

interface SSECompleteEvent {
  type: 'complete'
  code: string
  tokensUsed: number
  creditsUsed: number
  generationType: string
  validation: {
    security: { isValid: boolean; violations: string[] }
    rtl: { isValid: boolean; issues: string[] }
  }
}

interface SSEErrorEvent {
  type: 'error'
  message: string
  messageAr: string
}

type SSEEvent = SSEProgressEvent | SSECodeChunkEvent | SSECompleteEvent | SSEErrorEvent

/**
 * Helper to format SSE data
 */
function formatSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/**
 * Request body interface
 */
interface StreamRequest {
  prompt: StructuredPrompt
  projectId?: string
}

/**
 * POST /api/generate/stream
 * Streaming code generation with credit deduction
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body: StreamRequest = await request.json()
    const { prompt, projectId } = body

    // Validate prompt
    if (!prompt || !prompt.userPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required', errorAr: 'الوصف مطلوب' },
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
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user subscription and credits
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        credits_balance,
        status,
        tier:subscription_tiers(name)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        {
          error: 'Active subscription required',
          errorAr: 'يجب أن يكون لديك اشتراك فعال',
        },
        { status: 403 }
      )
    }

    // Detect generation type and calculate credits
    const generationType = prompt.generationType || detectGenerationType(prompt.userPrompt)
    const creditCost = getCreditCost(generationType)
    const operationType = mapToOperationType(generationType) as OperationType

    // Reserve credits before starting stream
    const reservation = await reserveCredits(userId, operationType, {
      generation_type: generationType,
      project_id: projectId,
    })

    if (!reservation.success) {
      return NextResponse.json(
        {
          error: reservation.error || 'Failed to reserve credits',
          errorAr: `رصيدك غير كافٍ. المطلوب: ${creditCost}، المتاح: ${subscription.credits_balance}`,
        },
        { status: 402 }
      )
    }

    const reservationId = reservation.reservationId!

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'progress',
                stage: 'planning',
                percent: 10,
                message: 'جاري تحليل الطلب...',
              })
            )
          )

          // Initialize code generator
          const generator = new CodeGenerator('coder')

          // Start streaming generation
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'progress',
                stage: 'generating',
                percent: 20,
                message: 'جاري إنشاء الكود...',
              })
            )
          )

          let accumulatedCode = ''
          let totalTokens = 0

          // Stream code chunks
          for await (const chunk of generator.streamGeneration(prompt)) {
            if (chunk.type === 'content' && chunk.content) {
              accumulatedCode += chunk.content
              totalTokens = chunk.tokensUsed || 0

              controller.enqueue(
                encoder.encode(
                  formatSSE({
                    type: 'code_chunk',
                    content: chunk.content,
                    tokensUsed: totalTokens,
                  })
                )
              )

              // Update progress based on tokens
              const progressPercent = Math.min(80, 20 + (totalTokens / 8000) * 60)
              controller.enqueue(
                encoder.encode(
                  formatSSE({
                    type: 'progress',
                    stage: 'generating',
                    percent: Math.round(progressPercent),
                    message: 'جاري إنشاء الكود...',
                  })
                )
              )
            } else if (chunk.type === 'done') {
              accumulatedCode = chunk.content || accumulatedCode
              totalTokens = chunk.tokensUsed || totalTokens
            } else if (chunk.type === 'error') {
              throw new Error(chunk.error)
            }
          }

          // Validation stage
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'progress',
                stage: 'validating',
                percent: 85,
                message: 'جاري التحقق من الكود...',
              })
            )
          )

          // Import validation functions
          const { validateCodeSecurity, validateRTLCompliance } = await import(
            '@/lib/deepseek/templates'
          )

          const securityResult = validateCodeSecurity(accumulatedCode)
          const rtlResult = validateRTLCompliance(accumulatedCode)

          // Commit the credit reservation (deduct credits on success)
          const commitResult = await commitCredits(reservationId)
          if (!commitResult.success) {
            console.error('Failed to commit credits:', commitResult.error)
          }

          // Get updated balance for response
          const { data: updatedSub } = await supabase
            .from('user_subscriptions')
            .select('credits_balance')
            .eq('id', subscription.id)
            .single()

          const newBalance = updatedSub?.credits_balance ?? subscription.credits_balance - creditCost

          // Save generated code if project provided
          if (projectId) {
            await supabase
              .from('projects')
              .update({
                generated_code: accumulatedCode,
                status: 'preview',
                updated_at: new Date().toISOString(),
              })
              .eq('id', projectId)

            // Also save to generated_code table
            await supabase.from('generated_code').insert({
              project_id: projectId,
              user_id: userId,
              code: accumulatedCode,
              language: 'tsx',
            })
          }

          // Send complete event
          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'progress',
                stage: 'complete',
                percent: 100,
                message: 'تم إنشاء الكود بنجاح!',
              })
            )
          )

          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'complete',
                code: accumulatedCode,
                tokensUsed: totalTokens,
                creditsUsed: creditCost,
                generationType,
                validation: {
                  security: securityResult,
                  rtl: rtlResult,
                },
              })
            )
          )

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)

          // Release the credit reservation on failure (return held credits)
          await releaseCredits(reservationId)
          console.log(`[Stream] Released credits due to error, reservation: ${reservationId}`)

          controller.enqueue(
            encoder.encode(
              formatSSE({
                type: 'error',
                message: error instanceof Error ? error.message : 'Generation failed',
                messageAr: 'فشل في إنشاء الكود',
              })
            )
          )

          controller.close()
        }
      },
    })

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  } catch (error) {
    console.error('Stream API error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        errorAr: 'خطأ في الخادم',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/generate/stream',
    method: 'POST',
    description: 'Streaming code generation with SSE',
    contentType: 'text/event-stream',
  })
}

/**
 * Helper: Get Arabic name for generation type
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
