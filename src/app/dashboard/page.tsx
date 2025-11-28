'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Sparkles, LogOut } from 'lucide-react'
import { ProjectsTab } from './components/projects-tab'
import { ProfileTab } from './components/profile-tab'
import { PublishedTab } from './components/published-tab'
import { SettingsTab } from './components/settings-tab'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()

    // SECURITY: Use getUser() to validate with Auth server
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error || !user) {
      router.push('/login')
      return
    }

    setUserEmail(user.email || '')
    setIsLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-semibold cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => router.push('/')}
            >
              <Sparkles className="w-4 h-4" />
              <span>KW APPS</span>
            </div>
            <div className="hidden md:block text-sm text-slate-600">
              مرحباً، {userEmail}
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
              لوحة التحكم
            </h1>
            <p className="text-xl text-slate-600">
              إدارة مشاريعك وملفك الشخصي
            </p>
          </div>

          {/* Tabs Container */}
          <Tabs defaultValue="projects" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-1 bg-white shadow-sm rounded-lg">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 font-medium py-3 px-4"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                المشاريع
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 font-medium py-3 px-4"
              >
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                المواقع المنشورة
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 font-medium py-3 px-4"
              >
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                الملف الشخصي
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-700 font-medium py-3 px-4"
              >
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                الإعدادات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-0">
              <ProjectsTab />
            </TabsContent>

            <TabsContent value="published" className="mt-0">
              <PublishedTab />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <ProfileTab userEmail={userEmail} />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
