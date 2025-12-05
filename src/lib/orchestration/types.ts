/**
 * Gemini Pro Orchestration Types
 *
 * Types for the three-tier AI pipeline:
 * Tier 1: Gemini Pro (Orchestration)
 * Tier 2: DeepSeek (Generation)
 * Tier 3: Gemini Flash (Editing)
 */

/**
 * Detected parameters from user prompt
 */
export interface DetectedParameters {
  businessType: BusinessTypeParam | null
  services: ServicesParam | null
  functionality: FunctionalityParam | null
  styling: StylingParam | null
  language: LanguageParam
}

export interface BusinessTypeParam {
  type: string // e.g., "beauty_salon", "restaurant", "ecommerce"
  keywords: string[] // Keywords that led to detection
  confidence: number // 0-1
  arabicName: string // e.g., "صالون تجميل"
}

export interface ServicesParam {
  services: string[] // e.g., ["haircut", "hair_coloring", "makeup"]
  arabicServices: string[] // e.g., ["قص شعر", "صبغ شعر", "مكياج"]
  confidence: number
}

export interface FunctionalityParam {
  widgets: string[] // e.g., ["booking_calendar", "gallery", "whatsapp_bubble"]
  pages: string[] // e.g., ["home", "services", "gallery", "booking"]
  confidence: number
}

export interface StylingParam {
  theme: string // e.g., "feminine_modern", "classic_luxury", "minimal_clean"
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  arabicTheme: string // e.g., "أنثوي وعصري"
  confidence: number
}

export interface LanguageParam {
  primary: 'ar' | 'en'
  direction: 'rtl' | 'ltr'
  font: string // e.g., "Cairo"
  detected: boolean
}

/**
 * Clarifying question types
 */
export type QuestionType = 'services' | 'functionality' | 'styling' | 'business_details'

export interface ClarifyingQuestion {
  id: string
  type: QuestionType
  question: string // Arabic text
  answerType: 'checkbox' | 'radio' | 'text' | 'color'
  options?: QuestionOption[]
  required: boolean
  dependsOn?: string // Question ID that must be answered first
}

export interface QuestionOption {
  id: string
  label: string // Arabic
  value: string // English value for system
  icon?: string // Lucide icon name
}

/**
 * User answers to clarifying questions
 */
export interface ClarifyingAnswers {
  [questionId: string]: string | string[] | { [key: string]: boolean }
}

/**
 * Structured prompt for DeepSeek
 */
export interface DeepSeekPrompt {
  project_type: 'website' | 'webapp' | 'landing' | 'dashboard'
  business: {
    type: string
    name?: string
    location?: string
    services: string[]
  }
  language: {
    primary: 'ar' | 'en'
    direction: 'rtl' | 'ltr'
    font: string
  }
  functionality: {
    widgets: string[]
    pages: string[]
    features?: string[]
  }
  styling: {
    theme: string
    colors: {
      primary: string
      secondary: string
      accent?: string
      background?: string
    }
    spacing?: 'compact' | 'normal' | 'spacious'
  }
  admin_dashboard?: boolean
  meta?: {
    targetAudience?: string
    urgency?: 'low' | 'medium' | 'high'
  }
}

/**
 * Validation checklist results
 */
export interface ValidationResult {
  passed: boolean
  checks: ValidationCheck[]
  score: number // 0-100
  errors: string[]
  warnings: string[]
}

export interface ValidationCheck {
  name: string
  nameAr: string
  passed: boolean
  severity: 'critical' | 'warning' | 'info'
  message?: string
  messageAr?: string
  autoFix?: boolean
}

/**
 * Orchestration pipeline state
 */
export type OrchestrationStage =
  | 'detection' // Detecting parameters
  | 'clarifying' // Asking questions
  | 'constructing' // Building DeepSeek prompt
  | 'generating' // DeepSeek generation
  | 'validating' // Validation checks
  | 'completed' // Success
  | 'failed' // Error

export interface OrchestrationState {
  stage: OrchestrationStage
  detectedParams: DetectedParameters | null
  clarifyingQuestions: ClarifyingQuestion[]
  answers: ClarifyingAnswers
  deepseekPrompt: DeepSeekPrompt | null
  validationResult: ValidationResult | null
  error?: {
    code: string
    message: string
    messageAr: string
  }
}

/**
 * Cost tracking
 */
export interface OrchestrationCost {
  geminiProTokens: number
  deepseekTokens: number
  geminiFlashTokens: number
  totalTokens: number
  estimatedCostUSD: number
  estimatedCostKWD: number
  timestamp: Date
}

/**
 * Business type catalog
 */
