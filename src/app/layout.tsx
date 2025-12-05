// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Cairo: Modern, bold Arabic font with character
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "كي دبليو آبس - أنشئ تطبيقك بالذكاء الاصطناعي",
  description: "منصة عربية لبناء تطبيقات SaaS باستخدام الذكاء الاصطناعي. من الفكرة إلى التطبيق في دقائق",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-white text-slate-900 font-sans antialiased">
        {children}
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}
