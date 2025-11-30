'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-600 mb-4">
            {language === 'ar'
              ? 'آخر تحديث: ديسمبر 2024'
              : 'Last updated: December 2024'}
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
              <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
              <p className="mb-6 text-gray-700 leading-relaxed">
                في KW APPS، نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك عند استخدام منصتنا.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">المعلومات التي نجمعها</h2>
              <h3 className="text-xl font-semibold mb-3">1. المعلومات الشخصية</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>الاسم وعنوان البريد الإلكتروني</li>
                <li>معلومات الحساب وكلمة المرور (مشفرة)</li>
                <li>معلومات الدفع (يتم معالجتها بشكل آمن)</li>
                <li>معلومات الاتصال (عند التواصل مع الدعم)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2. معلومات الاستخدام</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>المشاريع التي تنشئها والتعليمات البرمجية المولدة</li>
                <li>سجل الطلبات المقدمة إلى الذكاء الاصطناعي</li>
                <li>إحصائيات الاستخدام (عدد المشاريع، التخزين المستخدم)</li>
                <li>معلومات الجهاز والمتصفح</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">كيفية استخدام معلوماتك</h2>
              <p className="mb-4 text-gray-700">نستخدم المعلومات المجمعة للأغراض التالية:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>توفير وتحسين خدماتنا</li>
                <li>معالجة المدفوعات والاشتراكات</li>
                <li>إرسال إشعارات مهمة حول حسابك</li>
                <li>تقديم الدعم الفني</li>
                <li>تحليل وتحسين أداء المنصة</li>
                <li>منع الاحتيال وضمان الأمان</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">مشاركة البيانات</h2>
              <p className="mb-4 text-gray-700">نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. نشارك البيانات فقط مع:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>مزودي خدمات الدفع:</strong> لمعالجة المدفوعات الإلكترونية بشكل آمن</li>
                <li><strong>خدمات الذكاء الاصطناعي:</strong> لمعالجة طلبات توليد الكود (بدون بيانات شخصية)</li>
                <li><strong>خدمات الاستضافة:</strong> لاستضافة وتشغيل التطبيقات المنشورة</li>
                <li><strong>خدمات البنية التحتية:</strong> لتخزين البيانات والمصادقة بشكل آمن</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">أمان البيانات</h2>
              <p className="mb-4 text-gray-700">نتخذ إجراءات أمنية صارمة لحماية بياناتك:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>تشفير البيانات أثناء النقل (SSL/TLS)</li>
                <li>تشفير كلمات المرور باستخدام bcrypt</li>
                <li>سياسات صارمة للتحكم في الوصول (RLS)</li>
                <li>مراقبة أمنية على مدار الساعة</li>
                <li>نسخ احتياطية منتظمة</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">حقوقك</h2>
              <p className="mb-4 text-gray-700">لديك الحقوق التالية فيما يتعلق ببياناتك:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
                <li><strong>التصحيح:</strong> تحديث أو تصحيح البيانات غير الدقيقة</li>
                <li><strong>الحذف:</strong> طلب حذف حسابك وبياناتك</li>
                <li><strong>التصدير:</strong> تصدير بياناتك بتنسيق قابل للقراءة</li>
                <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">ملفات تعريف الارتباط (Cookies)</h2>
              <p className="mb-4 text-gray-700">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">الاحتفاظ بالبيانات</h2>
              <p className="mb-4 text-gray-700">
                نحتفظ ببياناتك طالما كان حسابك نشطاً. عند حذف حسابك، نقوم بحذف بياناتك الشخصية خلال 30 يوماً، باستثناء البيانات المطلوبة قانونياً للاحتفاظ بها (مثل سجلات الفواتير لمدة 5 سنوات).
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">خصوصية الأطفال</h2>
              <p className="mb-4 text-gray-700">
                خدماتنا غير موجهة للأطفال دون سن 18 عاماً. نحن لا نجمع معلومات شخصية عن عمد من الأطفال.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">التغييرات على هذه السياسة</h2>
              <p className="mb-4 text-gray-700">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">اتصل بنا</h2>
              <p className="mb-4 text-gray-700">
                إذا كانت لديك أي أسئلة حول سياسة الخصوصية أو ترغب في ممارسة حقوقك:
              </p>
              <ul className="list-none mb-6 text-gray-700 space-y-2">
                <li><strong>البريد الإلكتروني:</strong> privacy@kwapps.com</li>
                <li><strong>صفحة الاتصال:</strong> <Link href="/contact" className="text-primary hover:underline">kwapps.com/contact</Link></li>
              </ul>
            </div>
          </Card>
        )}

        {/* English Content */}
        {language === 'en' && (
          <Card className="p-8 text-left">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="mb-6 text-gray-700 leading-relaxed">
                At KW APPS, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you use our platform.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3">1. Personal Information</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>Name and email address</li>
                <li>Account information and password (encrypted)</li>
                <li>Payment information (processed securely)</li>
                <li>Contact information (when contacting support)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2. Usage Information</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>Projects you create and code generated</li>
                <li>AI prompts history</li>
                <li>Usage statistics (number of projects, storage used)</li>
                <li>Device and browser information</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">How We Use Your Information</h2>
              <p className="mb-4 text-gray-700">We use collected information for the following purposes:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process payments and subscriptions</li>
                <li>Send important notifications about your account</li>
                <li>Provide technical support</li>
                <li>Analyze and improve platform performance</li>
                <li>Prevent fraud and ensure security</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Data Sharing</h2>
              <p className="mb-4 text-gray-700">We do not sell your personal data to third parties. We share data only with:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>Payment Processors:</strong> For secure electronic payment processing</li>
                <li><strong>AI Services:</strong> For processing code generation requests (no personal data)</li>
                <li><strong>Hosting Services:</strong> For hosting and running published applications</li>
                <li><strong>Infrastructure Services:</strong> For secure data storage and authentication</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Data Security</h2>
              <p className="mb-4 text-gray-700">We implement strict security measures to protect your data:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li>Data encryption in transit (SSL/TLS)</li>
                <li>Password encryption using bcrypt</li>
                <li>Strict access control policies (RLS)</li>
                <li>24/7 security monitoring</li>
                <li>Regular backups</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
              <p className="mb-4 text-gray-700">You have the following rights regarding your data:</p>
              <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Update or correct inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a readable format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">Cookies</h2>
              <p className="mb-4 text-gray-700">
                We use cookies to improve your experience on the platform. You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Data Retention</h2>
              <p className="mb-4 text-gray-700">
                We retain your data as long as your account is active. When you delete your account, we delete your personal data within 30 days, except for data legally required to be retained (such as billing records for 5 years).
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Children's Privacy</h2>
              <p className="mb-4 text-gray-700">
                Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Changes to This Policy</h2>
              <p className="mb-4 text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any significant changes via email or through a notice on the platform.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about this privacy policy or wish to exercise your rights:
              </p>
              <ul className="list-none mb-6 text-gray-700 space-y-2">
                <li><strong>Email:</strong> privacy@kwapps.com</li>
                <li><strong>Contact Page:</strong> <Link href="/contact" className="text-primary hover:underline">kwapps.com/contact</Link></li>
              </ul>
            </div>
          </Card>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/terms">
            <Button variant="outline">
              {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
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