export const BUSINESS_TYPES = {
  beauty_salon: {
    ar: 'صالون تجميل',
    keywords: ['صالون', 'تجميل', 'حلاقة', 'شعر', 'مكياج', 'أظافر'],
    defaultServices: ['haircut', 'hair_coloring', 'makeup', 'nails'],
    defaultWidgets: ['booking_calendar', 'gallery', 'whatsapp_bubble'],
  },
  restaurant: {
    ar: 'مطعم',
    keywords: ['مطعم', 'طعام', 'منيو', 'قائمة', 'توصيل', 'أكل'],
    defaultServices: ['dine_in', 'takeout', 'delivery'],
    defaultWidgets: ['menu', 'online_ordering', 'location_map'],
  },
  ecommerce: {
    ar: 'متجر إلكتروني',
    keywords: ['متجر', 'تسوق', 'منتجات', 'بيع', 'شراء'],
    defaultServices: ['product_catalog', 'shopping_cart', 'checkout'],
    defaultWidgets: ['product_grid', 'cart', 'payment'],
  },
  clinic: {
    ar: 'عيادة طبية',
    keywords: ['عيادة', 'طبيب', 'دكتور', 'صحة', 'طبي'],
    defaultServices: ['appointments', 'medical_records', 'prescriptions'],
    defaultWidgets: ['booking_calendar', 'doctor_profiles', 'contact'],
  },
  portfolio: {
    ar: 'معرض أعمال',
    keywords: ['معرض', 'أعمال', 'بورتفوليو', 'تصميم', 'مشاريع'],
    defaultServices: ['project_showcase', 'about', 'contact'],
    defaultWidgets: ['gallery', 'project_cards', 'contact_form'],
  },
  real_estate: {
    ar: 'عقارات',
    keywords: ['عقار', 'شقة', 'بيت', 'عقارات', 'إيجار', 'بيع'],
    defaultServices: ['property_listings', 'search', 'contact'],
    defaultWidgets: ['property_grid', 'search_filters', 'map'],
  },
} as const

/**
 * Theme catalog
 */
export const THEME_CATALOG = {
  feminine_modern: {
    ar: 'أنثوي وعصري',
    colors: { primary: '#E91E63', secondary: '#FCE4EC', accent: '#FF4081' },
    keywords: ['أنثوي', 'ناعم', 'وردي', 'عصري'],
  },
  classic_luxury: {
    ar: 'كلاسيكي وفخم',
    colors: { primary: '#1A1A1A', secondary: '#D4AF37', accent: '#8B7355' },
    keywords: ['كلاسيكي', 'فخم', 'راقي', 'ذهبي'],
  },
  minimal_clean: {
    ar: 'بسيط ونظيف',
    colors: { primary: '#000000', secondary: '#FFFFFF', accent: '#3B82F6' },
    keywords: ['بسيط', 'نظيف', 'مينمال', 'واضح'],
  },
  bold_modern: {
    ar: 'جريء وعصري',
    colors: { primary: '#FF6B35', secondary: '#004E89', accent: '#F7931E' },
    keywords: ['جريء', 'قوي', 'عصري', 'ملون'],
  },
  professional_corporate: {
    ar: 'احترافي ومؤسسي',
    colors: { primary: '#0F172A', secondary: '#3B82F6', accent: '#10B981' },
    keywords: ['احترافي', 'مؤسسي', 'رسمي', 'أعمال'],
  },
} as const

/**
 * Widget catalog
 */
export const WIDGET_CATALOG = {
  booking_calendar: { ar: 'نظام حجز مواعيد', complexity: 'high' },
  gallery: { ar: 'معرض صور', complexity: 'medium' },
  whatsapp_bubble: { ar: 'زر واتساب', complexity: 'low' },
  menu: { ar: 'قائمة طعام', complexity: 'medium' },
  online_ordering: { ar: 'طلب أونلاين', complexity: 'high' },
  location_map: { ar: 'خريطة الموقع', complexity: 'low' },
  product_grid: { ar: 'عرض منتجات', complexity: 'medium' },
  cart: { ar: 'سلة شراء', complexity: 'high' },
  payment: { ar: 'نظام دفع', complexity: 'high' },
  contact_form: { ar: 'نموذج تواصل', complexity: 'low' },
  testimonials: { ar: 'آراء العملاء', complexity: 'low' },
  pricing_table: { ar: 'جدول أسعار', complexity: 'medium' },
  faq_accordion: { ar: 'أسئلة شائعة', complexity: 'low' },
  team_profiles: { ar: 'فريق العمل', complexity: 'medium' },
  blog_feed: { ar: 'مدونة', complexity: 'medium' },
  search_bar: { ar: 'بحث', complexity: 'medium' },
  filters: { ar: 'فلاتر', complexity: 'medium' },
  newsletter: { ar: 'اشتراك بريدي', complexity: 'low' },
  social_links: { ar: 'روابط التواصل', complexity: 'low' },
  video_embed: { ar: 'فيديو', complexity: 'low' },
} as const
