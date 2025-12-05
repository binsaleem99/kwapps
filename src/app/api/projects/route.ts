import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/projects
 * Fetch all projects for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Fetch all projects for this user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json(
        { error: 'فشل جلب المشاريع', errorEn: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      projects: projects || [],
    })
  } catch (error: any) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب المشاريع',
        errorEn: 'Error fetching projects',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Parse request body
    const body = await req.json()
    const { name, description, template_id } = body

    // Generate default name if not provided
    const projectName = name || `مشروع ${new Date().toLocaleDateString('ar-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`

    // Create new project
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName,
        description: description || null,
        template_id: template_id || null,
        status: 'draft',
        active_version: 1,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating project:', createError)
      return NextResponse.json(
        { error: 'فشل إنشاء المشروع', errorEn: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error: any) {
    console.error('Error in POST /api/projects:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء إنشاء المشروع',
        errorEn: 'Error creating project',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
