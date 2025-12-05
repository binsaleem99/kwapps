// ==============================================
// KW APPS - Schema Analyzer for Admin Dashboards
// ==============================================
// Analyzes generated website code to detect:
// - Products, services, pages, forms, content blocks
// - Extracts editable fields and their types
// - Returns structured schema for dashboard generation
// ==============================================

/**
 * Content types that can be detected in generated code
 */
export type ContentType =
  | 'products'
  | 'services'
  | 'pages'
  | 'forms'
  | 'content_blocks'
  | 'users'
  | 'testimonials'
  | 'team_members'
  | 'gallery'
  | 'pricing'
  | 'faq'
  | 'blog'
  | 'contact'

/**
 * Field types for editable content
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'price'
  | 'image'
  | 'images'
  | 'url'
  | 'email'
  | 'phone'
  | 'date'
  | 'boolean'
  | 'select'
  | 'color'

/**
 * Editable field definition
 */
export interface EditableField {
  name: string
  key: string // Alias for name for dashboard compatibility
  nameAr: string
  type: FieldType
  required: boolean
  defaultValue?: string | number | boolean
  options?: string[] // For select fields
  placeholder?: string
  placeholderAr?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
    messageAr?: string
  }
}

/**
 * Content section detected in code
 */
export interface ContentSection {
  id: string
  type: ContentType
  nameAr: string
  nameEn: string
  labelAr: string // Alias for nameAr for dashboard compatibility
  description?: string
  descriptionAr?: string
  fields: EditableField[]
  isArray: boolean // If true, supports multiple items (e.g., products list)
  maxItems?: number
  detectedCount?: number // Number of items found in code
  codeLocation?: {
    startLine: number
    endLine: number
    componentName?: string
  }
}

/**
 * Complete project schema
 */
export interface ProjectSchema {
  projectId: string
  analyzedAt: string
  sections: ContentSection[]
  hasAuth: boolean
  hasEcommerce: boolean
  hasBlog: boolean
  hasContactForm: boolean
  primaryLanguage: 'ar' | 'en'
  detectedComponents: string[]
  totalEditableFields: number
}

/**
 * Detection patterns for content types
 */
export const DETECTION_PATTERNS: Record<ContentType, RegExp[]> = {
  products: [
    /(?:منتج|product|سعر|price|د\.ك|KWD|سلة|cart|إضافة للسلة|add to cart)/gi,
    /\b(products?|items?|goods?|merchandise)\b/gi,
    /className="[^"]*product[^"]*"/gi,
  ],
  services: [
    /(?:خدمة|service|خدماتنا|our services)/gi,
    /\b(services?|offerings?)\b/gi,
    /className="[^"]*service[^"]*"/gi,
  ],
  pages: [
    /(?:صفحة|page|من نحن|about|تواصل|contact)/gi,
    /\b(pages?|sections?)\b/gi,
  ],
  forms: [
    /<form[\s\S]*?<\/form>/gi,
    /(?:نموذج|form|إرسال|submit|اتصل بنا)/gi,
    /onSubmit|handleSubmit/gi,
  ],
  content_blocks: [
    /<section[\s\S]*?<\/section>/gi,
    /className="[^"]*hero[^"]*"/gi,
    /className="[^"]*cta[^"]*"/gi,
  ],
  users: [
    /(?:مستخدم|user|تسجيل|login|register|auth)/gi,
    /supabase\.auth|createClient/gi,
  ],
  testimonials: [
    /(?:آراء|testimonial|شهادات|review|عملاء|customers say)/gi,
    /className="[^"]*testimonial[^"]*"/gi,
  ],
  team_members: [
    /(?:فريق|team|أعضاء|members|موظفين)/gi,
    /className="[^"]*team[^"]*"/gi,
  ],
  gallery: [
    /(?:معرض|gallery|صور|photos|images)/gi,
    /className="[^"]*gallery[^"]*"/gi,
  ],
  pricing: [
    /(?:أسعار|pricing|خطط|plans|اشتراك|subscription)/gi,
    /className="[^"]*pricing[^"]*"/gi,
  ],
  faq: [
    /(?:أسئلة|faq|شائعة|frequently|سؤال وجواب)/gi,
    /className="[^"]*faq[^"]*"/gi,
  ],
  blog: [
    /(?:مدونة|blog|مقالات|articles|أخبار|news)/gi,
    /className="[^"]*blog[^"]*"/gi,
  ],
  contact: [
    /(?:تواصل|contact|اتصل|email|phone|هاتف|بريد)/gi,
    /className="[^"]*contact[^"]*"/gi,
  ],
}

