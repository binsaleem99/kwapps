'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Image, Video, Music, Files } from 'lucide-react'

export default function ContentManagementPage() {
  const contentTypes = [
    {
      title: 'المقالات',
      titleEn: 'Articles',
      description: 'إدارة المقالات والمحتوى النصي',
      icon: FileText,
      count: 0,
    },
    {
      title: 'الصور',
      titleEn: 'Images',
      description: 'إدارة مكتبة الصور',
      icon: Image,
      count: 0,
    },
    {
      title: 'الفيديوهات',
      titleEn: 'Videos',
      description: 'إدارة محتوى الفيديو',
      icon: Video,
      count: 0,
    },
    {
      title: 'الملفات الصوتية',
      titleEn: 'Audio',
      description: 'إدارة الملفات الصوتية',
      icon: Music,
      count: 0,
    },
    {
      title: 'الملفات',
      titleEn: 'Files',
      description: 'إدارة الملفات والمستندات',
      icon: Files,
      count: 0,
    },
  ]

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Cairo, sans-serif' }}>
            إدارة المحتوى
          </h1>
          <p className="text-slate-400 mt-1">إدارة جميع أنواع المحتوى في المنصة</p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">قريباً</h2>
          <p className="text-slate-300">نظام إدارة المحتوى الكامل قيد التطوير</p>
        </CardContent>
      </Card>

      {/* Content Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentTypes.map((type, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <type.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{type.title}</CardTitle>
                  <CardDescription className="text-slate-400">{type.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">العناصر</span>
                <span className="text-2xl font-bold text-white">{type.count}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
