# 🏛️ KWQ8.COM — COUNCIL BRIEFING DOCUMENT
## Springwood Company | Kuwait | December 2025

---

# COUNCIL MEMBERS PRESENT

| Role | Focus Area |
|------|------------|
| **Business Consultant** | Strategy, Market Fit, Growth |
| **Product Manager** | Features, Roadmap, User Experience |
| **Product Director** | Vision, Direction, Priorities |
| **Software Engineer** | Architecture, Code Quality |
| **Backend Engineer** | APIs, Database, Infrastructure |
| **Frontend Engineer** | UI/UX, Performance, Accessibility |
| **Business Developer** | Partnerships, Revenue Streams |
| **Accountant** | Finances, Pricing, Margins |
| **Marketing Manager** | Brand, Campaigns, Messaging |
| **Promotion Manager** | Ads, Offers, Conversions |
| **Collab Manager** | Influencers, Affiliates, Partners |
| **Integration Manager** | Third-party Services, APIs |
| **Customer Support Manager** | Help, Onboarding, Retention |
| **Customer Acquisition Manager** | Growth, Funnels, CAC |

---

# PART 1: WHAT IS KWQ8?

## 📌 Executive Summary

**KWq8.com** is an AI-powered website and web application builder designed exclusively for Arabic-speaking businesses in the GCC (Gulf Cooperation Council) region.

Think of it as **"Lovable.dev meets Wix, but built from the ground up for Arabs."**

| Attribute | Details |
|-----------|---------|
| **Company** | Springwood |
| **Location** | Kuwait 🇰🇼 |
| **Domain** | KWq8.com |
| **Funding** | Bootstrapped (self-funded) |
| **Currency** | KWD (Kuwaiti Dinar) |
| **Target Market** | Arabic-speaking businesses in GCC |
| **Language** | Arabic-first (RTL by default) |

---

## 🎯 The Problem We Solve

### For Arabic Business Owners:

1. **Language Barrier**: Most website builders are English-first. Arabic is an afterthought.
2. **RTL Nightmare**: Right-to-left layouts break in most tools. Business owners get frustrated.
3. **Technical Complexity**: Traditional web development requires hiring developers (expensive).
4. **GCC-Specific Needs**: VAT calculations, local payment gateways, Arabic invoicing — global tools don't support these.
5. **Cultural Mismatch**: Western templates don't fit GCC aesthetics, Islamic design needs, or local business practices.

### The Gap in the Market:

| Tool | Arabic Support | RTL Native | GCC Payments | GCC Templates |
|------|---------------|------------|--------------|---------------|
| Wix | ⚠️ Partial | ❌ No | ❌ No | ❌ No |
| Squarespace | ❌ No | ❌ No | ❌ No | ❌ No |
| Lovable.dev | ❌ No | ❌ No | ❌ No | ❌ No |
| Bolt.new | ❌ No | ❌ No | ❌ No | ❌ No |
| v0 (Vercel) | ❌ No | ❌ No | ❌ No | ❌ No |
| **KWq8** | ✅ **Native** | ✅ **Default** | ✅ **Yes** | ✅ **Yes** |

**KWq8 is the ONLY Arabic-first AI website builder in the world.**

---

## 🌟 The Vision

> **"Any Arabic-speaking person can build a professional website or web app in minutes, just by describing what they want in Arabic."**

### What This Means:

