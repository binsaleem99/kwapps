// ==============================================
// KW APPS - Admin Content CRUD API
// ==============================================
// GET /api/projects/[projectId]/admin/content/[contentType]
// POST /api/projects/[projectId]/admin/content/[contentType]
// PUT /api/projects/[projectId]/admin/content/[contentType]
// DELETE /api/projects/[projectId]/admin/content/[contentType]
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Valid content types
const VALID_CONTENT_TYPES = [
  'products',
  'services',
  'pages',
  'forms',
  'testimonials',
  'team',
  'gallery',
  'pricing',
  'faq',
  'blog',
  'contact',
  'users',
] as const

type ContentType = (typeof VALID_CONTENT_TYPES)[number]

interface RouteParams {
  params: Promise<{ projectId: string; contentType: string }>
}

/**
 * Validate content type
 */
function isValidContentType(type: string): type is ContentType {
  return VALID_CONTENT_TYPES.includes(type as ContentType)
}

/**
 * Get table name for content type
 */
function getTableName(contentType: ContentType): string {
  return `admin_${contentType}`
}

/**
 * GET - Fetch all items of a content type
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, contentType } = await params
    const supabase = await createClient()

    // Validate content type
    if (!isValidContentType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type', errorAr: 'نوع المحتوى غير صالح' },
        { status: 400 }
      )
    }

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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false
    const search = searchParams.get('search') || ''

    const tableName = getTableName(contentType)

    // Build query
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order(sortBy, { ascending: sortOrder })
      .range((page - 1) * limit, page * limit - 1)

    // Add search if provided
    if (search) {
      // Search in common text fields
      query = query.or(
        `name.ilike.%${search}%,name_ar.ilike.%${search}%,title.ilike.%${search}%,title_ar.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          limit,
          message: 'الجدول غير موجود - قم بإنشاء لوحة التحكم أولاً',
        })
      }
      throw error
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit,
    })
  } catch (error) {
    console.error('GET content error:', error)
    return NextResponse.json(
      { error: 'Fetch failed', errorAr: 'فشل في جلب البيانات' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new item
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, contentType } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Validate content type
    if (!isValidContentType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type', errorAr: 'نوع المحتوى غير صالح' },
        { status: 400 }
      )
    }

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

    const tableName = getTableName(contentType)

    // Remove id from body if provided (will be auto-generated)
    const { id, ...itemData } = body

    // Insert new item
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        ...itemData,
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          {
            error: 'Table not found. Run migrations first.',
            errorAr: 'الجدول غير موجود. قم بتنفيذ التحديثات أولاً',
          },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      item: data,
      message: 'تم إنشاء العنصر بنجاح',
    })
  } catch (error) {
    console.error('POST content error:', error)
    return NextResponse.json(
      { error: 'Create failed', errorAr: 'فشل في إنشاء العنصر' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update existing item
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, contentType } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Validate content type
    if (!isValidContentType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type', errorAr: 'نوع المحتوى غير صالح' },
        { status: 400 }
      )
    }

    // Validate item ID
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID required', errorAr: 'معرف العنصر مطلوب' },
        { status: 400 }
      )
    }

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

    const tableName = getTableName(contentType)

    // Update item
    const { data, error } = await supabase
      .from(tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('project_id', projectId) // Ensure item belongs to project
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Item not found', errorAr: 'العنصر غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: data,
      message: 'تم تحديث العنصر بنجاح',
    })
  } catch (error) {
    console.error('PUT content error:', error)
    return NextResponse.json(
      { error: 'Update failed', errorAr: 'فشل في تحديث العنصر' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Partial update (e.g., toggle boolean fields)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // PATCH behaves the same as PUT for this API
  return PUT(request, { params })
}

/**
 * DELETE - Remove item
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, contentType } = await params
    const supabase = await createClient()

    // Validate content type
    if (!isValidContentType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type', errorAr: 'نوع المحتوى غير صالح' },
        { status: 400 }
      )
    }

    // Get item ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID required', errorAr: 'معرف العنصر مطلوب' },
        { status: 400 }
      )
    }

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

    const tableName = getTableName(contentType)

    // Delete item
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('project_id', projectId) // Ensure item belongs to project

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'تم حذف العنصر بنجاح',
    })
  } catch (error) {
    console.error('DELETE content error:', error)
    return NextResponse.json(
      { error: 'Delete failed', errorAr: 'فشل في حذف العنصر' },
      { status: 500 }
    )
  }
}
