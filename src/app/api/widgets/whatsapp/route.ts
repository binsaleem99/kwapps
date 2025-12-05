/**
 * WhatsApp Widget API
 *
 * POST /api/widgets/whatsapp
 * Generate WhatsApp widget code snippet
 *
 * Features:
 * - Phone number validation for GCC countries
 * - Customizable styling and positioning
 * - RTL-aware output
 * - Minified snippet for production
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateWhatsAppWidget,
  validatePhoneNumber,
  generateWhatsAppLink,
} from '@/lib/widgets'
import type { WhatsAppWidgetConfig, WidgetStyleConfig } from '@/lib/widgets'

interface GenerateWidgetRequest {
  phoneNumber: string
  welcomeMessage?: string
  buttonText?: string
  style?: Partial<WidgetStyleConfig>
  showBadge?: boolean
  badgeText?: string
  showOnMobile?: boolean
  showOnDesktop?: boolean
  workingHours?: WhatsAppWidgetConfig['workingHours']
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateWidgetRequest = await request.json()

    // Validate phone number
    if (!body.phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PHONE',
            message: 'Phone number is required',
            messageAr: 'رقم الهاتف مطلوب',
          },
        },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhoneNumber(body.phoneNumber)

    if (!phoneValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PHONE',
            message: phoneValidation.error,
            messageAr: phoneValidation.errorAr,
          },
        },
        { status: 400 }
      )
    }

    // Generate widget
    const widget = generateWhatsAppWidget({
      phoneNumber: phoneValidation.formatted!,
      welcomeMessage: body.welcomeMessage,
      buttonText: body.buttonText,
      style: body.style as WhatsAppWidgetConfig['style'],
      showBadge: body.showBadge,
      badgeText: body.badgeText,
      showOnMobile: body.showOnMobile,
      showOnDesktop: body.showOnDesktop,
      workingHours: body.workingHours,
    })

    // Generate direct link as well
    const directLink = generateWhatsAppLink(
      phoneValidation.formatted!,
      body.welcomeMessage
    )

    return NextResponse.json({
      success: true,
      widget: {
        html: widget.html,
        css: widget.css,
        js: widget.js,
        snippet: widget.snippet,
        minified: widget.minified,
      },
      directLink,
      phone: {
        original: body.phoneNumber,
        formatted: phoneValidation.formatted,
        country: phoneValidation.country,
      },
    })
  } catch (error) {
    console.error('[API] WhatsApp widget generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate widget',
          messageAr: 'فشل إنشاء الويدجت',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/widgets/whatsapp?phone=+96512345678
 * Quick link generation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const message = searchParams.get('message')

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PHONE',
            message: 'Phone parameter is required',
            messageAr: 'معامل الهاتف مطلوب',
          },
        },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhoneNumber(phone)

    if (!phoneValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PHONE',
            message: phoneValidation.error,
            messageAr: phoneValidation.errorAr,
          },
        },
        { status: 400 }
      )
    }

    const link = generateWhatsAppLink(
      phoneValidation.formatted!,
      message || undefined
    )

    return NextResponse.json({
      success: true,
      link,
      phone: {
        formatted: phoneValidation.formatted,
        country: phoneValidation.country,
      },
    })
  } catch (error) {
    console.error('[API] WhatsApp link generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate link',
          messageAr: 'فشل إنشاء الرابط',
        },
      },
      { status: 500 }
    )
  }
}
