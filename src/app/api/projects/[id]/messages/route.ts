import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول' },
        { status: 401 }
      )
    }

    const projectId = params.id

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود' },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول لهذا المشروع' },
        { status: 403 }
      )
    }

    // Fetch messages for this project
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, role, content, tokens_used, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw messagesError
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    })
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب الرسائل',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
