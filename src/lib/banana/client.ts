/**
 * Banana.dev Image AI Client
 *
 * KWq8.com Image Enhancement Service
 * Available ONLY for Premium (59 KWD) and Enterprise (75 KWD) tiers
 *
 * Features:
 * - Image upscaling (Real-ESRGAN)
 * - Quality enhancement
 * - Aspect ratio adjustment
 * - Rate limiting per user
 */

import type {
  ImageUpscaleRequest,
  ImageUpscaleResponse,
  ImageEnhanceRequest,
  ImageEnhanceResponse,
  ImageAspectRatioRequest,
  ImageQualityCheckRequest,
  ImageQualityCheckResponse,
  ImageQuality,
  ImageIssue,
  ImageRecommendation,
  RateLimitInfo,
  BananaApiResponse,
} from './types'

import {
  RATE_LIMITS,
  QUALITY_THRESHOLDS,
  QUALITY_THRESHOLD,
  MAX_IMAGE_SIZE,
  SUPPORTED_FORMATS,
  QUALITY_LABELS_AR,
  ISSUE_LABELS_AR,
  ENHANCEMENT_LABELS_AR,
} from './types'

// ============================================
// Configuration
// ============================================

interface BananaConfig {
  apiKey: string
  modelKey: string
  baseUrl: string
}

const DEFAULT_CONFIG: BananaConfig = {
  apiKey: process.env.BANANA_API_KEY || '',
  modelKey: process.env.BANANA_MODEL_KEY || '',
  baseUrl: 'https://api.banana.dev',
}

// ============================================
// Banana.dev Client Class
// ============================================

export class BananaClient {
  private config: BananaConfig
  private rateLimitCache: Map<string, RateLimitInfo> = new Map()

  constructor(config?: Partial<BananaConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    if (!this.config.apiKey) {
      console.warn('[Banana] API key not configured - using mock mode')
    }
  }

  // ============================================
  // Image Upscaling (Real-ESRGAN)
  // ============================================

