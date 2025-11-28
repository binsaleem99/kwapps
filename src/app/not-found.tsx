import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowRight, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4" dir="rtl">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-50" />
              <div className="relative px-3 py-2 bg-gradient-primary rounded-lg">
                <span className="text-2xl font-black text-white">KW</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">KW APPS</div>
          </div>
        </div>

        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-gradient leading-none">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            الصفحة غير موجودة
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
            يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-white hover:shadow-glow transition-all px-8 py-6 text-lg font-black"
          >
            <Link href="/">
              <Home className="w-5 h-5 ml-2" />
              العودة للرئيسية
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg font-bold hover:bg-blue-50 hover:border-blue-500 transition-all"
          >
            <Link href="/dashboard">
              <Sparkles className="w-5 h-5 ml-2" />
              لوحة التحكم
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            إذا كنت تعتقد أن هذا خطأ، يرجى{' '}
            <Link href="/#contact" className="text-blue-500 hover:underline font-medium">
              الاتصال بنا
            </Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 opacity-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 blur-3xl" />
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-slate-500 blur-3xl" />
        </div>
      </div>
    </div>
  )
}
