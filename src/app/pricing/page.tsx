'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Check, Sparkles, Zap, Building2, Users } from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      id: 'developer',
      name: 'المطور',
      description: 'للمستقلين وأصحاب المشاريع الناشئة',
      icon: Zap,
      monthlyPrice: 27,
      yearlyPrice: 22,
      yearlyTotal: 264,
      trialPrice: 1,
      hasTrial: true,
      features: [
        '10 مشاريع',
        '50 طلبات AI يومياً',
        'جميع القوالب',
        'تصدير الكود',
        'دعم فني',
      ],
      popular: false,
    },
    {
      id: 'professional',
      name: 'الاحترافي',
      description: 'للشركات الصغيرة والمحترفين',
      icon: Building2,
      monthlyPrice: 39,
      yearlyPrice: 31,
      yearlyTotal: 372,
      trialPrice: null,
      hasTrial: false,
      features: [
        '25 مشروع',
        '100 طلبات AI يومياً',
        'أولوية في المعالجة',
        'نطاق خاص',
        'تحليلات متقدمة',
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'الوكالات',
      description: 'للوكالات التي تدير عملاء متعددين',
      icon: Users,
      monthlyPrice: 75,
      yearlyPrice: 60,
      yearlyTotal: 720,
      trialPrice: null,
      hasTrial: false,
      features: [
        'مشاريع غير محدودة',
        '9999 طلبات AI يومياً',
        'واجهة بيضاء (White-label)',
        'مدير حساب خاص',
        'API Access',
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 font-['Cairo']">
            KW APPS
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-['Cairo']">
              الرئيسية
            </Link>
            <Link href="/pricing" className="text-blue-600 font-medium font-['Cairo']">
              الأسعار
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 font-['Cairo']">
              المدونة
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" className="font-['Cairo']">تسجيل الدخول</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-['Cairo'] bg-blue-600 hover:bg-blue-700">ابدأ الآن</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 font-['Cairo']">
            <Sparkles className="w-4 h-4" />
            جرب خطة المطور بـ 1 د.ك لمدة أسبوع
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 font-['Cairo']">
            اختر الخطة المناسبة لمشروعك
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-['Cairo']">
            ابدأ بخطة المطور مع أسبوع تجريبي بدينار واحد فقط، أو اختر خطة أعلى لمميزات أكثر
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all font-['Cairo'] ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all font-['Cairo'] flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              سنوي
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                وفر 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

              return (
                <Card
                  key={plan.id}
                  className={`relative p-8 flex flex-col ${
                    plan.popular
                      ? 'border-2 border-blue-500 shadow-xl scale-105'
                      : 'border border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full font-['Cairo']">
                        الأكثر شيوعاً
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                      plan.popular ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${plan.popular ? 'text-blue-600' : 'text-slate-600'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 font-['Cairo']">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 font-['Cairo']">{plan.description}</p>
                  </div>

                  {/* Trial Badge - Only for plans with trial */}
                  {plan.hasTrial && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-center">
                      <span className="text-amber-800 text-sm font-medium font-['Cairo']">
                        أسبوع تجريبي {plan.trialPrice} د.ك
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-slate-900">{currentPrice}</span>
                      <span className="text-xl text-gray-500 font-['Cairo']">د.ك</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 font-['Cairo']">/ شهر</p>
                    {billingCycle === 'yearly' && (
                      <p className="text-green-600 text-sm mt-2 font-['Cairo']">
                        تدفع سنوياً {plan.yearlyTotal} د.ك
                      </p>
                    )}
                    {plan.hasTrial && (
                      <p className="text-gray-400 text-xs mt-2 font-['Cairo']">
                        بعد انتهاء الفترة التجريبية
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href="/sign-up" className="mb-6">
                    <Button
                      className={`w-full py-6 text-lg font-bold font-['Cairo'] ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {plan.hasTrial ? `جرب أسبوع بـ ${plan.trialPrice} د.ك` : 'اشترك الآن'}
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="border-t pt-6">
                    <p className="text-sm font-semibold text-slate-900 mb-4 font-['Cairo']">المميزات</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.popular ? 'bg-blue-100' : 'bg-slate-100'
                          }`}>
                            <Check className={`w-3 h-3 ${plan.popular ? 'text-blue-600' : 'text-slate-600'}`} />
                          </div>
                          <span className="text-gray-700 font-['Cairo']">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Cairo']">
            مقارنة الميزات
          </h2>
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full" dir="rtl">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-5 text-right font-semibold font-['Cairo']">الميزة</th>
                  <th className="p-5 text-center font-semibold font-['Cairo']">المطور</th>
                  <th className="p-5 text-center font-semibold font-['Cairo'] bg-blue-50">الاحترافي</th>
                  <th className="p-5 text-center font-semibold font-['Cairo']">الوكالات</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-5 font-medium font-['Cairo']">عدد المشاريع</td>
                  <td className="p-5 text-center font-['Cairo']">10</td>
                  <td className="p-5 text-center bg-blue-50 font-['Cairo']">25</td>
                  <td className="p-5 text-center font-['Cairo']">غير محدود</td>
                </tr>
                <tr className="border-b bg-slate-50/50">
                  <td className="p-5 font-medium font-['Cairo']">طلبات AI يومياً</td>
                  <td className="p-5 text-center font-['Cairo']">50</td>
                  <td className="p-5 text-center bg-blue-50 font-['Cairo']">100</td>
                  <td className="p-5 text-center font-['Cairo']">9999</td>
                </tr>
                <tr className="border-b">
                  <td className="p-5 font-medium font-['Cairo']">جميع القوالب</td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center bg-blue-50"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b bg-slate-50/50">
                  <td className="p-5 font-medium font-['Cairo']">تصدير الكود</td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center bg-blue-50"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-5 font-medium font-['Cairo']">نطاق خاص</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b bg-slate-50/50">
                  <td className="p-5 font-medium font-['Cairo']">أولوية المعالجة</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-5 font-medium font-['Cairo']">تحليلات متقدمة</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b bg-slate-50/50">
                  <td className="p-5 font-medium font-['Cairo']">White-label</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50 text-gray-400">-</td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-5 font-medium font-['Cairo']">API Access</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50 text-gray-400">-</td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
                <tr>
                  <td className="p-5 font-medium font-['Cairo']">مدير حساب خاص</td>
                  <td className="p-5 text-center text-gray-400">-</td>
                  <td className="p-5 text-center bg-blue-50 text-gray-400">-</td>
                  <td className="p-5 text-center"><Check className="w-5 h-5 mx-auto text-green-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Cairo']">
            الأسئلة الشائعة
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-2 font-['Cairo']">كيف تعمل الفترة التجريبية؟</h3>
              <p className="text-gray-600 font-['Cairo']">
                خطة المطور تتيح لك تجربة لمدة أسبوع كامل مقابل 1 دينار كويتي فقط. إذا لم تناسبك، يمكنك الإلغاء قبل انتهاء الأسبوع ولن يتم خصم أي مبلغ إضافي.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-2 font-['Cairo']">هل يمكنني تغيير خطتي لاحقاً؟</h3>
              <p className="text-gray-600 font-['Cairo']">
                نعم، يمكنك الترقية أو التخفيض في أي وقت. عند الترقية، سيتم محاسبتك على الفرق بشكل نسبي. عند التخفيض، سيتم تطبيق التغيير في بداية دورة الفوترة التالية.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-2 font-['Cairo']">ما هي طرق الدفع المتاحة؟</h3>
              <p className="text-gray-600 font-['Cairo']">
                نقبل بطاقات K-Net وبطاقات الائتمان (Visa, Mastercard) من خلال بوابة UPayments الآمنة. جميع المدفوعات آمنة ومشفرة.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-2 font-['Cairo']">ماذا يعني "طلبات AI يومياً"؟</h3>
              <p className="text-gray-600 font-['Cairo']">
                كل مرة تطلب من الذكاء الاصطناعي إنشاء أو تعديل كود تعتبر طلب واحد. يتم تجديد الحد يومياً في منتصف الليل بتوقيت الكويت.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg mb-2 font-['Cairo']">ما الفرق بين الاشتراك الشهري والسنوي؟</h3>
              <p className="text-gray-600 font-['Cairo']">
                الاشتراك السنوي يوفر لك 20% من التكلفة الإجمالية مقارنة بالدفع الشهري. يتم دفع المبلغ كاملاً مرة واحدة في السنة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 font-['Cairo']">
            جاهز للبدء؟
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-['Cairo']">
            جرب خطة المطور لمدة أسبوع كامل بدينار واحد فقط. لا التزام، إلغاء سهل.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 font-bold font-['Cairo']">
              ابدأ التجربة الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 font-['Cairo']">KW APPS</h3>
              <p className="text-gray-400 font-['Cairo']">
                منصة بناء تطبيقات الويب بالذكاء الاصطناعي
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Cairo']">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white font-['Cairo']">الرئيسية</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white font-['Cairo']">الأسعار</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white font-['Cairo']">المدونة</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Cairo']">الدعم</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-400 hover:text-white font-['Cairo']">اتصل بنا</Link></li>
                <li><Link href="/help" className="text-gray-400 hover:text-white font-['Cairo']">مركز المساعدة</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 font-['Cairo']">قانوني</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white font-['Cairo']">الشروط والأحكام</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white font-['Cairo']">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p className="font-['Cairo']">&copy; 2025 KW APPS. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
