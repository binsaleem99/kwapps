'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Target,
  Users,
  Zap,
  ArrowRight,
  Code,
  Globe,
  Shield
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
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
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              من نحن
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-['Cairo']">
              نبني مستقبل البرمجة العربية
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-['Cairo'] leading-relaxed">
              KW APPS هي منصة كويتية رائدة تمكّن المستخدمين العرب من بناء تطبيقات احترافية
              باستخدام الذكاء الاصطناعي، دون الحاجة لخبرة برمجية مسبقة.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-blue-100 bg-blue-50/50">
              <CardHeader>
                <Target className="w-10 h-10 text-blue-600 mb-3" />
                <CardTitle className="text-2xl font-['Cairo']">رسالتنا</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-['Cairo'] leading-relaxed">
                  تمكين رواد الأعمال والشركات في العالم العربي من تحويل أفكارهم إلى تطبيقات
                  حقيقية بسرعة وسهولة، مع الحفاظ على أعلى معايير الجودة والأمان.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100">
              <CardHeader>
                <Globe className="w-10 h-10 text-slate-600 mb-3" />
                <CardTitle className="text-2xl font-['Cairo']">رؤيتنا</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-['Cairo'] leading-relaxed">
                  أن نكون المنصة الأولى في المنطقة لبناء التطبيقات بالذكاء الاصطناعي،
                  ونساهم في تعزيز الاقتصاد الرقمي العربي.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 font-['Cairo']">قيمنا الأساسية</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <CardTitle className="font-['Cairo']">السرعة والكفاءة</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 font-['Cairo']">
                    من الفكرة إلى التطبيق في دقائق، لا أسابيع
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Code className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <CardTitle className="font-['Cairo']">الجودة العالية</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 font-['Cairo']">
                    كود نظيف ومحترف يتبع أفضل الممارسات
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <CardTitle className="font-['Cairo']">الأمان والثقة</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 font-['Cairo']">
                    حماية بياناتك وتطبيقاتك هي أولويتنا
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 font-['Cairo']">فريقنا</h2>
            <Card className="border-2 border-slate-100">
              <CardContent className="p-8">
                <div className="flex items-center gap-6 mb-6">
                  <Users className="w-16 h-16 text-blue-500" />
                  <div>
                    <h3 className="text-2xl font-bold font-['Cairo']">فريق متخصص</h3>
                    <p className="text-slate-600 font-['Cairo']">
                      مهندسون ومصممون شغوفون بالتكنولوجيا
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 font-['Cairo'] leading-relaxed">
                  فريقنا يضم نخبة من المهندسين والمصممين ذوي الخبرة في مجال الذكاء الاصطناعي
                  وتطوير البرمجيات. نعمل معاً لتقديم أفضل تجربة ممكنة لمستخدمينا في الكويت
                  والعالم العربي.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4 font-['Cairo']">
              هل أنت مستعد للبدء؟
            </h2>
            <p className="text-blue-100 mb-6 font-['Cairo']">
              انضم إلى آلاف المستخدمين الذين يبنون تطبيقاتهم مع KW APPS
            </p>
            <Link href="/sign-up?tier=basic&trial=true">
              <Button size="lg" variant="secondary" className="font-['Cairo'] font-bold">
                جرّب أسبوع بدينار
              </Button>
            </Link>
          </div>
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
