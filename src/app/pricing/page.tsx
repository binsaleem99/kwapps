import { createClient } from '@/lib/supabase/server'
import { PricingCard } from '@/components/pricing/pricing-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata = {
  title: 'الأسعار - KW APPS',
  description: 'اختر الخطة المناسبة لك وابدأ في بناء تطبيقات الويب بالذكاء الاصطناعي',
}

export default async function PricingPage() {
  const supabase = await createClient()

  // Get all active plans
  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price_monthly', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', error)
  }

  const plansData = plans || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            KW APPS
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              الرئيسية
            </Link>
            <Link href="/pricing" className="text-primary font-medium">
              الأسعار
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              المدونة
            </Link>
            <Link href="/sign-in">
              <Button variant="outline">تسجيل الدخول</Button>
            </Link>
            <Link href="/signup">
              <Button>ابدأ مجاناً</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Cairo, sans-serif' }}>
            اختر الخطة المناسبة لك
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ابدأ مجاناً وقم بالترقية عندما تكون جاهزاً. جميع الخطط تشمل استضافة غير محدودة وأمان عالي.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plansData.map((plan) => (
              <PricingCard
                key={plan.id}
                name={plan.name}
                nameAr={plan.name_ar}
                nameEn={plan.name_en}
                price={plan.price_monthly}
                features={plan.features as string[]}
                maxProjects={plan.max_projects}
                maxStorage={plan.max_storage_mb}
                maxPrompts={plan.max_prompts_per_day}
                isPopular={plan.name === 'builder'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Cairo, sans-serif' }}>
            مقارنة الميزات
          </h2>
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full" dir="rtl">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-right font-semibold">الميزة</th>
                  <th className="p-4 text-center font-semibold">مجاني</th>
                  <th className="p-4 text-center font-semibold">بناء</th>
                  <th className="p-4 text-center font-semibold">احترافي</th>
                  <th className="p-4 text-center font-semibold">استضافة فقط</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">عدد المشاريع</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center">10</td>
                  <td className="p-4 text-center">100</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">مساحة التخزين</td>
                  <td className="p-4 text-center">100 MB</td>
                  <td className="p-4 text-center">1 GB</td>
                  <td className="p-4 text-center">10 GB</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">طلبات AI يومياً</td>
                  <td className="p-4 text-center">3</td>
                  <td className="p-4 text-center">30</td>
                  <td className="p-4 text-center">100</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">دومين مخصص</td>
                  <td className="p-4 text-center text-gray-400">✗</td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">استضافة غير محدودة</td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">الدعم الفني</td>
                  <td className="p-4 text-center">أساسي</td>
                  <td className="p-4 text-center">أولوية</td>
                  <td className="p-4 text-center">VIP</td>
                  <td className="p-4 text-center">أساسي</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">تحليلات متقدمة</td>
                  <td className="p-4 text-center text-gray-400">✗</td>
                  <td className="p-4 text-center text-gray-400">✗</td>
                  <td className="p-4 text-center text-green-600"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-gray-400">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Cairo, sans-serif' }}>
            الأسئلة الشائعة
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">هل يمكنني الترقية أو التخفيض في أي وقت؟</h3>
              <p className="text-gray-600">
                نعم، يمكنك تغيير خطتك في أي وقت. عند الترقية، سيتم محاسبتك على الفرق بشكل نسبي. عند التخفيض، سيتم تطبيق التغيير في بداية دورة الفوترة التالية.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">ما هي طرق الدفع المتاحة؟</h3>
              <p className="text-gray-600">
                نقبل بطاقات K-Net وبطاقات الائتمان من خلال بوابة UPayments الآمنة. جميع المدفوعات آمنة ومشفرة.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">ماذا يحدث إذا تجاوزت حدود خطتي؟</h3>
              <p className="text-gray-600">
                سيتم إيقاف الميزات التي تجاوزت حدودها حتى تقوم بالترقية إلى خطة أعلى أو حتى يتم تجديد حدود الاستخدام في بداية الشهر الجديد.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">هل الاستضافة مضمونة؟</h3>
              <p className="text-gray-600">
                نعم، نضمن استضافة 99.9% للتطبيقات المنشورة. نستخدم بنية Vercel التحتية لضمان السرعة والموثوقية.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">ما هي خطة "استضافة فقط"؟</h3>
              <p className="text-gray-600">
                مثالية للمشاريع المكتملة التي لا تحتاج إلى تحديثات متكررة. تحافظ على تطبيقاتك الحالية مستضافة وتعمل بسعر 5 د.ك شهرياً، لكن لا يمكنك إنشاء مشاريع جديدة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Cairo, sans-serif' }}>
            جاهز للبدء؟
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            ابدأ ببناء تطبيقك الأول اليوم. لا حاجة لبطاقة ائتمان للخطة المجانية.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              ابدأ مجاناً الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">KW APPS</h3>
              <p className="text-gray-400">
                منصة بناء تطبيقات الويب بالذكاء الاصطناعي
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">الرئيسية</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">الأسعار</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">المدونة</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-400 hover:text-white">اتصل بنا</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">من نحن</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">قانوني</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">الشروط والأحكام</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 KW APPS. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
