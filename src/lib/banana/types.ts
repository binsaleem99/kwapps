/**
 * Banana.dev Image AI Types
 *
 * KWq8.com Image Enhancement Service
 * Available ONLY for Premium (59 KWD) and Enterprise (75 KWD) tiers
 *
 * Credit Cost: 2.5 credits per enhancement
 */

// ============================================
// Enums
// ============================================

export type ImageQuality = 'low' | 'medium' | 'high' | 'ultra'

export type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16' | '3:2' | '2:3' | 'original'

export type UpscaleScale = 2 | 4 | 8

export type EnhancementType =
  | 'upscale'           // Increase resolution
  | 'enhance'           // Improve quality (denoise, sharpen)
  | 'restore'           // Fix old/damaged images
  | 'colorize'          // Add color to B&W images
  | 'background_remove' // Remove background

// ============================================
// Request Types
// ============================================

export interface ImageUpscaleRequest {
  /** Base64 encoded image or URL */
  image: string
  /** Is the image a URL (true) or base64 (false) */
  isUrl?: boolean
  /** Upscale factor: 2x, 4x, or 8x */
  scale: UpscaleScale
  /** Model to use for upscaling */
  model?: 'realesrgan' | 'esrgan' | 'swinir'
  /** Enable face enhancement */
  faceEnhance?: boolean
  /** Output format */
  outputFormat?: 'png' | 'jpeg' | 'webp'
  /** JPEG/WebP quality (1-100) */
  outputQuality?: number
}

export interface ImageEnhanceRequest {
  /** Base64 encoded image or URL */
  image: string
  /** Is the image a URL (true) or base64 (false) */
  isUrl?: boolean
  /** Enhancement type */
  enhancementType: EnhancementType
  /** Desired output quality */
  targetQuality?: ImageQuality
  /** Denoise strength (0-1) */
  denoiseStrength?: number
  /** Sharpen strength (0-1) */
  sharpenStrength?: number
  /** Output format */
  outputFormat?: 'png' | 'jpeg' | 'webp'
}

export interface ImageAspectRatioRequest {
  /** Base64 encoded image or URL */
  image: string
  /** Is the image a URL (true) or base64 (false) */
  isUrl?: boolean
  /** Target aspect ratio */
  aspectRatio: AspectRatio
  /** How to handle cropping */
  cropMode?: 'center' | 'smart' | 'fill'
  /** Background color for fill mode (hex) */
  backgroundColor?: string
}

export interface ImageQualityCheckRequest {
  /** Base64 encoded image or URL */
  image: string
  /** Is the image a URL (true) or base64 (false) */
  isUrl?: boolean
}

// ============================================
// Response Types
// ============================================

export interface ImageUpscaleResponse {
  success: boolean
  /** Base64 encoded result image */
  image?: string
  /** URL to result image (if uploaded to storage) */
  imageUrl?: string
  /** Original dimensions */
  originalSize?: { width: number; height: number }
  /** Result dimensions */
  resultSize?: { width: number; height: number }
  /** Processing time in ms */
  processingTime?: number
  /** Error info */
  error?: string
  errorAr?: string
}

export interface ImageEnhanceResponse {
  success: boolean
  /** Base64 encoded result image */
  image?: string
  /** URL to result image */
  imageUrl?: string
  /** Quality scores before/after */
  qualityBefore?: number
  qualityAfter?: number
  /** Processing time in ms */
  processingTime?: number
  /** Error info */
  error?: string
  errorAr?: string
}

export interface ImageQualityCheckResponse {
  success: boolean
  /** Overall quality score (0-100) */
  qualityScore: number
  /** Quality level */
  qualityLevel: ImageQuality
  /** Resolution */
  resolution: {
    width: number
    height: number
    megapixels: number
  }
  /** Detected issues */
  issues: ImageIssue[]
  /** Recommended enhancements */
  recommendations: ImageRecommendation[]
  /** Should suggest enhancement? */
  needsEnhancement: boolean
  /** Error info */
  error?: string
  errorAr?: string
}

export interface ImageIssue {
  type: 'low_resolution' | 'noise' | 'blur' | 'compression_artifacts' | 'poor_lighting' | 'low_contrast'
  severity: 'low' | 'medium' | 'high'
  descriptionAr: string
  descriptionEn: string
}

export interface ImageRecommendation {
  enhancementType: EnhancementType
  priority: number
  descriptionAr: string
  descriptionEn: string
  expectedImprovement: number // 0-100
}

// ============================================
// API Response Wrapper
// ============================================

export interface BananaApiResponse<T> {
  id: string
  message: string
  created: number
  apiVersion: string
  modelOutputs: T[]
}

// ============================================
// Rate Limiting
// ============================================

export interface RateLimitInfo {
  userId: string
  dailyLimit: number
  dailyUsed: number
  remaining: number
  resetsAt: string
}

// ============================================
// Constants
// ============================================

/** Credit cost per enhancement operation */
export const BANANA_CREDIT_COST = 2.5

/** Minimum quality score threshold (below this, suggest enhancement) */
export const QUALITY_THRESHOLD = 60

/** Maximum image size in bytes (10MB) */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

/** Supported image formats */
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/** Daily rate limits by tier */
export const RATE_LIMITS: Record<string, number> = {
  premium: 50,    // 50 enhancements per day
  enterprise: 200, // 200 enhancements per day
}

/** Eligible tiers for image enhancement */
export const ELIGIBLE_TIERS = ['premium', 'enterprise']

/** Quality level thresholds */
export const QUALITY_THRESHOLDS: Record<ImageQuality, { min: number; max: number }> = {
  low: { min: 0, max: 30 },
  medium: { min: 31, max: 60 },
  high: { min: 61, max: 85 },
  ultra: { min: 86, max: 100 },
}

/** Arabic labels for quality levels */
export const QUALITY_LABELS_AR: Record<ImageQuality, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  ultra: 'ممتازة',
}

/** Arabic labels for enhancement types */
export const ENHANCEMENT_LABELS_AR: Record<EnhancementType, string> = {
  upscale: 'تكبير الدقة',
  enhance: 'تحسين الجودة',
  restore: 'إصلاح الصورة',
  colorize: 'تلوين الصورة',
  background_remove: 'إزالة الخلفية',
}

/** Arabic labels for issues */
export const ISSUE_LABELS_AR: Record<ImageIssue['type'], string> = {
  low_resolution: 'دقة منخفضة',
  noise: 'تشويش',
  blur: 'ضبابية',
  compression_artifacts: 'آثار الضغط',
  poor_lighting: 'إضاءة ضعيفة',
  low_contrast: 'تباين منخفض',
}
