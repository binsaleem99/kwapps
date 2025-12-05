'use client'

/**
 * PublishModal Component
 *
 * Multi-step publish wizard:
 * 1. Subdomain selection (username.kwq8.com default)
 * 2. Custom domain option (premium)
 * 3. Deployment progress with live status
 * 4. Success celebration with share buttons
 */

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Rocket,
  Globe,
  Sparkles,
  Link2,
  Copy,
  Check,
  X,
  ExternalLink,
  Loader2,
  Coins,
  AlertCircle,
  CheckCircle2,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Crown,
} from 'lucide-react'

// Publish steps
type PublishStep = 'configure' | 'deploying' | 'success' | 'error'

// Deployment status from API
interface DeploymentStatus {
  step: string
  progress: number
  message: string
  error?: string
}

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  hasCode: boolean
  userCredits: number
  username?: string
  existingSubdomain?: string
  existingUrl?: string
}

export function PublishModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  hasCode,
  userCredits,
  username,
  existingSubdomain,
  existingUrl,
}: PublishModalProps) {
  // State
  const [step, setStep] = useState<PublishStep>('configure')
  const [subdomain, setSubdomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [useCustomDomain, setUseCustomDomain] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentMessage, setDeploymentMessage] = useState('')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Credit cost
  const PUBLISH_COST = 1

  // Generate default subdomain
  useEffect(() => {
    if (existingSubdomain) {
      setSubdomain(existingSubdomain)
    } else {
      const baseName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 25)
      const suffix = projectId.slice(0, 6)
      setSubdomain(`${baseName}-${suffix}`)
    }
  }, [projectName, projectId, existingSubdomain])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('configure')
      setDeploymentProgress(0)
      setDeploymentMessage('')
      setError('')
      setCopied(false)
      if (existingUrl) {
        setDeployedUrl(existingUrl)
      }
    }
  }, [open, existingUrl])

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!hasCode) {
      setError('لا يوجد كود لنشره. قم بإنشاء الموقع أولاً.')
      return
    }

    if (userCredits < PUBLISH_COST) {
      setError(`رصيدك غير كافٍ. تحتاج ${PUBLISH_COST} رصيد للنشر.`)
      return
    }

    setIsPublishing(true)
    setStep('deploying')
    setDeploymentProgress(10)
    setDeploymentMessage('جارٍ تحضير المشروع...')
    setError('')

    try {
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
          customDomain: useCustomDomain ? customDomain : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل النشر')
      }

      setDeploymentProgress(100)
      setDeploymentMessage('تم النشر بنجاح!')
      setDeployedUrl(data.url)
      setStep('success')

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء النشر')
      setStep('error')
    } finally {
      setIsPublishing(false)
    }
  }, [projectId, subdomain, customDomain, useCustomDomain, hasCode, userCredits])

  // Copy URL to clipboard
  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(deployedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [deployedUrl])

  // Share handlers
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`تحقق من موقعي الجديد: ${deployedUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deployedUrl)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(deployedUrl)}`, '_blank')
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`تحقق من موقعي الجديد: ${deployedUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg font-['Cairo']" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="w-5 h-5 text-blue-500" />
            نشر الموقع
          </DialogTitle>
          <DialogDescription>
            {step === 'configure' && 'اختر اسم النطاق لموقعك'}
            {step === 'deploying' && 'جارٍ نشر موقعك...'}
            {step === 'success' && 'تم نشر موقعك بنجاح!'}
            {step === 'error' && 'حدث خطأ أثناء النشر'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Configure */}
        {step === 'configure' && (
          <div className="space-y-6 py-4">
            {/* Credit cost notice */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-slate-600">تكلفة النشر</span>
              </div>
              <Badge variant="secondary" className="gap-1">
                {PUBLISH_COST} رصيد
              </Badge>
            </div>

            {/* Subdomain input */}
            <div className="space-y-3">
              <Label>نطاق فرعي مجاني</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <Input
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="border-0 focus-visible:ring-0"
                    placeholder="my-site"
                    dir="ltr"
                  />
                  <span className="px-3 py-2 bg-slate-100 text-slate-500 text-sm border-r">
                    .vercel.app
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                سيكون موقعك متاحاً على: {subdomain}.vercel.app
              </p>
            </div>

            {/* Custom domain option */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  نطاق مخصص (متميز)
                </Label>
                <Button
                  variant={useCustomDomain ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseCustomDomain(!useCustomDomain)}
                >
                  {useCustomDomain ? 'مفعّل' : 'إضافة'}
                </Button>
              </div>

              {useCustomDomain && (
                <div className="space-y-2">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="www.example.com"
                    dir="ltr"
                  />
                  <p className="text-xs text-amber-600">
                    ستحتاج إلى إضافة سجلات DNS لربط النطاق. سنوفر لك التعليمات بعد النشر.
                  </p>
                </div>
              )}
            </div>

            {/* Insufficient credits warning */}
            {userCredits < PUBLISH_COST && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                رصيدك غير كافٍ ({userCredits} رصيد). تحتاج {PUBLISH_COST} رصيد للنشر.
              </div>
            )}

            {/* Publish button */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!hasCode || userCredits < PUBLISH_COST || isPublishing || !subdomain}
                className="flex-1 gap-2 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Rocket className="w-4 h-4" />
                نشر الآن
              </Button>
            </div>
          </div>
        )}

        {/* Step: Deploying */}
        {step === 'deploying' && (
          <div className="space-y-6 py-8">
            {/* Animated rocket */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Rocket className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-400/30 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <Progress value={deploymentProgress} className="h-2" />
              <p className="text-center text-slate-600">{deploymentMessage}</p>
            </div>

            {/* Status indicators */}
            <div className="space-y-2">
              <StatusItem
                completed={deploymentProgress >= 10}
                active={deploymentProgress >= 0 && deploymentProgress < 30}
                label="تحضير المشروع"
              />
              <StatusItem
                completed={deploymentProgress >= 30}
                active={deploymentProgress >= 10 && deploymentProgress < 50}
                label="رفع الملفات"
              />
              <StatusItem
                completed={deploymentProgress >= 50}
                active={deploymentProgress >= 30 && deploymentProgress < 80}
                label="بناء الموقع"
              />
              <StatusItem
                completed={deploymentProgress >= 80}
                active={deploymentProgress >= 50 && deploymentProgress < 100}
                label="إعداد النطاق"
              />
              <StatusItem
                completed={deploymentProgress === 100}
                active={deploymentProgress >= 80 && deploymentProgress < 100}
                label="الإنهاء"
              />
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="space-y-6 py-4">
            {/* Success animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-400/30 rounded-full blur-xl animate-ping" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-green-600">مبروك! 🎉</h3>
              <p className="text-slate-600">موقعك الآن متاح على الإنترنت</p>
            </div>

            {/* URL display */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Globe className="w-5 h-5 text-blue-500 shrink-0" />
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-blue-600 hover:underline truncate text-sm"
                dir="ltr"
              >
                {deployedUrl}
              </a>
              <Button variant="ghost" size="icon-sm" onClick={copyUrl}>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => window.open(deployedUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {/* Share buttons */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                شارك موقعك
              </Label>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnTwitter}
                  className="rounded-full"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnFacebook}
                  className="rounded-full"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnLinkedIn}
                  className="rounded-full"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareOnWhatsApp}
                  className="rounded-full"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Close button */}
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              إغلاق
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="space-y-6 py-4">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-red-600">فشل النشر</h3>
              <p className="text-slate-600">{error}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                إغلاق
              </Button>
              <Button
                onClick={() => setStep('configure')}
                className="flex-1"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Status item component
function StatusItem({
  completed,
  active,
  label,
}: {
  completed: boolean
  active: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
        completed && 'bg-green-500',
        active && !completed && 'bg-blue-500',
        !completed && !active && 'bg-slate-200'
      )}>
        {completed ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : active ? (
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        ) : null}
      </div>
      <span className={cn(
        'text-sm',
        completed && 'text-green-600',
        active && !completed && 'text-blue-600 font-medium',
        !completed && !active && 'text-slate-400'
      )}>
        {label}
      </span>
    </div>
  )
}
