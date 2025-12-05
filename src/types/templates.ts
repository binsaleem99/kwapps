// ============================================
// KW APPS Template System Types
// ============================================

/**
 * Industry categories for templates
 * صالون، مطعم، متجر، محفظة
 */
export type TemplateCategory = 'salon' | 'restaurant' | 'store' | 'portfolio';

export interface TemplateCategoryInfo {
  id: TemplateCategory;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  gradient: string; // Tailwind gradient class
}

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, TemplateCategoryInfo> = {
  salon: {
    id: 'salon',
    nameAr: 'صالون',
    nameEn: 'Salon',
    descriptionAr: 'قوالب صالونات التجميل والحلاقة والسبا',
    icon: 'Scissors',
    color: 'pink-500',
    gradient: 'from-pink-500 to-rose-500',
  },
  restaurant: {
    id: 'restaurant',
    nameAr: 'مطعم',
    nameEn: 'Restaurant',
    descriptionAr: 'قوالب المطاعم والكافيهات وخدمات التوصيل',
    icon: 'UtensilsCrossed',
    color: 'orange-500',
    gradient: 'from-orange-500 to-amber-500',
  },
  store: {
    id: 'store',
    nameAr: 'متجر',
    nameEn: 'Store',
    descriptionAr: 'قوالب المتاجر الإلكترونية والبيع بالتجزئة',
    icon: 'ShoppingBag',
    color: 'blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  portfolio: {
    id: 'portfolio',
    nameAr: 'محفظة',
    nameEn: 'Portfolio',
    descriptionAr: 'قوالب المحافظ الشخصية والسير الذاتية',
    icon: 'Briefcase',
    color: 'emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
  },
};

/**
 * Template definition
 */
export interface Template {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: TemplateCategory;
  previewImage: string;
  thumbnailImage: string;
  featuresAr: string[];
  featuresEn: string[];
  isPremium: boolean;
  isNew: boolean;
  usageCount: number;
  rating: number;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  demoUrl?: string;
  createdAt: string;
}

/**
 * Template preview sections for detailed view
 */
export interface TemplateSection {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'hero' | 'features' | 'services' | 'gallery' | 'testimonials' | 'contact' | 'pricing' | 'about' | 'menu' | 'products';
  previewImage: string;
}

/**
 * Full template with sections
 */
export interface TemplateWithSections extends Template {
  sections: TemplateSection[];
  sampleContent: {
    heroTitleAr: string;
    heroSubtitleAr: string;
    aboutTextAr: string;
  };
}

// ============================================
// Mock Template Data
// ============================================

