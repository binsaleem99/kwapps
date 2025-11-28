/**
 * Vercel API Client
 *
 * Wrapper for Vercel REST API to deploy user-generated websites
 * Docs: https://vercel.com/docs/rest-api
 */

export interface VercelDeployment {
  id: string
  url: string
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  aliasAssigned: boolean
  createdAt: number
}

export interface VercelDeploymentFile {
  file: string
  data: string
  encoding?: 'utf-8' | 'base64'
}

export class VercelClient {
  private apiToken: string
  private teamId?: string
  private baseUrl = 'https://api.vercel.com'

  constructor() {
    this.apiToken = process.env.VERCEL_API_TOKEN!
    this.teamId = process.env.VERCEL_TEAM_ID

    if (!this.apiToken) {
      throw new Error('VERCEL_API_TOKEN is required')
    }
  }

  /**
   * Deploy static HTML to Vercel
   * Creates a new deployment with the provided files
   *
   * @param subdomain - Project name (used as subdomain)
   * @param htmlContent - HTML content to deploy
   * @param projectName - Display name for the project
   * @returns Deployment information including URL
   */
  async deployStatic(
    subdomain: string,
    htmlContent: string,
    projectName: string
  ): Promise<VercelDeployment> {
    const files: VercelDeploymentFile[] = [
      {
        file: 'index.html',
        data: htmlContent,
        encoding: 'utf-8'
      }
    ]

    const body: any = {
      name: subdomain,
      files,
      projectSettings: {
        framework: null // Static HTML (no framework)
      },
      target: 'production',
      gitSource: undefined // No git integration
    }

    // Add team ID if configured
    const queryParams = this.teamId ? `?teamId=${this.teamId}` : ''

    const response = await fetch(`${this.baseUrl}/v13/deployments${queryParams}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Vercel deployment failed: ${error.error?.message || error.message || 'Unknown error'}`)
    }

    const deployment = await response.json()

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState || 'QUEUED',
      aliasAssigned: deployment.aliasAssigned || false,
      createdAt: deployment.createdAt || Date.now()
    }
  }

  /**
   * Wait for deployment to be ready
   * Polls the deployment status every 3 seconds
   *
   * @param deploymentId - Vercel deployment ID
   * @param maxWaitMs - Maximum time to wait in milliseconds (default: 180000 = 3 minutes)
   * @returns Deployment information when ready
   * @throws Error if deployment fails or times out
   */
  async waitForReady(
    deploymentId: string,
    maxWaitMs: number = 180000
  ): Promise<VercelDeployment> {
    const startTime = Date.now()
    const pollInterval = 3000 // 3 seconds

    while (Date.now() - startTime < maxWaitMs) {
      const deployment = await this.getDeployment(deploymentId)

      if (deployment.readyState === 'READY') {
        return deployment
      }

      if (deployment.readyState === 'ERROR' || deployment.readyState === 'CANCELED') {
        throw new Error(`Deployment failed with state: ${deployment.readyState}`)
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Deployment timeout after ${maxWaitMs / 1000} seconds`)
  }

  /**
   * Get deployment status
   *
   * @param deploymentId - Vercel deployment ID
   * @returns Current deployment information
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const queryParams = this.teamId ? `?teamId=${this.teamId}` : ''

    const response = await fetch(
      `${this.baseUrl}/v13/deployments/${deploymentId}${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get deployment: ${error.error?.message || error.message || 'Unknown error'}`)
    }

    const deployment = await response.json()

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState || 'QUEUED',
      aliasAssigned: deployment.aliasAssigned || false,
      createdAt: deployment.createdAt || Date.now()
    }
  }

  /**
   * Delete a deployment
   * Useful for cleanup or failed deployments
   *
   * @param deploymentId - Vercel deployment ID
   */
  async deleteDeployment(deploymentId: string): Promise<void> {
    const queryParams = this.teamId ? `?teamId=${this.teamId}` : ''

    const response = await fetch(
      `${this.baseUrl}/v13/deployments/${deploymentId}${queryParams}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to delete deployment: ${error.error?.message || error.message || 'Unknown error'}`)
    }
  }

  /**
   * List all deployments for a project
   *
   * @param projectName - Project name (subdomain)
   * @param limit - Maximum number of deployments to return
   * @returns Array of deployments
   */
  async listDeployments(
    projectName?: string,
    limit: number = 20
  ): Promise<VercelDeployment[]> {
    const params = new URLSearchParams()
    if (this.teamId) params.append('teamId', this.teamId)
    if (projectName) params.append('projectId', projectName)
    params.append('limit', limit.toString())

    const response = await fetch(
      `${this.baseUrl}/v6/deployments?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to list deployments: ${error.error?.message || error.message || 'Unknown error'}`)
    }

    const data = await response.json()

    return data.deployments.map((d: any) => ({
      id: d.id,
      url: d.url,
      readyState: d.readyState || d.state || 'QUEUED',
      aliasAssigned: d.aliasAssigned || false,
      createdAt: d.createdAt || d.created || Date.now()
    }))
  }
}

/**
 * Create a new Vercel client instance
 * Validates environment variables
 */
export function createVercelClient(): VercelClient {
  return new VercelClient()
}
