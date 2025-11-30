/**
 * AI Prompt Analysis API Route
 *
 * POST /api/analyze
 *
 * Analyzes user prompts to identify clarifying questions before code generation.
 * This improves accuracy and reduces iterations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

interface AnalyzeRequest {
  prompt: string // Arabic prompt from user
}

interface Question {
  id: string
  question: string // Arabic question
  options: {
    value: string
    label: string // Arabic label
    description: string // Arabic description
  }[]
}

interface AnalysisResponse {
  needsClarification: boolean
  questions: Question[]
  reasoning?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { prompt } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
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

    // Analyze the prompt for clarification needs
    const analysisPrompt = `You are an expert at analyzing web application requirements in Arabic.

Analyze this Arabic prompt and determine if clarifying questions are needed BEFORE generating code.

User Prompt: "${prompt}"

Your task:
1. Identify any ambiguities or choices that would significantly affect the implementation
2. Generate clarifying questions ONLY if they would meaningfully improve the result
3. Each question should have 2-4 clear options
4. Questions should be in Arabic and easy to understand

Return a JSON object with this structure:
{
  "needsClarification": true/false,
  "questions": [
    {
      "id": "unique_id",
      "question": "السؤال بالعربية؟",
      "options": [
        {
          "value": "option1",
          "label": "الخيار الأول",
          "description": "وصف قصير للخيار"
        }
      ]
    }
  ],
  "reasoning": "Why clarification is or isn't needed"
}

Common scenarios that need clarification:
- E-commerce: payment methods, product types, shipping options
- Restaurant: menu structure, reservation system, delivery options
- Landing page: CTA type, form fields, sections needed
- Dashboard: user roles, data sources, chart types
- Blog: comment system, categories, author profiles

If the prompt is clear and straightforward (like "صفحة هبوط بسيطة" or "بطاقة عرض منتج"), return needsClarification: false.

Return ONLY valid JSON, no explanations.`

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes requirements and returns valid JSON.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 1000,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the JSON response
    let analysis: AnalysisResponse
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : responseText
      analysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', responseText)
      // Default to no clarification if parsing fails
      analysis = {
        needsClarification: false,
        questions: [],
        reasoning: 'Failed to parse analysis response',
      }
    }

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Analysis failed',
        errorAr: 'فشل التحليل',
      },
      { status: 500 }
    )
  }
}
