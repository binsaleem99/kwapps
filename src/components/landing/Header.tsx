"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-2xl border-b-2 border-slate-200 shadow-glow-sm"
          : "bg-white/60 backdrop-blur-xl"
      }`}
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - BOLD with electric glow */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Electric glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-electric-blue rounded-xl blur-md opacity-40 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />
              <div className="relative px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center gap-2 shadow-glow group-hover:shadow-glow-lg group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                <span className="text-xl font-black text-white">KW</span>
              </div>
            </div>
            <div>
              <div className="text-xl font-black leading-none text-slate-900 group-hover:text-blue-600 transition-colors">
                KW APPS
              </div>
              <div className="text-xs leading-none mt-0.5 text-slate-600 font-extrabold">
                كي دبليو آبس
              </div>
            </div>
          </Link>

          {/* Navigation - BOLD hover states with scale */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              الرئيسية
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            <Link
              href="#features"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              المزايا
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              الأسعار
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            <Link
              href="/templates"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              القوالب
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            <Link
              href="/blog"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              المدونة
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            <Link
              href="/builder"
              className="text-sm font-extrabold text-slate-700 hover:text-blue-600 hover:scale-110 transition-all duration-200 relative group"
            >
              إنشاء تطبيق
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
            {!isLoaded ? (
              <div className="w-32 h-10 bg-slate-200 animate-pulse rounded-xl" />
            ) : user ? (
              <>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow hover:shadow-glow-lg hover:scale-110 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard">لوحة التحكم</Link>
                </Button>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-blue-500 shadow-glow",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </>
            ) : (
              <>
                <SignInButton mode="redirect">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-black border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:scale-105 transition-all duration-300"
                  >
                    تسجيل الدخول
                  </Button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow-lg hover:shadow-electric hover:scale-110 transition-all duration-300"
                  >
                    ابدأ مجاناً
                  </Button>
                </SignUpButton>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-colors text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white py-4">
            <nav className="flex flex-col gap-4 px-4">
              <Link
                href="/"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                href="#features"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                المزايا
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                الأسعار
              </Link>
              <Link
                href="/templates"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                القوالب
              </Link>
              <Link
                href="/blog"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                المدونة
              </Link>
              <Link
                href="/builder"
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                إنشاء تطبيق
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                {loading ? (
                  <div className="w-full h-10 bg-slate-200 animate-pulse rounded-lg" />
                ) : user ? (
                  <>
                    <Button
                      size="sm"
                      className="bg-gradient-primary text-white font-bold w-full"
                      asChild
                    >
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        لوحة التحكم
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="font-bold w-full hover:border-red-500"
                    >
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-bold w-full"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        تسجيل الدخول
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-primary text-white font-bold w-full"
                      asChild
                    >
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        ابدأ مجاناً
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
