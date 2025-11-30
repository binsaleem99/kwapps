"use client";

import Link from "next/link";

export function Footer() {
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
              <li><Link href="#templates" className="text-slate-400 hover:text-blue-400 font-extrabold hover:translate-x-1 inline-block transition-all">القوالب</Link></li>
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
            2025 KW APPS. جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/kwapps" className="text-slate-400 hover:text-blue-400 hover:scale-125 transition-all" target="_blank" rel="noopener noreferrer">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://github.com/kwapps" className="text-slate-400 hover:text-blue-400 hover:scale-125 transition-all" target="_blank" rel="noopener noreferrer">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
