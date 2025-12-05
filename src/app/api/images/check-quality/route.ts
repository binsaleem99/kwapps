/**
 * Image Quality Check API
 *
 * POST /api/images/check-quality
 * Analyze image quality and recommend enhancements
 *
 * Features:
 * - FREE (no credit cost)
 * - Returns quality score, detected issues, recommendations
 * - If quality < threshold: suggest Banana enhancement
 * - Arabic error messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBananaClient } from '@/lib/banana/client'
import {
  ELIGIBLE_TIERS,
  QUALITY_THRESHOLD,
  QUALITY_LABELS_AR,
  BANANA_CREDIT_COST,
} from '@/lib/banana/types'

interface CheckQualityRequestBody {
  image: string
  isUrl?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CheckQualityRequestBody = await request.json()

    if (!body.image) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_IMAGE',
            message: 'Image is required',
            messageAr: 'الصورة مطلوبة',
          },
        },
        { status: 400 }
      )
    }

    // Analyze image quality (no API call needed, done locally)
    const client = getBananaClient()
    const analysis = await client.analyzeImageQuality({
      image: body.image,
      isUrl: body.isUrl,
    })

    if (!analysis.success) {
      return NextResponse.json(
        {
          error: {
            code: 'ANALYSIS_FAILED',
            message: analysis.error || 'Failed to analyze image',
            messageAr: analysis.errorAr || 'فشل تحليل الصورة',
          },
        },
        { status: 500 }
      )
    }

    // Get user info for tier-specific messaging (optional, works without auth)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userTier: string | null = null
    let canEnhance = false
    let upgradeMessage: string | null = null
    let upgradeMessageAr: string | null = null

    if (user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (
            name,
            display_name_ar
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        userTier = (subscription.subscription_tiers as any)?.name
        canEnhance = userTier ? ELIGIBLE_TIERS.includes(userTier) : false

        if (!canEnhance && analysis.needsEnhancement) {
          upgradeMessage = 'Upgrade to Premium or Enterprise to enhance this image'
          upgradeMessageAr = 'قم بالترقية إلى مميز أو مؤسسي لتحسين هذه الصورة'
        }
      }
    } else if (analysis.needsEnhancement) {
      upgradeMessage = 'Sign in and subscribe to Premium or Enterprise to enhance images'
      upgradeMessageAr = 'سجل الدخول واشترك في مميز أو مؤسسي لتحسين الصور'
    }

    // Build response
    const response: any = {
      success: true,
      quality: {
        score: analysis.qualityScore,
        level: analysis.qualityLevel,
        levelAr: QUALITY_LABELS_AR[analysis.qualityLevel],
      },
      resolution: analysis.resolution,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      needsEnhancement: analysis.needsEnhancement,
    }

    // Add enhancement availability info
    if (analysis.needsEnhancement) {
      response.enhancement = {
        available: canEnhance,
        creditCost: BANANA_CREDIT_COST,
        eligibleTiers: ELIGIBLE_TIERS,
        currentTier: userTier,
      }

      if (!canEnhance) {
        response.upgrade = {
          message: upgradeMessage,
          messageAr: upgradeMessageAr,
          url: user ? '/pricing' : '/login?redirect=/pricing',
        }
      }
    }

    // Add Arabic summary message
    if (analysis.needsEnhancement) {
      if (analysis.qualityScore < 30) {
        response.summaryAr = 'جودة الصورة منخفضة جداً. ننصح بشدة بتحسينها للحصول على نتائج أفضل.'
        response.summary = 'Image quality is very low. We strongly recommend enhancing it for better results.'
      } else if (analysis.qualityScore < 60) {
        response.summaryAr = 'صورتك بحاجة للتحسين. استخدم ميزة التحسين بالذكاء الاصطناعي.'
        response.summary = 'Your image needs enhancement. Use our AI enhancement feature.'
      }
    } else {
      response.summaryAr = 'جودة الصورة جيدة!'
      response.summary = 'Image quality is good!'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] Image quality check error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'CHECK_FAILED',
          message: 'Failed to check image quality',
          messageAr: 'فشل فحص جودة الصورة',
        },
      },
      { status: 500 }
    )
  }
}
