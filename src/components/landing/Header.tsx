"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

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
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-bold link-hover-blue"
            >
              الرئيسية
            </Link>
            <Link
              href="#features"
              className="text-sm font-bold link-hover-blue"
            >
              المزايا
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-bold link-hover-blue"
            >
              الأسعار
            </Link>
            <Link
              href="/templates"
              className="text-sm font-bold link-hover-blue"
            >
              القوالب
            </Link>
            <Link
              href="/blog"
              className="text-sm font-bold link-hover-blue"
            >
              المدونة
            </Link>
            <Link
              href="/builder"
              className="text-sm font-bold link-hover-blue"
            >
              إنشاء تطبيق
            </Link>
            {loading ? (
              <div className="w-32 h-10 bg-slate-200 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <Button
                  size="sm"
                  className="bg-gradient-primary text-white font-bold shadow-glow hover:scale-105 transition-transform"
                  asChild
                >
                  <Link href="/dashboard">لوحة التحكم</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="font-bold border-slate-300 text-slate-900 hover:border-red-500"
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
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
