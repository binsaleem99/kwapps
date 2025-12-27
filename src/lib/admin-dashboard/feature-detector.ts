/**
 * Feature Detector
 *
 * Analyzes project/template to determine which admin features to enable
 * E-commerce → products, orders, inventory
 * Restaurant → menu (products), bookings, orders
 * Service → services, bookings, contact forms
 * Portfolio → gallery, blog
 */

import { ProjectFeatures } from './generator'

interface Project {
  id: string
  template_id?: string
  generated_code?: string
  from_template?: boolean
}

export async function detectProjectFeatures(project: Project): Promise<ProjectFeatures> {
  // Default features (all false)
  const features: ProjectFeatures = {
    products: false,
    services: false,
    bookings: false,
    orders: false,
    users: false,
    blog: false,
    gallery: false,
    reviews: false,
    analytics: true, // Always enable analytics
    contactForms: false,
  }

  // If from template, use template-based detection
  if (project.from_template && project.template_id) {
    return await detectFromTemplate(project.template_id, features)
  }

  // Otherwise, analyze generated code
  if (project.generated_code) {
    return await analyzeGeneratedCode(project.generated_code, features)
  }

  return features
}

/**
 * Detect features from template
 */
async function detectFromTemplate(
  templateId: string,
  defaultFeatures: ProjectFeatures
): Promise<ProjectFeatures> {
  // Template ID patterns (from registry)
  const featureMap: Record<string, Partial<ProjectFeatures>> = {
    // E-commerce templates
    'ec-01-anaqah': {
      products: true,
      orders: true,
      users: true,
      reviews: true,
      gallery: true,
    },
    'ec-02-souq': {
      products: true,
      orders: true,
      users: true,
      reviews: true,
    },

    // Restaurant templates
    'rest-01-al-maidah': {
      products: true, // Menu items
      bookings: true,
      orders: true,
      gallery: true,
      reviews: true,
    },
    'rest-02-qahwati': {
      products: true, // Menu
      orders: true,
      contactForms: true,
    },

    // Service templates
    'svc-01-jamali': {
      services: true,
      bookings: true,
      gallery: true,
      reviews: true,
      contactForms: true,
    },
    'svc-02-siyanah': {
      services: true,
      contactForms: true,
    },

    // Corporate templates
    'corp-01-riyadah': {
      services: true,
      blog: true,
      contactForms: true,
    },

    // Real estate
    're-01-darak': {
      products: true, // Properties
      gallery: true,
      contactForms: true,
    },

    // Portfolio
    'port-01-ibdaei': {
      gallery: true,
      blog: true,
      services: true,
      contactForms: true,
    },

    // Travel
    'book-01-rihlati': {
      products: true, // Tour packages
      bookings: true,
      orders: true,
      gallery: true,
    },

    // Government
    'gov-01-ruyah': {
      services: true,
      blog: true, // News/announcements
      contactForms: true,
    },
  }

  const templateFeatures = featureMap[templateId] || {}

  return {
    ...defaultFeatures,
    ...templateFeatures,
  }
}

/**
 * Analyze generated code to detect features
 */
async function analyzeGeneratedCode(
  code: string,
  defaultFeatures: ProjectFeatures
): Promise<ProjectFeatures> {
  const features = { ...defaultFeatures }

  // Product/shopping patterns
  if (
    code.includes('product') ||
    code.includes('shop') ||
    code.includes('cart') ||
    code.includes('منتج')
  ) {
    features.products = true
  }

  // Order patterns
  if (
    code.includes('order') ||
    code.includes('checkout') ||
    code.includes('طلب') ||
    code.includes('الطلبات')
  ) {
    features.orders = true
  }

  // Booking patterns
  if (
    code.includes('booking') ||
    code.includes('reservation') ||
    code.includes('appointment') ||
    code.includes('حجز') ||
    code.includes('موعد')
  ) {
    features.bookings = true
  }

  // Blog patterns
  if (
    code.includes('blog') ||
    code.includes('post') ||
    code.includes('article') ||
    code.includes('مدونة') ||
    code.includes('مقال')
  ) {
    features.blog = true
  }

  // Gallery patterns
  if (
    code.includes('gallery') ||
    code.includes('portfolio') ||
    code.includes('معرض') ||
    code.includes('الأعمال')
  ) {
    features.gallery = true
  }

  // Review patterns
  if (
    code.includes('review') ||
    code.includes('rating') ||
    code.includes('testimonial') ||
    code.includes('تقييم') ||
    code.includes('مراجعة')
  ) {
    features.reviews = true
  }

  // Contact form patterns
  if (
    code.includes('contact') ||
    code.includes('ContactForm') ||
    code.includes('تواصل')
  ) {
    features.contactForms = true
  }

  // User management (if has auth/login)
  if (
    code.includes('login') ||
    code.includes('register') ||
    code.includes('user') ||
    code.includes('تسجيل')
  ) {
    features.users = true
  }

  return features
}

/**
 * Get feature summary in Arabic
 */
export function getFeatureSummaryAr(features: ProjectFeatures): string {
  const enabled: string[] = []

  if (features.products) enabled.push('إدارة المنتجات')
  if (features.services) enabled.push('إدارة الخدمات')
  if (features.bookings) enabled.push('إدارة الحجوزات')
  if (features.orders) enabled.push('إدارة الطلبات')
  if (features.users) enabled.push('إدارة المستخدمين')
  if (features.blog) enabled.push('إدارة المدونة')
  if (features.gallery) enabled.push('إدارة المعرض')
  if (features.reviews) enabled.push('إدارة المراجعات')
  if (features.analytics) enabled.push('التحليلات')
  if (features.contactForms) enabled.push('رسائل التواصل')

  return enabled.join(' • ')
}
