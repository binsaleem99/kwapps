/**
 * DNS Auto-Configuration Service
 *
 * Automatically configures DNS records when domain is purchased
 * Connects domain to Vercel deployment with SSL
 */

import { createClient } from '@supabase/supabase-js'
import { namecheapClient } from './namecheap-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VercelProject {
  id: string
  name: string
  deploymentUrl: string
}

export class DNSSetupService {
  /**
   * Configure domain DNS for Vercel deployment
   */
  async configureDomainForVercel(
    domain: string,
    projectId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔧 Configuring DNS for ${domain} → project ${projectId}`)

      // 1. Get project's Vercel deployment info
      const { data: project } = await supabase
        .from('projects')
        .select('name, deployed_url, vercel_project_id')
        .eq('id', projectId)
        .single()

      if (!project || !project.deployed_url) {
        throw new Error('Project must be deployed to Vercel first')
      }

      // 2. Set Namecheap DNS records to point to Vercel
      const dnsSuccess = await namecheapClient.setDNSForVercel(domain)

      if (!dnsSuccess) {
        throw new Error('Failed to configure DNS records')
      }

      console.log(`✅ DNS records configured for ${domain}`)

      // 3. Add domain to Vercel project
      const vercelAdded = await this.addDomainToVercel(domain, project.vercel_project_id || project.name)

      if (!vercelAdded) {
        console.warn('Failed to add domain to Vercel, but DNS is configured')
      }

      // 4. Update project with custom domain
      await supabase
        .from('projects')
        .update({
          custom_domain: domain,
          domain_configured_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      // 5. Monitor SSL provisioning (background task)
      await this.monitorSSLProvisioning(domain, projectId)

      console.log(`🎉 Domain ${domain} fully configured`)

      return { success: true }
    } catch (error: any) {
      console.error('DNS configuration error:', error)
      return {
        success: false,
        error: error.message || 'DNS configuration failed',
      }
    }
  }

  /**
   * Add domain to Vercel project via API
   */
  private async addDomainToVercel(
    domain: string,
    vercelProjectId: string
  ): Promise<boolean> {
    try {
      const vercelToken = process.env.VERCEL_TOKEN

      if (!vercelToken) {
        console.warn('VERCEL_TOKEN not set, skipping Vercel domain addition')
        return false
      }

      const response = await fetch(
        `https://api.vercel.com/v9/projects/${vercelProjectId}/domains`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: domain,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Vercel domain addition error:', error)
        return false
      }

      console.log(`✅ Domain ${domain} added to Vercel project ${vercelProjectId}`)
      return true
    } catch (error) {
      console.error('Vercel API error:', error)
      return false
    }
  }

  /**
   * Monitor SSL certificate provisioning
   */
  private async monitorSSLProvisioning(
    domain: string,
    projectId: string
  ): Promise<void> {
    // Schedule SSL check for 5 minutes later
    await supabase.from('scheduled_tasks').insert({
      type: 'ssl_check',
      data: { domain, project_id: projectId },
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
  }

  /**
   * Check SSL certificate status
   */
  async checkSSLStatus(domain: string): Promise<{
    provisioned: boolean
    validUntil?: string
    error?: string
  }> {
    try {
      // Simple check: try to fetch via HTTPS
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        redirect: 'manual',
      })

      return {
        provisioned: response.ok || response.status === 301 || response.status === 302,
      }
    } catch (error) {
      return {
        provisioned: false,
        error: 'SSL not yet provisioned',
      }
    }
  }
}

// Singleton
export const dnsSetupService = new DNSSetupService()
