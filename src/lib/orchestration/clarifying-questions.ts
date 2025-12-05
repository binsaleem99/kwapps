/**
 * Clarifying Questions Generator
 *
 * Generates Arabic clarifying questions based on missing parameters
 * Uses checkbox options for easy selection
 */

import type {
  DetectedParameters,
  ClarifyingQuestion,
  QuestionOption,
  ClarifyingAnswers,
} from './types'
import { BUSINESS_TYPES, THEME_CATALOG, WIDGET_CATALOG } from './types'

/**
 * Generate clarifying questions for missing parameters
 */
export function generateClarifyingQuestions(
  detectedParams: DetectedParameters,
  missingParams: string[]
): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = []

  // Only ask about missing or low-confidence parameters
  if (missingParams.includes('businessType')) {
    questions.push(createBusinessTypeQuestion())
  }

  if (missingParams.includes('services')) {
    questions.push(createServicesQuestion(detectedParams.businessType?.type))
  }

  if (missingParams.includes('functionality')) {
    questions.push(createFunctionalityQuestion(detectedParams.businessType?.type))
  }

  if (missingParams.includes('styling')) {
    questions.push(createStylingQuestion())
  }

  return questions
}

/**
 * Business Type Question
 */
function createBusinessTypeQuestion(): ClarifyingQuestion {
  const options: QuestionOption[] = Object.entries(BUSINESS_TYPES).map(([key, config]) => ({
    id: key,
    label: config.ar,
    value: key,
    icon: getBusinessIcon(key),
  }))

  return {
    id: 'business_type',
    type: 'business_details',
    question: 'ما نوع نشاطك التجاري؟',
    answerType: 'radio',
    options,
    required: true,
  }
}

/**
 * Services Question (customized per business type)
 */
function createServicesQuestion(businessType?: string): ClarifyingQuestion {
  let options: QuestionOption[] = []
  let question = 'ما الخدمات التي تقدمها؟'

  if (businessType && BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES]) {
    const config = BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES]

    // Customize question based on business type
    switch (businessType) {
      case 'beauty_salon':
        question = 'ما خدمات الصالون التي تقدمينها؟'
        options = [
          { id: 'haircut', label: 'قص شعر', value: 'haircut', icon: 'Scissors' },
          { id: 'hair_coloring', label: 'صبغ شعر', value: 'hair_coloring', icon: 'Droplet' },
          { id: 'makeup', label: 'مكياج', value: 'makeup', icon: 'Sparkles' },
          { id: 'nails', label: 'أظافر', value: 'nails', icon: 'Hand' },
          { id: 'skin_care', label: 'عناية بالبشرة', value: 'skin_care', icon: 'Smile' },
          { id: 'waxing', label: 'إزالة شعر', value: 'waxing', icon: 'Zap' },
        ]
        break

      case 'restaurant':
        question = 'ما أنواع الخدمات المتاحة؟'
        options = [
          { id: 'dine_in', label: 'تناول في المطعم', value: 'dine_in', icon: 'UtensilsCrossed' },
          { id: 'takeout', label: 'طلبات خارجية', value: 'takeout', icon: 'ShoppingBag' },
          { id: 'delivery', label: 'توصيل', value: 'delivery', icon: 'Truck' },
          { id: 'catering', label: 'تقديم طعام', value: 'catering', icon: 'ChefHat' },
          { id: 'reservation', label: 'حجز طاولة', value: 'reservation', icon: 'Calendar' },
        ]
        break

      case 'ecommerce':
        question = 'ما نوع المنتجات التي تبيعها؟'
        options = [
          { id: 'fashion', label: 'ملابس وإكسسوارات', value: 'fashion', icon: 'Shirt' },
          { id: 'electronics', label: 'إلكترونيات', value: 'electronics', icon: 'Laptop' },
          { id: 'home', label: 'أدوات منزلية', value: 'home', icon: 'Home' },
          { id: 'beauty', label: 'منتجات تجميل', value: 'beauty', icon: 'Sparkles' },
          { id: 'food', label: 'مواد غذائية', value: 'food', icon: 'Apple' },
          { id: 'other', label: 'أخرى', value: 'other', icon: 'Package' },
        ]
        break

      case 'clinic':
        question = 'ما التخصصات الطبية المتاحة؟'
        options = [
          { id: 'general', label: 'طب عام', value: 'general', icon: 'Stethoscope' },
          { id: 'dental', label: 'أسنان', value: 'dental', icon: 'Smile' },
          { id: 'derma', label: 'جلدية', value: 'derma', icon: 'Hand' },
          { id: 'pediatric', label: 'أطفال', value: 'pediatric', icon: 'Baby' },
          { id: 'physio', label: 'علاج طبيعي', value: 'physio', icon: 'Activity' },
        ]
        break

      default:
        // Generic services
        options = [
          { id: 'consulting', label: 'استشارات', value: 'consulting', icon: 'MessageCircle' },
          { id: 'training', label: 'تدريب', value: 'training', icon: 'GraduationCap' },
          { id: 'support', label: 'دعم فني', value: 'support', icon: 'Headphones' },
          { id: 'custom', label: 'خدمات مخصصة', value: 'custom', icon: 'Settings' },
        ]
    }
  } else {
    // Generic services if no business type
    options = [
      { id: 'service_1', label: 'خدمة 1', value: 'service_1', icon: 'Star' },
      { id: 'service_2', label: 'خدمة 2', value: 'service_2', icon: 'Star' },
      { id: 'service_3', label: 'خدمة 3', value: 'service_3', icon: 'Star' },
    ]
  }

  return {
    id: 'services',
    type: 'services',
    question,
    answerType: 'checkbox',
    options,
    required: true,
  }
}

