/**
 * Publish API Route
 *
 * POST /api/projects/[projectId]/publish - Publish project to Vercel
 * GET /api/projects/[projectId]/publish - Get deployment status
 *
 * Costs 1 credit per deployment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deployProject, getDeploymentStatus } from '@/lib/vercel/deployer'
import { deductCredits } from '@/lib/billing/credit-service'

// Credit cost for deployment
const PUBLISH_CREDIT_COST = 1.0

interface PublishRequestBody {
  subdomain?: string
  customDomain?: string
}

/**
 * POST /api/projects/[projectId]/publish
 * Publish a project to production
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
        { error: 'لا يوجد كود لنشره. قم بإنشاء الموقع أولاً.', code: 'NO_CODE' },
        { status: 400 }
      )
    }

    // Check user credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < PUBLISH_CREDIT_COST) {
      return NextResponse.json(
        {
          error: `رصيدك غير كافٍ. تحتاج ${PUBLISH_CREDIT_COST} رصيد للنشر.`,
          code: 'INSUFFICIENT_CREDITS',
          required: PUBLISH_CREDIT_COST,
          available: profile?.credits || 0
        },
        { status: 402 }
      )
    }

    // Parse request body
    const body: PublishRequestBody = await request.json().catch(() => ({}))

    // Generate subdomain from project name and ID
    const subdomain = body.subdomain || generateSubdomain(project.name, projectId)

    // Deploy to Vercel
    const result = await deployProject({
      projectId,
      projectName: project.name,
      subdomain,
      htmlContent: project.generated_code,
      customDomain: body.customDomain,
      isPreview: false
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'فشل النشر', code: 'DEPLOYMENT_FAILED' },
        { status: 500 }
      )
    }

    // Deduct credits
    await deductCredits(user.id, { operation_type: 'deploy' })

    // Update project with deployment info
    await supabase
      .from('projects')
      .update({
        status: 'deployed',
        deployment_url: result.url,
        deployment_id: result.deploymentId,
        subdomain: subdomain,
        custom_domain: body.customDomain || null,
        deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    // Log deployment (ignore errors)
    try {
      await supabase.from('deployment_logs').insert({
        project_id: projectId,
        user_id: user.id,
        deployment_id: result.deploymentId,
        status: 'success',
        url: result.url,
        subdomain,
        custom_domain: body.customDomain || null,
        credits_used: PUBLISH_CREDIT_COST
      })
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json({
      success: true,
      deploymentId: result.deploymentId,
      url: result.url,
      subdomain,
      customDomainStatus: result.customDomainStatus,
      creditsUsed: PUBLISH_CREDIT_COST
    })

  } catch (error: any) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء النشر', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/[projectId]/publish
 * Get current deployment status
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

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('deployment_id, deployment_url, subdomain, custom_domain, status, deployed_at')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // If no deployment, return empty status
    if (!project.deployment_id) {
      return NextResponse.json({
        deployed: false,
        status: 'not_deployed'
      })
    }

    // Get live deployment status from Vercel
    const status = await getDeploymentStatus(project.deployment_id)

    return NextResponse.json({
      deployed: true,
      deploymentId: project.deployment_id,
      url: project.deployment_url,
      subdomain: project.subdomain,
      customDomain: project.custom_domain,
      status: status.state,
      deployedAt: project.deployed_at,
      isLive: status.state === 'READY',
      error: status.error
    })

  } catch (error: any) {
    console.error('Get publish status error:', error)
    return NextResponse.json(
      { error: error.message || 'حدث خطأ', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * Helper to generate subdomain from project name
 */
function generateSubdomain(projectName: string, projectId: string): string {
  const cleaned = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)

  const idSuffix = projectId.slice(0, 6)
  return `${cleaned}-${idSuffix}`
}
