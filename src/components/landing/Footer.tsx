"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call - in production, connect to your newsletter service
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    setLoading(false);
    setEmail("");
  };

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgb(59 130 246 / 0.2) 1px, transparent 1px), linear-gradient(90deg, rgb(59 130 246 / 0.2) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Newsletter Section - MED-010 */}
        <div className="mb-16 p-8 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <h3 className="text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-6 h-6 text-blue-400" />
                اشترك في النشرة البريدية
              </h3>
              <p className="text-slate-400 font-bold">
                احصل على آخر الأخبار والتحديثات والعروض الحصرية
              </p>
            </div>
            <div className="w-full md:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  تم الاشتراك بنجاح!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="بريدك@example.com"
                    required
                    className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-64 font-medium"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        اشترك
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-16 md:grid-cols-4 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl blur-md opacity-75" />
                <div className="relative px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-electric">
                  <span className="text-xl font-black text-white">KW</span>
                </div>
              </div>
              <div className="text-2xl font-black">KW APPS</div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-extrabold">
              منصة عربية لبناء التطبيقات بالذكاء الاصطناعي. من الفكرة إلى التطبيق في دقائق
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-6 text-sm font-black text-slate-300">المنتج</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/builder" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">إنشاء تطبيق</Link></li>
              <li><Link href="#features" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">المزايا</Link></li>
              <li><Link href="/pricing" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">الأسعار</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">المدونة</Link></li>
              <li><Link href="/templates" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">القوالب</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-sm font-black text-slate-300">الشركة</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">من نحن</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">اتصل بنا</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">الشروط والأحكام</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-6 text-sm font-black text-slate-300">الدعم</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/help" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">مركز المساعدة</Link></li>
              <li><Link href="/tutorials" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">الدروس التعليمية</Link></li>
              <li><Link href="/community" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">المجتمع</Link></li>
              <li><Link href="/status" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">حالة النظام</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-extrabold text-slate-500">
            © {new Date().getFullYear()} KW APPS. جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-4">
            {/* WhatsApp */}
            <a href="https://wa.me/96599000000" className="text-slate-400 hover:text-green-400 hover:scale-125 transition-all" target="_blank" rel="noopener noreferrer" title="واتساب">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            {/* Email */}
            <a href="mailto:support@kwapps.com" className="text-slate-400 hover:text-blue-400 hover:scale-125 transition-all" title="البريد الإلكتروني">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            {/* Made in Kuwait Badge */}
            <span className="text-xs font-bold text-slate-500 border border-slate-700 rounded-full px-3 py-1 flex items-center gap-1">
              🇰🇼 صنع في الكويت
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
