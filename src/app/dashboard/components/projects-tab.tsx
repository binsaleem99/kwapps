'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Code, Trash2, FileCode } from 'lucide-react'
import { Project } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export function ProjectsTab() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setProjects(data as Project[])
    }
    setIsLoading(false)
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', projectId)

    if (!error) {
      fetchProjects()
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      generating: 'جاري الإنشاء',
      preview: 'معاينة',
      published: 'منشور',
      error: 'خطأ',
    }
    return labels[status] || status
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'published') return 'default'
    if (status === 'error') return 'destructive'
    if (status === 'generating') return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-16 text-center">
          <FileCode className="w-20 h-20 mx-auto mb-4 text-slate-300" />
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">
            لا توجد مشاريع بعد
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            ابدأ بإنشاء مشروعك الأول باستخدام الذكاء الاصطناعي. صف موقعك بالعربية
            وسنقوم بإنشائه لك!
          </p>
          <Button
            onClick={() => router.push('/builder')}
            className="bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            إنشاء أول مشروع
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Project Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => router.push('/builder')}
        >
          <Plus className="w-5 h-5 ml-2" />
          إنشاء مشروع جديد
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer group relative overflow-hidden"
            onClick={() => router.push(`/builder?project=${project.id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-2 truncate">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'لا يوجد وصف'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => handleDeleteProject(project.id, e)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusVariant(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <div className="flex gap-1">
                  {project.deployed_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(project.deployed_url, '_blank')
                      }}
                      title="زيارة التطبيق"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-500">
                <p>
                  آخر تحديث:{' '}
                  {formatDistanceToNow(new Date(project.updated_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </p>
              </div>

              {project.generated_code && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Code className="w-4 h-4" />
                  <span>تم إنشاء الكود</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
