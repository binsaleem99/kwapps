/**
 * Admin Dashboard Generator
 *
 * Auto-generates admin dashboard for each deployed project
 * Features enabled based on project type/template
 *
 * Flow:
 * 1. Detect project features (e-commerce → products/orders)
 * 2. Generate dashboard pages
 * 3. Create admin credentials
 * 4. Email user with access details
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { detectProjectFeatures } from './feature-detector'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface DashboardConfig {
  dashboardId: string
  projectId: string
  dashboardUrl: string
  credentials: {
    email: string
    temporaryPassword: string
  }
  features: ProjectFeatures
  pages: DashboardPage[]
}

export interface ProjectFeatures {
  products: boolean
  services: boolean
  bookings: boolean
  orders: boolean
  users: boolean
  blog: boolean
  gallery: boolean
  reviews: boolean
  analytics: boolean
  contactForms: boolean
}

export interface DashboardPage {
  id: string
  title: string
  titleAr: string
  route: string
  component: string
  icon: string
}

export class DashboardGenerator {
  /**
   * Generate admin dashboard for a project
   */
  async generate(projectId: string, userId: string): Promise<DashboardConfig> {
    try {
      // 1. Get project details
      const { data: project } = await supabase
        .from('projects')
        .select('*, template_id, users:user_id(email, name)')
        .eq('id', projectId)
        .single()

      if (!project) {
        throw new Error('Project not found')
      }

      // 2. Check if dashboard already exists
      const { data: existing } = await supabase
        .from('admin_dashboards')
        .select('id')
        .eq('project_id', projectId)
        .single()

      if (existing) {
        throw new Error('Dashboard already exists for this project')
      }

      // 3. Detect features based on project type/template
      const features = await detectProjectFeatures(project)

      // 4. Generate pages based on features
      const pages = this.generatePages(features)

      // 5. Create dashboard record
      const { data: dashboard } = await supabase
        .from('admin_dashboards')
        .insert({
          project_id: projectId,
          features,
          pages,
          theme: 'arabic-rtl',
          public_url: `/admin/project/${projectId}`,
          is_active: true,
        })
        .select()
        .single()

      if (!dashboard) {
        throw new Error('Failed to create dashboard')
      }

      // 6. Generate admin credentials
      const credentials = await this.createAdminUser(
        projectId,
        project.users.email,
        project.users.name
      )

      // 7. Send email with credentials
      await this.sendCredentialsEmail(
        project.users.email,
        project.name,
        dashboard.public_url,
        credentials
      )

      // 8. Log dashboard creation
      await supabase.from('admin_activity_logs').insert({
        project_id: projectId,
        action: 'create',
        resource_type: 'dashboard',
        resource_id: dashboard.id,
        details: 'Admin dashboard auto-generated',
      })

      return {
        dashboardId: dashboard.id,
        projectId,
        dashboardUrl: dashboard.public_url,
        credentials,
        features,
        pages,
      }
    } catch (error: any) {
      console.error('Dashboard generation error:', error)
      throw error
    }
  }

  /**
   * Generate dashboard pages based on features
   */
  private generatePages(features: ProjectFeatures): DashboardPage[] {
    const pages: DashboardPage[] = [
      // Always include home
      {
        id: 'home',
        title: 'Dashboard',
        titleAr: 'لوحة التحكم',
        route: '/admin',
        component: 'DashboardHome',
        icon: 'LayoutDashboard',
      },
    ]

    if (features.products) {
      pages.push({
        id: 'products',
        title: 'Products',
        titleAr: 'المنتجات',
        route: '/admin/products',
        component: 'ProductsManager',
        icon: 'Package',
      })
    }

    if (features.orders) {
      pages.push({
        id: 'orders',
        title: 'Orders',
        titleAr: 'الطلبات',
        route: '/admin/orders',
        component: 'OrdersManager',
        icon: 'ShoppingCart',
      })
    }

    if (features.bookings) {
      pages.push({
        id: 'bookings',
        title: 'Bookings',
        titleAr: 'الحجوزات',
        route: '/admin/bookings',
        component: 'BookingsManager',
        icon: 'Calendar',
      })
    }

    if (features.users) {
      pages.push({
        id: 'users',
        title: 'Users',
        titleAr: 'المستخدمين',
        route: '/admin/users',
        component: 'UsersManager',
        icon: 'Users',
      })
    }

    if (features.blog) {
      pages.push({
        id: 'blog',
        title: 'Blog',
        titleAr: 'المدونة',
        route: '/admin/blog',
        component: 'BlogManager',
        icon: 'FileText',
      })
    }

    if (features.gallery) {
      pages.push({
        id: 'gallery',
        title: 'Gallery',
        titleAr: 'المعرض',
        route: '/admin/gallery',
        component: 'GalleryManager',
        icon: 'Image',
      })
    }

    if (features.reviews) {
      pages.push({
        id: 'reviews',
        title: 'Reviews',
        titleAr: 'المراجعات',
        route: '/admin/reviews',
        component: 'ReviewsManager',
        icon: 'Star',
      })
    }

    if (features.analytics) {
      pages.push({
        id: 'analytics',
        title: 'Analytics',
        titleAr: 'التحليلات',
        route: '/admin/analytics',
        component: 'AnalyticsDashboard',
        icon: 'TrendingUp',
      })
    }

    // Always include settings
    pages.push({
      id: 'settings',
      title: 'Settings',
      titleAr: 'الإعدادات',
      route: '/admin/settings',
      component: 'DashboardSettings',
      icon: 'Settings',
    })

    return pages
  }

  /**
   * Create admin user with credentials
   */
  private async createAdminUser(
    projectId: string,
    ownerEmail: string,
    ownerName: string
  ): Promise<{ email: string; temporaryPassword: string }> {
    // Generate temporary password
    const { data: tempPassword } = await supabase.rpc('generate_temp_password')

    // Hash password
    const passwordHash = await this.hashPassword(tempPassword)

    // Create admin user
    await supabase.from('project_admin_users').insert({
      project_id: projectId,
      email: ownerEmail,
      password_hash: passwordHash,
      temp_password: tempPassword,
      role: 'owner',
      must_change_password: true,
    })

    return {
      email: ownerEmail,
      temporaryPassword: tempPassword,
    }
  }

  /**
   * Hash password (simple hash for demo - use bcrypt in production)
   */
  private async hashPassword(password: string): Promise<string> {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  /**
   * Send credentials email to project owner
   */
  private async sendCredentialsEmail(
    email: string,
    projectName: string,
    dashboardUrl: string,
    credentials: { email: string; temporaryPassword: string }
  ): Promise<void> {
    await supabase.from('email_queue').insert({
      template: 'admin_dashboard_created',
      recipient_email: email,
      data: {
        projectName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}${dashboardUrl}`,
        email: credentials.email,
        tempPassword: credentials.temporaryPassword,
      },
      scheduled_for: new Date().toISOString(),
    })
  }
}

// Singleton instance
export const dashboardGenerator = new DashboardGenerator()
