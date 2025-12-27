/**
 * Admin Dashboard Auto-Generation
 *
 * Automatically generates admin dashboard when project is deployed
 * Triggered by deployment success webhook/event
 */

import { createClient } from '@supabase/supabase-js'
import { dashboardGenerator } from './generator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Auto-generate admin dashboard on project deployment
 */
export async function autoGenerateOnDeploy(projectId: string, userId: string): Promise<void> {
  try {
    console.log(`🎨 Auto-generating admin dashboard for project ${projectId}`)

    // Check if project is deployed
    const { data: project } = await supabase
      .from('projects')
      .select('status, deployed_url')
      .eq('id', projectId)
      .single()

    if (!project || project.status !== 'deployed') {
      console.log('Project not deployed, skipping admin dashboard')
      return
    }

    // Check if dashboard already exists
    const { data: existing } = await supabase
      .from('admin_dashboards')
      .select('id')
      .eq('project_id', projectId)
      .single()

    if (existing) {
      console.log('Admin dashboard already exists, skipping')
      return
    }

    // Generate dashboard
    const config = await dashboardGenerator.generate(projectId, userId)

    console.log(`✅ Admin dashboard generated: ${config.dashboardUrl}`)
    console.log(`📧 Credentials sent to user`)
    console.log(`🔧 Features enabled: ${Object.keys(config.features).filter(k => config.features[k as keyof typeof config.features]).join(', ')}`)

  } catch (error) {
    console.error('Auto-generation failed:', error)
    // Don't throw - deployment should succeed even if dashboard generation fails
  }
}

/**
 * Deployment success webhook handler
 * Call this from Vercel webhook or deployment API
 */
export async function handleDeploymentSuccess(data: {
  projectId: string
  userId: string
  deploymentUrl: string
}): Promise<void> {
  try {
    // Update project status
    await supabase
      .from('projects')
      .update({
        status: 'deployed',
        deployed_url: data.deploymentUrl,
        deployed_at: new Date().toISOString(),
      })
      .eq('id', data.projectId)

    // Trigger admin dashboard generation
    await autoGenerateOnDeploy(data.projectId, data.userId)

    console.log(`✅ Deployment success handled for project ${data.projectId}`)
  } catch (error) {
    console.error('Deployment success handler error:', error)
  }
}
