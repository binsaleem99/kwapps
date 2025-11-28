/**
 * Deployment API Route
 *
 * POST /api/deploy - Deploy a project to Vercel
 * GET /api/deploy?id={deploymentId} - Get deployment status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVercelClient } from '@/lib/vercel/client'
import { transformReactToHTML, validateReactCode } from '@/lib/deploy/transform-code'

/**
 * POST /api/deploy
 *
 * Deploy a user project to Vercel
 *
 * Request Body:
 * {
 *   projectId: string - Project UUID
 *   subdomain: string - Desired subdomain (e.g., "my-restaurant")
 * }
 *
 * Response:
 * {
 *   success: true,
 *   deploymentId: string,
 *   url: string,
 *   vercelUrl: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ====================================================================
    // 1. AUTHENTICATION
    // ====================================================================
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // ====================================================================
    // 2. PARSE REQUEST
    // ====================================================================
    const body = await request.json()
    const { projectId, subdomain } = body

    if (!projectId || !subdomain) {
      return NextResponse.json(
        { error: 'معرف المشروع والمجال الفرعي مطلوبان' },
        { status: 400 }
      )
    }

    // ====================================================================
    // 3. VALIDATE SUBDOMAIN FORMAT
    // ====================================================================
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        {
          error: 'المجال الفرعي غير صالح. استخدم أحرف صغيرة وأرقام وشرطات فقط',
          example: 'my-restaurant-123'
        },
        { status: 400 }
      )
    }

    // Check length
    if (subdomain.length < 3 || subdomain.length > 63) {
      return NextResponse.json(
        { error: 'يجب أن يكون المجال الفرعي بين 3 و 63 حرفاً' },
        { status: 400 }
      )
    }

    // ====================================================================
    // 4. CHECK IF SUBDOMAIN ALREADY TAKEN
    // ====================================================================
    const { data: existingDeployment } = await supabase
      .from('deployments')
      .select('id, deployed_url')
      .eq('subdomain', subdomain)
      .maybeSingle()

    if (existingDeployment) {
      return NextResponse.json(
        {
          error: 'المجال الفرعي محجوز بالفعل',
          suggestion: `جرب: ${subdomain}-${Math.floor(Math.random() * 1000)}`
        },
        { status: 409 }
      )
    }

    // ====================================================================
    // 5. GET PROJECT AND VERIFY OWNERSHIP
    // ====================================================================
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, generated_code, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'المشروع غير موجود أو ليس لديك صلاحية الوصول إليه' },
        { status: 404 }
      )
    }

    if (!project.generated_code) {
      return NextResponse.json(
        { error: 'لم يتم إنشاء كود بعد. قم بإنشاء التطبيق أولاً باستخدام الذكاء الاصطناعي' },
        { status: 400 }
      )
    }

    // ====================================================================
    // 6. VALIDATE CODE
    // ====================================================================
    const validation = validateReactCode(project.generated_code)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `كود غير صالح: ${validation.error}` },
        { status: 400 }
      )
    }

    // ====================================================================
    // 7. CHECK USER PLAN (DEPLOYMENTS REQUIRE BUILDER OR PRO)
    // ====================================================================
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle()

    const userPlan = userData?.plan || 'free'

    if (userPlan !== 'pro' && userPlan !== 'builder') {
      return NextResponse.json(
        {
          error: 'النشر يتطلب خطة Builder أو Pro',
          currentPlan: userPlan,
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }

    // ====================================================================
    // 8. CREATE DEPLOYMENT RECORD
    // ====================================================================
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        user_id: user.id,
        project_id: projectId,
        subdomain,
        status: 'pending'
      })
      .select()
      .single()

    if (deploymentError) {
      console.error('Failed to create deployment record:', deploymentError)
      return NextResponse.json(
        { error: 'فشل إنشاء سجل النشر' },
        { status: 500 }
      )
    }

    // ====================================================================
    // 9. TRANSFORM CODE TO HTML
    // ====================================================================
    let htmlContent: string
    try {
      htmlContent = transformReactToHTML(
        project.generated_code,
        project.name
      )
    } catch (transformError: any) {
      // Update deployment as failed
      await supabase
        .from('deployments')
        .update({
          status: 'failed',
          error_message: `فشل تحويل الكود: ${transformError.message}`
        })
        .eq('id', deployment.id)

      return NextResponse.json(
        { error: `فشل تحويل الكود: ${transformError.message}` },
        { status: 500 }
      )
    }

    // ====================================================================
    // 10. DEPLOY TO VERCEL
    // ====================================================================
    try {
      const vercelClient = createVercelClient()

      // Update status: building
      await supabase
        .from('deployments')
        .update({ status: 'building' })
        .eq('id', deployment.id)

      // Create Vercel deployment
      console.log(`Creating Vercel deployment for subdomain: ${subdomain}`)
      const vercelDeployment = await vercelClient.deployStatic(
        subdomain,
        htmlContent,
        project.name
      )

      console.log(`Vercel deployment created: ${vercelDeployment.id}`)

      // Update status: deploying
      await supabase
        .from('deployments')
        .update({
          status: 'deploying',
          vercel_deployment_id: vercelDeployment.id
        })
        .eq('id', deployment.id)

      // Wait for deployment to be ready (max 3 minutes)
      console.log('Waiting for deployment to be ready...')
      const readyDeployment = await vercelClient.waitForReady(
        vercelDeployment.id,
        180000 // 3 minutes
      )

      console.log(`Deployment ready: ${readyDeployment.url}`)

      // Final deployed URL
      const deployedUrl = `https://${subdomain}.vercel.app`

      // Update status: ready
      await supabase
        .from('deployments')
        .update({
          status: 'ready',
          deployed_url: deployedUrl,
          deployed_at: new Date().toISOString()
        })
        .eq('id', deployment.id)

      // Also update project table
      await supabase
        .from('projects')
        .update({ deployed_url: deployedUrl })
        .eq('id', projectId)

      // ====================================================================
      // 11. SUCCESS RESPONSE
      // ====================================================================
      return NextResponse.json({
        success: true,
        deploymentId: deployment.id,
        url: deployedUrl,
        vercelUrl: readyDeployment.url,
        message: 'تم النشر بنجاح!'
      })

    } catch (vercelError: any) {
      console.error('Vercel deployment error:', vercelError)

      // Mark deployment as failed
      await supabase
        .from('deployments')
        .update({
          status: 'failed',
          error_message: vercelError.message,
          build_logs: vercelError.stack || ''
        })
        .eq('id', deployment.id)

      return NextResponse.json(
        {
          error: `فشل النشر: ${vercelError.message}`,
          details: process.env.NODE_ENV === 'development' ? vercelError.stack : undefined
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء النشر',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/deploy?id={deploymentId}
 *
 * Get deployment status
 *
 * Query Params:
 * - id: Deployment UUID
 *
 * Response:
 * {
 *   id: string,
 *   status: string,
 *   deployed_url: string,
 *   error_message?: string,
 *   ...
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const deploymentId = searchParams.get('id')

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'معرف النشر مطلوب' },
        { status: 400 }
      )
    }

    // Get deployment
    const { data: deployment, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .maybeSingle()

    if (error || !deployment) {
      return NextResponse.json(
        { error: 'النشر غير موجود' },
        { status: 404 }
      )
    }

    // Verify user owns this deployment
    const { data: { user } } = await supabase.auth.getUser()

    if (user && deployment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      )
    }

    return NextResponse.json(deployment)

  } catch (error: any) {
    console.error('Error fetching deployment:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب معلومات النشر' },
      { status: 500 }
    )
  }
}
