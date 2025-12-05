'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  Users,
  MessageSquare,
  Heart,
  Star,
  ExternalLink,
  Globe,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const communityLinks = [
  {
    title: 'واتساب',
    description: 'تواصل معنا مباشرة عبر واتساب للدعم الفوري',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-600',
    link: 'https://wa.me/96599000000',
    members: 'دعم فوري',
  },
  {
    title: 'البريد الإلكتروني',
    description: 'راسلنا للاستفسارات والمقترحات',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
    link: 'mailto:support@kwapps.com',
    members: 'support@kwapps.com',
  },
]

const showcaseProjects = [
  {
    title: 'متجر الكتروني',
    author: 'أحمد محمد',
    description: 'متجر إلكتروني متكامل مع نظام دفع وإدارة منتجات',
    likes: 128,
    views: 1240,
  },
  {
    title: 'لوحة تحكم إدارية',
    author: 'سارة علي',
    description: 'داشبورد متقدم مع رسوم بيانية وتقارير',
    likes: 95,
    views: 890,
  },
  {
    title: 'موقع مطعم',
    author: 'خالد العبدالله',
    description: 'موقع احترافي لمطعم مع قائمة طعام وحجوزات',
    likes: 76,
    views: 654,
  },
]

const stats = [
  { value: '🚀', label: 'انضم للمستخدمين الأوائل' },
  { value: '1 د.ك', label: 'ابدأ تجربتك الآن' },
  { value: '50+', label: 'قالب جاهز' },
  { value: '24/7', label: 'دعم فني' },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white" dir="rtl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">KW APPS</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16" dir="rtl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
            <Users className="w-4 h-4" />
            المجتمع
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-['Cairo']">
            مجتمع KW APPS
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-['Cairo']">
            انضم لآلاف المطورين ورواد الأعمال العرب الذين يبنون تطبيقاتهم مع KW APPS
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-slate-600 font-['Cairo']">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Links */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">انضم إلينا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {communityLinks.map((link, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-3`}
                  >
                    <link.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-['Cairo']">{link.title}</CardTitle>
                  <CardDescription className="font-['Cairo']">{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-['Cairo']">
                      {link.members}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={link.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Showcase */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-['Cairo']">مشاريع المجتمع</h2>
            <Button variant="outline" className="font-['Cairo']">
              عرض الكل
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {showcaseProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-['Cairo']">
                      مشروع مميز
                    </Badge>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <CardTitle className="font-['Cairo']">{project.title}</CardTitle>
                  <CardDescription className="font-['Cairo']">
                    بواسطة {project.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4 font-['Cairo']">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{project.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{project.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-500 border-0">
            <CardContent className="p-10 text-center">
              <Users className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4 font-['Cairo']">
                شارك إبداعك مع المجتمع
              </h2>
              <p className="text-blue-100 mb-6 font-['Cairo']">
                أنشئ تطبيقك وشاركه مع الآلاف من المطورين العرب
              </p>
              <Link href="/builder">
                <Button size="lg" variant="secondary" className="font-['Cairo'] font-bold">
                  <Sparkles className="w-5 h-5 ml-2" />
                  ابدأ الإنشاء
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 mt-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© 2025 KW APPS - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
