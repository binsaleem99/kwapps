/**
 * Structured Prompt Constructor for DeepSeek
 *
 * Converts detected parameters into a structured JSON prompt
 * that DeepSeek can use for code generation
 */

import type { DetectedParameters, DeepSeekPrompt } from './types'
import { BUSINESS_TYPES } from './types'

/**
 * Construct structured DeepSeek prompt from detected parameters
 */
export function constructDeepSeekPrompt(
  params: DetectedParameters,
  originalPrompt?: string
): DeepSeekPrompt {
  // Determine project type
  const projectType = inferProjectType(params.businessType?.type)

  // Build business section
  const business = {
    type: params.businessType?.type || 'general',
    name: extractBusinessName(originalPrompt),
    location: extractLocation(originalPrompt) || 'Kuwait',
    services: params.services?.services || [],
  }

  // Build language section
  const language = {
    primary: params.language.primary,
    direction: params.language.direction,
    font: params.language.font,
  }

  // Build functionality section
  const functionality = {
    widgets: params.functionality?.widgets || [],
    pages: params.functionality?.pages || inferDefaultPages(params.businessType?.type),
    features: extractFeatures(originalPrompt),
  }

  // Build styling section
  const defaultColors = getDefaultColors(params.styling?.theme)
  const styling = {
    theme: params.styling?.theme || 'minimal_clean',
    colors: {
      primary: params.styling?.colors?.primary || defaultColors.primary,
      secondary: params.styling?.colors?.secondary || defaultColors.secondary,
      accent: params.styling?.colors?.accent || defaultColors.accent,
      background: defaultColors.background,
    },
    spacing: inferSpacing(params.styling?.theme),
  }

  // Determine if admin dashboard needed
  const adminDashboard = checkAdminDashboardNeed(params, originalPrompt)

  // Build meta section
  const meta = {
    targetAudience: inferTargetAudience(params.businessType?.type),
    urgency: inferUrgency(originalPrompt),
  }

  return {
    project_type: projectType,
    business,
    language,
    functionality,
    styling,
    admin_dashboard: adminDashboard,
    meta,
  }
}

/**
 * Infer project type from business type
 */
function inferProjectType(
  businessType?: string
): 'website' | 'webapp' | 'landing' | 'dashboard' {
  if (!businessType) return 'website'

  const webappTypes = ['ecommerce', 'booking', 'clinic']
  const landingTypes = ['portfolio', 'service']
  const dashboardTypes = ['admin', 'analytics']

  if (webappTypes.includes(businessType)) return 'webapp'
  if (landingTypes.includes(businessType)) return 'landing'
  if (dashboardTypes.includes(businessType)) return 'dashboard'

  return 'website'
}

/**
 * Extract business name from original prompt
 */
function extractBusinessName(prompt?: string): string | undefined {
  if (!prompt) return undefined

  // Try to extract quoted names: "اسم العمل"
  const quotedMatch = prompt.match(/[""]([^""]+)[""]/)
  if (quotedMatch) return quotedMatch[1]

  // Try to extract names after keywords
  const namePatterns = [
    /اسم[هها]?\s+([^\s،.؟]+)/,
    /يسمى\s+([^\s،.؟]+)/,
    /لـ\s+([^\s،.؟]+)/,
    /for\s+([^\s,.?]+)/i,
  ]

  for (const pattern of namePatterns) {
    const match = prompt.match(pattern)
    if (match) return match[1]
  }

  return undefined
}

/**
 * Extract location from prompt
 */
function extractLocation(prompt?: string): string | undefined {
  if (!prompt) return undefined

  const kuwaitCities = [
    'الكويت',
    'حولي',
    'الفروانية',
    'الجهراء',
    'الأحمدي',
    'مبارك الكبير',
    'السالمية',
    'الفنطاس',
  ]

  for (const city of kuwaitCities) {
    if (prompt.includes(city)) return city
  }

  // Check for "Kuwait" or "الكويت"
  if (/kuwait|الكويت/i.test(prompt)) {
    return 'Kuwait'
  }

  return undefined
}

