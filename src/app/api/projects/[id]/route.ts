import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: projectId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول', errorEn: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json(
        { error: 'فشل جلب المشروع', errorEn: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    if (!project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', errorEn: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب المشروع',
        errorEn: 'Error fetching project',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: projectId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول', errorEn: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify project belongs to user
    const { data: existingProject, error: verifyError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .maybeSingle()

    if (verifyError || !existingProject) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', errorEn: 'Project not found' },
        { status: 404 }
      )
    }

    if (existingProject.user_id !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول لهذا المشروع', errorEn: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { name, description, generated_code, status, deployed_url } = body

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (generated_code !== undefined) updateData.generated_code = generated_code
    if (status !== undefined) updateData.status = status
    if (deployed_url !== undefined) updateData.deployed_url = deployed_url

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return NextResponse.json(
        { error: 'فشل تحديث المشروع', errorEn: 'Failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/projects/[id]:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تحديث المشروع',
        errorEn: 'Error updating project',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: projectId } = await params

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول', errorEn: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify project belongs to user
    const { data: existingProject, error: verifyError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .maybeSingle()

    if (verifyError || !existingProject) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', errorEn: 'Project not found' },
        { status: 404 }
      )
    }

    if (existingProject.user_id !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول لهذا المشروع', errorEn: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete related messages first
    await supabase.from('messages').delete().eq('project_id', projectId)

    // Delete project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return NextResponse.json(
        { error: 'فشل حذف المشروع', errorEn: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف المشروع بنجاح',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء حذف المشروع',
        errorEn: 'Error deleting project',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