/**
 * Field definitions for each content type
 */
export const CONTENT_TYPE_FIELDS: Record<ContentType, EditableField[]> = {
  products: [
    { name: 'name', key: 'name', nameAr: 'اسم المنتج', type: 'text', required: true },
    { name: 'description', key: 'description', nameAr: 'الوصف', type: 'textarea', required: false },
    { name: 'price', key: 'price', nameAr: 'السعر', type: 'price', required: true },
    { name: 'originalPrice', key: 'originalPrice', nameAr: 'السعر الأصلي', type: 'price', required: false },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: true },
    { name: 'images', key: 'images', nameAr: 'صور إضافية', type: 'images', required: false },
    { name: 'category', key: 'category', nameAr: 'التصنيف', type: 'select', required: false },
    { name: 'inStock', key: 'inStock', nameAr: 'متوفر', type: 'boolean', required: false, defaultValue: true },
    { name: 'featured', key: 'featured', nameAr: 'مميز', type: 'boolean', required: false, defaultValue: false },
  ],
  services: [
    { name: 'title', key: 'title', nameAr: 'عنوان الخدمة', type: 'text', required: true },
    { name: 'description', key: 'description', nameAr: 'الوصف', type: 'textarea', required: true },
    { name: 'icon', key: 'icon', nameAr: 'الأيقونة', type: 'text', required: false },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: false },
    { name: 'price', key: 'price', nameAr: 'السعر', type: 'price', required: false },
    { name: 'features', key: 'features', nameAr: 'المميزات', type: 'textarea', required: false },
  ],
  pages: [
    { name: 'title', key: 'title', nameAr: 'عنوان الصفحة', type: 'text', required: true },
    { name: 'slug', key: 'slug', nameAr: 'الرابط', type: 'text', required: true },
    { name: 'content', key: 'content', nameAr: 'المحتوى', type: 'richtext', required: true },
    { name: 'metaTitle', key: 'metaTitle', nameAr: 'عنوان SEO', type: 'text', required: false },
    { name: 'metaDescription', key: 'metaDescription', nameAr: 'وصف SEO', type: 'textarea', required: false },
    { name: 'featured_image', key: 'featured_image', nameAr: 'الصورة الرئيسية', type: 'image', required: false },
  ],
  forms: [
    { name: 'title', key: 'title', nameAr: 'عنوان النموذج', type: 'text', required: true },
    { name: 'submitText', key: 'submitText', nameAr: 'نص الإرسال', type: 'text', required: false, defaultValue: 'إرسال' },
    { name: 'successMessage', key: 'successMessage', nameAr: 'رسالة النجاح', type: 'textarea', required: false },
    { name: 'recipientEmail', key: 'recipientEmail', nameAr: 'البريد المستلم', type: 'email', required: false },
  ],
  content_blocks: [
    { name: 'title', key: 'title', nameAr: 'العنوان', type: 'text', required: false },
    { name: 'subtitle', key: 'subtitle', nameAr: 'العنوان الفرعي', type: 'text', required: false },
    { name: 'content', key: 'content', nameAr: 'المحتوى', type: 'richtext', required: false },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: false },
    { name: 'buttonText', key: 'buttonText', nameAr: 'نص الزر', type: 'text', required: false },
    { name: 'buttonUrl', key: 'buttonUrl', nameAr: 'رابط الزر', type: 'url', required: false },
  ],
  users: [
    { name: 'allowRegistration', key: 'allowRegistration', nameAr: 'السماح بالتسجيل', type: 'boolean', required: false, defaultValue: true },
    { name: 'requireEmailVerification', key: 'requireEmailVerification', nameAr: 'تأكيد البريد', type: 'boolean', required: false, defaultValue: false },
  ],
  testimonials: [
    { name: 'name', key: 'name', nameAr: 'الاسم', type: 'text', required: true },
    { name: 'title', key: 'title', nameAr: 'المنصب', type: 'text', required: false },
    { name: 'content', key: 'content', nameAr: 'التعليق', type: 'textarea', required: true },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: false },
    { name: 'rating', key: 'rating', nameAr: 'التقييم', type: 'number', required: false, validation: { min: 1, max: 5 } },
  ],
  team_members: [
    { name: 'name', key: 'name', nameAr: 'الاسم', type: 'text', required: true },
    { name: 'position', key: 'position', nameAr: 'المنصب', type: 'text', required: true },
    { name: 'bio', key: 'bio', nameAr: 'نبذة', type: 'textarea', required: false },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: true },
    { name: 'email', key: 'email', nameAr: 'البريد', type: 'email', required: false },
    { name: 'linkedin', key: 'linkedin', nameAr: 'لينكد إن', type: 'url', required: false },
  ],
  gallery: [
    { name: 'title', key: 'title', nameAr: 'العنوان', type: 'text', required: false },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: true },
    { name: 'caption', key: 'caption', nameAr: 'الوصف', type: 'text', required: false },
    { name: 'category', key: 'category', nameAr: 'التصنيف', type: 'select', required: false },
  ],
  pricing: [
    { name: 'name', key: 'name', nameAr: 'اسم الخطة', type: 'text', required: true },
    { name: 'price', key: 'price', nameAr: 'السعر', type: 'price', required: true },
    { name: 'period', key: 'period', nameAr: 'الفترة', type: 'select', required: false, options: ['شهري', 'سنوي'] },
    { name: 'features', key: 'features', nameAr: 'المميزات', type: 'textarea', required: true },
    { name: 'highlighted', key: 'highlighted', nameAr: 'مميز', type: 'boolean', required: false, defaultValue: false },
    { name: 'buttonText', key: 'buttonText', nameAr: 'نص الزر', type: 'text', required: false, defaultValue: 'اشترك الآن' },
  ],
  faq: [
    { name: 'question', key: 'question', nameAr: 'السؤال', type: 'text', required: true },
    { name: 'answer', key: 'answer', nameAr: 'الإجابة', type: 'textarea', required: true },
    { name: 'category', key: 'category', nameAr: 'التصنيف', type: 'select', required: false },
  ],
  blog: [
    { name: 'title', key: 'title', nameAr: 'العنوان', type: 'text', required: true },
    { name: 'slug', key: 'slug', nameAr: 'الرابط', type: 'text', required: true },
    { name: 'excerpt', key: 'excerpt', nameAr: 'مقتطف', type: 'textarea', required: false },
    { name: 'content', key: 'content', nameAr: 'المحتوى', type: 'richtext', required: true },
    { name: 'image', key: 'image', nameAr: 'الصورة', type: 'image', required: true },
    { name: 'author', key: 'author', nameAr: 'الكاتب', type: 'text', required: false },
    { name: 'publishDate', key: 'publishDate', nameAr: 'تاريخ النشر', type: 'date', required: false },
    { name: 'category', key: 'category', nameAr: 'التصنيف', type: 'select', required: false },
  ],
  contact: [
    { name: 'email', key: 'email', nameAr: 'البريد الإلكتروني', type: 'email', required: false },
    { name: 'phone', key: 'phone', nameAr: 'الهاتف', type: 'phone', required: false },
    { name: 'address', key: 'address', nameAr: 'العنوان', type: 'textarea', required: false },
    { name: 'mapUrl', key: 'mapUrl', nameAr: 'رابط الخريطة', type: 'url', required: false },
    { name: 'workingHours', key: 'workingHours', nameAr: 'ساعات العمل', type: 'text', required: false },
  ],
}

