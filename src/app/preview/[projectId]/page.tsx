'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ExternalLink, ArrowRight, Monitor, Smartphone, Tablet, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PublishModal } from '@/components/builder/PublishModal'

type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface Project {
  id: string
  name: string
  generated_code: string | null
  deployed_url: string | null
  status: string
  subdomain?: string | null
}

interface UserProfile {
  credits_remaining: number
  username?: string
}

export default function PreviewPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProject()
    fetchUserProfile()
  }, [projectId])

  async function fetchUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('credits_remaining, username')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  async function fetchProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, generated_code, deployed_url, status, subdomain')
        .eq('id', projectId)
        .single()

      if (error) throw error

      if (!data) {
        setError('المشروع غير موجود')
        return
      }

      setProject(data)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('فشل تحميل المشروع')
    } finally {
      setIsLoading(false)
    }
  }

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return 'max-w-[375px]'
      case 'tablet': return 'max-w-[768px]'
      default: return 'max-w-full'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">جاري تحميل المعاينة...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{error || 'المشروع غير موجود'}</h1>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowRight className="w-4 h-4 ml-2" />
                رجوع
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cairo, sans-serif' }}>
              معاينة: {project.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <div className="flex items-center bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded ${device === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded ${device === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded ${device === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {project.deployed_url && (
              <a href={project.deployed_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  <ExternalLink className="w-4 h-4 ml-2" />
                  فتح الموقع
                </Button>
              </a>
            )}

            <Link href={`/builder?project=${project.id}`}>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                تعديل
              </Button>
            </Link>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setPublishModalOpen(true)}
            >
              <Rocket className="w-4 h-4 ml-2" />
              نشر
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`mx-auto h-full ${getDeviceWidth()} transition-all duration-300`}>
          {project.generated_code ? (
            <iframe
              srcDoc={project.generated_code}
              className="w-full h-full bg-white rounded-lg shadow-xl"
              style={{ minHeight: 'calc(100vh - 120px)' }}
              title={`معاينة ${project.name}`}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-center">
                <p className="text-slate-400 mb-4">لا يوجد محتوى للمعاينة</p>
                <Link href={`/builder?project=${project.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    ابدأ البناء
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        projectId={project.id}
        projectName={project.name}
        hasCode={!!project.generated_code}
        userCredits={userProfile?.credits_remaining || 0}
        username={userProfile?.username}
        existingSubdomain={project.subdomain || undefined}
        existingUrl={project.deployed_url || undefined}
      />
    </div>
  )
}
