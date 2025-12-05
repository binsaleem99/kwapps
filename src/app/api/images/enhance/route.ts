/**
 * Image Enhancement API
 *
 * POST /api/images/enhance
 * Enhance/upscale image using Banana.dev AI
 *
 * Requirements:
 * - User must be Premium (59 KWD) or Enterprise (75 KWD) tier
 * - Costs 2.5 credits per operation
 * - Arabic error messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBananaClient } from '@/lib/banana/client'
import { deductCredits } from '@/lib/billing/credit-service'
import {
  ELIGIBLE_TIERS,
  BANANA_CREDIT_COST,
  RATE_LIMITS,
  MAX_IMAGE_SIZE,
  SUPPORTED_FORMATS,
} from '@/lib/banana/types'
import type {
  EnhancementType,
  UpscaleScale,
  AspectRatio,
} from '@/lib/banana/types'

interface EnhanceRequestBody {
  image: string
  isUrl?: boolean
  enhancementType: EnhancementType | 'upscale' | 'aspect_ratio'
  // Upscale options
  scale?: UpscaleScale
  faceEnhance?: boolean
  // Enhance options
  denoiseStrength?: number
  sharpenStrength?: number
  // Aspect ratio options
  aspectRatio?: AspectRatio
  cropMode?: 'center' | 'smart' | 'fill'
  // Output options
  outputFormat?: 'png' | 'jpeg' | 'webp'
  outputQuality?: number
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يرجى تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    // Get user's subscription tier
    const { data: subscription, error: subError } = await supabase
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

    if (subError || !subscription) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'Active subscription required',
            messageAr: 'يرجى الاشتراك للوصول لهذه الخدمة',
          },
        },
        { status: 403 }
      )
    }

    const tierName = (subscription.subscription_tiers as any)?.name as string

    // Check if tier is eligible (Premium or Enterprise only)
    if (!ELIGIBLE_TIERS.includes(tierName)) {
      return NextResponse.json(
        {
          error: {
            code: 'TIER_NOT_ELIGIBLE',
            message: 'This feature requires Premium or Enterprise subscription',
            messageAr: 'هذه الميزة متاحة فقط لاشتراكات مميز ومؤسسي',
            requiredTiers: ELIGIBLE_TIERS,
            currentTier: tierName,
            upgradeUrl: '/pricing',
          },
        },
        { status: 403 }
      )
    }

    // Check credits balance
    if (subscription.credits_balance < BANANA_CREDIT_COST) {
      return NextResponse.json(
        {
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: `Requires ${BANANA_CREDIT_COST} credits. You have ${subscription.credits_balance}`,
            messageAr: `يتطلب ${BANANA_CREDIT_COST} رصيد. لديك ${subscription.credits_balance} رصيد`,
            required: BANANA_CREDIT_COST,
            available: subscription.credits_balance,
          },
        },
        { status: 402 }
      )
    }

    // Parse request body
    const body: EnhanceRequestBody = await request.json()

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

    if (!body.enhancementType) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_TYPE',
            message: 'Enhancement type is required',
            messageAr: 'نوع التحسين مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Check rate limits
    const client = getBananaClient()
    const rateLimit = await client.checkRateLimit(user.id, tierName)

    if (rateLimit.remaining <= 0) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Daily limit (${rateLimit.dailyLimit}) exceeded. Resets at midnight`,
            messageAr: `تجاوزت الحد اليومي (${rateLimit.dailyLimit}). يتم التجديد عند منتصف الليل`,
            limit: rateLimit.dailyLimit,
            used: rateLimit.dailyUsed,
            resetsAt: rateLimit.resetsAt,
          },
        },
        { status: 429 }
      )
    }

    // Process based on enhancement type
    let result

    if (body.enhancementType === 'upscale') {
      if (!body.scale || ![2, 4, 8].includes(body.scale)) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_SCALE',
              message: 'Scale must be 2, 4, or 8',
              messageAr: 'معدل التكبير يجب أن يكون 2 أو 4 أو 8',
            },
          },
          { status: 400 }
        )
      }

      result = await client.upscaleImage({
        image: body.image,
        isUrl: body.isUrl,
        scale: body.scale,
        faceEnhance: body.faceEnhance,
        outputFormat: body.outputFormat,
        outputQuality: body.outputQuality,
      })
    } else if (body.enhancementType === 'aspect_ratio') {
      if (!body.aspectRatio) {
        return NextResponse.json(
          {
            error: {
              code: 'MISSING_ASPECT_RATIO',
              message: 'Aspect ratio is required',
              messageAr: 'نسبة العرض للارتفاع مطلوبة',
            },
          },
          { status: 400 }
        )
      }

      result = await client.adjustAspectRatio({
        image: body.image,
        isUrl: body.isUrl,
        aspectRatio: body.aspectRatio,
        cropMode: body.cropMode,
      })
    } else {
      result = await client.enhanceQuality({
        image: body.image,
        isUrl: body.isUrl,
        enhancementType: body.enhancementType as EnhancementType,
        denoiseStrength: body.denoiseStrength,
        sharpenStrength: body.sharpenStrength,
        outputFormat: body.outputFormat,
      })
    }

    // Check if enhancement was successful
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'ENHANCEMENT_FAILED',
            message: result.error || 'Enhancement failed',
            messageAr: result.errorAr || 'فشل تحسين الصورة',
          },
        },
        { status: 500 }
      )
    }

    // Deduct credits
    try {
      const deductResult = await deductCredits(user.id, {
        operation_type: 'banana_image',
        operation_metadata: {
          enhancement_type: body.enhancementType,
          scale: body.scale,
          aspect_ratio: body.aspectRatio,
          processing_time: result.processingTime,
        },
      })

      // Update rate limit
      await client.incrementRateLimit(user.id, tierName)

      return NextResponse.json({
        success: true,
        image: result.image,
        imageUrl: result.imageUrl,
        originalSize: 'originalSize' in result ? result.originalSize : undefined,
        resultSize: 'resultSize' in result ? result.resultSize : undefined,
        qualityBefore: 'qualityBefore' in result ? result.qualityBefore : undefined,
        qualityAfter: 'qualityAfter' in result ? result.qualityAfter : undefined,
        processingTime: result.processingTime,
        creditsDeducted: BANANA_CREDIT_COST,
        remainingCredits: deductResult.remaining_balance,
        messageAr: 'تم تحسين الصورة بنجاح!',
      })
    } catch (creditError: any) {
      // Enhancement succeeded but credit deduction failed
      // Log this for manual handling
      console.error('[Image Enhance] Credit deduction failed:', creditError)

      return NextResponse.json({
        success: true,
        image: result.image,
        processingTime: result.processingTime,
        warning: 'Credit deduction failed but image was enhanced',
        warningAr: 'تم تحسين الصورة لكن فشل خصم الرصيد',
      })
    }
  } catch (error) {
    console.error('[API] Image enhance error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'ENHANCE_FAILED',
          message: 'Failed to enhance image',
          messageAr: 'فشل تحسين الصورة',
        },
      },
      { status: 500 }
    )
  }
}