/**
 * Arabic names for content types
 */
const CONTENT_TYPE_NAMES: Record<ContentType, { ar: string; en: string; descriptionAr: string }> = {
  products: { ar: 'المنتجات', en: 'Products', descriptionAr: 'إدارة منتجات المتجر' },
  services: { ar: 'الخدمات', en: 'Services', descriptionAr: 'إدارة الخدمات المقدمة' },
  pages: { ar: 'الصفحات', en: 'Pages', descriptionAr: 'إدارة صفحات الموقع' },
  forms: { ar: 'النماذج', en: 'Forms', descriptionAr: 'عرض الرسائل المستلمة' },
  content_blocks: { ar: 'أقسام المحتوى', en: 'Content Blocks', descriptionAr: 'تعديل أقسام الصفحة الرئيسية' },
  users: { ar: 'المستخدمين', en: 'Users', descriptionAr: 'إدارة مستخدمي الموقع' },
  testimonials: { ar: 'آراء العملاء', en: 'Testimonials', descriptionAr: 'إدارة آراء وتعليقات العملاء' },
  team_members: { ar: 'فريق العمل', en: 'Team', descriptionAr: 'إدارة أعضاء الفريق' },
  gallery: { ar: 'معرض الصور', en: 'Gallery', descriptionAr: 'إدارة صور المعرض' },
  pricing: { ar: 'الأسعار', en: 'Pricing', descriptionAr: 'إدارة خطط الأسعار' },
  faq: { ar: 'الأسئلة الشائعة', en: 'FAQ', descriptionAr: 'إدارة الأسئلة والأجوبة' },
  blog: { ar: 'المدونة', en: 'Blog', descriptionAr: 'إدارة المقالات والأخبار' },
  contact: { ar: 'التواصل', en: 'Contact', descriptionAr: 'تعديل معلومات التواصل' },
}