/**
 * Functionality Question (widgets and features)
 */
function createFunctionalityQuestion(businessType?: string): ClarifyingQuestion {
  let options: QuestionOption[] = []
  const question = 'ما الوظائف التي تحتاجها في الموقع؟'

  // Get recommended widgets based on business type
  const recommendedWidgets = businessType
    ? BUSINESS_TYPES[businessType as keyof typeof BUSINESS_TYPES]?.defaultWidgets || []
    : []

  // Always include these common widgets
  const commonWidgets = [
    'contact_form',
    'whatsapp_bubble',
    'social_links',
    'location_map',
    'gallery',
  ]

  // Merge and deduplicate
  const widgetKeys = Array.from(new Set([...recommendedWidgets, ...commonWidgets]))

  options = widgetKeys.map((key) => {
    const widget = WIDGET_CATALOG[key as keyof typeof WIDGET_CATALOG]
    return {
      id: key,
      label: widget.ar,
      value: key,
      icon: getWidgetIcon(key),
    }
  })

  // Add business-specific widgets
  if (businessType === 'ecommerce') {
    options.unshift(
      { id: 'product_grid', label: 'عرض منتجات', value: 'product_grid', icon: 'Grid3x3' },
      { id: 'cart', label: 'سلة شراء', value: 'cart', icon: 'ShoppingCart' },
      { id: 'payment', label: 'نظام دفع', value: 'payment', icon: 'CreditCard' }
    )
  } else if (businessType === 'restaurant') {
    options.unshift(
      { id: 'menu', label: 'قائمة طعام', value: 'menu', icon: 'Menu' },
      { id: 'online_ordering', label: 'طلب أونلاين', value: 'online_ordering', icon: 'ShoppingBag' }
    )
  } else if (businessType === 'beauty_salon' || businessType === 'clinic') {
    options.unshift({
      id: 'booking_calendar',
      label: 'نظام حجز مواعيد',
      value: 'booking_calendar',
      icon: 'Calendar',
    })
  }

  return {
    id: 'functionality',
    type: 'functionality',
    question,
    answerType: 'checkbox',
    options,
    required: true,
  }
}

/**
 * Styling Question (theme preference)
 */
