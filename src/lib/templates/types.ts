/**
 * Template System Type Definitions
 */

export interface Template {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  category: TemplateCategory
  industry: string
  tags: string[]

  // Visual
  thumbnailUrl: string
  previewUrl?: string
  screenshots: string[]

  // Technical
  techStack: string[]
  features: TemplateFeature[]
  pages: TemplatePage[]
  sections: TemplateSection[]
  componentsUsed: string[]

  // Customization
  colorSchemes: ColorScheme[]
  contentRequirements: ContentRequirement[]
  imageRequirements: ImageRequirement[]
  customizationSteps: CustomizationStep[]

  // Metadata
  isPremium: boolean
  creditsToCustomize: number
  popularityScore: number
  averageRating: number
  isActive: boolean
  isNew: boolean
  featured: boolean
}

export type TemplateCategory =
  | 'ecommerce'
  | 'restaurant'
  | 'service'
  | 'corporate'
  | 'portfolio'
  | 'real_estate'
  | 'healthcare'
  | 'education'
  | 'government'
  | 'travel'

export interface TemplateFeature {
  id: string
  nameEn: string
  nameAr: string
  included: boolean
}

export interface TemplatePage {
  id: string
  name: string
  nameAr: string
  route: string
  sections: string[]
}

export interface TemplateSection {
  id: string
  name: string
  nameAr: string
  required: boolean
  order: number
}

export interface ColorScheme {
  id: string
  name: string
  nameAr: string
  primary: string
  secondary: string
  accent: string
  background: string
  preview: string
}

export interface ContentRequirement {
  field: string
  label: string
  labelAr: string
  type: 'text' | 'textarea' | 'rich_text' | 'url' | 'phone' | 'email'
  required: boolean
  placeholder?: string
  placeholderAr?: string
  maxLength?: number
}

export interface ImageRequirement {
  id: string
  label: string
  labelAr: string
  required: boolean
  dimensions?: string
  count?: number // For galleries
}

export interface CustomizationStep {
  step: number
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  fields: string[]
}

export interface TemplateCustomization {
  templateId: string
  basicInfo: {
    businessName: string
    businessNameEn?: string
    phone: string
    email: string
    address?: string
    workingHours?: string
    country: string
  }
  colorScheme: {
    preset?: string
    custom?: {
      primary: string
      secondary: string
      accent: string
    }
  }
  content: Record<string, string> // aboutUs, services, etc.
  images: Record<string, string | string[]> // logo, hero, featured, etc.
  enabledSections: string[]
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    whatsapp?: string
  }
}
