// ==============================================
// KW APPS - Project Admin Dashboard API
// ==============================================
// POST /api/projects/[projectId]/admin - Generate admin dashboard
// GET /api/projects/[projectId]/admin - Get admin config
// PUT /api/projects/[projectId]/admin - Update admin config
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeProjectSchema, type ProjectSchema } from '@/lib/admin-generator/schema-analyzer'
import { generateAdminDashboard, type GeneratedDashboard } from '@/lib/admin-generator/dashboard-generator'

interface RouteParams {
  params: Promise<{ projectId: string }>
}

/**
 * POST - Generate admin dashboard for a project
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Get project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, user_id, generated_code, status')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', errorAr: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    if (project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Check if project has generated code
    if (!project.generated_code) {
      return NextResponse.json(
        { error: 'No code generated yet', errorAr: 'لم يتم إنشاء كود بعد' },
        { status: 400 }
      )
    }

    // Analyze the generated code to detect content types
    const schema = await analyzeProjectSchema(projectId, project.generated_code)

    // Generate admin dashboard components
    const dashboard = generateAdminDashboard(
      projectId,
      project.name || 'مشروع',
      schema
    )

    // Save admin config to database
    const { error: configError } = await supabase
      .from('admin_dashboard_config')
      .upsert(
        {
          project_id: projectId,
          schema: schema as unknown as Record<string, unknown>,
          enabled_sections: schema.sections.map(s => s.type),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' }
      )

    if (configError) {
      console.error('Config save error:', configError)
      // Continue anyway - config save is not critical
    }

    return NextResponse.json({
      success: true,
      projectId,
      schema,
      dashboard: {
        summary: dashboard.summary,
        sectionsGenerated: Object.keys(dashboard.sectionComponents),
        apiRoutesGenerated: Object.keys(dashboard.apiRoutes),
      },
      message: 'تم إنشاء لوحة التحكم بنجاح',
    })
  } catch (error) {
    console.error('Admin generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
        errorAr: 'فشل في إنشاء لوحة التحكم',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Get admin dashboard configuration
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Get project with admin config
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        user_id,
        generated_code,
        status,
        admin_config:admin_dashboard_config(
          schema,
          theme,
          enabled_sections,
          created_at,
          updated_at
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', errorAr: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    if (project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 403 }
      )
    }

    // If no admin config exists, analyze and create one
    let adminConfig = Array.isArray(project.admin_config)
      ? project.admin_config[0]
      : project.admin_config

    if (!adminConfig && project.generated_code) {
      const schema = await analyzeProjectSchema(projectId, project.generated_code)

      // Save new config
      const { data: newConfig } = await supabase
        .from('admin_dashboard_config')
        .upsert(
          {
            project_id: projectId,
            schema: schema as unknown as Record<string, unknown>,
            enabled_sections: schema.sections.map(s => s.type),
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single()

      adminConfig = newConfig
    }

    return NextResponse.json({
      projectId,
      projectName: project.name,
      hasCode: !!project.generated_code,
      status: project.status,
      adminConfig: adminConfig || null,
      adminUrl: `/admin/${projectId}`,
    })
  } catch (error) {
    console.error('Get admin config error:', error)
    return NextResponse.json(
      { error: 'Internal server error', errorAr: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update admin dashboard configuration
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (!project || project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Update config
    const { theme, enabled_sections } = body

    const { data: updatedConfig, error: updateError } = await supabase
      .from('admin_dashboard_config')
      .update({
        ...(theme && { theme }),
        ...(enabled_sections && { enabled_sections }),
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: 'تم تحديث الإعدادات بنجاح',
    })
  } catch (error) {
    console.error('Update admin config error:', error)
    return NextResponse.json(
      { error: 'Update failed', errorAr: 'فشل في تحديث الإعدادات' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Disable admin dashboard for a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 401 }
      )
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (!project || project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', errorAr: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Delete admin config
    await supabase
      .from('admin_dashboard_config')
      .delete()
      .eq('project_id', projectId)

    return NextResponse.json({
      success: true,
      message: 'تم تعطيل لوحة التحكم',
    })
  } catch (error) {
    console.error('Delete admin config error:', error)
    return NextResponse.json(
      { error: 'Delete failed', errorAr: 'فشل في الحذف' },
      { status: 500 }
    )
  }
}
