import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  ShoppingCart,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Users,
  Sparkles,
  Star,
  Check,
  ArrowRight,
  Tag,
} from 'lucide-react'

// Map icon names to Lucide components
const iconMap: Record<string, any> = {
  ShoppingCart,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Users,
  Sparkles,
}

interface TemplatePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: template } = await supabase
    .from('app_templates')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!template) {
    return {
      title: 'قالب غير موجود | KW APPS',
    }
  }

  return {
    title: `${template.name} | قوالب KW APPS`,
    description: template.description,
  }
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch template details
  const { data: template } = await supabase
    .from('app_templates')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!template) {
    notFound()
  }

  // Fetch related templates (same category)
  const { data: relatedTemplates } = await supabase
    .from('app_templates')
    .select('id, name, slug, description, category, icon_name')
    .eq('category', template.category)
    .eq('is_active', true)
    .neq('id', template.id)
    .limit(3)

  const Icon = iconMap[template.icon_name] || Sparkles

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-24 pb-16" dir="rtl">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                الرئيسية
              </Link>
              <span>/</span>
              <Link href="/templates" className="hover:text-blue-600">
                القوالب
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-bold">{template.name}</span>
            </nav>
          </div>

          {/* Template Header */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left: Template Info */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600">
                  <Icon className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{template.category}</Badge>
                    {template.is_premium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 ml-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-gray-900">
                    {template.name}
                  </h1>
                </div>
              </div>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    استخدمه <strong>{template.usage_count}</strong> شخص
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href={`/builder?template=${template.slug}`}>
                    <Sparkles className="w-5 h-5 ml-2" />
                    استخدم هذا القالب
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 font-bold text-lg px-8 py-6 hover:bg-gray-900 hover:text-white transition-all"
                  asChild
                >
                  <Link href="/templates">
                    <ArrowRight className="w-5 h-5 ml-2" />
                    تصفح قوالب أخرى
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Preview Image or Placeholder */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
              {template.preview_image_url ? (
                <img
                  src={template.preview_image_url}
                  alt={`معاينة ${template.name}`}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-center text-white">
                  <Icon className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg opacity-75">معاينة القالب</p>
                  <p className="text-sm opacity-50 mt-2">
                    ابدأ الآن لترى القالب بالكامل
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          {template.features && template.features.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                مزايا القالب
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {template.features.map((feature: string, index: number) => (
                  <Card key={index} className="border-2 hover:border-blue-500 transition-colors">
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                الوسوم
              </h2>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Templates */}
          {relatedTemplates && relatedTemplates.length > 0 && (
            <div className="border-t pt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                قوالب مشابهة
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTemplates.map((related) => {
                  const RelatedIcon = iconMap[related.icon_name] || Sparkles
                  return (
                    <Card
                      key={related.id}
                      className="hover:shadow-lg transition-all group"
                    >
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                          <RelatedIcon className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className="mb-2">
                          {related.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {related.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {related.description}
                        </p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/templates/${related.slug}`}>
                            عرض التفاصيل
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              جاهز للبدء؟
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              استخدم قالب {template.name} وأنشئ تطبيقك في دقائق مع الذكاء الاصطناعي
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 font-bold text-lg px-10 py-6 hover:bg-gray-100 transition-all"
              asChild
            >
              <Link href={`/builder?template=${template.slug}`}>
                <Sparkles className="w-5 h-5 ml-2" />
                ابدأ الآن بدينار واحد
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