/**
 * Infer default pages based on business type
 */
function inferDefaultPages(businessType?: string): string[] {
  if (!businessType) {
    return ['home', 'about', 'services', 'contact']
  }

  const pagesByType: Record<string, string[]> = {
    beauty_salon: ['home', 'services', 'gallery', 'booking', 'about', 'contact'],
    restaurant: ['home', 'menu', 'order', 'location', 'about', 'contact'],
    ecommerce: ['home', 'shop', 'product', 'cart', 'checkout', 'account'],
    clinic: ['home', 'services', 'doctors', 'booking', 'about', 'contact'],
    portfolio: ['home', 'projects', 'about', 'contact'],
    real_estate: ['home', 'properties', 'search', 'about', 'contact'],
  }

  return pagesByType[businessType] || ['home', 'about', 'services', 'contact']
}

/**
 * Extract features from original prompt
 */
function extractFeatures(prompt?: string): string[] | undefined {
  if (!prompt) return undefined

  const features: string[] = []
  const lowerPrompt = prompt.toLowerCase()

  // Feature keywords mapping
  const featureKeywords: Record<string, string[]> = {
    responsive: ['موبايل', 'جوال', 'responsive', 'mobile'],
    multilingual: ['متعدد اللغات', 'لغتين', 'bilingual', 'arabic english'],
    seo: ['محركات بحث', 'seo', 'google'],
    analytics: ['إحصائيات', 'analytics', 'تحليلات'],
    blog: ['مدونة', 'blog', 'articles'],
    newsletter: ['نشرة بريدية', 'newsletter', 'subscription'],
    chat: ['دردشة', 'chat', 'live chat'],
    search: ['بحث', 'search'],
  }

  for (const [feature, keywords] of Object.entries(featureKeywords)) {
    if (keywords.some((kw) => lowerPrompt.includes(kw))) {
      features.push(feature)
    }
  }

  return features.length > 0 ? features : undefined
}

/**
 * Get default colors for theme
 */
function getDefaultColors(theme?: string): {
  primary: string
  secondary: string
  accent?: string
  background?: string
} {
  const colorsByTheme: Record<
    string,
    { primary: string; secondary: string; accent?: string; background?: string }
  > = {
    feminine_modern: {
      primary: '#E91E63',
      secondary: '#FCE4EC',
      accent: '#FF4081',
      background: '#FFFFFF',
    },
    classic_luxury: {
      primary: '#1A1A1A',
      secondary: '#D4AF37',
      accent: '#8B7355',
      background: '#F5F5F0',
    },
    minimal_clean: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#3B82F6',
      background: '#F9FAFB',
    },
    bold_modern: {
      primary: '#FF6B35',
      secondary: '#004E89',
      accent: '#F7931E',
      background: '#FFFFFF',
    },
    professional_corporate: {
      primary: '#0F172A',
      secondary: '#3B82F6',
      accent: '#10B981',
      background: '#F8FAFC',
    },
  }

  return (
    colorsByTheme[theme || 'minimal_clean'] || {
      primary: '#0F172A',
      secondary: '#3B82F6',
      background: '#FFFFFF',
    }
  )
}

/**
 * Infer spacing preference
 */
function inferSpacing(theme?: string): 'compact' | 'normal' | 'spacious' {
  if (theme === 'minimal_clean') return 'spacious'
  if (theme === 'bold_modern') return 'compact'
  return 'normal'
}

/**
 * Check if admin dashboard is needed
 */
