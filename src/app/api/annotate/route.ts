/**
 * Gemini Annotation API Route
 *
 * POST /api/annotate
 *
 * Analyzes generated code using Gemini and provides:
 * - Summary of what the page does
 * - UX and conversion suggestions
 * - Inline comments and code hints
 * - Accessibility notes
 * - RTL compliance check
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { geminiClient } from '@/lib/gemini/client'
import type { GeminiAnnotations } from '@/lib/gemini/types'
import { z } from 'zod'

// Request body schema
const AnnotateRequestSchema = z.object({
  projectId: z.string().uuid(),
  code: z.string().optional(), // Optional - if not provided, load from DB
})

type AnnotateRequest = z.infer<typeof AnnotateRequestSchema>

// Response interface
interface AnnotateResponse {
  success: boolean
  annotations?: GeminiAnnotations
  error?: {
    code: string
    message: string
    messageAr: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AnnotateResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = AnnotateRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request body',
            messageAr: 'طلب غير صالح',
          },
        },
        { status: 400 }
      )
    }

    const { projectId, code: providedCode } = parseResult.data

    // Check authentication
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يجب تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check if Gemini is configured
    if (!geminiClient.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Gemini API not configured',
            messageAr: 'خدمة Gemini غير مهيأة',
          },
        },
        { status: 503 }
      )
    }

    // Verify project ownership and get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, arabic_prompt, generated_code')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or access denied',
            messageAr: 'المشروع غير موجود أو الوصول مرفوض',
          },
        },
        { status: 404 }
      )
    }

    // Get code - either from request or from project
    let codeToAnalyze = providedCode

    if (!codeToAnalyze) {
      // Try to get latest generated code from generated_code table
      const { data: latestCode } = await supabase
        .from('generated_code')
        .select('code')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      codeToAnalyze = latestCode?.code || project.generated_code
    }

    if (!codeToAnalyze) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_CODE',
            message: 'No code found to analyze',
            messageAr: 'لا يوجد كود للتحليل',
          },
        },
        { status: 400 }
      )
    }

    // Get the original Arabic prompt from messages
    const { data: messages } = await supabase
      .from('messages')
      .select('content')
      .eq('project_id', projectId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const arabicPrompt = messages?.content || project.arabic_prompt || 'غير معروف'

    // Call Gemini for annotation
    console.log('[API/annotate] Analyzing code with Gemini...')

    const result = await geminiClient.annotateCode(codeToAnalyze, arabicPrompt, {
      projectName: project.name,
    })

    if (!result.success || !result.data) {
      console.error('[API/annotate] Gemini annotation failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || {
            code: 'ANNOTATION_FAILED',
            message: 'Failed to analyze code',
            messageAr: 'فشل تحليل الكود',
          },
        },
        { status: 500 }
      )
    }

    // Log analytics event
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: 'annotation_requested',
      event_data: {
        project_id: projectId,
        code_length: codeToAnalyze.length,
        tokens_used: result.tokensUsed || 0,
        quality_score: result.data.qualityScore,
      },
    })

    console.log('[API/annotate] Annotation complete:', {
      projectId,
      qualityScore: result.data.qualityScore,
      suggestionsCount: result.data.suggestions.length,
    })

    return NextResponse.json({
      success: true,
      annotations: result.data,
    })
  } catch (error: any) {
    console.error('[API/annotate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
          messageAr: 'حدث خطأ داخلي',
        },
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check Gemini availability
export async function GET(request: NextRequest) {
  const isConfigured = geminiClient.isConfigured()

  return NextResponse.json({
    available: isConfigured,
    message: isConfigured
      ? 'Gemini annotation service is available'
      : 'Gemini API key not configured',
    messageAr: isConfigured
      ? 'خدمة التحليل بـ Gemini متاحة'
      : 'مفتاح Gemini غير مهيأ',
  })
}