export const MOCK_TEMPLATES: Template[] = [
  // صالون Templates
  {
    id: 'salon-1',
    slug: 'glamour-salon',
    nameAr: 'صالون جلامور',
    nameEn: 'Glamour Salon',
    descriptionAr: 'قالب أنيق لصالونات التجميل النسائية مع نظام حجز متكامل',
    descriptionEn: 'Elegant template for beauty salons with integrated booking system',
    category: 'salon',
    previewImage: '/templates/salon-glamour-preview.jpg',
    thumbnailImage: '/templates/salon-glamour-thumb.jpg',
    featuresAr: ['نظام حجز المواعيد', 'معرض الأعمال', 'قائمة الخدمات والأسعار', 'تقييمات العملاء', 'خريطة الموقع'],
    featuresEn: ['Appointment booking', 'Portfolio gallery', 'Services & pricing', 'Customer reviews', 'Location map'],
    isPremium: false,
    isNew: true,
    usageCount: 847,
    rating: 4.8,
    colorScheme: { primary: '#ec4899', secondary: '#f9a8d4', accent: '#fdf2f8' },
    createdAt: '2024-11-15',
  },
  {
    id: 'salon-2',
    slug: 'royal-spa',
    nameAr: 'رويال سبا',
    nameEn: 'Royal Spa',
    descriptionAr: 'قالب فاخر لمراكز السبا والعناية بالبشرة',
    descriptionEn: 'Luxury template for spa and skincare centers',
    category: 'salon',
    previewImage: '/templates/salon-royal-preview.jpg',
    thumbnailImage: '/templates/salon-royal-thumb.jpg',
    featuresAr: ['عروض الباقات', 'حجز الجلسات', 'فريق العمل', 'شهادات العملاء', 'اتصل بنا'],
    featuresEn: ['Package deals', 'Session booking', 'Team profiles', 'Testimonials', 'Contact form'],
    isPremium: true,
    isNew: false,
    usageCount: 523,
    rating: 4.9,
    colorScheme: { primary: '#7c3aed', secondary: '#c4b5fd', accent: '#f5f3ff' },
    createdAt: '2024-10-20',
  },
  {
    id: 'salon-3',
    slug: 'barber-king',
    nameAr: 'ملك الحلاقة',
    nameEn: 'Barber King',
    descriptionAr: 'قالب عصري لصالونات الحلاقة الرجالية',
    descriptionEn: 'Modern template for mens barbershops',
    category: 'salon',
    previewImage: '/templates/salon-barber-preview.jpg',
    thumbnailImage: '/templates/salon-barber-thumb.jpg',
    featuresAr: ['قائمة الخدمات', 'حجز موعد', 'معرض القصات', 'الموقع والاتجاهات', 'واتساب مباشر'],
    featuresEn: ['Services menu', 'Appointment booking', 'Styles gallery', 'Location & directions', 'WhatsApp direct'],
    isPremium: false,
    isNew: false,
    usageCount: 1203,
    rating: 4.7,
    colorScheme: { primary: '#1e293b', secondary: '#64748b', accent: '#f1f5f9' },
    createdAt: '2024-09-10',
  },

  // مطعم Templates
  {
    id: 'restaurant-1',
    slug: 'oriental-feast',
    nameAr: 'المائدة الشرقية',
    nameEn: 'Oriental Feast',
    descriptionAr: 'قالب راقي للمطاعم العربية والشرقية',
    descriptionEn: 'Elegant template for Arabic and Oriental restaurants',
    category: 'restaurant',
    previewImage: '/templates/restaurant-oriental-preview.jpg',
    thumbnailImage: '/templates/restaurant-oriental-thumb.jpg',
    featuresAr: ['قائمة الطعام التفاعلية', 'نظام الطلب', 'حجز الطاولات', 'معرض الأطباق', 'قسم التوصيل'],
    featuresEn: ['Interactive menu', 'Order system', 'Table reservation', 'Dish gallery', 'Delivery section'],
    isPremium: true,
    isNew: true,
    usageCount: 1456,
    rating: 4.9,
    colorScheme: { primary: '#b45309', secondary: '#fbbf24', accent: '#fffbeb' },
    createdAt: '2024-11-20',
  },
  {
    id: 'restaurant-2',
    slug: 'cafe-blend',
    nameAr: 'كافيه بلند',
    nameEn: 'Cafe Blend',
    descriptionAr: 'قالب عصري للكافيهات والمقاهي',
    descriptionEn: 'Modern template for cafes and coffee shops',
    category: 'restaurant',
    previewImage: '/templates/restaurant-cafe-preview.jpg',
    thumbnailImage: '/templates/restaurant-cafe-thumb.jpg',
    featuresAr: ['قائمة المشروبات', 'العروض اليومية', 'نقاط الولاء', 'الطلب المسبق', 'أجواء المكان'],
    featuresEn: ['Drinks menu', 'Daily specials', 'Loyalty points', 'Pre-order', 'Ambiance showcase'],
    isPremium: false,
    isNew: false,
    usageCount: 2341,
    rating: 4.6,
    colorScheme: { primary: '#78350f', secondary: '#d97706', accent: '#fef3c7' },
    createdAt: '2024-08-15',
  },
  {
    id: 'restaurant-3',
    slug: 'fast-bites',
    nameAr: 'فاست بايتس',
    nameEn: 'Fast Bites',
    descriptionAr: 'قالب سريع لمطاعم الوجبات السريعة والتوصيل',
    descriptionEn: 'Quick template for fast food and delivery restaurants',
    category: 'restaurant',
    previewImage: '/templates/restaurant-fast-preview.jpg',
    thumbnailImage: '/templates/restaurant-fast-thumb.jpg',
    featuresAr: ['طلب سريع', 'تتبع التوصيل', 'العروض والكوبونات', 'قائمة الوجبات', 'تقييم الطلب'],
    featuresEn: ['Quick order', 'Delivery tracking', 'Deals & coupons', 'Combo menu', 'Order rating'],
    isPremium: false,
    isNew: true,
    usageCount: 3102,
    rating: 4.5,
    colorScheme: { primary: '#dc2626', secondary: '#fca5a5', accent: '#fef2f2' },
    createdAt: '2024-11-01',
  },

  // متجر Templates
  {
    id: 'store-1',
    slug: 'fashion-hub',
    nameAr: 'هب الأزياء',
    nameEn: 'Fashion Hub',
    descriptionAr: 'قالب متجر ملابس وأزياء عصري',
    descriptionEn: 'Modern fashion and clothing store template',
    category: 'store',
    previewImage: '/templates/store-fashion-preview.jpg',
    thumbnailImage: '/templates/store-fashion-thumb.jpg',
    featuresAr: ['كتالوج المنتجات', 'سلة التسوق', 'فلترة المنتجات', 'المفضلة', 'تتبع الشحن'],
    featuresEn: ['Product catalog', 'Shopping cart', 'Product filters', 'Wishlist', 'Shipping tracking'],
    isPremium: true,
    isNew: false,
    usageCount: 4521,
    rating: 4.8,
    colorScheme: { primary: '#0ea5e9', secondary: '#7dd3fc', accent: '#f0f9ff' },
    createdAt: '2024-07-20',
  },
  {
    id: 'store-2',
    slug: 'tech-zone',
    nameAr: 'تك زون',
    nameEn: 'Tech Zone',
    descriptionAr: 'قالب متجر إلكترونيات وتقنية',
    descriptionEn: 'Electronics and technology store template',
    category: 'store',
    previewImage: '/templates/store-tech-preview.jpg',
    thumbnailImage: '/templates/store-tech-thumb.jpg',
    featuresAr: ['مقارنة المنتجات', 'المواصفات التقنية', 'التقييمات', 'الضمان والصيانة', 'عروض حصرية'],
    featuresEn: ['Product comparison', 'Tech specs', 'Reviews', 'Warranty & service', 'Exclusive deals'],
    isPremium: false,
    isNew: false,
    usageCount: 2876,
    rating: 4.7,
    colorScheme: { primary: '#3b82f6', secondary: '#93c5fd', accent: '#eff6ff' },
    createdAt: '2024-06-10',
  },
  {
    id: 'store-3',
    slug: 'beauty-shop',
    nameAr: 'بيوتي شوب',
    nameEn: 'Beauty Shop',
    descriptionAr: 'قالب متجر مستحضرات التجميل والعناية',
    descriptionEn: 'Cosmetics and skincare shop template',
    category: 'store',
    previewImage: '/templates/store-beauty-preview.jpg',
    thumbnailImage: '/templates/store-beauty-thumb.jpg',
    featuresAr: ['منتجات مميزة', 'نصائح الجمال', 'باقات الهدايا', 'برنامج الولاء', 'استشارة مجانية'],
    featuresEn: ['Featured products', 'Beauty tips', 'Gift sets', 'Loyalty program', 'Free consultation'],
    isPremium: true,
    isNew: true,
    usageCount: 1987,
    rating: 4.9,
    colorScheme: { primary: '#db2777', secondary: '#f9a8d4', accent: '#fdf2f8' },
    createdAt: '2024-11-10',
  },

  // محفظة Templates
  {
    id: 'portfolio-1',
    slug: 'creative-pro',
    nameAr: 'المبدع المحترف',
    nameEn: 'Creative Pro',
    descriptionAr: 'قالب محفظة أعمال للمصممين والمبدعين',
    descriptionEn: 'Portfolio template for designers and creatives',
    category: 'portfolio',
    previewImage: '/templates/portfolio-creative-preview.jpg',
    thumbnailImage: '/templates/portfolio-creative-thumb.jpg',
    featuresAr: ['معرض الأعمال', 'نبذة شخصية', 'المهارات والخبرات', 'شهادات العملاء', 'نموذج التواصل'],
    featuresEn: ['Work gallery', 'About me', 'Skills & experience', 'Client testimonials', 'Contact form'],
    isPremium: false,
    isNew: false,
    usageCount: 6234,
    rating: 4.8,
    colorScheme: { primary: '#10b981', secondary: '#6ee7b7', accent: '#ecfdf5' },
    createdAt: '2024-05-15',
  },
  {
    id: 'portfolio-2',
    slug: 'developer-cv',
    nameAr: 'سيرة المطور',
    nameEn: 'Developer CV',
    descriptionAr: 'قالب سيرة ذاتية للمبرمجين والمطورين',
    descriptionEn: 'CV template for programmers and developers',
    category: 'portfolio',
    previewImage: '/templates/portfolio-dev-preview.jpg',
    thumbnailImage: '/templates/portfolio-dev-thumb.jpg',
    featuresAr: ['المشاريع البرمجية', 'التقنيات والأدوات', 'الخبرة المهنية', 'التعليم والشهادات', 'روابط GitHub'],
    featuresEn: ['Code projects', 'Tech stack', 'Work experience', 'Education & certs', 'GitHub links'],
    isPremium: false,
    isNew: true,
    usageCount: 4567,
    rating: 4.7,
    colorScheme: { primary: '#6366f1', secondary: '#a5b4fc', accent: '#eef2ff' },
    createdAt: '2024-10-25',
  },
  {
    id: 'portfolio-3',
    slug: 'business-card',
    nameAr: 'بطاقة الأعمال',
    nameEn: 'Business Card',
    descriptionAr: 'قالب بسيط وأنيق للتعريف الشخصي والمهني',
    descriptionEn: 'Simple and elegant personal branding template',
    category: 'portfolio',
    previewImage: '/templates/portfolio-card-preview.jpg',
    thumbnailImage: '/templates/portfolio-card-thumb.jpg',
    featuresAr: ['صفحة واحدة', 'روابط التواصل الاجتماعي', 'معلومات الاتصال', 'QR كود', 'تصميم متجاوب'],
    featuresEn: ['Single page', 'Social links', 'Contact info', 'QR code', 'Responsive design'],
    isPremium: false,
    isNew: false,
    usageCount: 8901,
    rating: 4.6,
    colorScheme: { primary: '#1e293b', secondary: '#475569', accent: '#f8fafc' },
    createdAt: '2024-04-01',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return MOCK_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get featured templates (new or high rating)
 */
export function getFeaturedTemplates(): Template[] {
  return MOCK_TEMPLATES.filter(t => t.isNew || t.rating >= 4.8).slice(0, 6);
}

/**
 * Get template by slug
 */
export function getTemplateBySlug(slug: string): Template | undefined {
  return MOCK_TEMPLATES.find(t => t.slug === slug);
}
