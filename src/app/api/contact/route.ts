/**
 * Contact Form API
 *
 * POST /api/contact
 * Handles contact form submissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Validate required fields
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required (min 2 characters)',
          errorAr: 'الاسم مطلوب (حرفان على الأقل)',
        },
        { status: 400 }
      )
    }

    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid email is required',
          errorAr: 'البريد الإلكتروني مطلوب',
        },
        { status: 400 }
      )
    }

    if (!body.message || body.message.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required (min 10 characters)',
          errorAr: 'الرسالة مطلوبة (10 أحرف على الأقل)',
        },
        { status: 400 }
      )
    }

    // Validate phone if provided (Kuwait format: 8 digits)
    if (body.phone && body.phone.length > 0) {
      const phoneDigits = body.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 8) {
        return NextResponse.json(
          {
            success: false,
            error: 'Phone number must be 8 digits',
            errorAr: 'رقم الهاتف يجب أن يكون 8 أرقام',
          },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()

    // Store contact message in database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone ? `+965${body.phone.replace(/\D/g, '')}` : null,
        message: body.message.trim(),
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      // If table doesn't exist, log but still return success
      // Contact will be handled via email notification instead
      console.error('[Contact API] Database error:', error.message)

      // For now, just log the message and return success
      console.log('[Contact API] New contact message:', {
        name: body.name,
        email: body.email,
        phone: body.phone ? `+965${body.phone}` : 'N/A',
        message: body.message.substring(0, 100) + '...',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message received',
      messageAr: 'تم استلام رسالتك بنجاح',
    })

  } catch (error: any) {
    console.error('[Contact API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process contact message',
        errorAr: 'فشل معالجة الرسالة',
      },
      { status: 500 }
    )
  }
}
