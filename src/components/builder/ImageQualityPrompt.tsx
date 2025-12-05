'use client'

/**
 * Image Quality Prompt Component
 *
 * Modal shown when a low-quality image is detected
 * - Shows quality score and issues
 * - Upgrade to Premium button for Basic/Pro users
 * - Enhance now button for Premium+ users
 * - Skip option
 *
 * Arabic-first, RTL, Cairo font
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ImageIcon,
  SparklesIcon,
  AlertTriangleIcon,
  ArrowUpIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  ZapIcon,
} from 'lucide-react'
import type {
  ImageQuality,
  ImageIssue,
  ImageRecommendation,
} from '@/lib/banana/types'
import {
  QUALITY_LABELS_AR,
  ELIGIBLE_TIERS,
  BANANA_CREDIT_COST,
} from '@/lib/banana/types'

interface ImageQualityPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Quality analysis results
  qualityScore: number
  qualityLevel: ImageQuality
  resolution: {
    width: number
    height: number
    megapixels: number
  }
  issues: ImageIssue[]
  recommendations: ImageRecommendation[]
  // User info
  userTier?: string | null
  creditsBalance?: number
  // Image data
  imagePreview?: string
  // Callbacks
  onEnhance?: () => void
  onSkip?: () => void
}

export default function ImageQualityPrompt({
  open,
  onOpenChange,
  qualityScore,
  qualityLevel,
  resolution,
  issues,
  recommendations,
  userTier,
  creditsBalance,
  imagePreview,
  onEnhance,
  onSkip,
}: ImageQualityPromptProps) {
  const router = useRouter()
  const [isEnhancing, setIsEnhancing] = useState(false)

  const canEnhance = userTier ? ELIGIBLE_TIERS.includes(userTier) : false
  const hasEnoughCredits = (creditsBalance ?? 0) >= BANANA_CREDIT_COST

  const getQualityColor = (level: ImageQuality) => {
    switch (level) {
      case 'ultra':
        return 'bg-green-500'
      case 'high':
        return 'bg-blue-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getQualityBadgeVariant = (level: ImageQuality) => {
    switch (level) {
      case 'ultra':
        return 'default'
      case 'high':
        return 'secondary'
      case 'medium':
        return 'outline'
      case 'low':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleEnhance = async () => {
    if (!onEnhance) return

    setIsEnhancing(true)
    try {
      await onEnhance()
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push('/pricing')
  }

  const handleSkip = () => {
    onSkip?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        dir="rtl"
        style={{ fontFamily: 'Cairo, sans-serif' }}
      >
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />
            صورتك بحاجة للتحسين
          </DialogTitle>
          <DialogDescription className="text-right">
            اكتشفنا أن جودة الصورة منخفضة. استخدم تقنية الذكاء الاصطناعي لتحسينها.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Preview & Quality Score */}
          <div className="flex gap-4 items-start">
            {imagePreview && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-3">
              {/* Quality Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">درجة الجودة</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{qualityScore}%</span>
                    <Badge variant={getQualityBadgeVariant(qualityLevel)}>
                      {QUALITY_LABELS_AR[qualityLevel]}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={qualityScore}
                  className="h-2"
                />
              </div>

              {/* Resolution */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">الدقة</span>
                <span className="font-medium">
                  {resolution.width} × {resolution.height}
                  <span className="text-slate-400 mr-1">
                    ({resolution.megapixels} MP)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <XIcon className="h-4 w-4" />
                المشاكل المكتشفة
              </h4>
              <ul className="space-y-1">
                {issues.map((issue, index) => (
                  <li
                    key={index}
                    className="text-sm text-red-700 flex items-center gap-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        issue.severity === 'high'
                          ? 'bg-red-500'
                          : issue.severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    {issue.descriptionAr}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                التحسينات المقترحة
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-blue-700 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4" />
                      {rec.descriptionAr}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      +{rec.expectedImprovement}%
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Credit Cost Info */}
          {canEnhance && (
            <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                تكلفة التحسين
              </span>
              <div className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{BANANA_CREDIT_COST} رصيد</span>
                {creditsBalance !== undefined && (
                  <span className="text-slate-400 text-sm">
                    (لديك {creditsBalance})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Upgrade Notice for non-eligible users */}
          {!canEnhance && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <ArrowUpIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-800">
                    ميزة حصرية للاشتراكات المميزة
                  </h4>
                  <p className="text-sm text-purple-600 mt-1">
                    تحسين الصور بالذكاء الاصطناعي متاح فقط لاشتراكات{' '}
                    <span className="font-semibold">مميز (59 د.ك)</span> و{' '}
                    <span className="font-semibold">مؤسسي (75 د.ك)</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row-reverse gap-2 sm:gap-2">
          {canEnhance ? (
            <>
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing || !hasEnoughCredits}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isEnhancing ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin ml-2" />
                    جاري التحسين...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 ml-2" />
                    تحسين الآن
                  </>
                )}
              </Button>
              {!hasEnoughCredits && (
                <p className="text-xs text-red-500 mt-1">
                  رصيدك غير كافٍ
                </p>
              )}
            </>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <ArrowUpIcon className="h-4 w-4 ml-2" />
              ترقية الاشتراك
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleSkip}
          >
            تخطي
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook to check image quality and show prompt if needed
 */
export function useImageQualityCheck() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [qualityData, setQualityData] = useState<{
    qualityScore: number
    qualityLevel: ImageQuality
    resolution: { width: number; height: number; megapixels: number }
    issues: ImageIssue[]
    recommendations: ImageRecommendation[]
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkImageQuality = async (
    image: string,
    isUrl?: boolean
  ): Promise<boolean> => {
    setIsChecking(true)

    try {
      const response = await fetch('/api/images/check-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, isUrl }),
      })

      const data = await response.json()

      if (data.success && data.needsEnhancement) {
        setQualityData({
          qualityScore: data.quality.score,
          qualityLevel: data.quality.level,
          resolution: data.resolution,
          issues: data.issues,
          recommendations: data.recommendations,
        })
        setShowPrompt(true)
        return true // Needs enhancement
      }

      return false // Quality is good
    } catch (error) {
      console.error('Quality check failed:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  const enhanceImage = async (
    image: string,
    enhancementType: string = 'upscale',
    options?: { scale?: number }
  ): Promise<{ success: boolean; enhancedImage?: string; error?: string }> => {
    try {
      const response = await fetch('/api/images/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          enhancementType,
          scale: options?.scale || 2,
        }),
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, enhancedImage: data.image }
      }

      return {
        success: false,
        error: data.error?.messageAr || data.error?.message || 'فشل التحسين',
      }
    } catch (error) {
      return { success: false, error: 'خطأ في الاتصال' }
    }
  }

  return {
    showPrompt,
    setShowPrompt,
    qualityData,
    isChecking,
    checkImageQuality,
    enhanceImage,
  }
}
