import { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

// MED-007: OG Meta Tags for social sharing
export const metadata: Metadata = {
  title: "KW APPS - أنشئ تطبيقك بالذكاء الاصطناعي",
  description: "منصة كويتية لبناء المواقع والتطبيقات بالذكاء الاصطناعي. من الفكرة إلى التطبيق في دقائق. جرّب أسبوع بدينار واحد فقط!",
  keywords: ["AI website builder", "منصة بناء مواقع", "الكويت", "ذكاء اصطناعي", "تطبيقات ويب"],
  openGraph: {
    title: "KW APPS - أنشئ تطبيقك بالذكاء الاصطناعي",
    description: "منصة كويتية لبناء المواقع والتطبيقات بالذكاء الاصطناعي. من الفكرة إلى التطبيق في دقائق.",
    url: "https://kwq8.com",
    siteName: "KW APPS",
    locale: "ar_KW",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KW APPS - منصة بناء التطبيقات بالذكاء الاصطناعي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KW APPS - أنشئ تطبيقك بالذكاء الاصطناعي",
    description: "منصة كويتية لبناء المواقع والتطبيقات بالذكاء الاصطناعي. جرّب أسبوع بدينار واحد!",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <Templates />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
