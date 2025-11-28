"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200"
          : "bg-transparent"
      }`}
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative px-3 py-2 bg-gradient-primary rounded-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-xl font-black text-white">KW</span>
              </div>
            </div>
            <div>
              <div className="text-xl font-black leading-none text-slate-900">
                KW APPS
              </div>
              <div className="text-xs leading-none mt-0.5 text-slate-600">
                كي دبليو آبس
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-bold link-hover-blue"
            >
              المزايا
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-bold link-hover-blue"
            >
              الأسعار
            </Link>
            <Link
              href="#templates"
              className="text-sm font-bold link-hover-blue"
            >
              القوالب
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="font-bold border-slate-300 text-slate-900 hover:border-blue-500"
              asChild
            >
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-primary text-white font-bold shadow-glow hover:scale-105 transition-transform"
              asChild
            >
              <Link href="/signup">ابدأ مجاناً</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 transition-colors text-slate-600 hover:text-slate-900">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
