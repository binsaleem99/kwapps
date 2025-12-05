import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TemplateGallery } from '@/components/templates/TemplateGallery'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'قوالب التطبيقات | KW APPS',
  description: 'تصفح مجموعتنا من قوالب التطبيقات الجاهزة وابدأ مشروعك في دقائق',
  openGraph: {
    title: 'قوالب التطبيقات | KW APPS',
    description: 'اختر من بين قوالبنا الاحترافية الجاهزة وابدأ مشروعك في دقائق',
    url: 'https://kwq8.com/templates',
    siteName: 'KW APPS',
    locale: 'ar_KW',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'KW APPS Templates' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قوالب التطبيقات | KW APPS',
    description: 'اختر من بين قوالبنا الاحترافية الجاهزة وابدأ مشروعك في دقائق',
    images: ['/og-image.png'],
  },
}

export const revalidate = 3600 // Revalidate every hour

export default async function TemplatesPage() {
  const supabase = await createClient()

  // Fetch all active templates
  const { data: templates } = await supabase
    .from('app_templates')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  // Get unique categories
  const categories = templates
    ? Array.from(new Set(templates.map((t) => t.category)))
    : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-24 pb-16" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 border border-blue-200">
              <span className="text-sm font-bold text-blue-600">قوالب جاهزة</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
              قوالب التطبيقات
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اختر من بين قوالبنا الاحترافية الجاهزة وابدأ مشروعك في دقائق
            </p>
          </div>

          {/* Template Gallery */}
          <TemplateGallery
            templates={templates || []}
            categories={categories}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
