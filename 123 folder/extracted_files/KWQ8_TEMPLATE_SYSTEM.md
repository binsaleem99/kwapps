# 📦 KWQ8 TEMPLATE SYSTEM
## ThemeForest-Inspired Arabic Templates | December 2025

---

# EXECUTIVE SUMMARY

The Template System is the foundation of KWQ8's "Template Mode" - offering pre-built, high-quality Arabic website templates inspired by top-selling ThemeForest designs. Templates are industry-specific, RTL-native, and designed to be customized through the AI builder or visual editor.

---

# PART 1: TEMPLATE ARCHITECTURE

## 1.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TEMPLATE SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        TEMPLATE REGISTRY                            │   │
│  │                                                                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │ E-Commerce │  │ Restaurant │  │  Service   │  │  Corporate │   │   │
│  │  │  Templates │  │  Templates │  │  Templates │  │  Templates │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │   │
│  │                                                                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │ Real Estate│  │  Portfolio │  │  Booking   │  │ Government │   │   │
│  │  │  Templates │  │  Templates │  │  Templates │  │  Templates │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      TEMPLATE CUSTOMIZER                            │   │
│  │                                                                     │   │
│  │  • Color scheme selection                                          │   │
│  │  • Font family selection                                           │   │
│  │  • Content placeholder filling                                     │   │
│  │  • Image upload and placement                                      │   │
│  │  • Section enable/disable                                          │   │
│  │  • RTL/LTR toggle (RTL default)                                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      TEMPLATE GENERATOR                             │   │
│  │                                                                     │   │
│  │  User selections → DeepSeek → Customized Code → Preview            │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Template Categories

| Category | Arabic Name | Industries Covered |
|----------|-------------|-------------------|
| **E-Commerce** | متجر إلكتروني | Fashion, Electronics, Food, General Retail |
| **Restaurant** | مطاعم | Restaurants, Cafes, Bakeries, Catering |
| **Services** | خدمات | Salons, Clinics, Maintenance, Consulting |
| **Corporate** | شركات | Business, Agencies, Consulting Firms |
| **Real Estate** | عقارات | Property Listings, Agencies, Developers |
| **Portfolio** | معرض أعمال | Freelancers, Artists, Photographers |
| **Booking** | حجوزات | Hotels, Tours, Events, Appointments |
| **Government** | حكومي | Ministries, Municipalities, Vision 2030 |

---

# PART 2: TEMPLATE DATA MODEL

## 2.1 Template Schema

```typescript
interface Template {
  id: string;
  slug: string;
  
  // Display Info
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  thumbnailUrl: string;
  previewUrl: string;
  
  // Categorization
  category: TemplateCategory;
  subCategory?: string;
  tags: string[];
  
  // Technical
  techStack: string[];          // ['next.js', 'tailwind', 'supabase']
  features: TemplateFeature[];
  pages: TemplatePage[];
  sections: TemplateSection[];
  
  // Customization
  colorSchemes: ColorScheme[];
  fontPairings: FontPairing[];
  layoutVariations: LayoutVariation[];
  
  // Requirements
  contentRequirements: ContentRequirement[];
  imageRequirements: ImageRequirement[];
  
  // Metadata
  popularity: number;           // Download/usage count
  rating: number;              // 1-5 stars
  isNew: boolean;
  isPremium: boolean;          // Premium tier only?
  creditsToCustomize: number;
  
  createdAt: Date;
  updatedAt: Date;
}

type TemplateCategory = 
  | 'ecommerce'
  | 'restaurant'
  | 'services'
  | 'corporate'
  | 'real_estate'
  | 'portfolio'
  | 'booking'
  | 'government';

interface TemplateFeature {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  icon: string;
  included: boolean;
  optional: boolean;
}

interface TemplatePage {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sections: string[];  // Section IDs
  isRequired: boolean;
}

interface TemplateSection {
  id: string;
  type: SectionType;
  nameAr: string;
  nameEn: string;
  order: number;
  isRequired: boolean;
  contentSlots: ContentSlot[];
  imageSlots: ImageSlot[];
  variations: SectionVariation[];
}
```