/**
 * Schema Analyzer Class
 */
export class SchemaAnalyzer {
  private code: string
  private projectId: string

  constructor(projectId: string, code: string) {
    this.projectId = projectId
    this.code = code
  }

  /**
   * Analyze the code and return complete schema
   */
  analyze(): ProjectSchema {
    const sections: ContentSection[] = []
    const detectedComponents: string[] = []

    // Detect all content types
    for (const [type, patterns] of Object.entries(DETECTION_PATTERNS)) {
      const contentType = type as ContentType
      const detected = this.detectContentType(contentType, patterns)

      if (detected.found) {
        const names = CONTENT_TYPE_NAMES[contentType]
        sections.push({
          id: `${this.projectId}_${contentType}`,
          type: contentType,
          nameAr: names.ar,
          nameEn: names.en,
          labelAr: names.ar, // Alias for dashboard compatibility
          descriptionAr: names.descriptionAr,
          fields: CONTENT_TYPE_FIELDS[contentType],
          isArray: this.isArrayType(contentType),
          detectedCount: detected.count,
          codeLocation: detected.location,
        })

        if (detected.componentName) {
          detectedComponents.push(detected.componentName)
        }
      }
    }

    // Extract component names
    const componentMatches = this.code.match(/(?:function|const)\s+([A-Z][a-zA-Z]+)/g) || []
    for (const match of componentMatches) {
      const name = match.replace(/(?:function|const)\s+/, '')
      if (!detectedComponents.includes(name)) {
        detectedComponents.push(name)
      }
    }

    // Calculate totals
    const totalEditableFields = sections.reduce(
      (sum, section) => sum + section.fields.length,
      0
    )

    return {
      projectId: this.projectId,
      analyzedAt: new Date().toISOString(),
      sections,
      hasAuth: this.detectAuth(),
      hasEcommerce: this.detectEcommerce(),
      hasBlog: sections.some(s => s.type === 'blog'),
      hasContactForm: sections.some(s => s.type === 'forms' || s.type === 'contact'),
      primaryLanguage: this.detectLanguage(),
      detectedComponents,
      totalEditableFields,
    }
  }

