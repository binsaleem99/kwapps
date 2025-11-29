'use client'

/**
 * Deployment Modal Component
 *
 * Multi-step modal for deploying user-generated websites to Vercel
 * Steps: Enter subdomain → Deploying → Success/Error
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, ExternalLink, Copy, Github } from 'lucide-react'

type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'error'

interface DeploymentModalProps {
  projectId: string
  onClose: () => void
  onSuccess?: () => void
}

export function DeploymentModal({
  projectId,
  onClose,
  onSuccess
}: DeploymentModalProps) {
  const [subdomain, setSubdomain] = useState('')
  const [status, setStatus] = useState<DeploymentStatus>('idle')
  const [deployedUrl, setDeployedUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDeploy() {
    // Validate subdomain
    if (!subdomain || subdomain.trim().length === 0) {
      toast.error('الرجاء إدخال المجال الفرعي')
      return
    }

    const trimmedSubdomain = subdomain.trim().toLowerCase()

    // Basic validation
    if (!/^[a-z0-9-]+$/.test(trimmedSubdomain)) {
      toast.error('المجال الفرعي يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط')
      return
    }

    if (trimmedSubdomain.length < 3 || trimmedSubdomain.length > 63) {
      toast.error('يجب أن يكون المجال الفرعي بين 3 و 63 حرفاً')
      return
    }

    setStatus('deploying')
    setErrorMessage('')

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          subdomain: trimmedSubdomain
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل النشر')
      }

      setDeployedUrl(data.url)
      setGithubUrl(data.githubUrl || '')
      setStatus('success')
      toast.success('تم النشر بنجاح!')

      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Deployment error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'حدث خطأ أثناء النشر')
      toast.error(error.message || 'فشل النشر')
    }
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(deployedUrl)
    toast.success('تم نسخ الرابط!')
  }

  function handleOpenUrl() {
    window.open(deployedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="font-['Cairo'] sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>نشر التطبيق</DialogTitle>
          {status === 'idle' && (
            <DialogDescription>
              انشر تطبيقك على الإنترنت وشاركه مع العالم
            </DialogDescription>
          )}
        </DialogHeader>

        {/* IDLE STATE: Enter subdomain */}
        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                اختر المجال الفرعي
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  placeholder="my-restaurant"
                  className="flex-1 font-mono"
                  dir="ltr"
                  maxLength={63}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDeploy()
                    }
                  }}
                  autoFocus
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  .vercel.app
                </span>
              </div>
              <p className="text-xs text-gray-500">
                استخدم أحرف صغيرة وأرقام وشرطات فقط (مثال: my-app-123)
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button onClick={handleDeploy} disabled={!subdomain}>
                نشر
              </Button>
            </div>
          </div>
        )}

        {/* DEPLOYING STATE: Loading */}
        {status === 'deploying' && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-blue-500" />
            <p className="text-lg font-medium mb-2">جاري النشر...</p>
            <p className="text-sm text-gray-500">
              قد يستغرق هذا 1-3 دقائق. يرجى الانتظار...
            </p>
            <div className="mt-6 space-y-2 text-xs text-gray-400">
              <p>⏳ تحويل الكود إلى HTML...</p>
              <p>📁 إنشاء مستودع GitHub...</p>
              <p>📦 رفع الكود إلى GitHub...</p>
              <p>🚀 النشر على Vercel...</p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE: Show deployed URL */}
        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
            <p className="text-xl font-bold mb-2">تم النشر بنجاح!</p>
            <p className="text-sm text-gray-600 mb-6">
              تطبيقك الآن متاح على الإنترنت
            </p>

            <div className="space-y-4 mb-6">
              {/* Deployed URL */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">رابط التطبيق</p>
                <p className="font-mono font-bold text-sm break-all mb-3 text-blue-600">
                  {deployedUrl}
                </p>

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleOpenUrl}
                    className="flex-1"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    زيارة التطبيق
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyUrl}
                    size="sm"
                  >
                    <Copy className="w-4 h-4 ml-2" />
                    نسخ الرابط
                  </Button>
                </div>
              </div>

              {/* GitHub URL (if available) */}
              {githubUrl && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="w-4 h-4" />
                    <p className="text-xs">مستودع GitHub</p>
                  </div>
                  <p className="font-mono text-sm break-all mb-3 text-gray-300">
                    {githubUrl}
                  </p>
                  <Button
                    onClick={() => window.open(githubUrl, '_blank', 'noopener,noreferrer')}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent border-gray-600 hover:bg-gray-800 text-white"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    عرض الكود على GitHub
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 نصيحة</p>
              <p className="text-xs">
                يمكنك مشاركة هذا الرابط مع أي شخص. التطبيق سيبقى متاحاً على الإنترنت.
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              className="mt-4"
            >
              إغلاق
            </Button>
          </div>
        )}

        {/* ERROR STATE: Show error message */}
        {status === 'error' && (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <p className="text-xl font-bold mb-2 text-red-600">فشل النشر</p>
            <p className="text-sm text-gray-600 mb-6">
              حدث خطأ أثناء محاولة نشر تطبيقك
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
              <p className="text-sm text-red-800 font-medium mb-1">
                رسالة الخطأ:
              </p>
              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setStatus('idle')}
                variant="default"
              >
                حاول مرة أخرى
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
