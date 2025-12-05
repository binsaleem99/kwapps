/**
 * Vercel Deployer Service
 *
 * High-level deployment orchestration service
 * Handles the full deployment workflow:
 * 1. Create/get project
 * 2. Deploy code files
 * 3. Wait for build to complete
 * 4. Configure custom domain (optional)
 * 5. Return deployment URL
 */

import { createVercelClient, VercelDeployment, DeploymentReadyState } from './client'

// Deployment step types
export type DeploymentStep =
  | 'preparing'
  | 'uploading'
  | 'building'
  | 'configuring_domain'
  | 'finalizing'
  | 'completed'
  | 'failed'

export interface DeploymentProgress {
  step: DeploymentStep
  progress: number // 0-100
  message: string
  error?: string
}

export interface DeployProjectOptions {
  projectId: string // Database project ID
  projectName: string // Display name
  subdomain: string // URL subdomain (e.g., "mysite" for mysite.kwq8.com)
  htmlContent: string // Generated HTML code
  customDomain?: string // Optional custom domain
  isPreview?: boolean // Preview deployment (24h expiry)
  onProgress?: (progress: DeploymentProgress) => void
}

export interface DeploymentResult {
  success: boolean
  deploymentId?: string
  url?: string
  previewUrl?: string
  customDomainStatus?: {
    domain: string
    verified: boolean
    verificationRecords?: Array<{ type: string; domain: string; value: string }>
  }
  error?: string
}

/**
 * Generate a unique subdomain slug
 */
function generateSubdomain(projectName: string, projectId: string): string {
  // Clean the project name
  const cleaned = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 30) // Limit length

  // Add short project ID suffix for uniqueness
  const idSuffix = projectId.slice(0, 6)

  return `${cleaned}-${idSuffix}`
}

/**
 * Wrap HTML content in a complete document
 */
function wrapHtmlContent(htmlContent: string, projectName: string): string {
  // Check if it's already a complete HTML document
  if (htmlContent.trim().toLowerCase().startsWith('<!doctype') ||
      htmlContent.trim().toLowerCase().startsWith('<html')) {
    return htmlContent
  }

  // Check if it's a React/component code (contains JSX)
  if (htmlContent.includes('export default') ||
      htmlContent.includes('export function') ||
      htmlContent.includes('import React') ||
      htmlContent.includes('from "react"') ||
      htmlContent.includes("from 'react'")) {
    // Return a placeholder for now - in production, this would need proper compilation
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            cairo: ['Cairo', 'sans-serif'],
          },
        },
      },
    }
  </script>
  <style>
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-slate-50">
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    ${htmlContent}

    // Try to render the default export or first exported component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    try {
      // Check for common export patterns
      if (typeof App !== 'undefined') {
        root.render(<App />);
      } else if (typeof Page !== 'undefined') {
        root.render(<Page />);
      } else if (typeof Home !== 'undefined') {
        root.render(<Home />);
      } else if (typeof Main !== 'undefined') {
        root.render(<Main />);
      } else {
        // Try to find any function component
        const componentName = Object.keys(window).find(key =>
          typeof window[key] === 'function' &&
          /^[A-Z]/.test(key) &&
          key !== 'React' &&
          key !== 'ReactDOM'
        );
        if (componentName) {
          const Component = window[componentName];
          root.render(<Component />);
        } else {
          root.render(<div className="p-8 text-center text-slate-600">Component not found</div>);
        }
      }
    } catch (error) {
      console.error('Render error:', error);
      root.render(<div className="p-8 text-center text-red-600">Error: {error.message}</div>);
    }
  </script>
</body>
</html>`
  }

  // Wrap simple HTML content
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-slate-50">
  ${htmlContent}
</body>
</html>`
}

/**
 * Deploy a project to Vercel
 */
