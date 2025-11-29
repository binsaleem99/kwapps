'use client'

/**
 * Deployments Tab Component
 *
 * Displays all user deployments with status and management options
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink, RefreshCw, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Deployment {
  id: string
  subdomain: string
  deployed_url: string | null
  github_repo_url: string | null
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'failed'
  error_message: string | null
  deployed_at: string | null
  created_at: string
  projects: {
    name: string
  } | {
    name: string
  }[] | null
}

export function DeploymentsTab() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDeployments()
  }, [])

  async function fetchDeployments() {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('deployments')
      .select(`
        id,
        subdomain,
        deployed_url,
        github_repo_url,
        status,
        error_message,
        deployed_at,
        created_at,
        projects (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deployments:', error)
    } else {
      setDeployments(data as Deployment[] || [])
    }

    setIsLoading(false)
  }

  function getStatusBadge(status: Deployment['status']) {
    const variants: Record<Deployment['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'في الانتظار', variant: 'outline' },
      building: { label: 'جاري البناء', variant: 'secondary' },
      deploying: { label: 'جاري النشر', variant: 'secondary' },
      ready: { label: 'نشط', variant: 'default' },
      failed: { label: 'فشل', variant: 'destructive' }
    }

    const config = variants[status] || variants.pending

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-KW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const stats = {
    total: deployments.length,
    active: deployments.filter(d => d.status === 'ready').length,
    failed: deployments.filter(d => d.status === 'failed').length
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Cairo']">
            التطبيقات المنشورة
          </h2>
          <p className="text-gray-600 mt-1 font-['Cairo']">
            جميع تطبيقاتك المنشورة على الإنترنت
          </p>
        </div>
        <Button
          onClick={fetchDeployments}
          variant="outline"
          size="sm"
          className="font-['Cairo']"
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
              إجمالي النشرات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 font-['Cairo']">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
              التطبيقات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 font-['Cairo']">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
              الفاشلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 font-['Cairo']">
              {stats.failed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-['Cairo']">قائمة النشرات</CardTitle>
          <CardDescription className="font-['Cairo']">
            جميع نشراتك مرتبة حسب التاريخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 font-['Cairo']">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : deployments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-['Cairo'] mb-4">
                لم تقم بنشر أي تطبيقات بعد
              </p>
              <p className="text-sm text-gray-400 font-['Cairo']">
                اذهب إلى Builder واضغط على "نشر التطبيق" لنشر أول تطبيق لك
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-['Cairo']">اسم المشروع</TableHead>
                    <TableHead className="text-right font-['Cairo']">المجال</TableHead>
                    <TableHead className="text-right font-['Cairo']">الحالة</TableHead>
                    <TableHead className="text-right font-['Cairo']">تاريخ النشر</TableHead>
                    <TableHead className="text-right font-['Cairo']">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deployments.map((deployment) => (
                    <TableRow key={deployment.id}>
                      <TableCell className="font-medium font-['Cairo']">
                        {Array.isArray(deployment.projects)
                          ? deployment.projects[0]?.name || 'مشروع محذوف'
                          : deployment.projects?.name || 'مشروع محذوف'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <code className="text-sm font-mono text-gray-700">
                            {deployment.subdomain}
                          </code>
                          {deployment.deployed_url && (
                            <a
                              href={deployment.deployed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {deployment.deployed_url.replace('https://', '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(deployment.status)}
                        {deployment.error_message && (
                          <p className="text-xs text-red-600 mt-1">
                            {deployment.error_message.substring(0, 50)}...
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-['Cairo']">
                        <div className="text-sm text-gray-600">
                          {deployment.deployed_at
                            ? formatDate(deployment.deployed_at)
                            : formatDate(deployment.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {deployment.deployed_url && deployment.status === 'ready' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(deployment.deployed_url!, '_blank')}
                              className="font-['Cairo']"
                              title="زيارة التطبيق"
                            >
                              <ExternalLink className="w-4 h-4 ml-2" />
                              زيارة
                            </Button>
                          )}
                          {deployment.github_repo_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(deployment.github_repo_url!, '_blank')}
                              className="font-['Cairo']"
                              title="عرض الكود على GitHub"
                            >
                              <Github className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