  /**
   * Detect if content type exists in code
   */
  private detectContentType(
    type: ContentType,
    patterns: RegExp[]
  ): { found: boolean; count: number; location?: { startLine: number; endLine: number }; componentName?: string } {
    let totalMatches = 0
    let firstMatchIndex = -1

    for (const pattern of patterns) {
      const matches = this.code.match(pattern)
      if (matches) {
        totalMatches += matches.length
        if (firstMatchIndex === -1) {
          firstMatchIndex = this.code.search(pattern)
        }
      }
    }

    // Require at least 2 matches for detection (reduce false positives)
    const found = totalMatches >= 2

    if (found && firstMatchIndex !== -1) {
      const lines = this.code.substring(0, firstMatchIndex).split('\n')
      const startLine = lines.length

      return {
        found: true,
        count: totalMatches,
        location: {
          startLine,
          endLine: startLine + 20, // Approximate
        },
      }
    }

    return { found: false, count: 0 }
  }

  /**
   * Check if content type supports arrays
   */
  private isArrayType(type: ContentType): boolean {
    const arrayTypes: ContentType[] = [
      'products',
      'services',
      'testimonials',
      'team_members',
      'gallery',
      'faq',
      'blog',
      'pricing',
    ]
    return arrayTypes.includes(type)
  }

  /**
   * Detect authentication in code
   */
  private detectAuth(): boolean {
    const authPatterns = [
      /supabase\.auth/i,
      /createClient/i,
      /useAuth/i,
      /signIn|signOut|signUp/i,
      /تسجيل الدخول|تسجيل خروج/i,
    ]
    return authPatterns.some(pattern => pattern.test(this.code))
  }

  /**
   * Detect ecommerce features
   */
  private detectEcommerce(): boolean {
    const ecommercePatterns = [
      /cart|سلة/i,
      /checkout|الدفع/i,
      /add.?to.?cart|إضافة للسلة/i,
      /price|سعر/i,
      /product/i,
    ]
    const matches = ecommercePatterns.filter(pattern => pattern.test(this.code))
    return matches.length >= 3 // Need at least 3 matches
  }

  /**
   * Detect primary language
   */
  private detectLanguage(): 'ar' | 'en' {
    const arabicMatches = (this.code.match(/[\u0600-\u06FF]/g) || []).length
    const latinMatches = (this.code.match(/[a-zA-Z]/g) || []).length

    // Count actual content, not code
    const textContent = this.code.replace(/<[^>]*>/g, '').replace(/[{}()[\];,.:]/g, '')
    const arabicContent = (textContent.match(/[\u0600-\u06FF]/g) || []).length

    return arabicContent > textContent.length * 0.1 ? 'ar' : 'en'
  }

  /**
   * Extract specific data from code (products, etc.)
   */
  extractData(type: ContentType): Record<string, unknown>[] {
    const items: Record<string, unknown>[] = []

    // This would need more sophisticated parsing
    // For now, return empty array - data will be stored separately
    return items
  }
}

/**
 * Helper function to analyze project code
 */
export async function analyzeProjectSchema(
  projectId: string,
  code: string
): Promise<ProjectSchema> {
  const analyzer = new SchemaAnalyzer(projectId, code)
  return analyzer.analyze()
}

/**
 * Get default content for a content type
 */
export function getDefaultContent(type: ContentType): Record<string, unknown> {
  const fields = CONTENT_TYPE_FIELDS[type]
  const content: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      content[field.name] = field.defaultValue
    } else if (field.type === 'boolean') {
      content[field.name] = false
    } else if (field.type === 'number' || field.type === 'price') {
      content[field.name] = 0
    } else {
      content[field.name] = ''
    }
  }

  return content
}
