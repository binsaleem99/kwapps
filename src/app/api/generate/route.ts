/**
 * AI Code Generation API Route
 *
 * POST /api/generate
 *
 * Handles Arabic-first AI code generation using DeepSeek.
 * Pipeline: Translate → Generate → Verify RTL → Validate Security → Save
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompleteCode, calculateCost } from '@/lib/deepseek/client'
import type { UserPlan, User, Project, Message } from '@/types'

// Plan limits for AI generation
const PLAN_LIMITS: Record<
  UserPlan,
  { daily: number; monthly: number; name: string }
> = {
  free: { daily: 3, monthly: 10, name: 'Free' },
  builder: { daily: 50, monthly: 500, name: 'Builder' },
  pro: { daily: 200, monthly: 2000, name: 'Pro' },
  hosting_only: { daily: 0, monthly: 0, name: 'Hosting Only' },
}

// Request body interface
interface GenerateRequest {
  prompt: string // Arabic prompt
  projectId?: string // Optional: attach to existing project
  projectName?: string // Optional: name for new project
}

// Response interface
interface GenerateResponse {
  success: boolean
  code?: string
  projectId?: string
  englishPrompt?: string
  tokensUsed?: number
  cost?: number
  issues?: string[]
  vulnerabilities?: string[]
  error?: string
  errorAr?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json()
    const { prompt, projectId, projectName } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
          errorAr: 'الوصف مطلوب',
        } as GenerateResponse,
        { status: 400 }
      )
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          errorAr: 'غير مصرح',
        } as GenerateResponse,
        { status: 401 }
      )
    }

    // Get user data with plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single<User>()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          errorAr: 'المستخدم غير موجود',
        } as GenerateResponse,
        { status: 404 }
      )
    }

    // Check plan limits
    const limits = PLAN_LIMITS[user.plan]
    if (limits.daily === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Plan "${limits.name}" does not include AI generation`,
          errorAr: `خطة "${limits.name}" لا تتضمن إنشاء الذكاء الاصطناعي`,
        } as GenerateResponse,
        { status: 403 }
      )
    }

    // Check usage limits
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
      .select('prompt_count, tokens_used')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const todayCount = todayUsage?.prompt_count || 0
    if (todayCount >= limits.daily) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${limits.daily} generations per day)`,
          errorAr: `تم الوصول إلى الحد اليومي (${limits.daily} إنشاء في اليوم)`,
        } as GenerateResponse,
        { status: 429 }
      )
    }

    // Get month's usage
    const { data: monthUsage } = await supabase
      .from('usage_limits')
      .select('prompt_count')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)

    const monthCount =
      monthUsage?.reduce((sum, record) => sum + record.prompt_count, 0) || 0
    if (monthCount >= limits.monthly) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly limit reached (${limits.monthly} generations per month)`,
          errorAr: `تم الوصول إلى الحد الشهري (${limits.monthly} إنشاء في الشهر)`,
        } as GenerateResponse,
        { status: 429 }
      )
    }

    // Check if DeepSeek API key is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not configured',
          errorAr: 'خدمة الذكاء الاصطناعي غير مهيأة',
        } as GenerateResponse,
        { status: 500 }
      )
    }

    // Generate code using DeepSeek
    let generationResult
    try {
      generationResult = await generateCompleteCode(prompt)
    } catch (error) {
      console.error('Generation error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Code generation failed',
          errorAr: 'فشل إنشاء الكود',
        } as GenerateResponse,
        { status: 500 }
      )
    }

    const {
      code,
      englishPrompt,
      totalTokens,
      issues,
      vulnerabilities,
    } = generationResult

    // Check for security vulnerabilities
    if (vulnerabilities && vulnerabilities.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Security issues found: ${vulnerabilities.join(', ')}`,
          errorAr: `تم العثور على مشاكل أمنية: ${vulnerabilities.join('، ')}`,
          vulnerabilities,
        } as GenerateResponse,
        { status: 400 }
      )
    }

    // Get or create project
    let project: Project
    if (projectId) {
      // Update existing project
      const { data: existingProject, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single<Project>()

      if (projectError || !existingProject) {
        return NextResponse.json(
          {
            success: false,
            error: 'Project not found',
            errorAr: 'المشروع غير موجود',
          } as GenerateResponse,
          { status: 404 }
        )
      }

      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          arabic_prompt: prompt,
          english_prompt: englishPrompt,
          generated_code: code,
          status: 'preview',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single<Project>()

      if (updateError || !updatedProject) {
        throw new Error('Failed to update project')
      }

      project = updatedProject
    } else {
      // Create new project
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName || `مشروع ${new Date().toLocaleDateString('ar-KW')}`,
          arabic_prompt: prompt,
          english_prompt: englishPrompt,
          generated_code: code,
          status: 'preview',
        })
        .select()
        .single<Project>()

      if (createError || !newProject) {
        throw new Error('Failed to create project')
      }

      project = newProject
    }

    // Save messages (user prompt and assistant response)
    const messages: Partial<Message>[] = [
      {
        project_id: project.id,
        role: 'user',
        content: prompt,
        tokens_used: 0,
      },
      {
        project_id: project.id,
        role: 'assistant',
        content: code,
        tokens_used: totalTokens,
      },
    ]

    const { error: messagesError } = await supabase
      .from('messages')
      .insert(messages)

    if (messagesError) {
      console.error('Failed to save messages:', messagesError)
      // Don't fail the request if messages fail to save
    }

    // Update usage limits
    const { error: usageError } = await supabase.from('usage_limits').upsert({
      user_id: user.id,
      date: today,
      prompt_count: todayCount + 1,
      tokens_used: (todayUsage?.tokens_used || 0) + totalTokens,
    })

    if (usageError) {
      console.error('Failed to update usage:', usageError)
      // Don't fail the request if usage tracking fails
    }

    // Calculate cost
    const cost = calculateCost(totalTokens)

    // Calculate usage statistics for frontend
    const newTodayCount = todayCount + 1
    const remainingGenerations = Math.max(0, limits.daily - newTodayCount)

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        code,
        projectId: project.id,
        englishPrompt,
        tokensUsed: totalTokens,
        cost,
        usage: {
          current: newTodayCount,
          limit: limits.daily,
          remaining: remainingGenerations,
        },
        issues: issues.length > 0 ? issues : undefined,
      } as GenerateResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorAr: 'خطأ في الخادم الداخلي',
      } as GenerateResponse,
      { status: 500 }
    )
  }
}

// GET endpoint to check usage limits
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: user } = await supabase
      .from('users')
      .select('plan')
      .eq('id', authUser.id)
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
      .eq('user_id', authUser.id)
      .eq('date', today)
      .single()

    // Get month's usage
    const { data: monthUsage } = await supabase
      .from('usage_limits')
      .select('prompt_count')
      .eq('user_id', authUser.id)
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
