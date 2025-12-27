/**
 * Admin Dashboard Generation API
 * POST /api/admin-dashboard/generate
 *
 * Manually trigger admin dashboard generation for a project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dashboardGenerator } from '@/lib/admin-dashboard/generator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Get user from auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate dashboard
    const config = await dashboardGenerator.generate(projectId, user.id)

    return NextResponse.json({
      success: true,
      dashboardUrl: config.dashboardUrl,
      credentials: config.credentials,
      features: config.features,
      pages: config.pages,
    })
  } catch (error: any) {
    console.error('Dashboard generation API error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