- A **salon owner in Riyadh** types: "أريد موقع لصالون تجميل نسائي مع حجز مواعيد" (I want a website for a women's beauty salon with appointment booking)
- KWq8 asks a few clarifying questions in Arabic
- Within minutes, a complete, beautiful, functional website is generated
- The salon owner can publish it, connect a domain, and start taking bookings
- All in Arabic. All RTL. All GCC-compliant.

---

## 🏗️ How KWq8 Works

### The User Journey:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER SIGNS UP                                               │
│     └── Email/Password or Google OAuth                          │
│     └── Chooses subscription tier                               │
│     └── Gets daily credits                                      │
│                                                                 │
│  2. USER STARTS PROJECT                                         │
│     └── Option A: Choose from Arabic template                   │
│     └── Option B: Build from scratch with AI                    │
│                                                                 │
│  3. USER DESCRIBES IN ARABIC                                    │
│     └── "أريد متجر إلكتروني لبيع العطور"                          │
│     └── (I want an e-commerce store to sell perfumes)           │
│                                                                 │
│  4. AI ASKS CLARIFYING QUESTIONS                                │
│     └── What's your brand name?                                 │
│     └── How many products?                                      │
│     └── What colors do you prefer?                              │
│     └── Do you need payment integration?                        │
│                                                                 │
│  5. AI GENERATES WEBSITE                                        │
│     └── Complete code (React + Tailwind + Supabase)             │
│     └── RTL layout                                              │
│     └── Arabic fonts (Tajawal, Cairo, Amiri)                    │
│     └── GCC-compliant (VAT, payments, etc.)                     │
│                                                                 │
│  6. USER CUSTOMIZES                                             │
│     └── Chat with AI to make changes                            │
│     └── Upload images                                           │
│     └── Add products/services                                   │
│     └── Connect APIs (WhatsApp, payments)                       │
│                                                                 │
│  7. USER PUBLISHES                                              │
│     └── One-click deployment to Vercel                          │
│     └── Buy domain in-platform (Namecheap)                      │
│     └── SSL included                                            │
│     └── Live in minutes                                         │
│                                                                 │
│  8. USER MANAGES                                                │
│     └── Auto-generated admin dashboard                          │
│     └── Add products without AI (free)                          │
│     └── See sales, users, analytics                             │
│     └── Full control from KWq8 platform                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 2: TECHNICAL ARCHITECTURE

## 🧠 The Dual-AI System

KWq8 uses **two AI models working together**:

```
┌─────────────────────────────────────────────────────────────────┐
│                      DUAL-AI ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐      ┌─────────────────────┐          │
│  │   GEMINI 3 PRO      │      │     DEEPSEEK        │          │
│  │   (Orchestrator)    │ ───▶ │   (Code Generator)  │          │
│  └─────────────────────┘      └─────────────────────┘          │
│                                                                 │
│  GEMINI'S JOB:                 DEEPSEEK'S JOB:                 │
│  • Understand user intent      • Generate actual code          │
│  • Detect language (AR/EN)     • Write React components        │
│  • Identify business type      • Create Tailwind styles        │
│  • Ask clarifying questions    • Build Supabase schemas        │
│  • Construct structured        • Follow RTL rules              │
│    prompts for DeepSeek        • Apply design system           │
│  • Validate generated code     • Optimize for performance      │
│  • Ensure GCC compliance                                       │
│  • Check RTL correctness                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Two AIs?

| Reason | Explanation |
|--------|-------------|
| **Cost Optimization** | DeepSeek is cheaper for code generation. Gemini is better for understanding. |
| **Quality Control** | Gemini validates what DeepSeek produces. Double-checking. |
| **Specialization** | Each AI does what it's best at. |
| **Reliability** | If one fails, the other can catch errors. |

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | Web application framework |
| **Styling** | Tailwind CSS | Utility-first CSS, RTL support |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **Database** | Supabase (PostgreSQL) | Database, Auth, Storage, RLS |
| **AI Orchestration** | Gemini 3 Pro | User understanding, validation |
| **AI Code Gen** | DeepSeek | Website/app code generation |
| **Deployment** | Vercel | Hosting user projects |
| **Code Storage** | GitHub | Repository for each project |
| **Payments** | UPayments | Kuwait-native KWD processing |
| **Domains** | Namecheap API | In-platform domain purchase |
| **Image AI** | Banana.dev | Image upscaling (Premium+) |
| **Messaging** | WhatsApp Business | Chat bubble integration |

---

## 📊 Database Schema

### Core Tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts, profiles, preferences |
| `projects` | User's website/app projects |
| `messages` | AI conversation history |
| `templates` | Pre-built Arabic templates |
| `user_assets` | Uploaded images, files |
| `subscriptions` | User subscription status |
| `usage_limits` | Credit tracking per user |
| `project_versions` | Version history for rollback |
| `billing_events` | Payment transactions |
| `analytics_events` | Usage tracking |

### Row Level Security (RLS):

All tables use Supabase RLS to ensure:
- Users can only see their own data
- Projects are private by default
- Admin access is controlled
- No data leaks between users

---

## 🛠️ Development Tools

### MCP Servers (Model Context Protocol):

| MCP Server | Use Case |
|------------|----------|
| **Browser MCP** | QA testing, automated browser actions |
| **GitMCP** | Real-time code access, fix hallucinations |
| **Supabase MCP** | Direct schema sync, SQL policies |
| **Claude Taskmaster** | Product roadmap, task prioritization |
| **Exa Search MCP** | Real-time data, API references |
| **Knowledge Graph Memory** | Reusable logic across features |
| **21st Dev Magic MCP** | Natural language to UI (platform only) |
| **Rube MCP (Composio)** | 500+ app integrations |

### Docker MCP Consolidation:

- Problem: 5 MCPs × 10 tools = 20,000+ tokens flooding context
- Solution: Docker MCP server consolidates all tools
- Result: **90% reduction in context consumption**

---

# PART 3: PRODUCT FEATURES

## 🎨 Building Modes

### Mode 1: Template Mode

```
┌─────────────────────────────────────────────────────────────────┐
│                       TEMPLATE MODE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • Pre-built Arabic templates                                   │
│  • Inspired by top-selling ThemeForest templates                │
│  • Industry-specific:                                           │
│    - Salons & Beauty                                            │
│    - Restaurants & Cafes                                        │
│    - Retail & E-commerce                                        │
│    - Corporate & Business                                       │
│    - Real Estate                                                │
│    - Government (Vision 2030 style)                             │
│    - Portfolios                                                 │
│    - Clinics & Healthcare                                       │
│    - Islamic Centers & Mosques                                  │
│    - Food Delivery                                              │
│                                                                 │
│  • Multiple style variations                                    │
│  • With/without hero sections                                   │
│  • All RTL and Arabic-first                                     │
│  • Stable and always organized                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mode 2: Build from Scratch

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD FROM SCRATCH MODE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: User sends prompt                                      │
│  "أريد موقع لمطعم بحري مع قائمة طعام وحجز طاولات"                 │
│  (I want a seafood restaurant site with menu and reservations)  │
│                                                                 │
│  STEP 2: Gemini analyzes prompt for:                            │
│  ├── Business type: Restaurant (seafood)                        │
│  ├── Services: Menu display, table reservations                 │
│  ├── Functionality: Booking system needed                       │
│  ├── Styling: Not specified (will ask)                          │
│  └── Language: Arabic                                           │
│                                                                 │
│  STEP 3: Gemini asks clarifying questions                       │
│  "ما اسم المطعم؟"                                                │
│  "ما الألوان التي تفضلها؟"                                       │
│  "هل تريد نظام دفع إلكتروني؟"                                    │
│                                                                 │
│  STEP 4: Gemini constructs structured prompt for DeepSeek       │
│                                                                 │
│  STEP 5: DeepSeek generates complete code                       │
│                                                                 │
│  STEP 6: Gemini validates output                                │
│  ├── RTL correct? ✓                                             │
│  ├── Arabic fonts? ✓                                            │
│  ├── Functional? ✓                                              │
│  ├── Styling compliant? ✓                                       │
│  └── GCC compliant? ✓                                           │
│                                                                 │
│  STEP 7: Code sent to preview                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✏️ Visual Editor

The Visual Editor allows users to customize their website through chat:

| Feature | How It Works |
|---------|--------------|
| **Chat-based editing** | User types "غير لون الخلفية إلى أزرق" (change background to blue) |
| **DOM analysis** | Gemini analyzes website structure to find correct element |
| **Image placement** | User uploads photo → AI finds proper location automatically |
| **Smart suggestions** | AI suggests improvements based on industry best practices |

### Image Management:

```
┌─────────────────────────────────────────────────────────────────┐
│                     IMAGE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UPLOAD OPTIONS:                                                │
│  ├── Upload from device                                         │
│  ├── YouTube video link                                         │
│  └── Online image URL                                           │
│                                                                 │
│  QUALITY CHECK:                                                 │
│  ├── If image quality is low:                                   │
│  │   └── Prompt: "Upgrade to Premium for AI image enhancement"  │
│  └── If quality is good:                                        │
│      └── Styled according to placement location                 │
│                                                                 │
│  FOR TEMPLATES:                                                 │
│  ├── AI asks for specific number of images                      │
│  ├── "Upload 3 product images"                                  │
│  └── Guides user through each placement                         │
│                                                                 │
│  BANANA.DEV INTEGRATION (Premium+):                             │
│  ├── AI-powered image upscaling                                 │
│  ├── Quality improvement                                        │
│  └── Ratio adjustment                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database (Supabase)

Every user project gets a **production-ready database**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE INTEGRATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHAT USERS GET:                                                │
│  ├── Full PostgreSQL database                                   │
│  ├── Authentication system                                      │
│  ├── File storage                                               │
│  ├── Row Level Security                                         │
│  └── Real-time subscriptions                                    │
│                                                                 │
│  HOW IT WORKS:                                                  │
│  ├── User clicks "Backend" section                              │
│  ├── Places all required API links                              │
│  ├── Gemini creates proper schema                               │
│  └── Tables auto-created with RLS policies                      │
│                                                                 │
│  LOVABLE-STYLE APPROACH:                                        │
│  ├── Production-ready from day one                              │
│  ├── User can publish directly                                  │
│  ├── Dashboard shows all data                                   │
│  └── Full control from KWq8 platform                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Integration

### Preset APIs:

| API | Purpose | Setup |
|-----|---------|-------|
| **UPayments** | Payment processing | Pre-linked (contract required) |
| **WhatsApp** | Chat bubble | User provides phone number |
| **Namecheap** | Domain purchase | Built into publish flow |
| **Supabase** | Database | Auto-configured per project |

### How API Integration Works:

1. User clicks **Backend** section in builder
2. Sees list of available integrations
3. Places required credentials/links
4. Gemini creates the connection code
5. Integration tested and deployed

**Example: WhatsApp Bubble**
```
User → "أريد زر واتساب على الموقع"
AI → "ما رقم الواتساب؟"
User → "+965 1234 5678"
AI → Creates floating WhatsApp button with correct link
```

---

## 📊 Auto-Generated Admin Dashboard

**Every user project automatically gets an admin dashboard:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AUTO-CREATED FOR EVERY PROJECT:                                │
│  ├── Admin credentials auto-provided                            │
│  ├── Separate login from main site                              │
│  └── Similar to Lovable's database button                       │
│                                                                 │
│  DASHBOARD FEATURES:                                            │
│  ├── User Management                                            │
│  │   ├── View all users                                         │
│  │   ├── Delete users                                           │
│  │   └── Edit user details                                      │
│  │                                                              │
│  ├── Sales & Analytics                                          │
│  │   ├── View all orders                                        │
│  │   ├── Revenue tracking                                       │
│  │   └── Customer insights                                      │
│  │                                                              │
│  ├── Product Management                                         │
│  │   ├── Add products (LIVE updates)                            │
│  │   ├── Edit pricing                                           │
│  │   └── Upload product images                                  │
│  │                                                              │
│  └── Content Management                                         │
│      ├── Add pages                                              │
│      ├── Edit text                                              │
│      └── Update images                                          │
│                                                                 │
│  TWO WAYS TO ADD CONTENT:                                       │
│  ├── Through AI → Costs credits                                 │
│  └── Through Dashboard → FREE                                   │
│                                                                 │
│  PRESET FIELDS FOR ADDING PAGES:                                │
│  ├── Product image field                                        │
│  ├── User reviews field                                         │
│  ├── Pricing fields                                             │
│  └── Description fields                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛒 Product/Service Management

For templates selling products or services (stores, salons, etc.):

```
┌─────────────────────────────────────────────────────────────────┐
│               PRODUCT/SERVICE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ADDING NEW PRODUCTS:                                           │
│  ├── User clicks "Add Products" button                          │
│  ├── System auto-generates new page                             │
│  ├── Page matches existing product page styling                 │
│  └── AI asks: "Keep styling or change it?"                      │
│                                                                 │
│  ADDING NEW SERVICES:                                           │
│  ├── User clicks "Add Services" button                          │
│  ├── Same flow as products                                      │
│  └── Booking integration if needed                              │
│                                                                 │
│  BULK OPERATIONS:                                               │
│  ├── Import from CSV                                            │
│  ├── Duplicate existing products                                │
│  └── Category management                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Publishing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PUBLISHING FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: User clicks "Publish" button                           │
│          ↓                                                      │
│  STEP 2: Prompt appears:                                        │
│          "Would you like to purchase a domain?"                 │
│          ↓                                                      │
│  STEP 3: If YES → Domain search interface                       │
│          └── Search available domains                           │
│          └── See pricing                                        │
│          └── Purchase with UPayments                            │
│          ↓                                                      │
│  STEP 4: Domain purchased via Namecheap API                     │
│          └── User never leaves KWq8                             │
│          └── SSL auto-provisioned                               │
│          ↓                                                      │
│  STEP 5: Project deployed to Vercel                             │
│          └── Code pushed to GitHub                              │
│          └── Live URL generated                                 │
│          ↓                                                      │
│  STEP 6: User returns to dashboard                              │
│          └── Published projects listed                          │
│          └── Domain management available                        │
│          └── Analytics accessible                               │
│                                                                 │
│  DOMAIN PRICING:                                                │
│  ├── Cost ≤ $15 USD → FREE (1 domain/year + SSL)                │
│  └── Cost > $15 USD → Cost + 20% markup                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 4: BUSINESS MODEL

## 💰 Pricing Structure

### Subscription Tiers:

| Tier | Price (KWD/month) | Trial | Credits/Day | Key Features |
|------|-------------------|-------|-------------|--------------|
| **Basic** | 23 | 1 KWD/week | 100 | Standard AI, Basic templates |
| **Pro** | 38 | — | 200 | Priority support, More templates |
| **Premium** | 59 | — | 400 | Banana AI images, All templates |
| **Enterprise** | 75 | — | 800 | Everything, Priority everything |

### Key Pricing Rules:

| Rule | Details |
|------|---------|
| **NO Free Tier** | Everyone pays. 1 KWD trial is minimum barrier. |
| **Trial** | 1 KWD/week for Basic tier ONLY |
| **Banana AI** | Premium (59 KWD) and Enterprise (75 KWD) ONLY |
| **White-labeling** | NOT offered |
| **Credit Model** | Credits consumed per AI action |
| **Daily Bonus** | Credits refresh daily based on tier |
| **Rollover** | Unused credits roll over |
| **Add-on Packs** | Extra credits purchasable |

### Why No Free Tier?

| Reason | Explanation |
|--------|-------------|
| **Quality Users** | Free users rarely convert. Trial users are serious. |
| **Cost Control** | AI generation costs money. Free tier = losing money. |
| **Value Perception** | If it's free, it's not valued. 1 KWD shows commitment. |
| **Bootstrapped Reality** | We need revenue from day one. |

---

## 💳 Payment Integration

### Primary: UPayments

| Feature | Details |
|---------|---------|
| **Location** | Kuwait-based |
| **Currency** | Native KWD support |
| **Cards** | KNET, Visa, Mastercard |
| **Recurring** | Subscription support |
| **Contract** | Required for integration |

### Domain Payments: Namecheap

| Feature | Details |
|---------|---------|
| **API** | Namecheap domain API |
| **In-platform** | Users never leave KWq8 |
| **Pricing** | Our margin on domains > $15 |
| **SSL** | Included free |

---

## 📈 Revenue Streams

```
┌─────────────────────────────────────────────────────────────────┐
│                      REVENUE STREAMS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SUBSCRIPTIONS (Primary - 80%)                               │
│     ├── Basic: 23 KWD/month                                     │
│     ├── Pro: 38 KWD/month                                       │
│     ├── Premium: 59 KWD/month                                   │
│     └── Enterprise: 75 KWD/month                                │
│                                                                 │
│  2. ADD-ON CREDIT PACKS (10%)                                   │
│     ├── Users who run out of credits                            │
│     └── Heavy AI users                                          │
│                                                                 │
│  3. DOMAIN SALES (5%)                                           │
│     ├── Free domains ≤ $15 (customer acquisition)               │
│     └── 20% markup on domains > $15                             │
│                                                                 │
│  4. FUTURE: AFFILIATE PROGRAM (5%)                              │
│     ├── Influencers promote KWq8                                │
│     └── 20% recurring commission for 12 months                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Target Market

### Primary: GCC Arabic Speakers

| Country | Code | VAT | Currency | Priority |
|---------|------|-----|----------|----------|
| Kuwait | 🇰🇼 KW | 0% | KWD | #1 (Home market) |
| Saudi Arabia | 🇸🇦 SA | 15% | SAR | #2 (Largest market) |
| UAE | 🇦🇪 AE | 5% | AED | #3 (Tech hub) |
| Qatar | 🇶🇦 QA | 0% | QAR | #4 |
| Bahrain | 🇧🇭 BH | 10% | BHD | #5 |
| Oman | 🇴🇲 OM | 5% | OMR | #6 |

### Target Customer Personas:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER PERSONAS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PERSONA 1: Small Business Owner                                │
│  ├── Age: 25-45                                                 │
│  ├── Business: Salon, restaurant, retail shop                   │
│  ├── Pain: Can't afford developer, needs website now            │
│  ├── Budget: 20-50 KWD/month                                    │
│  └── Value: Speed, Arabic, simplicity                           │
│                                                                 │
│  PERSONA 2: Startup Founder                                     │
│  ├── Age: 22-35                                                 │
│  ├── Business: Tech startup, app idea                           │
│  ├── Pain: Wants to build MVP without coding                    │
│  ├── Budget: 50-100 KWD/month                                   │
│  └── Value: Speed to market, iterate quickly                    │
│                                                                 │
│  PERSONA 3: Marketing Agency                                    │
│  ├── Age: 28-45                                                 │
│  ├── Business: Agency building client sites                     │
│  ├── Pain: Need to deliver fast, Arabic clients                 │
│  ├── Budget: 75+ KWD/month (multiple projects)                  │
│  └── Value: Speed, templates, client dashboards                 │
│                                                                 │
│  PERSONA 4: Government/Corporate                                │
│  ├── Size: Medium to large organizations                        │
│  ├── Need: Vision 2030 style portals, Arabic                    │
│  ├── Pain: Slow traditional development                         │
│  ├── Budget: Enterprise tier                                    │
│  └── Value: Compliance, Arabic, professional                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 5: GCC-SPECIFIC FEATURES

## 🇸🇦🇦🇪🇰🇼🇶🇦🇧🇭🇴🇲 What Makes KWq8 GCC-Native

### 1. VAT Handling by Country

| Country | VAT Rate | Auto-Calculation |
|---------|----------|------------------|
| Saudi Arabia | 15% | ✅ Yes |
| UAE | 5% | ✅ Yes |
| Bahrain | 10% | ✅ Yes |
| Oman | 5% | ✅ Yes |
| Kuwait | 0% | ✅ Yes |
| Qatar | 0% | ✅ Yes |

### 2. Currency Support

| Currency | Code | Decimals | Symbol Position |
|----------|------|----------|-----------------|
| Kuwaiti Dinar | KWD | **3** | After amount |
| Saudi Riyal | SAR | 2 | After amount |
| UAE Dirham | AED | 2 | After amount |
| Qatari Riyal | QAR | 2 | After amount |
| Bahraini Dinar | BHD | **3** | After amount |
| Omani Rial | OMR | **3** | After amount |

**Note:** KWD, BHD, and OMR use 3 decimal places (not 2 like most currencies).

### 3. Phone Number Validation

| Country | Format | Example |
|---------|--------|---------|
| Kuwait | +965 XXXX XXXX | +965 1234 5678 |
| Saudi | +966 5X XXX XXXX | +966 50 123 4567 |
| UAE | +971 5X XXX XXXX | +971 50 123 4567 |
| Qatar | +974 XXXX XXXX | +974 1234 5678 |
| Bahrain | +973 XXXX XXXX | +973 1234 5678 |
| Oman | +968 XXXX XXXX | +968 1234 5678 |

### 4. Payment Gateways

| Gateway | Countries | Currencies |
|---------|-----------|------------|
| **UPayments** | Kuwait | KWD |
| **PayTabs** | SA, UAE, BH, OM, JO, EG | SAR, AED, BHD, OMR |
| **MyFatoorah** | All GCC | All GCC currencies |
| **HyperPay** | SA, UAE | SAR, AED |
| **Checkout.com** | All GCC | All currencies |
| **Telr** | UAE, SA | AED, SAR |

### 5. Shipping Integrations

| Provider | Coverage |
|----------|----------|
| **SMSA** | Saudi Arabia (primary) |
| **Aramex** | All GCC |
| **Fetchr** | UAE, SA |
| **DHL** | International |

### 6. Arabic Typography

| Font | Style | Best For |
|------|-------|----------|
| **Tajawal** | Clean, modern | Default for all |
| **Cairo** | Modern tech | SaaS, tech startups |
| **Amiri** | Elegant, classic | Luxury, formal |
| **IBM Plex Sans Arabic** | Technical | Documentation |
| **Noto Naskh Arabic** | Formal | Government |

### 7. Cultural Design Elements

| Element | Consideration |
|---------|---------------|
| **Colors** | Green (Islamic), Gold (luxury), Blue (trust) |
| **Layout** | RTL default, generous spacing |
| **Imagery** | Gender-appropriate for conservative markets |
| **Calendar** | Hijri date support |
| **Timing** | Prayer times awareness for bookings |
| **Seasons** | Ramadan themes, Eid campaigns |

---

# PART 6: COMPETITIVE ADVANTAGE

## 🏆 Why KWq8 Wins

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPETITIVE ADVANTAGES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ONLY ARABIC-FIRST AI BUILDER                                │
│     └── Competitors: English-first, Arabic afterthought         │
│     └── KWq8: Arabic from the ground up                         │
│                                                                 │
│  2. RTL BY DEFAULT                                              │
│     └── Competitors: RTL breaks constantly                      │
│     └── KWq8: RTL is the default, LTR is exception              │
│                                                                 │
│  3. GCC-NATIVE FEATURES                                         │
│     └── Competitors: No VAT, no local payments                  │
│     └── KWq8: VAT, UPayments, PayTabs, Arabic invoices          │
│                                                                 │
│  4. ARABIC TEMPLATES                                            │
│     └── Competitors: ZERO Arabic templates                      │
│     └── KWq8: 15+ industry-specific Arabic templates            │
│                                                                 │
│  5. CULTURAL UNDERSTANDING                                      │
│     └── Competitors: Western design aesthetics                  │
│     └── KWq8: GCC aesthetics, Islamic patterns, local taste     │
│                                                                 │
│  6. LOCAL SUPPORT                                               │
│     └── Competitors: English support, different timezone        │
│     └── KWq8: Arabic support, Kuwait timezone, WhatsApp         │
│                                                                 │
│  7. PRICING IN KWD                                              │
│     └── Competitors: USD pricing, currency conversion           │
│     └── KWq8: Native KWD, local payment methods                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🆚 Competitor Comparison

| Feature | Lovable | v0 | Bolt | Wix | **KWq8** |
|---------|---------|----|----|-----|----------|
| Arabic-first | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| RTL default | ❌ | ❌ | ❌ | ❌ | ✅ |
| Arabic templates | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| GCC payments | ❌ | ❌ | ❌ | ❌ | ✅ |
| VAT calculator | ❌ | ❌ | ❌ | ❌ | ✅ |
| Arabic fonts | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| WhatsApp integration | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Arabic support | ❌ | ❌ | ❌ | ⚠️ | ✅ |

---

# PART 7: FINANCIAL PROJECTIONS

## 📊 Revenue Targets

| Period | Target (KWD) | Customers | Notes |
|--------|--------------|-----------|-------|
| Month 1 | 3,000+ | 100 | Launch month |
| Month 2 | 5,000 | 200 | Growth phase |
| Month 3 | 10,000 | 300 | Break-even target |
| Month 6 | 25,000 | 700 | Scale phase |
| Year 1 | 150,000 | 2,000 | Sustainable growth |

## 💸 Cost Structure

| Category | Monthly Cost | Notes |
|----------|--------------|-------|
| **Claude Code** | $200 USD | Development tool |
| **AI APIs** | Variable | Gemini + DeepSeek usage |
| **Supabase** | $25-100 USD | Database (scales with users) |
| **Vercel** | $20-100 USD | Hosting (scales with projects) |
| **Domains** | Pass-through | Namecheap API |
| **UPayments** | Transaction fees | ~2-3% per transaction |
| **Marketing** | Variable | Ads, influencers |
| **Support** | TBD | Team costs |

## 📈 Unit Economics

| Metric | Target |
|--------|--------|
| **CAC** (Customer Acquisition Cost) | < 20 KWD |
| **LTV** (Lifetime Value) | > 200 KWD |
| **LTV:CAC Ratio** | > 10:1 |
| **Monthly Churn** | < 5% |
| **Trial Conversion** | > 30% |
| **ARPU** (Average Revenue Per User) | 35 KWD |

---

# PART 8: COUNCIL MEMBER RESPONSIBILITIES

## 👥 Role-by-Role Breakdown

### Business Consultant
| Focus | Responsibility |
|-------|----------------|
| Strategy | Overall business strategy and market positioning |
| Growth | Identify growth opportunities and market expansion |
| Risk | Assess risks and mitigation strategies |
| Metrics | Define and track key business metrics |

### Product Manager
| Focus | Responsibility |
|-------|----------------|
| Features | Define and prioritize product features |
| Roadmap | Maintain product roadmap and timeline |
| User Research | Understand user needs and pain points |
| AI Prompts | Write and refine AI system prompts |

### Product Director
| Focus | Responsibility |
|-------|----------------|
| Vision | Define and communicate product vision |
| Priorities | Make final decisions on feature priorities |
| Quality | Ensure product quality standards |
| Team Alignment | Keep all teams aligned on goals |

### Software Engineer
| Focus | Responsibility |
|-------|----------------|
| Architecture | Design system architecture |
| Code Quality | Ensure clean, maintainable code |
| Performance | Optimize for speed and efficiency |
| Security | Implement security best practices |

### Backend Engineer
| Focus | Responsibility |
|-------|----------------|
| APIs | Build and maintain API endpoints |
| Database | Design and optimize database schema |
| AI Integration | Integrate Gemini and DeepSeek |
| Infrastructure | Manage servers and deployment |

### Frontend Engineer
| Focus | Responsibility |
|-------|----------------|
| UI/UX | Build beautiful, usable interfaces |
| RTL | Ensure RTL works perfectly |
| Performance | Optimize frontend performance |
| Accessibility | Ensure accessibility compliance |

### Business Developer
| Focus | Responsibility |
|-------|----------------|
| Partnerships | Develop strategic partnerships |
| B2B Sales | Enterprise and agency sales |
| Revenue | Identify new revenue opportunities |
| Contracts | Negotiate and manage contracts |

### Accountant
| Focus | Responsibility |
|-------|----------------|
| Finances | Track revenue, costs, and margins |
| Pricing | Analyze and optimize pricing |
| Compliance | Ensure financial compliance |
| Reporting | Financial reporting and forecasts |

### Marketing Manager
| Focus | Responsibility |
|-------|----------------|
| Brand | Build and maintain brand identity |
| Content | Content strategy and creation |
| SEO | Search engine optimization |
| Messaging | Craft compelling messaging |

### Promotion Manager
| Focus | Responsibility |
|-------|----------------|
| Ads | Paid advertising campaigns |
| Offers | Design promotional offers |
| Conversion | Optimize conversion funnels |
| Testing | A/B test marketing materials |

### Collab Manager
| Focus | Responsibility |
|-------|----------------|
| Influencers | Partner with Arabic influencers |
| Affiliates | Manage affiliate program |
| Cross-promotions | Partner with complementary services |
| Community | Build user community |

### Integration Manager
| Focus | Responsibility |
|-------|----------------|
| Third-party | Manage all third-party integrations |
| APIs | Ensure API reliability |
| New Integrations | Evaluate and add new integrations |
| Documentation | Document integration processes |

### Customer Support Manager
| Focus | Responsibility |
|-------|----------------|
| Support | Handle customer inquiries |
| Onboarding | Guide new users |
| Documentation | Create help articles and tutorials |
| Retention | Reduce churn through support |

### Customer Acquisition Manager
| Focus | Responsibility |
|-------|----------------|
| Growth | Drive user acquisition |
| Funnels | Build and optimize acquisition funnels |
| CAC | Keep acquisition costs low |
| Channels | Test and scale acquisition channels |

---

# PART 9: COMPLETE TODO LIST

## 📋 Master TODO by Phase

### PHASE 0: FOUNDATION (Week 1)

#### AI Architecture
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 1 | Implement Parallel Tool Calls Architecture | Backend | P0 | 3 |
| 2 | Create line-replace tool (surgical edits) | Backend | P0 | 2 |
| 3 | Add "Never Re-Read Context" logic | Backend | P0 | 1 |
| 4 | Implement Design System Validator | Frontend | P0 | 1 |
| 5 | Add Concise Response Rules to prompts | Product | P0 | 0.5 |
| 6 | Create RTL-First Code Generation defaults | Backend | P0 | 2 |

#### System Prompts
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 7 | Rewrite Gemini Orchestrator prompt | Product | P0 | 1 |
| 8 | Rewrite DeepSeek Code Gen prompt | Product | P0 | 1 |
| 9 | Add RTL enforcement rules | Product | P0 | 0.5 |
| 10 | Add Arabic typography rules | Product | P0 | 0.5 |
| 11 | Add GCC market detection logic | Backend | P0 | 1 |

#### Critical Bug Fixes
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 12 | Fix Reset Password 404 | Backend | P0 | 1 |
| 13 | Fix Middleware deprecated convention | Backend | P0 | 0.5 |
| 14 | Audit all API routes for security | Backend | P0 | 2 |
| 15 | Fix Supabase RLS policies | Backend | P0 | 1 |
| 16 | Test all auth flows | QA | P0 | 1 |
| 17 | Verify UPayments webhook handling | Backend | P0 | 1 |

#### Infrastructure
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 18 | Verify Vercel deployment configuration | DevOps | P0 | 0.5 |
| 19 | Check all environment variables | DevOps | P0 | 0.5 |
| 20 | Set up error monitoring (Sentry) | DevOps | P0 | 1 |
| 21 | Configure Supabase connection pooling | Backend | P0 | 0.5 |
| 22 | Set up database backups | DevOps | P0 | 0.5 |

---

### PHASE 1: PRE-LAUNCH (Week 2)

#### AI Builder Enhancements
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 23 | Implement "Read-Before-Edit" requirement | Backend | P0 | 1 |
| 24 | Add "// ... existing code ..." marker support | Backend | P0 | 1 |
| 25 | Create Supabase integration pattern | Backend | P0 | 2 |
| 26 | Add RLS enforcement to generated code | Backend | P0 | 1 |
| 27 | Implement migration-based schema generation | Backend | P0 | 1 |
| 28 | Add "IF NOT EXISTS" to CREATE statements | Backend | P0 | 0.5 |

#### Design System
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 29 | Create default Arabic design system (globals.css) | Frontend | P0 | 1 |
| 30 | Implement 3-5 color limit enforcement | Frontend | P0 | 0.5 |
| 31 | Implement 2 font family limit | Frontend | P0 | 0.5 |
| 32 | Enforce HSL color format only | Frontend | P0 | 0.5 |
| 33 | Create semantic token validator | Frontend | P0 | 1 |
| 34 | Block explicit colors (bg-blue-500) | Frontend | P0 | 0.5 |

#### Pricing System
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 35 | Remove FREE tier completely | Backend | P0 | 0.5 |
| 36 | Implement credit-based system | Backend | P0 | 3 |
| 37 | Add daily bonus credits per tier | Backend | P0 | 1 |
| 38 | Implement credit rollover | Backend | P0 | 1 |
| 39 | Create add-on credit packs | Backend | P1 | 1 |
| 40 | Show credit consumption before executing | Frontend | P0 | 1 |
| 41 | Update pricing page with new tiers | Frontend | P0 | 1 |
| 42 | Implement 1 KWD/week trial for Basic | Backend | P0 | 1 |

#### Template System
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 43 | Create Template #1: Arabic E-commerce (Fashion) | Frontend | P0 | 2 |
| 44 | Create Template #2: Arabic Corporate Website | Frontend | P0 | 2 |
| 45 | Create Template #3: Arabic Restaurant | Frontend | P0 | 2 |
| 46 | Create Template #4: Arabic Real Estate | Frontend | P1 | 2 |
| 47 | Create Template #5: Government Portal | Frontend | P1 | 2 |
| 48 | Implement template selection popup | Frontend | P0 | 1 |
| 49 | Add "Build from Scratch" option | Frontend | P0 | 0.5 |

#### GCC Components
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 50 | Create VATCalculator component | Frontend | P0 | 1 |
| 51 | Create GCCPhoneInput component | Frontend | P0 | 1 |
| 52 | Create CurrencyDisplay component | Frontend | P0 | 0.5 |
| 53 | Create ArabicInvoice component | Frontend | P1 | 2 |
| 54 | Create VATBreakdown component | Frontend | P1 | 1 |
| 55 | Create ContactFormArabic component | Frontend | P0 | 1 |

#### Gemini Orchestration
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 56 | Build Gemini API integration | Backend | P0 | 2 |
| 57 | Create prompt analysis module | Backend | P0 | 2 |
| 58 | Add language detection (AR/EN/Bilingual) | Backend | P0 | 1 |
| 59 | Add RTL/LTR direction detection | Backend | P0 | 0.5 |
| 60 | Add GCC market detection | Backend | P0 | 1 |
| 61 | Build clarifying questions system | Backend | P0 | 2 |
| 62 | Create structured prompt builder for DeepSeek | Backend | P0 | 2 |
| 63 | Build DeepSeek output validator | Backend | P0 | 2 |
| 64 | Add validation checklist | Backend | P0 | 1 |

#### DeepSeek Integration
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 65 | Configure DeepSeek API connection | Backend | P0 | 1 |
| 66 | Create code generation templates | Backend | P0 | 2 |
| 67 | Add RTL code generation patterns | Backend | P0 | 1 |
| 68 | Add Arabic font injection | Backend | P0 | 0.5 |
| 69 | Implement error handling and retry | Backend | P0 | 1 |
| 70 | Add cost tracking per generation | Backend | P0 | 1 |

---

### PHASE 2: SOFT LAUNCH (Week 3-4)

#### Advanced AI Tools
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 71 | Implement Semantic Search | Backend | P1 | 4 |
| 72 | Create Screenshot/Inspect tool | Backend | P1 | 3 |
| 73 | Add Integration Status Checker | Backend | P1 | 2 |
| 74 | Implement debugging tools | Backend | P1 | 2 |
| 75 | Add network request reader | Backend | P1 | 1 |

#### Visual Editor
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 76 | Build chat-based editing interface | Frontend | P0 | 3 |
| 77 | Implement DOM analysis for placement | Backend | P1 | 2 |
| 78 | Create image upload and placement system | Frontend | P1 | 2 |
| 79 | Add visual editing post-generation | Frontend | P1 | 3 |

#### Image Management
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 80 | Build image quality checker | Backend | P1 | 1 |
| 81 | Integrate Banana.dev for upscaling | Backend | P1 | 2 |
| 82 | Create upsell prompt for image quality | Frontend | P1 | 0.5 |
| 83 | Build YouTube embed functionality | Frontend | P1 | 1 |

#### Auto-Generated Admin Dashboard
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 84 | Design admin dashboard template | Frontend | P1 | 2 |
| 85 | Build auto-generation logic per project | Backend | P1 | 3 |
| 86 | Create admin credentials system | Backend | P1 | 1 |
| 87 | Implement user management features | Backend | P1 | 2 |
| 88 | Build product/content management | Backend | P1 | 2 |
| 89 | Add Arabic admin interface | Frontend | P1 | 1 |

#### Publishing & Deployment
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 90 | Build publish flow UI | Frontend | P0 | 2 |
| 91 | Integrate Namecheap API | Backend | P1 | 3 |
| 92 | Create domain search interface | Frontend | P1 | 1 |
| 93 | Build domain purchase flow | Backend | P1 | 2 |
| 94 | Implement SSL provisioning | Backend | P1 | 1 |
| 95 | Create Vercel deployment integration | Backend | P0 | 2 |
| 96 | Build GitHub repo creation | Backend | P1 | 2 |

#### Paywall Optimization
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 97 | Implement multi-step paywall (3 screens) | Frontend | P0 | 2 |
| 98 | Add "FREE TRIAL" mention 5+ times | Frontend | P0 | 0.5 |
| 99 | Implement trial toggle | Frontend | P1 | 1 |
| 100 | Add transaction abandonment paywall | Frontend | P1 | 1 |
| 101 | Create lucky spin discount wheel | Frontend | P2 | 2 |
| 102 | Add price framing ("$1/week") | Frontend | P0 | 0.5 |

#### Marketing Website
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 103 | Update landing page with Arabic focus | Marketing | P0 | 2 |
| 104 | Create Arabic landing page version | Marketing | P0 | 2 |
| 105 | Add competitor comparison section | Marketing | P1 | 1 |
| 106 | Build testimonials section | Marketing | P1 | 1 |
| 107 | Create demo video (Arabic) | Marketing | P0 | 3 |
| 108 | Create demo video (English) | Marketing | P1 | 2 |

#### Soft Launch Activities
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 109 | Recruit 20 beta testers | Support | P0 | 3 |
| 110 | Create feedback collection system | Product | P0 | 1 |
| 111 | Set up NPS survey | Product | P1 | 0.5 |
| 112 | Monitor error rates | Engineering | P0 | Ongoing |
| 113 | Document common issues | Support | P1 | Ongoing |

---

### PHASE 3: PUBLIC LAUNCH (Week 5-6)

#### Advanced Features
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 114 | Build Arabic Design Inspiration Generator | Backend | P2 | 4 |
| 115 | Implement Todo Manager system | Backend | P2 | 3 |
| 116 | Add "First Message Magic" (auto-design brief) | Backend | P2 | 2 |
| 117 | Create 10 more Arabic templates | Frontend | P2 | 10 |

#### Payment Gateway Integration
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 118 | Complete UPayments production setup | Backend | P0 | 2 |
| 119 | Add PayTabs integration | Backend | P1 | 3 |
| 120 | Add MyFatoorah integration | Backend | P2 | 2 |
| 121 | Implement subscription management | Backend | P0 | 2 |
| 122 | Build invoice generation (Arabic) | Backend | P1 | 2 |
| 123 | Create receipt emails (AR/EN) | Backend | P1 | 1 |

#### Customer Support Infrastructure
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 124 | Set up WhatsApp Business | Support | P0 | 1 |
| 125 | Create WhatsApp auto-responses (Arabic) | Support | P0 | 1 |
| 126 | Build knowledge base (Arabic) | Support | P1 | 5 |
| 127 | Create video tutorials (Arabic) | Support | P1 | 5 |
| 128 | Set up Intercom or similar chat | Support | P1 | 1 |

#### Marketing & Acquisition
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 129 | Launch social media campaign (Arabic) | Marketing | P0 | Ongoing |
| 130 | Create Instagram content calendar | Marketing | P0 | 2 |
| 131 | Create Twitter/X content calendar | Marketing | P1 | 1 |
| 132 | Reach out to Arabic tech influencers | Collab | P1 | Ongoing |
| 133 | Submit to Product Hunt | Marketing | P1 | 1 |
| 134 | Write Arabic SEO blog posts | Marketing | P1 | 5 |
| 135 | Set up Google Ads (Arabic) | Marketing | P1 | 2 |

#### Affiliate Program
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 136 | Build affiliate dashboard | Backend | P1 | 3 |
| 137 | Create affiliate tracking system | Backend | P1 | 2 |
| 138 | Design commission structure | Business | P1 | 1 |
| 139 | Recruit first 10 affiliates | Collab | P1 | Ongoing |

---

### PHASE 4: POST-LAUNCH (Month 2-3)

#### Advanced GCC Features
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 140 | Add HijriDatePicker component | Frontend | P2 | 1 |
| 141 | Add PrayerTimesWidget component | Frontend | P2 | 1 |
| 142 | Add shipping integration (SMSA, Aramex) | Backend | P2 | 3 |
| 143 | Add Arabic Privacy Policy generator | Backend | P2 | 2 |
| 144 | Add Arabic Terms & Conditions generator | Backend | P2 | 2 |
| 145 | Add Commercial Registration display | Frontend | P2 | 1 |

#### Scale & Optimization
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 146 | Implement caching for AI responses | Backend | P1 | 2 |
| 147 | Optimize Supabase queries | Backend | P1 | 2 |
| 148 | Set up CDN for static assets | DevOps | P1 | 1 |
| 149 | Implement rate limiting | Backend | P1 | 1 |
| 150 | Add comprehensive logging | Backend | P1 | 2 |

#### Testing
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 151 | Set up Jest testing framework | QA | P1 | 1 |
| 152 | Write unit tests for critical flows | QA | P1 | 5 |
| 153 | Set up Playwright E2E tests | QA | P1 | 2 |
| 154 | Write E2E tests for auth, builder, payment | QA | P1 | 5 |
| 155 | Achieve 50% test coverage | QA | P1 | Ongoing |

#### Mobile App (Deprioritized)
| # | Task | Owner | Priority | Days |
|---|------|-------|----------|------|
| 156 | Flutter SDK setup | Mobile | P3 | 2 |
| 157 | Build mobile AI builder interface | Mobile | P3 | 10 |
| 158 | Create mobile project management | Mobile | P3 | 5 |
| 159 | Submit to App Store/Play Store | Mobile | P3 | 3 |

---

## 📊 TODO Summary

| Phase | Items | Days | Priority |
|-------|-------|------|----------|
| Phase 0 (Week 1) | 22 | 7 | P0 Critical |
| Phase 1 (Week 2) | 48 | 14 | P0-P1 |
| Phase 2 (Week 3-4) | 43 | 21 | P0-P1 |
| Phase 3 (Week 5-6) | 26 | 14 | P0-P2 |
| Phase 4 (Month 2-3) | 20 | 30 | P1-P3 |
| **TOTAL** | **159** | **86 days** | — |

---

## ✅ Success Metrics

| Metric | Week 1 | Week 2 | Month 1 | Month 3 |
|--------|--------|--------|---------|---------|
| Bugs Fixed | 100% | — | — | — |
| AI Speed | <5s | <5s | <5s | <3s |
| Templates | — | 3 | 5 | 15 |
| Waitlist | — | 200 | 500 | 1,000 |
| Trials | — | — | 50 | 200 |
| Customers | — | — | 100 | 300 |
| Revenue (KWD) | — | — | 3,000 | 10,000 |
| Churn | — | — | <10% | <5% |
| NPS | — | — | 40+ | 50+ |

---

# APPENDIX: QUICK REFERENCE

## Key Numbers

| Item | Value |
|------|-------|
| Domain | KWq8.com |
| Company | Springwood |
| Location | Kuwait |
| Currency | KWD |
| Target Market | GCC Arabic speakers |
| Funding | Bootstrapped |
| Launch Date | December 2025 |
| Month 1 Revenue Target | 3,000 KWD |
| Month 3 Revenue Target | 10,000 KWD |

## Pricing Quick Reference

| Tier | KWD/month | Credits/day |
|------|-----------|-------------|
| Basic | 23 | 100 |
| Pro | 38 | 200 |
| Premium | 59 | 400 |
| Enterprise | 75 | 800 |

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 |
| Styling | Tailwind CSS |
| Database | Supabase |
| AI Orchestration | Gemini 3 Pro |
| AI Code Gen | DeepSeek |
| Deployment | Vercel |
| Payments | UPayments |
| Domains | Namecheap |

## GCC VAT Quick Reference

| Country | VAT |
|---------|-----|
| Saudi Arabia | 15% |
| UAE | 5% |
| Bahrain | 10% |
| Oman | 5% |
| Kuwait | 0% |
| Qatar | 0% |

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Classification:** Council Internal

---

*This document is the property of Springwood. All Council members are expected to review and understand its contents.*
