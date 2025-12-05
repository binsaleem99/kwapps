'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Globe } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          <p className="text-gray-600 mb-4">
            {language === 'ar'
              ? 'آخر تحديث: ديسمبر 2025'
              : 'Last updated: December 2025'}
          </p>

          {/* Language Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('ar')}
            >
              <Globe className="w-4 h-4 mr-2" />
              العربية
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              <Globe className="w-4 h-4 mr-2" />
              English
            </Button>
          </div>
        </div>

        {/* Arabic Content */}
        {language === 'ar' && (
          <Card className="p-8 text-right" style={{ fontFamily: 'Cairo, sans-serif' }}>
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. قبول الشروط</h2>
              <p className="mb-6 text-gray-700 leading-relaxed">
                باستخدامك لمنصة KW APPS، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. وصف الخدمة</h2>
              <p className="mb-4 text-gray-700">
                KW APPS هي منصة لبناء التطبيقات باستخدام الذكاء الاصطناعي. نوفر:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>أدوات توليد الكود باستخدام الذكاء الاصطناعي</li>
                <li>قوالب جاهزة للتطبيقات</li>
                <li>نشر تلقائي على GitHub و Vercel</li>
                <li>خطط اشتراك متعددة (أساسي، احترافي، مميز، مؤسسي)</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. التسجيل والحساب</h2>
              <h3 className="text-xl font-semibold mb-3">3.1 متطلبات التسجيل</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>يجب أن يكون عمرك 18 عاماً أو أكثر</li>
                <li>تقديم معلومات دقيقة وكاملة</li>
                <li>الحفاظ على أمان حسابك وكلمة المرور</li>
                <li>إخطارنا فوراً بأي استخدام غير مصرح به</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 مسؤولية الحساب</h3>
              <p className="mb-6 text-gray-700">
                أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. نحن لسنا مسؤولين عن أي خسارة ناتجة عن استخدام غير مصرح به لحسابك.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. خطط الاشتراك والدفع</h2>
              <h3 className="text-xl font-semibold mb-3">4.1 الخطط المتاحة</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>تجربة:</strong> 1 د.ك/أسبوع - فترة تجريبية للخطة الأساسية</li>
                <li><strong>أساسي:</strong> 23 د.ك شهرياً - 30 طلب يومياً، 3 مشاريع، 500MB تخزين</li>
                <li><strong>احترافي:</strong> 38 د.ك شهرياً - 100 طلب يومياً، 10 مشاريع، 2GB تخزين</li>
                <li><strong>مميز:</strong> 59 د.ك شهرياً - 300 طلب يومياً، 50 مشروع، 10GB تخزين</li>
                <li><strong>مؤسسي:</strong> 75 د.ك شهرياً - طلبات غير محدودة، مشاريع غير محدودة، 50GB تخزين</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 معالجة الدفع</h3>
              <p className="mb-4 text-gray-700">
                تتم معالجة جميع المدفوعات عبر UPayments. نحن نقبل:
              </p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>K-Net (بطاقات الخصم الكويتية)</li>
                <li>Visa و Mastercard</li>
                <li>Apple Pay</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 الفواتير والتجديد</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>الاشتراكات تُجدد تلقائياً كل شهر</li>
                <li>سيتم إرسال فاتورة إلى بريدك الإلكتروني</li>
                <li>يمكنك إلغاء الاشتراك في أي وقت</li>
                <li>لا توجد استرداد للمدفوعات عن الأشهر الجزئية</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. الاستخدام المقبول</h2>
              <h3 className="text-xl font-semibold mb-3">5.1 الاستخدامات المسموح بها</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>بناء تطبيقات ويب قانونية</li>
                <li>استخدام الكود المولد في مشاريعك</li>
                <li>نشر التطبيقات للاستخدام الشخصي أو التجاري</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 الاستخدامات المحظورة</h3>
              <p className="mb-4 text-gray-700">يُحظر عليك استخدام المنصة لـ:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>إنشاء محتوى غير قانوني أو ضار</li>
                <li>انتهاك حقوق الملكية الفكرية لأطراف أخرى</li>
                <li>توليد برامج ضارة أو فيروسات</li>
                <li>استخدام الخدمة لأغراض احتيالية</li>
                <li>إساءة استخدام الذكاء الاصطناعي أو تجاوز حدود الاستخدام</li>
                <li>محاولة اختراق أو تعطيل الخدمة</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">6. حقوق الملكية الفكرية</h2>
              <h3 className="text-xl font-semibold mb-3">6.1 ملكية المنصة</h3>
              <p className="mb-4 text-gray-700">
                جميع حقوق الملكية الفكرية في منصة KW APPS (التصميم، الشعار، المحتوى) مملوكة لنا.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.2 ملكية الكود المولد</h3>
              <p className="mb-6 text-gray-700">
                أنت تمتلك الكود الذي تم توليده من خلال طلباتك. لديك الحق الكامل في استخدامه وتعديله وتوزيعه.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">7. إخلاء المسؤولية</h2>
              <h3 className="text-xl font-semibold mb-3">7.1 "كما هو"</h3>
              <p className="mb-4 text-gray-700">
                يتم توفير الخدمة "كما هي" و"كما هي متاحة" بدون أي ضمانات من أي نوع.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.2 الكود المولد</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>نحن لا نضمن أن الكود المولد سيكون خالياً من الأخطاء</li>
                <li>أنت مسؤول عن مراجعة واختبار الكود قبل النشر</li>
                <li>نحن لسنا مسؤولين عن أي أضرار ناتجة عن استخدام الكود</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">8. تحديد المسؤولية</h2>
              <p className="mb-4 text-gray-700">
                في أقصى حد يسمح به القانون:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية</li>
                <li>مسؤوليتنا الإجمالية محدودة بالمبلغ المدفوع في الـ 12 شهراً الماضية</li>
                <li>نحن لسنا مسؤولين عن أي خسارة في البيانات أو الأرباح</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">9. إنهاء الخدمة</h2>
              <h3 className="text-xl font-semibold mb-3">9.1 من قبلك</h3>
              <p className="mb-4 text-gray-700">
                يمكنك إنهاء حسابك في أي وقت من خلال إعدادات الحساب.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.2 من قبلنا</h3>
              <p className="mb-6 text-gray-700">
                نحتفظ بالحق في تعليق أو إنهاء حسابك إذا:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>انتهكت هذه الشروط</li>
                <li>استخدمت الخدمة بشكل احتيالي</li>
                <li>فشلت في دفع الرسوم المستحقة</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">10. التغييرات على الشروط</h2>
              <p className="mb-6 text-gray-700">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام الخدمة بعد التغييرات يعني قبولك للشروط الجديدة.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">11. القانون الحاكم</h2>
              <p className="mb-6 text-gray-700">
                تخضع هذه الشروط لقوانين دولة الكويت. أي نزاع ينشأ عن هذه الشروط سيتم حله في محاكم الكويت.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">12. اتصل بنا</h2>
              <p className="mb-4 text-gray-700">
                إذا كانت لديك أي أسئلة حول شروط الخدمة:
              </p>
              <ul className="list-none mb-6 text-gray-700 space-y-2">
                <li><strong>البريد الإلكتروني:</strong> legal@kwapps.com</li>
                <li><strong>صفحة الاتصال:</strong> <Link href="/contact" className="text-primary hover:underline">kwapps.com/contact</Link></li>
              </ul>
            </div>
          </Card>
        )}

        {/* English Content */}
        {language === 'en' && (
          <Card className="p-8 text-left">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-6 text-gray-700 leading-relaxed">
                By using the KW APPS platform, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. Description of Service</h2>
              <p className="mb-4 text-gray-700">
                KW APPS is an AI-powered application building platform. We provide:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>AI code generation tools</li>
                <li>Ready-made application templates</li>
                <li>Automatic deployment to GitHub and Vercel</li>
                <li>Multiple subscription plans (Basic, Pro, Premium, Enterprise)</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. Registration and Account</h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Registration Requirements</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>You must be 18 years or older</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account and password</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 Account Responsibility</h3>
              <p className="mb-6 text-gray-700">
                You are responsible for all activities that occur under your account. We are not liable for any loss resulting from unauthorized use of your account.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. Subscription Plans and Payment</h2>
              <h3 className="text-xl font-semibold mb-3">4.1 Available Plans</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>Trial:</strong> 1 KWD/week - Trial period for Basic plan</li>
                <li><strong>Basic:</strong> 23 KWD/month - 30 daily requests, 3 projects, 500MB storage</li>
                <li><strong>Pro:</strong> 38 KWD/month - 100 daily requests, 10 projects, 2GB storage</li>
                <li><strong>Premium:</strong> 59 KWD/month - 300 daily requests, 50 projects, 10GB storage</li>
                <li><strong>Enterprise:</strong> 75 KWD/month - Unlimited requests, unlimited projects, 50GB storage</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 Payment Processing</h3>
              <p className="mb-4 text-gray-700">
                All payments are processed through UPayments. We accept:
              </p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>K-Net (Kuwaiti debit cards)</li>
                <li>Visa and Mastercard</li>
                <li>Apple Pay</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.3 Billing and Renewal</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Subscriptions automatically renew monthly</li>
                <li>An invoice will be sent to your email</li>
                <li>You can cancel your subscription at any time</li>
                <li>No refunds for partial months</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. Acceptable Use</h2>
              <h3 className="text-xl font-semibold mb-3">5.1 Permitted Uses</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>Build legal web applications</li>
                <li>Use generated code in your projects</li>
                <li>Deploy applications for personal or commercial use</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">5.2 Prohibited Uses</h3>
              <p className="mb-4 text-gray-700">You are prohibited from using the platform to:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Create illegal or harmful content</li>
                <li>Violate intellectual property rights of others</li>
                <li>Generate malware or viruses</li>
                <li>Use the service for fraudulent purposes</li>
                <li>Abuse AI or exceed usage limits</li>
                <li>Attempt to hack or disrupt the service</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">6. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold mb-3">6.1 Platform Ownership</h3>
              <p className="mb-4 text-gray-700">
                All intellectual property rights in the KW APPS platform (design, logo, content) are owned by us.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.2 Generated Code Ownership</h3>
              <p className="mb-6 text-gray-700">
                You own the code generated through your prompts. You have full rights to use, modify, and distribute it.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">7. Disclaimers</h2>
              <h3 className="text-xl font-semibold mb-3">7.1 "As Is"</h3>
              <p className="mb-4 text-gray-700">
                The service is provided "as is" and "as available" without warranties of any kind.
              </p>

              <h3 className="text-xl font-semibold mb-3">7.2 Generated Code</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>We do not guarantee that generated code will be error-free</li>
                <li>You are responsible for reviewing and testing code before deployment</li>
                <li>We are not liable for any damages resulting from code use</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">8. Limitation of Liability</h2>
              <p className="mb-4 text-gray-700">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>We will not be liable for any indirect or incidental damages</li>
                <li>Our total liability is limited to the amount paid in the last 12 months</li>
                <li>We are not responsible for any loss of data or profits</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">9. Termination</h2>
              <h3 className="text-xl font-semibold mb-3">9.1 By You</h3>
              <p className="mb-4 text-gray-700">
                You can terminate your account at any time through account settings.
              </p>

              <h3 className="text-xl font-semibold mb-3">9.2 By Us</h3>
              <p className="mb-6 text-gray-700">
                We reserve the right to suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Violate these terms</li>
                <li>Use the service fraudulently</li>
                <li>Fail to pay fees owed</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">10. Changes to Terms</h2>
              <p className="mb-6 text-gray-700">
                We reserve the right to modify these terms at any time. We will notify you of any material changes via email or through a notice on the platform. Your continued use of the service after changes means acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">11. Governing Law</h2>
              <p className="mb-6 text-gray-700">
                These terms are governed by the laws of the State of Kuwait. Any dispute arising from these terms will be resolved in the courts of Kuwait.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">12. Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about these Terms of Service:
              </p>
              <ul className="list-none mb-6 text-gray-700 space-y-2">
                <li><strong>Email:</strong> legal@kwapps.com</li>
                <li><strong>Contact Page:</strong> <Link href="/contact" className="text-primary hover:underline">kwapps.com/contact</Link></li>
              </ul>
            </div>
          </Card>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/privacy">
            <Button variant="outline">
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