  async upscaleImage(request: ImageUpscaleRequest): Promise<ImageUpscaleResponse> {
    const startTime = Date.now()

    // Validate request
    const validation = this.validateImageRequest(request.image, request.isUrl)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        errorAr: validation.errorAr,
      }
    }

    // Use mock if no API key
    if (!this.config.apiKey) {
      return this.mockUpscaleImage(request)
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/start/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          modelKey: this.config.modelKey,
          modelInputs: {
            image: request.image,
            scale: request.scale,
            model: request.model || 'realesrgan',
            face_enhance: request.faceEnhance || false,
            output_format: request.outputFormat || 'png',
            output_quality: request.outputQuality || 95,
          },
        }),
      })

      const data = await response.json() as BananaApiResponse<{ image: string }>

      if (!response.ok || !data.modelOutputs?.[0]?.image) {
        return {
          success: false,
          error: data.message || 'Upscaling failed',
          errorAr: 'فشل تكبير الصورة',
        }
      }

      const resultImage = data.modelOutputs[0].image

      return {
        success: true,
        image: resultImage,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('[Banana] Upscale error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال بخدمة تحسين الصور',
      }
    }
  }

  // ============================================
  // Image Quality Enhancement
  // ============================================

  async enhanceQuality(request: ImageEnhanceRequest): Promise<ImageEnhanceResponse> {
    const startTime = Date.now()

    // Validate request
    const validation = this.validateImageRequest(request.image, request.isUrl)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        errorAr: validation.errorAr,
      }
    }

    // Use mock if no API key
    if (!this.config.apiKey) {
      return this.mockEnhanceQuality(request)
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/start/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          modelKey: this.config.modelKey,
          modelInputs: {
            image: request.image,
            enhancement_type: request.enhancementType,
            denoise_strength: request.denoiseStrength || 0.5,
            sharpen_strength: request.sharpenStrength || 0.3,
            output_format: request.outputFormat || 'png',
          },
        }),
      })

      const data = await response.json() as BananaApiResponse<{ image: string; quality_before?: number; quality_after?: number }>

      if (!response.ok || !data.modelOutputs?.[0]?.image) {
        return {
          success: false,
          error: data.message || 'Enhancement failed',
          errorAr: 'فشل تحسين الصورة',
        }
      }

      const output = data.modelOutputs[0]

      return {
        success: true,
        image: output.image,
        qualityBefore: output.quality_before,
        qualityAfter: output.quality_after,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('[Banana] Enhance error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال بخدمة تحسين الصور',
      }
    }
  }

  // ============================================
  // Aspect Ratio Adjustment
  // ============================================

  async adjustAspectRatio(request: ImageAspectRatioRequest): Promise<ImageEnhanceResponse> {
    const startTime = Date.now()

    // Validate request
    const validation = this.validateImageRequest(request.image, request.isUrl)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        errorAr: validation.errorAr,
      }
    }

    // Use mock if no API key
    if (!this.config.apiKey) {
      return this.mockAdjustAspectRatio(request)
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/start/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          modelKey: this.config.modelKey,
          modelInputs: {
            image: request.image,
            aspect_ratio: request.aspectRatio,
            crop_mode: request.cropMode || 'smart',
            background_color: request.backgroundColor || '#ffffff',
          },
        }),
      })

      const data = await response.json() as BananaApiResponse<{ image: string }>

      if (!response.ok || !data.modelOutputs?.[0]?.image) {
        return {
          success: false,
          error: data.message || 'Aspect ratio adjustment failed',
          errorAr: 'فشل تعديل نسبة العرض للارتفاع',
        }
      }

      return {
        success: true,
        image: data.modelOutputs[0].image,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('[Banana] Aspect ratio error:', error)
      return {
        success: false,
        error: 'Connection error',
        errorAr: 'خطأ في الاتصال بخدمة تحسين الصور',
      }
    }
  }

  // ============================================
  // Image Quality Analysis (Local - No API call)
  // ============================================

  async analyzeImageQuality(request: ImageQualityCheckRequest): Promise<ImageQualityCheckResponse> {
    try {
      // Parse image to get dimensions and analyze
      const imageInfo = await this.getImageInfo(request.image, request.isUrl)

      if (!imageInfo.valid) {
        return {
          success: false,
          qualityScore: 0,
          qualityLevel: 'low',
          resolution: { width: 0, height: 0, megapixels: 0 },
          issues: [],
          recommendations: [],
          needsEnhancement: false,
          error: imageInfo.error,
          errorAr: imageInfo.errorAr,
        }
      }

      // Calculate quality score based on resolution
      const { width, height } = imageInfo
      const megapixels = (width * height) / 1000000
      let qualityScore = this.calculateQualityScore(width, height)

      // Detect issues
      const issues: ImageIssue[] = []
      const recommendations: ImageRecommendation[] = []

      // Low resolution check
      if (megapixels < 0.5) {
        issues.push({
          type: 'low_resolution',
          severity: 'high',
          descriptionAr: 'الصورة ذات دقة منخفضة جداً',
          descriptionEn: 'Image has very low resolution',
        })
        recommendations.push({
          enhancementType: 'upscale',
          priority: 1,
          descriptionAr: 'ننصح بتكبير الدقة 4x للحصول على جودة أفضل',
          descriptionEn: 'Recommend 4x upscaling for better quality',
          expectedImprovement: 40,
        })
      } else if (megapixels < 2) {
        issues.push({
          type: 'low_resolution',
          severity: 'medium',
          descriptionAr: 'الصورة بحاجة لتحسين الدقة',
          descriptionEn: 'Image could use resolution improvement',
        })
        recommendations.push({
          enhancementType: 'upscale',
          priority: 2,
          descriptionAr: 'ننصح بتكبير الدقة 2x',
          descriptionEn: 'Recommend 2x upscaling',
          expectedImprovement: 25,
        })
      }

      // Add general enhancement recommendation if quality is medium or below
      if (qualityScore < 70) {
        recommendations.push({
          enhancementType: 'enhance',
          priority: issues.length > 0 ? 2 : 1,
          descriptionAr: 'تحسين الجودة العامة للصورة',
          descriptionEn: 'General quality enhancement',
          expectedImprovement: 20,
        })
      }

      // Determine quality level
      const qualityLevel = this.getQualityLevel(qualityScore)

      return {
        success: true,
        qualityScore,
        qualityLevel,
        resolution: {
          width,
          height,
          megapixels: Math.round(megapixels * 100) / 100,
        },
        issues,
        recommendations: recommendations.sort((a, b) => a.priority - b.priority),
        needsEnhancement: qualityScore < QUALITY_THRESHOLD,
      }
    } catch (error) {
      console.error('[Banana] Quality analysis error:', error)
      return {
        success: false,
        qualityScore: 0,
        qualityLevel: 'low',
        resolution: { width: 0, height: 0, megapixels: 0 },
        issues: [],
        recommendations: [],
        needsEnhancement: false,
        error: 'Failed to analyze image',
        errorAr: 'فشل تحليل الصورة',
      }
    }
  }

  // ============================================
  // Rate Limiting
  // ============================================

  async checkRateLimit(userId: string, tierName: string): Promise<RateLimitInfo> {
    const limit = RATE_LIMITS[tierName] || 0
    const cacheKey = `${userId}-${new Date().toISOString().split('T')[0]}`

    // Check cache
    const cached = this.rateLimitCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // In production, this would check database
    // For now, return fresh limit
    const info: RateLimitInfo = {
      userId,
      dailyLimit: limit,
      dailyUsed: 0,
      remaining: limit,
      resetsAt: this.getEndOfDay(),
    }

    this.rateLimitCache.set(cacheKey, info)
    return info
  }

  async incrementRateLimit(userId: string, tierName: string): Promise<RateLimitInfo> {
    const info = await this.checkRateLimit(userId, tierName)
    info.dailyUsed++
    info.remaining = Math.max(0, info.dailyLimit - info.dailyUsed)

    const cacheKey = `${userId}-${new Date().toISOString().split('T')[0]}`
    this.rateLimitCache.set(cacheKey, info)

    return info
  }

  // ============================================
  // Helper Methods
  // ============================================

  private validateImageRequest(
    image: string,
    isUrl?: boolean
  ): { valid: boolean; error?: string; errorAr?: string } {
    if (!image) {
      return {
        valid: false,
        error: 'Image is required',
        errorAr: 'الصورة مطلوبة',
      }
    }

    if (isUrl) {
      // Validate URL
      try {
        new URL(image)
        return { valid: true }
      } catch {
        return {
          valid: false,
          error: 'Invalid image URL',
          errorAr: 'رابط الصورة غير صالح',
        }
      }
    }

    // Validate base64
    if (!image.startsWith('data:image/')) {
      // Try to detect if it's raw base64
      try {
        atob(image.slice(0, 100))
        return { valid: true }
      } catch {
        return {
          valid: false,
          error: 'Invalid image format',
          errorAr: 'صيغة الصورة غير صالحة',
        }
      }
    }

    // Check size (rough estimate for base64)
    const estimatedSize = (image.length * 3) / 4
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: 'Image too large (max 10MB)',
        errorAr: 'الصورة كبيرة جداً (الحد الأقصى 10 ميجابايت)',
      }
    }

    return { valid: true }
  }

  private async getImageInfo(
    image: string,
    isUrl?: boolean
  ): Promise<{ valid: boolean; width: number; height: number; error?: string; errorAr?: string }> {
    // For server-side, we'd use sharp or similar
    // For now, estimate based on base64 size
    try {
      if (isUrl) {
        // Would need to fetch image to get dimensions
        // Return estimated values for now
        return { valid: true, width: 1920, height: 1080 }
      }

      // Estimate from base64 size (rough approximation)
      const base64Length = image.replace(/^data:image\/[a-z]+;base64,/, '').length
      const estimatedBytes = (base64Length * 3) / 4
      const estimatedPixels = estimatedBytes / 3 // Assume RGB

      const dimension = Math.sqrt(estimatedPixels)
      return {
        valid: true,
        width: Math.round(dimension * 1.33), // Assume 4:3 ratio
        height: Math.round(dimension),
      }
    } catch {
      return {
        valid: false,
        width: 0,
        height: 0,
        error: 'Failed to analyze image',
        errorAr: 'فشل تحليل الصورة',
      }
    }
  }

  private calculateQualityScore(width: number, height: number): number {
    const megapixels = (width * height) / 1000000

    // Score based on resolution
    if (megapixels >= 8) return 95  // 4K+
    if (megapixels >= 4) return 85  // 2K-4K
    if (megapixels >= 2) return 75  // Full HD+
    if (megapixels >= 1) return 60  // HD
    if (megapixels >= 0.5) return 45  // 720p-ish
    if (megapixels >= 0.25) return 30  // Low
    return 15  // Very low
  }

  private getQualityLevel(score: number): ImageQuality {
    if (score >= QUALITY_THRESHOLDS.ultra.min) return 'ultra'
    if (score >= QUALITY_THRESHOLDS.high.min) return 'high'
    if (score >= QUALITY_THRESHOLDS.medium.min) return 'medium'
    return 'low'
  }

  private getEndOfDay(): string {
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay.toISOString()
  }

  // ============================================
  // Mock Methods (Development)
  // ============================================

  private async mockUpscaleImage(request: ImageUpscaleRequest): Promise<ImageUpscaleResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      success: true,
      image: request.image, // Return same image in mock
      originalSize: { width: 500, height: 500 },
      resultSize: {
        width: 500 * request.scale,
        height: 500 * request.scale,
      },
      processingTime: 1500,
    }
  }

  private async mockEnhanceQuality(request: ImageEnhanceRequest): Promise<ImageEnhanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200))

    return {
      success: true,
      image: request.image,
      qualityBefore: 45,
      qualityAfter: 78,
      processingTime: 1200,
    }
  }

  private async mockAdjustAspectRatio(request: ImageAspectRatioRequest): Promise<ImageEnhanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      success: true,
      image: request.image,
      processingTime: 800,
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let bananaClient: BananaClient | null = null

export function getBananaClient(): BananaClient {
  if (!bananaClient) {
    bananaClient = new BananaClient()
  }
  return bananaClient
}

export function createBananaClient(config: Partial<BananaConfig>): BananaClient {
  return new BananaClient(config)
}
