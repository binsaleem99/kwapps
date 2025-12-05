/**
 * Vercel API Client
 *
 * Enhanced wrapper for Vercel REST API to deploy user-generated websites
 * Supports project management, deployments, domains, and environment variables
 * Docs: https://vercel.com/docs/rest-api
 */

// Deployment ready states
export type DeploymentReadyState = 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'

export interface VercelDeployment {
  id: string
  url: string
  readyState: DeploymentReadyState
  aliasAssigned: boolean
  createdAt: number
  buildingAt?: number
  ready?: number
  alias?: string[]
  meta?: Record<string, string>
}

export interface VercelDeploymentFile {
  file: string
  data: string
  encoding?: 'utf-8' | 'base64'
}

export interface VercelProject {
  id: string
  name: string
  accountId: string
  createdAt: number
  updatedAt: number
  framework?: string | null
  latestDeployments?: VercelDeployment[]
}

export interface VercelDomain {
  name: string
  verified: boolean
  configuredBy?: 'CNAME' | 'A' | 'http'
  gitBranch?: string | null
  redirect?: string | null
  redirectStatusCode?: number | null
  createdAt: number
  updatedAt: number
}

export interface DeploymentLogs {
  id: string
  type: 'stdout' | 'stderr' | 'command'
  text: string
  createdAt: number
  serialNumber: number
}

export interface CreateProjectOptions {
  name: string
  framework?: string | null
  publicSource?: boolean
  gitRepository?: {
    type: 'github' | 'gitlab' | 'bitbucket'
    repo: string
  }
  environmentVariables?: Array<{
    key: string
    value: string
    target: ('production' | 'preview' | 'development')[]
  }>
}

