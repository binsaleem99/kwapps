/**
 * Project Widgets API
 *
 * GET    /api/widgets/[projectId] - List all widgets for a project
 * POST   /api/widgets/[projectId] - Create a new widget
 * PUT    /api/widgets/[projectId] - Update a widget
 * DELETE /api/widgets/[projectId] - Delete a widget
 *
 * Features:
 * - CRUD operations for project widgets
 * - Generates embeddable code on creation/update
 * - Validates widget configuration
 * - Arabic error messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateWidget,
  generateMultipleWidgets,
  validatePhoneNumber,
} from '@/lib/widgets'
import type {
  WidgetType,
  AnyWidgetConfig,
  ProjectWidget,
  WhatsAppWidgetConfig,
} from '@/lib/widgets'

interface RouteContext {
  params: Promise<{ projectId: string }>
}

// ============================================
// GET - List all widgets for a project
// ============================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
            messageAr: 'المشروع غير موجود',
          },
        },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المشروع',
          },
        },
        { status: 403 }
      )
    }

    // Get all widgets for the project
    const { data: widgets, error: widgetsError } = await supabase
      .from('project_widgets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (widgetsError) {
      console.error('[API] Widgets fetch error:', widgetsError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch widgets',
            messageAr: 'فشل جلب الويدجت',
          },
        },
        { status: 500 }
      )
    }

    // Generate combined snippet for all active widgets
    const activeWidgets = (widgets || []).filter((w) => w.is_active)
    let combinedSnippet = null

    if (activeWidgets.length > 0) {
      const widgetConfigs = activeWidgets.map((w) => ({
        type: w.widget_type as WidgetType,
        config: w.config as AnyWidgetConfig,
      }))

      try {
        const combined = generateMultipleWidgets(widgetConfigs)
        combinedSnippet = {
          snippet: combined.snippet,
          minified: combined.minified,
        }
      } catch (err) {
        console.error('[API] Combined snippet generation error:', err)
      }
    }

    return NextResponse.json({
      success: true,
      widgets: widgets || [],
      combinedSnippet,
      count: widgets?.length || 0,
    })
  } catch (error) {
    console.error('[API] Widget list error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch widgets',
          messageAr: 'فشل جلب الويدجت',
        },
      },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create a new widget
// ============================================

interface CreateWidgetRequest {
  widget_type: WidgetType
  config: Partial<AnyWidgetConfig> & { pageId?: string }
  position?: string
  is_active?: boolean
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params
    const supabase = await createClient()
    const body: CreateWidgetRequest = await request.json()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
            messageAr: 'المشروع غير موجود',
          },
        },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
            messageAr: 'ليس لديك صلاحية الوصول لهذا المشروع',
          },
        },
        { status: 403 }
      )
    }

    // Validate widget type
    const validTypes: WidgetType[] = [
      'whatsapp',
      'telegram',
      'instagram',
      'facebook_messenger',
      'custom_chat',
      'callback_request',
    ]

    if (!body.widget_type || !validTypes.includes(body.widget_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid widget type',
            messageAr: 'نوع الويدجت غير صالح',
          },
        },
        { status: 400 }
      )
    }

    // Validate phone number for WhatsApp widget
    if (body.widget_type === 'whatsapp') {
      const waConfig = body.config as Partial<WhatsAppWidgetConfig>
      if (!waConfig.phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_PHONE',
              message: 'Phone number is required for WhatsApp widget',
              messageAr: 'رقم الهاتف مطلوب لويدجت واتساب',
            },
          },
          { status: 400 }
        )
      }

      const phoneValidation = validatePhoneNumber(waConfig.phoneNumber)
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

      // Update config with formatted phone
      body.config = {
        ...body.config,
        phoneNumber: phoneValidation.formatted,
      }
    }

    // Generate widget snippet
    let generatedSnippet = null
    try {
      const generated = generateWidget(body.widget_type, body.config)
      generatedSnippet = {
        snippet: generated.snippet,
        minified: generated.minified,
      }
    } catch (err) {
      console.error('[API] Widget generation error:', err)
    }

    // Insert widget into database
    const { data: widget, error: insertError } = await supabase
      .from('project_widgets')
      .insert({
        project_id: projectId,
        widget_type: body.widget_type,
        config: body.config,
        position: body.position || body.config.style?.position || 'bottom-right',
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[API] Widget insert error:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSERT_FAILED',
            message: 'Failed to create widget',
            messageAr: 'فشل إنشاء الويدجت',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      widget,
      generated: generatedSnippet,
    })
  } catch (error) {
    console.error('[API] Widget create error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: 'Failed to create widget',
          messageAr: 'فشل إنشاء الويدجت',
        },
      },
      { status: 500 }
    )
  }
}

// ============================================
// PUT - Update a widget
// ============================================

interface UpdateWidgetRequest {
  widget_id: string
  config?: Partial<AnyWidgetConfig>
  position?: string
  is_active?: boolean
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params
    const supabase = await createClient()
    const body: UpdateWidgetRequest = await request.json()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    if (!body.widget_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_WIDGET_ID',
            message: 'Widget ID is required',
            messageAr: 'معرف الويدجت مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Get existing widget and verify ownership
    const { data: existingWidget, error: fetchError } = await supabase
      .from('project_widgets')
      .select(`
        *,
        projects!inner (
          user_id
        )
      `)
      .eq('id', body.widget_id)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingWidget) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WIDGET_NOT_FOUND',
            message: 'Widget not found',
            messageAr: 'الويدجت غير موجود',
          },
        },
        { status: 404 }
      )
    }

    if ((existingWidget.projects as any).user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this widget',
            messageAr: 'ليس لديك صلاحية الوصول لهذا الويدجت',
          },
        },
        { status: 403 }
      )
    }

    // Validate phone number if updating WhatsApp widget
    const configWithPhone = body.config as { phoneNumber?: string } | undefined
    if (existingWidget.widget_type === 'whatsapp' && configWithPhone?.phoneNumber) {
      const phoneValidation = validatePhoneNumber(configWithPhone.phoneNumber)
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

      // Update with formatted phone number
      if (body.config) {
        (body.config as { phoneNumber?: string }).phoneNumber = phoneValidation.formatted
      }
    }

    // Build update object
    const updateData: Partial<ProjectWidget> = {
      updated_at: new Date().toISOString(),
    }

    if (body.config) {
      updateData.config = {
        ...(existingWidget.config as object),
        ...body.config,
      } as AnyWidgetConfig
    }

    if (body.position !== undefined) {
      updateData.position = body.position as any
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active
    }

    // Update widget
    const { data: updatedWidget, error: updateError } = await supabase
      .from('project_widgets')
      .update(updateData)
      .eq('id', body.widget_id)
      .select()
      .single()

    if (updateError) {
      console.error('[API] Widget update error:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update widget',
            messageAr: 'فشل تحديث الويدجت',
          },
        },
        { status: 500 }
      )
    }

    // Generate updated snippet
    let generatedSnippet = null
    try {
      const generated = generateWidget(
        updatedWidget.widget_type as WidgetType,
        updatedWidget.config as AnyWidgetConfig
      )
      generatedSnippet = {
        snippet: generated.snippet,
        minified: generated.minified,
      }
    } catch (err) {
      console.error('[API] Widget generation error:', err)
    }

    return NextResponse.json({
      success: true,
      widget: updatedWidget,
      generated: generatedSnippet,
    })
  } catch (error) {
    console.error('[API] Widget update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update widget',
          messageAr: 'فشل تحديث الويدجت',
        },
      },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Delete a widget
// ============================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params
    const { searchParams } = new URL(request.url)
    const widgetId = searchParams.get('widget_id')
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    if (!widgetId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_WIDGET_ID',
            message: 'Widget ID is required',
            messageAr: 'معرف الويدجت مطلوب',
          },
        },
        { status: 400 }
      )
    }

    // Get existing widget and verify ownership
    const { data: existingWidget, error: fetchError } = await supabase
      .from('project_widgets')
      .select(`
        *,
        projects!inner (
          user_id
        )
      `)
      .eq('id', widgetId)
      .eq('project_id', projectId)
      .single()

    if (fetchError || !existingWidget) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WIDGET_NOT_FOUND',
            message: 'Widget not found',
            messageAr: 'الويدجت غير موجود',
          },
        },
        { status: 404 }
      )
    }

    if ((existingWidget.projects as any).user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this widget',
            messageAr: 'ليس لديك صلاحية الوصول لهذا الويدجت',
          },
        },
        { status: 403 }
      )
    }

    // Delete widget
    const { error: deleteError } = await supabase
      .from('project_widgets')
      .delete()
      .eq('id', widgetId)

    if (deleteError) {
      console.error('[API] Widget delete error:', deleteError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete widget',
            messageAr: 'فشل حذف الويدجت',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Widget deleted successfully',
      messageAr: 'تم حذف الويدجت بنجاح',
    })
  } catch (error) {
    console.error('[API] Widget delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete widget',
          messageAr: 'فشل حذف الويدجت',
        },
      },
      { status: 500 }
    )
  }
}
