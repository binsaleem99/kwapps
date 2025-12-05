/**
 * AI Code Generation API Route with Streaming Support
 *
 * POST /api/generate
 *
 * Handles Arabic-first AI code generation using DeepSeek with SSE streaming.
 * Pipeline: Translate → Generate (streaming) → Verify RTL → Validate Security → Save
 */

import { NextRequest, NextResponse } from 'next/server'

// Configure route for streaming with extended timeout
export const runtime = 'nodejs' // Use Node.js runtime for longer timeout
export const maxDuration = 60 // Maximum 60 seconds (requires Pro plan, falls back to 10s on Hobby)
import { createClient } from '@/lib/supabase/server'
import { StreamingDeepSeekClient } from '@/lib/deepseek/streaming-client'
import { ConversationManager } from '@/lib/deepseek/conversation-manager'
import { TokenTracker, PLAN_LIMITS } from '@/lib/deepseek/token-tracker'
import { geminiClient, formatPlanForDeepSeek } from '@/lib/gemini/client'
import type { GenerationMode, GeminiPlan } from '@/lib/gemini/types'
import type { UserPlan, User, Project } from '@/types'

// Request body interface
interface GenerateRequest {
  prompt: string // Arabic prompt
  project_id?: string // Project ID for context
  current_code?: string // Current code for context
  mode?: GenerationMode // 'standard' | 'smart' (default: 'standard')
}

// SSE Event Types
type SSEEvent =
  | { type: 'progress'; data: { stage: string; percent: number; message: string } }
  | { type: 'tokens'; data: { input?: number; output?: number; total?: number } }
  | { type: 'code_chunk'; data: string }
  | { type: 'plan'; data: { plan: GeminiPlan } } // NEW: Gemini plan for Smart mode
  | { type: 'complete'; data: { code: string; tokens: number; projectId: string; mode: GenerationMode } }
  | { type: 'error'; data: { message: string; messageAr: string } }

/**
 * Helper function to send SSE events
 */
function sendSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(request: NextRequest) {
  // Parse request body
  const body: GenerateRequest = await request.json()
  const { prompt, project_id, mode = 'standard' } = body

  // Validate prompt
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: 'Prompt is required', errorAr: 'الوصف مطلوب' },
      { status: 400 }
    )
  }

  // Check authentication with Supabase
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

  // Get user data with plan from database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single<User>()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'User not found', errorAr: 'المستخدم غير موجود' },
      { status: 404 }
    )
  }

  // Check plan limits
  const limits = PLAN_LIMITS[user.plan]
  if (limits.daily === 0) {
    return NextResponse.json(
      {
        error: `Plan "${limits.name}" does not include AI generation`,
        errorAr: `خطة "${limits.name}" لا تتضمن إنشاء الذكاء الاصطناعي`,
      },
      { status: 403 }
    )
  }

  // Check if user can generate
  const canGenerate = await TokenTracker.canGenerate(user.id)
  if (!canGenerate) {
    return NextResponse.json(
      {
        error: 'Daily or monthly limit reached',
        errorAr: 'تم الوصول إلى الحد اليومي أو الشهري',
      },
      { status: 429 }
    )
  }

  // Check if DeepSeek API key is configured
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      {
        error: 'AI service not configured',
        errorAr: 'خدمة الذكاء الاصطناعي غير مهيأة',
      },
      { status: 500 }
    )
  }

  // Create readable stream for SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Get or create project
        let projectId: string = project_id || ''

        if (!project_id) {
          const { data: newProject, error: createError } = await supabase
            .from('projects')
            .insert({
              user_id: user.id,
              name: `مشروع ${new Date().toLocaleDateString('ar-KW')}`,
              status: 'generating',
            })
            .select('id')
            .single()

          if (createError || !newProject) {
            controller.enqueue(
              encoder.encode(
                sendSSE({
                  type: 'error',
                  data: {
                    message: 'Failed to create project',
                    messageAr: 'فشل إنشاء المشروع',
                  },
                })
              )
            )
            controller.close()
            return
          }
          projectId = newProject.id
        }

        // Save user message
        await ConversationManager.saveMessage(projectId, 'user', prompt, 0)

        // Build contextual prompt
        let { contextPrompt } = await ConversationManager.buildContextualPrompt(
          projectId,
          prompt
        )

        let geminiPlan: GeminiPlan | null = null
        let geminiTokens = 0

        // ============================================
        // SMART MODE: Gemini Planning Stage
        // ============================================
        if (mode === 'smart' && geminiClient.isConfigured()) {
          console.log('[API] Smart mode: Starting Gemini planning...')

          // Send planning progress
          controller.enqueue(
            encoder.encode(
              sendSSE({
                type: 'progress',
                data: {
                  stage: 'planning',
                  percent: 10,
                  message: 'جاري التخطيط للتطبيق باستخدام Gemini...',
                },
              })
            )
          )

          // Call Gemini for planning
          const planResult = await geminiClient.planFromPrompt(prompt, {
            projectName: undefined, // Could fetch from project
            previousPrompts: [], // Could fetch from messages
          })

          if (planResult.success && planResult.data) {
            geminiPlan = planResult.data
            geminiTokens = planResult.tokensUsed || 0

            console.log('[API] Gemini plan created:', geminiPlan.summary)

            // Send plan to client
            controller.enqueue(
              encoder.encode(
                sendSSE({
                  type: 'plan',
                  data: { plan: geminiPlan },
                })
              )
            )

            // Inject plan into DeepSeek prompt
            const planPrompt = formatPlanForDeepSeek(geminiPlan)
            contextPrompt = `${planPrompt}\n\n---\n\nالطلب الأصلي: ${contextPrompt}`

            // Update progress
            controller.enqueue(
              encoder.encode(
                sendSSE({
                  type: 'progress',
                  data: {
                    stage: 'planning',
                    percent: 20,
                    message: 'تم التخطيط! جاري إنشاء الكود...',
                  },
                })
              )
            )
          } else {
            console.warn('[API] Gemini planning failed, falling back to standard mode:', planResult.error)
            // Continue with standard mode if Gemini fails
          }

          // Log Smart mode usage for analytics
          await supabase.from('analytics_events').insert({
            user_id: userId,
            event_name: 'generation_smart_mode',
            event_data: {
              project_id: projectId,
              plan: user.plan,
              gemini_tokens: geminiTokens,
              plan_success: !!geminiPlan,
            },
          })
        }

        // Initialize streaming client
        const streamingClient = new StreamingDeepSeekClient()

        let accumulatedCode = ''
        let totalTokens = geminiTokens // Include Gemini tokens in total

        // Stream generation with progress updates
        const generator = streamingClient.generateWithProgress(
          contextPrompt,
          projectId,
          (progress, tokens) => {
            // Send progress update
            controller.enqueue(
              encoder.encode(
                sendSSE({
                  type: 'progress',
                  data: {
                    stage: progress.stage,
                    percent: progress.percent,
                    message: progress.message,
                  },
                })
              )
            )

            // Send token info if available
            if (tokens) {
              controller.enqueue(
                encoder.encode(
                  sendSSE({
                    type: 'tokens',
                    data: tokens,
                  })
                )
              )
            }
          },
          'client_app'
        )

        // Stream code chunks
        let done = false
        while (!done) {
          const result = await generator.next()
          if (result.done) {
            // Get final result with totalTokens
            if (result.value && typeof result.value === 'object' && 'totalTokens' in result.value) {
              totalTokens = result.value.totalTokens
            }
            done = true
          } else {
            // Stream chunk
            const chunk = result.value
            accumulatedCode += chunk
            controller.enqueue(
              encoder.encode(
                sendSSE({
                  type: 'code_chunk',
                  data: chunk,
                })
              )
            )
          }
        }

        // Save assistant message
        const messageResult = await ConversationManager.saveMessage(
          projectId,
          'assistant',
          accumulatedCode,
          totalTokens
        )

        // Update project with generated code
        await supabase
          .from('projects')
          .update({
            generated_code: accumulatedCode,
            status: 'preview',
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)

        // Save to generated_code table (Lovable pattern)
        // This separates code from messages for better organization
        await supabase
          .from('generated_code')
          .insert({
            project_id: projectId,
            user_id: userId,
            code: accumulatedCode,
            language: 'tsx',
            message_id: messageResult?.id || null,
          })

        // Track usage
        await TokenTracker.trackUsage(user.id, totalTokens)

        // Send completion event
        console.log('[API] Sending complete event:', {
          codeLength: accumulatedCode.length,
          tokens: totalTokens,
          projectId,
          mode,
          firstChars: accumulatedCode.substring(0, 100),
        })

        controller.enqueue(
          encoder.encode(
            sendSSE({
              type: 'complete',
              data: {
                code: accumulatedCode,
                tokens: totalTokens,
                projectId,
                mode,
              },
            })
          )
        )

        console.log('[API] Stream closing')
        controller.close()
      } catch (error: any) {
        console.error('Streaming generation error:', error)
        controller.enqueue(
          encoder.encode(
            sendSSE({
              type: 'error',
              data: {
                message: error.message || 'Generation failed',
                messageAr: 'فشل إنشاء الكود',
              },
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
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// GET endpoint to check usage limits
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { data: user } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single<{ plan: UserPlan }>()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const limits = PLAN_LIMITS[user.plan]
    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split('T')[0]

    // Get today's usage
    const { data: todayUsage } = await supabase
      .from('usage_limits')
      .select('prompt_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    // Get month's usage
    const { data: monthUsage } = await supabase
      .from('usage_limits')
      .select('prompt_count')
      .eq('user_id', userId)
      .gte('date', startOfMonth)

    const todayCount = todayUsage?.prompt_count || 0
    const monthCount =
      monthUsage?.reduce((sum, record) => sum + record.prompt_count, 0) || 0

    return NextResponse.json({
      plan: user.plan,
      today: {
        used: todayCount,
        limit: limits.daily,
        remaining: Math.max(0, limits.daily - todayCount),
      },
      month: {
        used: monthCount,
        limit: limits.monthly,
        remaining: Math.max(0, limits.monthly - monthCount),
      },
    })
  } catch (error) {
    console.error('GET /api/generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