export interface DeployOptions {
  projectName: string
  files: VercelDeploymentFile[]
  target?: 'production' | 'preview'
  meta?: Record<string, string>
  alias?: string[]
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
   * Helper to build query parameters
   */
  private getQueryParams(additionalParams?: Record<string, string>): string {
    const params = new URLSearchParams()
    if (this.teamId) params.append('teamId', this.teamId)
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        params.append(key, value)
      })
    }
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Generic request helper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.error?.message || error.message || `Request failed with status ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // ==================== PROJECT MANAGEMENT ====================

  /**
   * Create a new Vercel project
   */
  async createProject(options: CreateProjectOptions): Promise<VercelProject> {
    const body: any = {
      name: options.name,
      framework: options.framework || null,
      publicSource: options.publicSource ?? false
    }

    if (options.gitRepository) {
      body.gitRepository = options.gitRepository
    }

    if (options.environmentVariables?.length) {
      body.environmentVariables = options.environmentVariables
    }

    return this.request<VercelProject>(
      `/v9/projects${this.getQueryParams()}`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    )
  }

  /**
   * Get project by name or ID
   */
  async getProject(nameOrId: string): Promise<VercelProject | null> {
    try {
      return await this.request<VercelProject>(
        `/v9/projects/${encodeURIComponent(nameOrId)}${this.getQueryParams()}`
      )
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return null
      }
      throw error
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(nameOrId: string): Promise<void> {
    await this.request(
      `/v9/projects/${encodeURIComponent(nameOrId)}${this.getQueryParams()}`,
      { method: 'DELETE' }
    )
  }

  // ==================== DEPLOYMENTS ====================

  /**
   * Create a new deployment with files
   */
  async deploy(options: DeployOptions): Promise<VercelDeployment> {
    const body: any = {
      name: options.projectName,
      files: options.files,
      projectSettings: {
        framework: null // Static HTML
      },
      target: options.target || 'production',
      gitSource: undefined
    }

    if (options.meta) {
      body.meta = options.meta
    }

    const deployment = await this.request<any>(
      `/v13/deployments${this.getQueryParams()}`,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    )

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState || 'QUEUED',
      aliasAssigned: deployment.aliasAssigned || false,
      createdAt: deployment.createdAt || Date.now(),
      alias: deployment.alias || [],
      meta: deployment.meta
    }
  }

  /**
   * Deploy static HTML to Vercel (legacy method for compatibility)
   */
  async deployStatic(
    subdomain: string,
    htmlContent: string,
    projectName: string
  ): Promise<VercelDeployment> {
    return this.deploy({
      projectName: subdomain,
      files: [
        {
          file: 'index.html',
          data: htmlContent,
          encoding: 'utf-8'
        }
      ],
      target: 'production',
      meta: {
        projectName
      }
    })
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const deployment = await this.request<any>(
      `/v13/deployments/${deploymentId}${this.getQueryParams()}`
    )

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState || 'QUEUED',
      aliasAssigned: deployment.aliasAssigned || false,
      createdAt: deployment.createdAt || Date.now(),
      buildingAt: deployment.buildingAt,
      ready: deployment.ready,
      alias: deployment.alias || [],
      meta: deployment.meta
    }
  }

  /**
   * Get deployment status with detailed build info
   */
  async getDeploymentStatus(deploymentId: string): Promise<{
    state: DeploymentReadyState
    url: string | null
    error?: string
    buildProgress?: number
  }> {
    try {
      const deployment = await this.getDeployment(deploymentId)

      let buildProgress = 0
      switch (deployment.readyState) {
        case 'QUEUED':
          buildProgress = 10
          break
        case 'BUILDING':
          buildProgress = 50
          break
        case 'READY':
          buildProgress = 100
          break
        case 'ERROR':
        case 'CANCELED':
          buildProgress = 0
          break
      }

      return {
        state: deployment.readyState,
        url: deployment.readyState === 'READY' ? `https://${deployment.url}` : null,
        buildProgress
      }
    } catch (error: any) {
      return {
        state: 'ERROR',
        url: null,
        error: error.message
      }
    }
  }

  /**
   * Get deployment build logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<DeploymentLogs[]> {
    const response = await this.request<{ logs: any[] }>(
      `/v2/deployments/${deploymentId}/events${this.getQueryParams()}`
    )

    return (response.logs || []).map((log: any) => ({
      id: log.id || String(log.serialNumber),
      type: log.type || 'stdout',
      text: log.text || log.payload || '',
      createdAt: log.date || log.createdAt || Date.now(),
      serialNumber: log.serialNumber || 0
    }))
  }

  /**
   * Wait for deployment to be ready
   */
  async waitForReady(
    deploymentId: string,
    maxWaitMs: number = 180000,
    onProgress?: (status: DeploymentReadyState, progress: number) => void
  ): Promise<VercelDeployment> {
    const startTime = Date.now()
    const pollInterval = 3000 // 3 seconds

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getDeploymentStatus(deploymentId)

      if (onProgress) {
        onProgress(status.state, status.buildProgress || 0)
      }

      if (status.state === 'READY') {
        return this.getDeployment(deploymentId)
      }

      if (status.state === 'ERROR' || status.state === 'CANCELED') {
        throw new Error(`Deployment failed with state: ${status.state}${status.error ? ` - ${status.error}` : ''}`)
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Deployment timeout after ${maxWaitMs / 1000} seconds`)
  }

  /**
   * Delete a deployment
   */
  async deleteDeployment(deploymentId: string): Promise<void> {
    await this.request(
      `/v13/deployments/${deploymentId}${this.getQueryParams()}`,
      { method: 'DELETE' }
    )
  }

  /**
   * List deployments for a project
   */
  async listDeployments(
    projectName?: string,
    limit: number = 20
  ): Promise<VercelDeployment[]> {
    const params: Record<string, string> = { limit: limit.toString() }
    if (projectName) params.projectId = projectName

    const response = await this.request<{ deployments: any[] }>(
      `/v6/deployments${this.getQueryParams(params)}`
    )

    return response.deployments.map((d: any) => ({
      id: d.id,
      url: d.url,
      readyState: d.readyState || d.state || 'QUEUED',
      aliasAssigned: d.aliasAssigned || false,
      createdAt: d.createdAt || d.created || Date.now(),
      alias: d.alias || [],
      meta: d.meta
    }))
  }

  // ==================== DOMAIN MANAGEMENT ====================

  /**
   * Add a domain to a project
   */
  async addDomain(projectNameOrId: string, domain: string): Promise<VercelDomain> {
    const response = await this.request<any>(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/domains${this.getQueryParams()}`,
      {
        method: 'POST',
        body: JSON.stringify({ name: domain })
      }
    )

    return {
      name: response.name,
      verified: response.verified || false,
      configuredBy: response.configuredBy,
      gitBranch: response.gitBranch,
      redirect: response.redirect,
      redirectStatusCode: response.redirectStatusCode,
      createdAt: response.createdAt || Date.now(),
      updatedAt: response.updatedAt || Date.now()
    }
  }

  /**
   * Remove a domain from a project
   */
  async removeDomain(projectNameOrId: string, domain: string): Promise<void> {
    await this.request(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/domains/${encodeURIComponent(domain)}${this.getQueryParams()}`,
      { method: 'DELETE' }
    )
  }

  /**
   * Get all domains for a project
   */
  async getProjectDomains(projectNameOrId: string): Promise<VercelDomain[]> {
    const response = await this.request<{ domains: any[] }>(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/domains${this.getQueryParams()}`
    )

    return (response.domains || []).map((d: any) => ({
      name: d.name,
      verified: d.verified || false,
      configuredBy: d.configuredBy,
      gitBranch: d.gitBranch,
      redirect: d.redirect,
      redirectStatusCode: d.redirectStatusCode,
      createdAt: d.createdAt || Date.now(),
      updatedAt: d.updatedAt || Date.now()
    }))
  }

  /**
   * Verify a domain
   */
  async verifyDomain(projectNameOrId: string, domain: string): Promise<{
    verified: boolean
    verification?: Array<{ type: string; domain: string; value: string }>
  }> {
    const response = await this.request<any>(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/domains/${encodeURIComponent(domain)}/verify${this.getQueryParams()}`,
      { method: 'POST' }
    )

    return {
      verified: response.verified || false,
      verification: response.verification
    }
  }

  // ==================== ENVIRONMENT VARIABLES ====================

  /**
   * Add an environment variable to a project
   */
  async addEnvVariable(
    projectNameOrId: string,
    key: string,
    value: string,
    target: ('production' | 'preview' | 'development')[] = ['production', 'preview', 'development']
  ): Promise<{ id: string; key: string }> {
    return this.request(
      `/v10/projects/${encodeURIComponent(projectNameOrId)}/env${this.getQueryParams()}`,
      {
        method: 'POST',
        body: JSON.stringify({
          key,
          value,
          type: 'encrypted',
          target
        })
      }
    )
  }

  /**
   * Get all environment variables for a project
   */
  async getEnvVariables(projectNameOrId: string): Promise<Array<{
    id: string
    key: string
    target: string[]
    createdAt: number
  }>> {
    const response = await this.request<{ envs: any[] }>(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/env${this.getQueryParams()}`
    )

    return (response.envs || []).map((env: any) => ({
      id: env.id,
      key: env.key,
      target: env.target || [],
      createdAt: env.createdAt || Date.now()
    }))
  }

  /**
   * Delete an environment variable
   */
  async deleteEnvVariable(projectNameOrId: string, envId: string): Promise<void> {
    await this.request(
      `/v9/projects/${encodeURIComponent(projectNameOrId)}/env/${envId}${this.getQueryParams()}`,
      { method: 'DELETE' }
    )
  }
}

/**
 * Create a new Vercel client instance
 */
export function createVercelClient(): VercelClient {
  return new VercelClient()
}