export async function deployProject(options: DeployProjectOptions): Promise<DeploymentResult> {
  const {
    projectId,
    projectName,
    subdomain,
    htmlContent,
    customDomain,
    isPreview = false,
    onProgress
  } = options

  const reportProgress = (step: DeploymentStep, progress: number, message: string, error?: string) => {
    onProgress?.({ step, progress, message, error })
  }

  try {
    const client = createVercelClient()

    // Step 1: Prepare deployment
    reportProgress('preparing', 10, 'جارٍ تحضير المشروع...')

    // Generate subdomain if not provided
    const deploymentSubdomain = subdomain || generateSubdomain(projectName, projectId)

    // Wrap HTML content in complete document
    const wrappedHtml = wrapHtmlContent(htmlContent, projectName)

    // Step 2: Upload files and create deployment
    reportProgress('uploading', 30, 'جارٍ رفع الملفات...')

    const deployment = await client.deploy({
      projectName: deploymentSubdomain,
      files: [
        {
          file: 'index.html',
          data: wrappedHtml,
          encoding: 'utf-8'
        }
      ],
      target: isPreview ? 'preview' : 'production',
      meta: {
        projectId,
        projectName,
        isPreview: String(isPreview)
      }
    })

    // Step 3: Wait for build
    reportProgress('building', 50, 'جارٍ بناء الموقع...')

    const readyDeployment = await client.waitForReady(
      deployment.id,
      180000, // 3 minutes timeout
      (state: DeploymentReadyState, progress: number) => {
        const progressMap: Record<DeploymentReadyState, number> = {
          'QUEUED': 50,
          'BUILDING': 60 + (progress * 0.2),
          'READY': 80,
          'ERROR': 50,
          'CANCELED': 50
        }
        reportProgress('building', progressMap[state] || 50, `حالة البناء: ${state}`)
      }
    )

    const deploymentUrl = `https://${readyDeployment.url}`

    // Step 4: Configure custom domain (if provided and not preview)
    let customDomainStatus: DeploymentResult['customDomainStatus']

    if (customDomain && !isPreview) {
      reportProgress('configuring_domain', 85, `جارٍ إعداد النطاق ${customDomain}...`)

      try {
        // Add domain to project
        const domainResult = await client.addDomain(deploymentSubdomain, customDomain)

        if (!domainResult.verified) {
          // Try to verify
          const verification = await client.verifyDomain(deploymentSubdomain, customDomain)
          customDomainStatus = {
            domain: customDomain,
            verified: verification.verified,
            verificationRecords: verification.verification
          }
        } else {
          customDomainStatus = {
            domain: customDomain,
            verified: true
          }
        }
      } catch (domainError: any) {
        // Domain setup failed but deployment succeeded
        customDomainStatus = {
          domain: customDomain,
          verified: false
        }
        console.error('Domain setup error:', domainError)
      }
    }

    // Step 5: Finalize
    reportProgress('finalizing', 95, 'جارٍ الإنهاء...')

    // Success
    reportProgress('completed', 100, 'تم النشر بنجاح!')

    return {
      success: true,
      deploymentId: readyDeployment.id,
      url: deploymentUrl,
      previewUrl: isPreview ? deploymentUrl : undefined,
      customDomainStatus
    }

  } catch (error: any) {
    reportProgress('failed', 0, 'فشل النشر', error.message)

    return {
      success: false,
      error: error.message || 'حدث خطأ أثناء النشر'
    }
  }
}

/**
 * Delete a deployment
 */
export async function deleteDeployment(deploymentId: string): Promise<boolean> {
  try {
    const client = createVercelClient()
    await client.deleteDeployment(deploymentId)
    return true
  } catch (error) {
    console.error('Delete deployment error:', error)
    return false
  }
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(deploymentId: string): Promise<{
  state: DeploymentReadyState
  url: string | null
  error?: string
}> {
  const client = createVercelClient()
  return client.getDeploymentStatus(deploymentId)
}

/**
 * Check if a subdomain is available
 */
export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  try {
    const client = createVercelClient()
    const project = await client.getProject(subdomain)
    return project === null
  } catch (error) {
    // If we can't check, assume it's not available
    return false
  }
}

/**
 * Generate a suggested subdomain
 */
export function suggestSubdomain(projectName: string, projectId: string, username?: string): string[] {
  const suggestions: string[] = []

  // Base name from project
  const baseName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 25)

  // Primary: projectname-id
  suggestions.push(`${baseName}-${projectId.slice(0, 6)}`)

  // With username if provided
  if (username) {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
    suggestions.push(`${cleanUsername}-${baseName}`)
  }

  // Random suffix
  const randomSuffix = Math.random().toString(36).slice(2, 6)
  suggestions.push(`${baseName}-${randomSuffix}`)

  return suggestions
}
