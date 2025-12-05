/**
 * API Route: Detect Parameters from Arabic Prompt
 *
 * POST /api/ai/detect-parameters
 *
 * Uses Gemini to extract structured parameters from user's Arabic prompt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { detectParameters } from '@/lib/gemini/parameter-detector'
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
    const { arabicPrompt, projectId } = body

    if (!arabicPrompt || typeof arabicPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Arabic prompt is required' },
        { status: 400 }
      )
    }

    // Get project context if projectId provided
    let context: { previousPrompts?: string[]; projectName?: string } = {}

    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('name, metadata')
        .eq('id', projectId)
        .single()

      if (project) {
        context.projectName = project.name
        // Get previous prompts from project metadata or chat history
        if (project.metadata?.previousPrompts) {
          context.previousPrompts = project.metadata.previousPrompts
        }
      }
    }

    // Detect parameters using Gemini
    const result = await detectParameters(arabicPrompt, context)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to detect parameters' },
        { status: 500 }
      )
    }

    // Log usage for billing
    if (result.tokensUsed) {
      await supabase.from('ai_usage_log').insert({
        user_id: user.id,
        model: 'gemini-2.0-flash-exp',
        operation: 'parameter_detection',
        tokens_input: result.tokensUsed,
        tokens_output: 0,
        cost_usd: (result.tokensUsed / 1_000_000) * 0.075, // Gemini Flash pricing
        metadata: {
          project_id: projectId,
          prompt_length: arabicPrompt.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      parameters: result.parameters,
      tokensUsed: result.tokensUsed,
    })
  } catch (error: any) {
    console.error('[API] detect-parameters error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