function createStylingQuestion(): ClarifyingQuestion {
  const options: QuestionOption[] = Object.entries(THEME_CATALOG).map(([key, config]) => ({
    id: key,
    label: config.ar,
    value: key,
    icon: getThemeIcon(key),
  }))

  // Add custom color option
  options.push({
    id: 'custom',
    label: 'ألوان مخصصة',
    value: 'custom',
    icon: 'Palette',
  })

  return {
    id: 'styling',
    type: 'styling',
    question: 'ما الطابع المفضل للموقع؟',
    answerType: 'radio',
    options,
    required: true,
  }
}

/**
 * Merge answers back into detected parameters
 */
export function mergeAnswersWithParameters(
  detectedParams: DetectedParameters,
  answers: ClarifyingAnswers
): DetectedParameters {
  const merged = { ...detectedParams }

  // Business Type
  if (answers.business_type && typeof answers.business_type === 'string') {
    const key = answers.business_type
    const config = BUSINESS_TYPES[key as keyof typeof BUSINESS_TYPES]
    if (config) {
      merged.businessType = {
        type: key,
        keywords: [],
        confidence: 1.0,
        arabicName: config.ar,
      }
    }
  }

  // Services
  if (answers.services) {
    const selectedServices = Array.isArray(answers.services)
      ? answers.services
      : Object.keys(answers.services).filter((k) => (answers.services as any)[k])

    merged.services = {
      services: selectedServices,
      arabicServices: selectedServices.map((s) => {
        // Map back to Arabic (best effort)
        return s
      }),
      confidence: 1.0,
    }
  }

  // Functionality
  if (answers.functionality) {
    const selectedWidgets = Array.isArray(answers.functionality)
      ? answers.functionality
      : Object.keys(answers.functionality).filter((k) => (answers.functionality as any)[k])

    merged.functionality = {
      widgets: selectedWidgets,
      pages: ['home', 'about', 'services', 'contact'], // Default pages
      confidence: 1.0,
    }
  }

  // Styling
  if (answers.styling && typeof answers.styling === 'string') {
    const key = answers.styling
    const config = THEME_CATALOG[key as keyof typeof THEME_CATALOG]
    if (config) {
      merged.styling = {
        theme: key,
        colors: config.colors,
        arabicTheme: config.ar,
        confidence: 1.0,
      }
    } else if (key === 'custom' && answers.custom_colors) {
      // Handle custom colors
      merged.styling = {
        theme: 'custom',
        colors: answers.custom_colors as any,
        arabicTheme: 'ألوان مخصصة',
        confidence: 1.0,
      }
    }
  }

  return merged
}

/**
 * Helper: Get icon for business type
 */
function getBusinessIcon(type: string): string {
  const icons: Record<string, string> = {
    beauty_salon: 'Scissors',
    restaurant: 'UtensilsCrossed',
    ecommerce: 'ShoppingBag',
    clinic: 'Stethoscope',
    portfolio: 'Briefcase',
    real_estate: 'Home',
  }
  return icons[type] || 'Building'
}

/**
 * Helper: Get icon for widget
 */
function getWidgetIcon(widget: string): string {
  const icons: Record<string, string> = {
    booking_calendar: 'Calendar',
    gallery: 'Images',
    whatsapp_bubble: 'MessageCircle',
    menu: 'Menu',
    online_ordering: 'ShoppingBag',
    location_map: 'MapPin',
    product_grid: 'Grid3x3',
    cart: 'ShoppingCart',
    payment: 'CreditCard',
    contact_form: 'Mail',
    testimonials: 'Quote',
    pricing_table: 'DollarSign',
    faq_accordion: 'HelpCircle',
    team_profiles: 'Users',
    blog_feed: 'FileText',
    search_bar: 'Search',
    filters: 'Filter',
    newsletter: 'Newspaper',
    social_links: 'Share2',
    video_embed: 'Video',
  }
  return icons[widget] || 'Box'
}

/**
 * Helper: Get icon for theme
 */
function getThemeIcon(theme: string): string {
  const icons: Record<string, string> = {
    feminine_modern: 'Sparkles',
    classic_luxury: 'Crown',
    minimal_clean: 'Minus',
    bold_modern: 'Zap',
    professional_corporate: 'Briefcase',
  }
  return icons[theme] || 'Palette'
}