function checkAdminDashboardNeed(params: DetectedParameters, prompt?: string): boolean {
  // Keywords indicating admin panel need
  const adminKeywords = [
    'إدارة',
    'لوحة تحكم',
    'admin',
    'dashboard',
    'management',
    'control panel',
  ]

  if (prompt && adminKeywords.some((kw) => prompt.toLowerCase().includes(kw))) {
    return true
  }

  // Business types that typically need admin
  const adminBusinessTypes = ['ecommerce', 'booking', 'clinic', 'restaurant']
  if (params.businessType && adminBusinessTypes.includes(params.businessType.type)) {
    return true
  }

  // If booking or payment widgets, likely needs admin
  const adminWidgets = ['booking_calendar', 'payment', 'cart', 'online_ordering']
  if (
    params.functionality?.widgets.some((w) => adminWidgets.includes(w))
  ) {
    return true
  }

  return false
}

/**
 * Infer target audience
 */
function inferTargetAudience(businessType?: string): string {
  const audienceByType: Record<string, string> = {
    beauty_salon: 'women_kuwait',
    restaurant: 'families_kuwait',
    ecommerce: 'online_shoppers_gcc',
    clinic: 'patients_kuwait',
    portfolio: 'clients_businesses',
    real_estate: 'buyers_renters_kuwait',
  }

  return audienceByType[businessType || ''] || 'general_kuwait'
}

/**
 * Infer urgency level from prompt
 */
function inferUrgency(prompt?: string): 'low' | 'medium' | 'high' {
  if (!prompt) return 'medium'

  const lowerPrompt = prompt.toLowerCase()

  // High urgency keywords
  const highUrgencyKeywords = ['عاجل', 'سريع', 'urgent', 'asap', 'now', 'اليوم']
  if (highUrgencyKeywords.some((kw) => lowerPrompt.includes(kw))) {
    return 'high'
  }

  // Low urgency keywords
  const lowUrgencyKeywords = ['مستقبلاً', 'لاحقاً', 'later', 'future', 'planning']
  if (lowUrgencyKeywords.some((kw) => lowerPrompt.includes(kw))) {
    return 'low'
  }

  return 'medium'
}

/**
 * Format DeepSeek prompt as human-readable JSON string
 */
export function formatPromptForDeepSeek(prompt: DeepSeekPrompt): string {
  return JSON.stringify(prompt, null, 2)
}

/**
 * Convert DeepSeek prompt to natural language (for display)
 */
export function promptToNaturalLanguage(prompt: DeepSeekPrompt): string {
  const lines: string[] = []

  // Project type
  lines.push(`نوع المشروع: ${projectTypeToArabic(prompt.project_type)}`)

  // Business
  if (prompt.business.name) {
    lines.push(`اسم العمل: ${prompt.business.name}`)
  }
  const businessConfig = BUSINESS_TYPES[prompt.business.type as keyof typeof BUSINESS_TYPES]
  if (businessConfig) {
    lines.push(`نوع النشاط: ${businessConfig.ar}`)
  }
  if (prompt.business.location) {
    lines.push(`الموقع: ${prompt.business.location}`)
  }

  // Services
  if (prompt.business.services.length > 0) {
    lines.push(`الخدمات: ${prompt.business.services.length} خدمة`)
  }

  // Functionality
  if (prompt.functionality.widgets.length > 0) {
    lines.push(`الويدجت: ${prompt.functionality.widgets.length} ويدجت`)
  }
  if (prompt.functionality.pages.length > 0) {
    lines.push(`الصفحات: ${prompt.functionality.pages.join('، ')}`)
  }

  // Styling
  lines.push(`الثيم: ${prompt.styling.theme}`)
  lines.push(`الألوان: ${prompt.styling.colors.primary}`)

  // Admin
  if (prompt.admin_dashboard) {
    lines.push(`✓ يشمل لوحة تحكم للإدارة`)
  }

  return lines.join('\n')
}

function projectTypeToArabic(type: string): string {
  const translations: Record<string, string> = {
    website: 'موقع إلكتروني',
    webapp: 'تطبيق ويب',
    landing: 'صفحة هبوط',
    dashboard: 'لوحة تحكم',
  }
  return translations[type] || type
}