## 2.2 Content and Image Requirements

```typescript
interface ContentRequirement {
  id: string;
  type: 'text' | 'rich_text' | 'list' | 'number';
  fieldNameAr: string;
  fieldNameEn: string;
  placeholder: string;
  required: boolean;
  maxLength?: number;
  section: string;
  order: number;
}

interface ImageRequirement {
  id: string;
  slotNameAr: string;
  slotNameEn: string;
  aspectRatio: string;        // e.g., '16:9', '1:1', '3:2'
  minWidth: number;
  minHeight: number;
  recommended: boolean;
  section: string;
  fallbackImage: string;      // Default placeholder
}

// Example for E-Commerce template
const ecommerceContentRequirements: ContentRequirement[] = [
  {
    id: 'store_name',
    type: 'text',
    fieldNameAr: 'اسم المتجر',
    fieldNameEn: 'Store Name',
    placeholder: 'متجر الأناقة',
    required: true,
    maxLength: 50,
    section: 'header',
    order: 1
  },
  {
    id: 'tagline',
    type: 'text',
    fieldNameAr: 'الشعار',
    fieldNameEn: 'Tagline',
    placeholder: 'أفضل المنتجات بأفضل الأسعار',
    required: false,
    maxLength: 100,
    section: 'hero',
    order: 2
  },
  {
    id: 'about_text',
    type: 'rich_text',
    fieldNameAr: 'نبذة عنا',
    fieldNameEn: 'About Us',
    placeholder: 'نحن متجر متخصص في...',
    required: true,
    maxLength: 500,
    section: 'about',
    order: 3
  }
];
```

---

# PART 3: TEMPLATE LIBRARY (15 LAUNCH TEMPLATES)

## 3.1 E-Commerce Templates

