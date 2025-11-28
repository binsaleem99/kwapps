import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'المدونة | KW APPS',
  description: 'مقالات وأخبار حول إنشاء المواقع بالذكاء الاصطناعي',
}

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch published blog posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title_ar, excerpt_ar, slug, category, tags, featured_image, view_count, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-500 font-['Cairo']">
              KW APPS
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition font-['Cairo']"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 font-['Cairo']">
            مدونة KW APPS
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-['Cairo']">
            أحدث المقالات والأخبار حول إنشاء المواقع بالذكاء الاصطناعي، نصائح البرمجة، وأدلة شاملة
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-400 mb-4 font-['Cairo']">
                لا توجد مقالات بعد
              </h2>
              <p className="text-gray-500 font-['Cairo']">
                ترقبوا المحتوى الجديد قريباً!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    {/* Featured Image */}
                    {post.featured_image && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={post.featured_image}
                          alt={post.title_ar}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <CardHeader>
                      {/* Category & Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className="font-['Cairo']">{post.category}</Badge>
                        {post.tags && post.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="font-['Cairo']">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-500 transition font-['Cairo']">
                        {post.title_ar}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="text-gray-600 mb-4 line-clamp-3 font-['Cairo']">
                        {post.excerpt_ar}
                      </CardDescription>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-['Cairo']">
                              {new Date(post.published_at || post.created_at).toLocaleDateString(
                                'ar-KW',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="font-['Cairo']">{post.view_count}</span>
                          </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-blue-500 group-hover:translate-x-[-4px] transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 font-['Cairo']">
          <p>© 2025 KW APPS. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
