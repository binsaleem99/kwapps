/**
 * Preview API Route
 *
 * POST /api/projects/[projectId]/preview - Create temporary preview deployment
 *
 * Free preview deployments with 24h expiry
 * No credit cost
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deployProject, deleteDeployment } from '@/lib/vercel/deployer'

// Preview expiry time (24 hours)
const PREVIEW_EXPIRY_MS = 24 * 60 * 60 * 1000

/**
 * POST /api/projects/[projectId]/preview
 * Create a temporary preview deployment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get project with generated code
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check if project has generated code
    if (!project.generated_code) {
      return NextResponse.json(
        { error: 'لا يوجد كود للمعاينة. قم بإنشاء الموقع أولاً.', code: 'NO_CODE' },
        { status: 400 }
      )
    }

    // Check for existing preview and delete if expired
    if (project.preview_deployment_id && project.preview_expires_at) {
      const expiresAt = new Date(project.preview_expires_at)
      if (expiresAt > new Date()) {
        // Existing preview still valid
        return NextResponse.json({
          success: true,
          previewUrl: project.preview_url,
          deploymentId: project.preview_deployment_id,
          expiresAt: project.preview_expires_at,
          isExisting: true
        })
      } else {
        // Delete expired preview
        try {
          await deleteDeployment(project.preview_deployment_id)
        } catch (e) {
          // Ignore deletion errors
        }
      }
    }

    // Generate unique preview subdomain
    const previewSubdomain = `preview-${projectId.slice(0, 8)}-${Date.now().toString(36)}`

    // Deploy preview
    const result = await deployProject({
      projectId,
      projectName: `${project.name} (معاينة)`,
      subdomain: previewSubdomain,
      htmlContent: project.generated_code,
      isPreview: true
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'فشل إنشاء المعاينة', code: 'PREVIEW_FAILED' },
        { status: 500 }
      )
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + PREVIEW_EXPIRY_MS).toISOString()

    // Update project with preview info
    await supabase
      .from('projects')
      .update({
        preview_url: result.url,
        preview_deployment_id: result.deploymentId,
        preview_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    // Schedule preview deletion (in production, use a background job)
    // For now, we'll clean up on next preview creation

    return NextResponse.json({
      success: true,
      previewUrl: result.url,
      deploymentId: result.deploymentId,
      expiresAt,
      expiresIn: PREVIEW_EXPIRY_MS,
      creditsUsed: 0 // Preview is free
    })

  } catch (error: any) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء المعاينة', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/[projectId]/preview
 * Get current preview status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get project preview info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('preview_url, preview_deployment_id, preview_expires_at')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check if preview exists and is not expired
    if (!project.preview_deployment_id || !project.preview_expires_at) {
      return NextResponse.json({
        hasPreview: false
      })
    }

    const expiresAt = new Date(project.preview_expires_at)
    const isExpired = expiresAt <= new Date()

    if (isExpired) {
      return NextResponse.json({
        hasPreview: false,
        expired: true
      })
    }

    return NextResponse.json({
      hasPreview: true,
      previewUrl: project.preview_url,
      deploymentId: project.preview_deployment_id,
      expiresAt: project.preview_expires_at,
      remainingMs: expiresAt.getTime() - Date.now()
    })

  } catch (error: any) {
    console.error('Get preview status error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]/preview
 * Delete preview deployment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Get project preview info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('preview_deployment_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete preview if exists
    if (project.preview_deployment_id) {
      try {
        await deleteDeployment(project.preview_deployment_id)
      } catch (e) {
        // Ignore deletion errors from Vercel
      }

      // Clear preview info from project
      await supabase
        .from('projects')
        .update({
          preview_url: null,
          preview_deployment_id: null,
          preview_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    console.error('Delete preview error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