### Template EC-01: "أناقة" (Elegance)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: EC-01 "أناقة" (Elegance)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: E-Commerce (Fashion/Luxury)                          │
│  STYLE: Minimalist, elegant, high-end                           │
│  INSPIRATION: Flavou theme (ThemeForest #1 fashion)             │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية (Home) - Hero, Featured Products, Categories        │
│  • المنتجات (Products) - Grid/List view, Filters                 │
│  • تفاصيل المنتج (Product Detail) - Gallery, Add to Cart        │
│  • السلة (Cart) - Items, Quantity, Checkout                     │
│  • من نحن (About) - Story, Team                                 │
│  • تواصل معنا (Contact) - Form, Map, WhatsApp                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Product catalog with categories                              │
│  ✓ Shopping cart                                                │
│  ✓ Wishlist                                                     │
│  ✓ Product search & filters                                     │
│  ✓ WhatsApp ordering                                            │
│  ✓ UPayments checkout                                           │
│  ✓ Mobile responsive                                            │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Classic (Black/White/Gold)                                   │
│  • Modern (Navy/Cream/Rose Gold)                                │
│  • Bold (Black/Red/White)                                       │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 30                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Template EC-02: "سوق" (Marketplace)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: EC-02 "سوق" (Marketplace)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: E-Commerce (General Retail)                          │
│  STYLE: Modern, colorful, feature-rich                          │
│  INSPIRATION: Porto theme (ThemeForest best-seller)             │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية with mega menu                                      │
│  • متجر (Shop) with sidebar filters                             │
│  • تفاصيل المنتج with reviews                                    │
│  • عربة التسوق with cross-sells                                  │
│  • حسابي (My Account) with order history                         │
│  • الأسئلة الشائعة (FAQ)                                         │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Mega menu navigation                                         │
│  ✓ Advanced product filtering                                   │
│  ✓ Product reviews & ratings                                    │
│  ✓ User accounts                                                │
│  ✓ Order tracking                                               │
│  ✓ Multi-currency (KWD default)                                 │
│  ✓ VAT calculator                                               │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Fresh (Green/White/Gray)                                     │
│  • Tech (Blue/Black/White)                                      │
│  • Warm (Orange/Cream/Brown)                                    │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 35                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 Restaurant Templates

### Template REST-01: "المائدة" (The Table)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: REST-01 "المائدة" (The Table)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Restaurant (Fine Dining)                             │
│  STYLE: Elegant, dark theme, food photography focus             │
│  INSPIRATION: flavor theme + Arabic aesthetics                  │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Full-screen hero, About, Featured Menu            │
│  • قائمة الطعام (Menu) - Categories, Items with prices          │
│  • حجز طاولة (Reservation) - Date/Time picker                   │
│  • معرض الصور (Gallery) - Food & Ambiance                        │
│  • تواصل معنا - Location, Hours, WhatsApp                       │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Digital menu with categories                                 │
│  ✓ Table reservation system                                     │
│  ✓ Photo gallery                                                │
│  ✓ WhatsApp ordering                                            │
│  ✓ Google Maps integration                                      │
│  ✓ Operating hours display                                      │
│  ✓ Social media links                                           │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Midnight (Dark/Gold/Cream)                                   │
│  • Classic (Burgundy/White/Gold)                                │
│  • Fresh (White/Green/Wood)                                     │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 25                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Template REST-02: "قهوتي" (My Coffee)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: REST-02 "قهوتي" (My Coffee)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Restaurant (Cafe/Coffee Shop)                        │
│  STYLE: Warm, cozy, hipster-modern                              │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Warm hero, Story, Menu Preview                    │
│  • القائمة (Menu) - Drinks, Food, Specials                       │
│  • قصتنا (Our Story) - Brand narrative                          │
│  • فروعنا (Locations) - Multiple branches                        │
│  • تواصل معنا                                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Menu with photos                                             │
│  ✓ Multiple location support                                    │
│  ✓ Instagram feed integration                                   │
│  ✓ Online ordering link                                         │
│  ✓ Loyalty program info                                         │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Coffee (Brown/Cream/Beige)                                   │
│  • Modern (Black/White/Copper)                                  │
│  • Forest (Green/Brown/Cream)                                   │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 20                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.3 Service Templates

### Template SVC-01: "جمالي" (My Beauty)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: SVC-01 "جمالي" (My Beauty)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Services (Salon/Spa)                                 │
│  STYLE: Luxurious, feminine, soft colors                        │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Hero, Services preview, Testimonials              │
│  • خدماتنا (Services) - Categories with pricing                 │
│  • احجز موعد (Book Appointment) - Service + Date/Time           │
│  • فريقنا (Our Team) - Staff profiles                            │
│  • المعرض (Gallery) - Before/After, Salon photos                 │
│  • تواصل معنا                                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Service catalog with prices                                  │
│  ✓ Online booking system                                        │
│  ✓ Staff profiles                                               │
│  ✓ Before/after gallery                                         │
│  ✓ WhatsApp booking                                             │
│  ✓ Review integration                                           │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Rose (Pink/Gold/White)                                       │
│  • Lavender (Purple/Silver/White)                               │
│  • Natural (Beige/Green/Cream)                                  │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 25                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Template SVC-02: "صيانة+" (Maintenance+)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: SVC-02 "صيانة+" (Maintenance+)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Services (Home Services/Maintenance)                 │
│  STYLE: Professional, trustworthy, blue tones                   │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Hero with CTA, Services, Trust badges             │
│  • خدماتنا - AC, Plumbing, Electrical, etc.                     │
│  • اطلب خدمة (Request Service) - Form                           │
│  • أسعارنا (Pricing) - Service packages                          │
│  • من نحن (About) - Company, Certifications                      │
│  • تواصل معنا                                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Service request form                                         │
│  ✓ Pricing tables                                               │
│  ✓ Service area map                                             │
│  ✓ Emergency contact                                            │
│  ✓ WhatsApp quick contact                                       │
│  ✓ Trust badges (licensed, insured)                             │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Professional (Blue/White/Gray)                               │
│  • Technical (Navy/Orange/White)                                │
│  • Trustworthy (Green/White/Gray)                               │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 20                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.4 Corporate Templates

### Template CORP-01: "ريادة" (Leadership)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: CORP-01 "ريادة" (Leadership)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Corporate (Business/Consulting)                      │
│  STYLE: Professional, modern, data-driven                       │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Hero, Stats, Services, Clients                    │
│  • خدماتنا - Consulting services                                │
│  • مشاريعنا (Projects/Case Studies)                              │
│  • فريقنا - Leadership team                                     │
│  • المدونة (Blog)                                               │
│  • تواصل معنا - Form, Offices                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Animated statistics                                          │
│  ✓ Case study portfolio                                         │
│  ✓ Team showcase                                                │
│  ✓ Blog/News section                                            │
│  ✓ Client logos carousel                                        │
│  ✓ Contact form with file upload                                │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Executive (Navy/Gold/White)                                  │
│  • Modern (Gray/Blue/White)                                     │
│  • Bold (Black/Red/White)                                       │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 30                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.5 Real Estate Template

### Template RE-01: "دارك" (Your Home)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: RE-01 "دارك" (Your Home)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Real Estate                                          │
│  STYLE: Clean, spacious, property-focused                       │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Search, Featured Properties                        │
│  • العقارات (Properties) - Listings with filters                 │
│  • تفاصيل العقار - Gallery, Details, Agent                       │
│  • عن الشركة (About Agency)                                      │
│  • فريق الوكلاء (Agents)                                         │
│  • تواصل معنا                                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Property search with filters                                 │
│  ✓ Property listings grid                                       │
│  ✓ Photo galleries                                              │
│  ✓ Agent profiles                                               │
│  ✓ Inquiry form                                                 │
│  ✓ WhatsApp quick contact                                       │
│  ✓ Map integration                                              │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Luxury (Gold/Black/White)                                    │
│  • Fresh (Green/White/Gray)                                     │
│  • Modern (Blue/White/Gray)                                     │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 35                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.6 Portfolio Templates

### Template PORT-01: "إبداعي" (Creative)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: PORT-01 "إبداعي" (Creative)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Portfolio (Designer/Artist)                          │
│  STYLE: Creative, minimal, work-focused                         │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Full-screen work showcase                         │
│  • أعمالي (Portfolio) - Filterable gallery                       │
│  • تفاصيل المشروع (Project Detail)                               │
│  • عني (About Me) - Bio, Skills                                  │
│  • تواصل معي                                                    │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Masonry portfolio grid                                       │
│  ✓ Project filtering by category                                │
│  ✓ Lightbox gallery                                             │
│  ✓ Skills visualization                                         │
│  ✓ Downloadable CV                                              │
│  ✓ Contact form                                                 │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Minimal (Black/White)                                        │
│  • Creative (Multi-color accents)                               │
│  • Dark (Charcoal/Neon accents)                                 │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 20                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.7 Booking Templates

### Template BOOK-01: "رحلتي" (My Trip)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: BOOK-01 "رحلتي" (My Trip)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Booking (Tours/Travel)                               │
│  STYLE: Adventurous, vibrant, photo-rich                        │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Search, Popular destinations                       │
│  • الرحلات (Tours) - Listings with filters                       │
│  • تفاصيل الرحلة - Itinerary, Pricing, Booking                   │
│  • عن الشركة                                                    │
│  • تواصل معنا                                                   │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Tour search                                                  │
│  ✓ Tour listings with pricing                                   │
│  ✓ Itinerary display                                            │
│  ✓ Online booking                                               │
│  ✓ Calendar availability                                        │
│  ✓ Payment integration                                          │
│  ✓ WhatsApp inquiry                                             │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Adventure (Orange/Blue/White)                                │
│  • Luxury (Gold/Navy/Cream)                                     │
│  • Natural (Green/Brown/Cream)                                  │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 30                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3.8 Government Template

### Template GOV-01: "رؤية" (Vision)
```
┌─────────────────────────────────────────────────────────────────┐
│  TEMPLATE: GOV-01 "رؤية" (Vision)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CATEGORY: Government (Ministries/Vision 2030)                  │
│  STYLE: Official, trustworthy, accessible                       │
│  INSPIRATION: Saudi Vision 2030 design language                 │
│                                                                 │
│  PAGES:                                                         │
│  • الرئيسية - Announcements, Services, Statistics               │
│  • الخدمات (Services) - E-services portal                        │
│  • الأخبار (News) - Latest updates                               │
│  • عن الجهة (About) - Vision, Mission, Leadership                │
│  • الهيكل التنظيمي (Org Structure)                               │
│  • تواصل معنا - Multiple channels                                │
│                                                                 │
│  FEATURES:                                                      │
│  ✓ Announcements ticker                                         │
│  ✓ E-services links                                             │
│  ✓ Statistics dashboard                                         │
│  ✓ News/Blog                                                    │
│  ✓ Leadership profiles                                          │
│  ✓ Contact directory                                            │
│  ✓ Accessibility features                                       │
│  ✓ Arabic/English toggle                                        │
│                                                                 │
│  COLOR SCHEMES:                                                 │
│  • Vision 2030 (Green/White/Gold)                               │
│  • Government (Blue/White/Gold)                                 │
│  • National (Flag colors)                                       │
│                                                                 │
│  CREDITS TO CUSTOMIZE: 40                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 4: TEMPLATE SELECTION FLOW

## 4.1 Selection UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          اختر قالبك | Choose Template                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔍 بحث...                              [كل الفئات ▼] [الأحدث ▼]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           الفئات                                    │   │
│  │                                                                     │   │
│  │  [🛒 متاجر]  [🍽️ مطاعم]  [💼 خدمات]  [🏢 شركات]                    │   │
│  │  [🏠 عقارات]  [🎨 معارض]  [📅 حجوزات]  [🏛️ حكومي]                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │               │  │               │  │               │                   │
│  │   [صورة]     │  │   [صورة]     │  │   [صورة]     │                   │
│  │               │  │               │  │               │                   │
│  │  ⭐⭐⭐⭐⭐     │  │  ⭐⭐⭐⭐☆     │  │  ⭐⭐⭐⭐⭐ 🆕  │                   │
│  │               │  │               │  │               │                   │
│  │  أناقة       │  │  سوق         │  │  المائدة     │                   │
│  │  متجر إلكتروني│  │  متجر عام    │  │  مطعم فاخر   │                   │
│  │               │  │               │  │               │                   │
│  │  [معاينة]    │  │  [معاينة]    │  │  [معاينة]    │                   │
│  │  [اختيار ✓]  │  │  [اختيار]    │  │  [اختيار]    │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │     ...       │  │     ...       │  │     ...       │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  أو ابدأ من الصفر مع الذكاء الاصطناعي                                       │
│  [🤖 بناء من الصفر]                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Template Preview Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✕                                                    [العربية | English]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                      [LIVE PREVIEW IFRAME]                          │   │
│  │                                                                     │   │
│  │        ┌───────────────────────────────────────────────┐           │   │
│  │        │                                               │           │   │
│  │        │          Template Preview                     │           │   │
│  │        │                                               │           │   │
│  │        └───────────────────────────────────────────────┘           │   │
│  │                                                                     │   │
│  │        [💻 Desktop]  [📱 Tablet]  [📱 Mobile]                       │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────┐                                  │
│  │  أناقة - متجر إلكتروني                │                                  │
│  │  ⭐⭐⭐⭐⭐ (4.8) • 1,245 استخدام        │                                  │
│  │                                       │                                  │
│  │  قالب متجر إلكتروني أنيق مصمم خصيصاً  │                                  │
│  │  للأزياء والمنتجات الفاخرة. يتميز    │                                  │
│  │  بتصميم عصري وتجربة تسوق سلسة.        │                                  │
│  │                                       │                                  │
│  │  الميزات:                             │                                  │
│  │  ✓ كتالوج المنتجات                   │                                  │
│  │  ✓ عربة التسوق                       │                                  │
│  │  ✓ قائمة الأمنيات                    │                                  │
│  │  ✓ دفع إلكتروني (UPayments)          │                                  │
│  │  ✓ واتساب للطلب                      │                                  │
│  │  ✓ متوافق مع الجوال                  │                                  │
│  │                                       │                                  │
│  │  الصفحات: 6                           │                                  │
│  │  نقاط التخصيص: 30                     │                                  │
│  │                                       │                                  │
│  │  الألوان المتاحة:                     │                                  │
│  │  ⚫ ⚪ 🟡  |  🔵 🤍 🟠  |  ⚫ 🔴 ⚪     │                                  │
│  │                                       │                                  │
│  └───────────────────────────────────────┘                                  │
│                                                                             │
│       [إلغاء]                              [استخدام هذا القالب ✓]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 5: TEMPLATE CUSTOMIZATION WIZARD

## 5.1 Customization Steps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       معالج تخصيص القالب                                   │
│                                                                             │
│       [1️⃣ معلومات]──[2️⃣ ألوان]──[3️⃣ محتوى]──[4️⃣ صور]──[5️⃣ مراجعة]        │
│           ●           ○           ○          ○          ○                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Step 1: Basic Information

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  الخطوة 1: المعلومات الأساسية                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  اسم المتجر / الشركة *                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ متجر الأناقة                                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  الشعار (Tagline)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ أفضل المنتجات بأفضل الأسعار                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  نوع النشاط *                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ▼ أزياء وملابس                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  رقم الواتساب *                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🇰🇼 +965 │ 1234 5678                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  البريد الإلكتروني *                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ info@elegance.kw                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│       [رجوع]                                              [التالي ←]       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.3 Step 2: Color Scheme

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  الخطوة 2: اختر نظام الألوان                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  اختر من الأنظمة الجاهزة:                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ ⚫ ⚪ 🟡    │  │ 🔵 🤍 🟠    │  │ ⚫ 🔴 ⚪    │              │   │
│  │  │  كلاسيكي    │  │  عصري       │  │  جريء       │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  │  [✓ محدد]   │  │  [اختيار]   │  │  [اختيار]   │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  أو خصص الألوان:                                                            │
│                                                                             │
│  اللون الرئيسي      اللون الثانوي      لون التمييز                          │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐                        │
│  │ ⚫ #000  │       │ ⚪ #FFF  │       │ 🟡 #D4AF │                        │
│  └──────────┘       └──────────┘       └──────────┘                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  معاينة مباشرة                                                      │   │
│  │  ┌───────────────────────────────────────────────────────────┐     │   │
│  │  │  [Preview with selected colors]                            │     │   │
│  │  └───────────────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│       [← رجوع]                                            [التالي ←]       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.4 Step 3: Content

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  الخطوة 3: أضف المحتوى                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📝 نبذة عنا *                                                      │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ متجر الأناقة متخصص في تقديم أرقى الأزياء والإكسسوارات      │   │   │
│  │  │ للمرأة الخليجية. نختار منتجاتنا بعناية من أفضل الماركات    │   │   │
│  │  │ العالمية لنقدم لكِ تجربة تسوق فريدة...                      │   │   │
│  │  │                                                             │   │   │
│  │  │ [B] [I] [U] [قائمة] [رابط]              235/500 حرف        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📍 العنوان                                                         │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ شارع السالم، السالمية، الكويت                               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🕐 أوقات العمل                                                     │   │
│  │                                                                     │   │
│  │  السبت - الخميس    10:00 ص - 10:00 م                               │   │
│  │  الجمعة            2:00 م - 10:00 م                                 │   │
│  │                                                                     │   │
│  │  [+ إضافة توقيت]                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│       [← رجوع]                                            [التالي ←]       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.5 Step 4: Images

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  الخطوة 4: أضف الصور                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💡 يمكنك إضافة الصور الآن أو لاحقاً من لوحة التحكم                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🖼️ الشعار *                                                        │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────┐       │   │
│  │  │                                                         │       │   │
│  │  │     [📤 ارفع الشعار]                                   │       │   │
│  │  │                                                         │       │   │
│  │  │     PNG أو SVG، شفاف الخلفية                            │       │   │
│  │  │     الحجم الموصى: 400×120 بكسل                          │       │   │
│  │  │                                                         │       │   │
│  │  └─────────────────────────────────────────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🖼️ صورة البانر الرئيسي                                             │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────┐       │   │
│  │  │                                                         │       │   │
│  │  │     [📤 ارفع صورة البانر]                               │       │   │
│  │  │                                                         │       │   │
│  │  │     الحجم الموصى: 1920×800 بكسل                         │       │   │
│  │  │                                                         │       │   │
│  │  └─────────────────────────────────────────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🖼️ صور المنتجات المميزة (0/4)                                      │   │
│  │                                                                     │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │   │
│  │  │  +   │  │  +   │  │  +   │  │  +   │                            │   │
│  │  │      │  │      │  │      │  │      │                            │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│       [← رجوع]          [تخطي الصور]          [التالي ←]                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.6 Step 5: Review & Generate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  الخطوة 5: مراجعة وتوليد الموقع                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ملخص التخصيصات                                 │   │
│  │                                                                     │   │
│  │  القالب: أناقة - متجر إلكتروني                                      │   │
│  │  الاسم: متجر الأناقة                                                │   │
│  │  نظام الألوان: كلاسيكي (أسود/أبيض/ذهبي)                              │   │
│  │  الصفحات: 6 صفحات                                                   │   │
│  │  الصور: 2 من 5 مرفوعة                                               │   │
│  │                                                                     │   │
│  │  ✓ معلومات أساسية مكتملة                                           │   │
│  │  ✓ نظام الألوان محدد                                               │   │
│  │  ✓ نبذة عنا مكتوبة                                                  │   │
│  │  ⚠ صور المنتجات غير مكتملة (يمكن إضافتها لاحقاً)                    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      معاينة الموقع                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐     │   │
│  │  │                                                           │     │   │
│  │  │              [Final Preview with content]                 │     │   │
│  │  │                                                           │     │   │
│  │  └───────────────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  💎 النقاط المطلوبة: 30                                             │   │
│  │  💰 رصيدك الحالي: 450                                               │   │
│  │  💎 الرصيد بعد التوليد: 420                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│       [← رجوع]                          [🚀 توليد الموقع]                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 6: TEMPLATE GENERATION PROCESS

## 6.1 Generation Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    TEMPLATE GENERATION FLOW                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER COMPLETES WIZARD                                        │
│     └── Selections validated                                     │
│                                                                  │
│  2. GEMINI PROCESSES CUSTOMIZATIONS                              │
│     └── Generates structured config for DeepSeek                 │
│                                                                  │
│  3. DEEPSEEK GENERATES CODE                                      │
│     ├── Applies color scheme to template                         │
│     ├── Injects user content                                     │
│     ├── Configures enabled sections                              │
│     ├── Sets up database schema                                  │
│     └── Creates admin dashboard config                           │
│                                                                  │
│  4. GEMINI VALIDATES OUTPUT                                      │
│     ├── RTL correctness                                          │
│     ├── Arabic text rendering                                    │
│     ├── Responsive design                                        │
│     └── Feature completeness                                     │
│                                                                  │
│  5. PROJECT CREATION                                             │
│     ├── GitHub repo created                                      │
│     ├── Supabase tables provisioned                              │
│     ├── Admin dashboard generated                                │
│     └── Preview URL generated                                    │
│                                                                  │
│  6. USER REDIRECTED TO EDITOR                                    │
│     └── Can now use Visual Editor for further changes            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 6.2 Template Generation API

```typescript
// POST /api/templates/generate
interface GenerateTemplateRequest {
  templateId: string;
  customizations: {
    basicInfo: {
      businessName: string;
      tagline?: string;
      businessType: string;
      phone: string;
      email: string;
      address?: string;
      hours?: OperatingHours[];
    };
    colorScheme: {
      preset?: string;           // Or custom:
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    content: {
      aboutUs: string;
      services?: ServiceItem[];
      products?: ProductItem[];
    };
    images: {
      logo?: UploadedImage;
      hero?: UploadedImage;
      featured?: UploadedImage[];
    };
    enabledSections: string[];
  };
}

interface GenerateTemplateResponse {
  projectId: string;
  previewUrl: string;
  editorUrl: string;
  adminUrl: string;
  creditsUsed: number;
  status: 'success' | 'pending' | 'error';
}
```

---

# PART 7: DATABASE SCHEMA

## 7.1 Template Tables

```sql
-- Templates registry
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category VARCHAR(50) NOT NULL,
  sub_category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  
  -- Technical
  tech_stack TEXT[] DEFAULT '{"next.js", "tailwind", "supabase"}',
  features JSONB DEFAULT '[]',
  pages JSONB DEFAULT '[]',
  sections JSONB DEFAULT '[]',
  
  -- Customization options
  color_schemes JSONB DEFAULT '[]',
  font_pairings JSONB DEFAULT '[]',
  layout_variations JSONB DEFAULT '[]',
  
  -- Requirements
  content_requirements JSONB DEFAULT '[]',
  image_requirements JSONB DEFAULT '[]',
  
  -- Metadata
  popularity INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  is_new BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  credits_to_customize INTEGER DEFAULT 25,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template usage tracking
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  customizations JSONB DEFAULT '{}',
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings
CREATE TABLE template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_popularity ON templates(popularity DESC);
CREATE INDEX idx_templates_rating ON templates(rating DESC);
CREATE INDEX idx_template_usage_user ON template_usage(user_id);
CREATE INDEX idx_template_usage_template ON template_usage(template_id);

-- RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;

-- Everyone can view templates
CREATE POLICY "Public templates read access"
  ON templates FOR SELECT
  USING (true);

-- Users can only see their own usage
CREATE POLICY "Users see own template usage"
  ON template_usage FOR ALL
  USING (auth.uid() = user_id);

-- Users can rate templates
CREATE POLICY "Users can rate templates"
  ON template_ratings FOR ALL
  USING (auth.uid() = user_id);
```

---

# PART 8: IMPLEMENTATION TIMELINE

## 8.1 Sprint Schedule

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| **Sprint 6** | Core System | Template registry, selection UI, database schema |
| **Sprint 7** | Templates 1-5 | EC-01, EC-02, REST-01, REST-02, SVC-01 |
| **Sprint 8** | Templates 6-10 | SVC-02, CORP-01, RE-01, PORT-01, BOOK-01 |
| **Sprint 9** | Templates 11-15 | GOV-01 + 4 additional variations |
| **Sprint 10** | Customization | Full wizard, generation pipeline, integration |

## 8.2 Template Development Checklist

For each template:
- [ ] Design approval from Product
- [ ] ThemeForest inspiration documented
- [ ] All pages designed (Figma)
- [ ] RTL layout verified
- [ ] Arabic content prepared
- [ ] Color schemes defined (3 per template)
- [ ] Font pairings selected
- [ ] Content requirements documented
- [ ] Image requirements documented
- [ ] React components built
- [ ] Supabase schema defined
- [ ] Admin dashboard configured
- [ ] Mobile responsiveness tested
- [ ] Preview deployed
- [ ] Test group review completed

---

# APPENDIX A: TEMPLATE QUICK REFERENCE

| ID | Name | Category | Pages | Credits |
|----|------|----------|-------|---------|
| EC-01 | أناقة | E-Commerce | 6 | 30 |
| EC-02 | سوق | E-Commerce | 6 | 35 |
| REST-01 | المائدة | Restaurant | 5 | 25 |
| REST-02 | قهوتي | Cafe | 5 | 20 |
| SVC-01 | جمالي | Salon/Spa | 6 | 25 |
| SVC-02 | صيانة+ | Maintenance | 6 | 20 |
| CORP-01 | ريادة | Corporate | 6 | 30 |
| RE-01 | دارك | Real Estate | 6 | 35 |
| PORT-01 | إبداعي | Portfolio | 5 | 20 |
| BOOK-01 | رحلتي | Travel/Booking | 5 | 30 |
| GOV-01 | رؤية | Government | 6 | 40 |

---

**Document Version:** 1.0  
**Created:** December 2025  
**Owner:** Product + Design Team  
**Sprint:** 6-10
