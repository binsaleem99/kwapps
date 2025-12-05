/**
 * Banana.dev Image AI - Main Export
 *
 * KWq8.com Image Enhancement Service
 * Available ONLY for Premium (59 KWD) and Enterprise (75 KWD) tiers
 *
 * Credit Cost: 2.5 credits per enhancement
 */

// Types
export type {
  ImageQuality,
  AspectRatio,
  UpscaleScale,
  EnhancementType,
  ImageUpscaleRequest,
  ImageUpscaleResponse,
  ImageEnhanceRequest,
  ImageEnhanceResponse,
  ImageAspectRatioRequest,
  ImageQualityCheckRequest,
  ImageQualityCheckResponse,
  ImageIssue,
  ImageRecommendation,
  RateLimitInfo,
} from './types'

// Constants
export {
  BANANA_CREDIT_COST,
  QUALITY_THRESHOLD,
  MAX_IMAGE_SIZE,
  SUPPORTED_FORMATS,
  RATE_LIMITS,
  ELIGIBLE_TIERS,
  QUALITY_THRESHOLDS,
  QUALITY_LABELS_AR,
  ENHANCEMENT_LABELS_AR,
  ISSUE_LABELS_AR,
} from './types'

// Client
export {
  BananaClient,
  getBananaClient,
  createBananaClient,
} from './client'
