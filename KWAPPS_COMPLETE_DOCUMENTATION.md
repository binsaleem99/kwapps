# KW APPS - Complete Project Documentation

**Version**: 2.0
**Last Updated**: December 2, 2025
**Production URL**: https://kwq8.com
**Status**: Production

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Styling Guide](#4-styling-guide)
5. [All Pages & Routes](#5-all-pages--routes)
6. [All API Endpoints](#6-all-api-endpoints)
7. [UI Components Library](#7-ui-components-library)
8. [Database Schema](#8-database-schema)
9. [Authentication System](#9-authentication-system)
10. [AI Code Generation Pipeline](#10-ai-code-generation-pipeline)
11. [Payment Integration (UPayments)](#11-payment-integration-upayments)
12. [Multi-Agent System](#12-multi-agent-system)
13. [Code Patterns & Conventions](#13-code-patterns--conventions)
14. [Feature Status (Done/Undone)](#14-feature-status-doneundone)
15. [Environment Variables](#15-environment-variables)

---

## 1. PROJECT OVERVIEW

### What is KW APPS?
KW APPS is an **Arabic-first AI-powered website builder platform** that enables users to create professional websites using natural language prompts. Users describe what they want in Arabic, and the AI generates production-ready React code.

### Core Value Proposition
- **Arabic-First**: Full RTL support, Cairo font, Arabic UI
- **AI-Powered**: DeepSeek AI generates React/TypeScript code from prompts
- **No-Code**: Users don't need to write any code
- **One-Click Deploy**: Automatic deployment to Vercel
- **Kuwait Market**: UPayments integration for local payment (KNET, Credit Cards)

### Target Audience
- Arabic-speaking entrepreneurs
- Small business owners in Kuwait
- Freelancers and agencies
- Non-technical users wanting a web presence

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.5 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **shadcn/ui** | Latest | Component library (Radix-based) |
| **Framer Motion** | 12.x | Animations |
| **Lucide React** | 0.555.0 | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Server-side logic |
| **Supabase** | PostgreSQL database, Auth, Storage |
| **DeepSeek API** | AI code generation |
| **UPayments** | Kuwait payment gateway |
| **Vercel** | Hosting & deployment |

### Key Dependencies
```json
{
  "@supabase/ssr": "^0.8.0",
  "@supabase/supabase-js": "^2.86.0",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.555.0",
  "openai": "^6.9.1",
  "zod": "^4.1.13",
  "recharts": "^3.5.1",
  "sonner": "^2.0.7",
  "react-hook-form": "^7.66.1"
}
```

---

## 3. PROJECT STRUCTURE

```
kwapps/
├── prompts/                          # Master UI prompt files
│   ├── master-ui-website.md          # Internal UI guidelines
│   └── master-ui-deepseek-client.md  # Client app UI guidelines
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages (sign-in, sign-up)
│   │   ├── admin/                    # Admin dashboard (protected)
│   │   ├── api/                      # API routes
│   │   ├── builder/                  # AI builder interface
│   │   ├── dashboard/                # User dashboard
│   │   ├── billing/                  # Payment success/cancel
│   │   └── [static pages]/           # about, help, pricing, etc.
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── landing/                  # Homepage sections
│   │   ├── builder/                  # Builder-specific
│   │   ├── admin/                    # Admin components
│   │   ├── billing/                  # Payment components
│   │   └── background/               # Visual effects
│   │
│   ├── lib/                          # Core utilities
│   │   ├── supabase/                 # Supabase client (client.ts, server.ts)
│   │   ├── deepseek/                 # AI client & prompts
│   │   ├── upayments/                # Payment gateway client
│   │   ├── agents/                   # Multi-agent system
│   │   └── cron/                     # Scheduled tasks
│   │
│   ├── types/                        # TypeScript definitions
│   └── middleware.ts                 # Auth & route protection
│
├── public/                           # Static assets
└── .env.local                        # Environment variables
```

---

## 4. STYLING GUIDE

### 4.1 Brand Colors

**PRIMARY: Slate (Dark, Professional)**
```css
--slate-950: #020617;  /* Deepest */
--slate-900: #0F172A;  /* Primary dark */
--slate-800: #1E293B;
--slate-700: #334155;
--slate-600: #475569;
--slate-500: #64748B;
--slate-400: #94A3B8;
--slate-300: #CBD5E1;
--slate-200: #E2E8F0;
--slate-100: #F1F5F9;
--slate-50:  #F8FAFC;
```

**ACCENT: Blue (Modern, Trustworthy)**
```css
--blue-700: #1D4ED8;
--blue-600: #2563EB;
--blue-500: #3B82F6;  /* Primary accent */
--blue-400: #60A5FA;
--blue-300: #93C5FD;
--blue-100: #DBEAFE;
--blue-50:  #EFF6FF;
```

**SPECIAL EFFECTS**
```css
--electric-blue: #0070F3;  /* High saturation for glows */
--cyan-vivid: #06B6D4;     /* Gradient accent */
```

**SEMANTIC COLORS**
```css
--success: #22C55E;  /* Green */
--warning: #EAB308;  /* Amber */
--error:   #EF4444;  /* Red */
--info:    #3B82F6;  /* Blue */
```

### 4.2 Typography

**Font Family**: Cairo (Google Fonts)
```css
font-family: 'Cairo', sans-serif;
```

**Font Weights Used**:
- 300: Light
- 400: Regular
- 600: Semi-Bold
- 700: Bold
- 800: Extra-Bold
- 900: Black (headlines)

**Typography Scale**:
```css
.text-10xl { font-size: 10rem; }  /* Hero headlines */
.text-9xl  { font-size: 8rem;  }  /* Sub-hero */
.text-8xl  { font-size: 6rem;  }  /* Section titles */
.text-7xl  { font-size: 4.5rem; }
.text-6xl  { font-size: 3.75rem; }
.text-5xl  { font-size: 3rem; }
.text-4xl  { font-size: 2.25rem; }
.text-3xl  { font-size: 1.875rem; }
.text-2xl  { font-size: 1.5rem; }
.text-xl   { font-size: 1.25rem; }
.text-lg   { font-size: 1.125rem; }
.text-base { font-size: 1rem; }
.text-sm   { font-size: 0.875rem; }
.text-xs   { font-size: 0.75rem; }
```

### 4.3 RTL Support

**All pages must include**:
```tsx
<div dir="rtl">
  {/* Content */}
</div>
```

**RTL-specific classes**:
```css
text-right        /* Text alignment */
mr-* instead of ml-*  /* Margins */
pr-* instead of pl-*  /* Padding */
rtl:space-x-reverse   /* Flex spacing */
```

### 4.4 Shadow System

```css
/* Standard shadows */
.shadow-sm    { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.shadow       { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.shadow-md    { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.shadow-lg    { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }

/* Glow effects (blue-tinted) */
.shadow-glow     { box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15); }
.shadow-glow-sm  { box-shadow: 0 4px 14px rgba(59, 130, 246, 0.12); }
.shadow-glow-lg  { box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25); }
.shadow-glow-xl  { box-shadow: 0 30px 60px rgba(59, 130, 246, 0.35); }
.shadow-glow-2xl { box-shadow: 0 40px 80px rgba(59, 130, 246, 0.4); }

/* Electric glow for hero elements */
.shadow-electric {
  box-shadow: 0 0 40px rgba(0, 112, 243, 0.5),
              0 0 80px rgba(0, 112, 243, 0.3);
}
```

### 4.5 Gradient Classes

```css
/* Text gradient (slate to blue) */
.text-gradient {
  background-image: linear-gradient(135deg, #0F172A 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  color: transparent;
}

/* Button gradient */
.bg-gradient-primary {
  background: linear-gradient(135deg, #0F172A 0%, #2563EB 100%);
}
```

### 4.6 Animation Classes

```css
/* Hover lift effect */
.hover-lift:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Glow pulse animation */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
```

### 4.7 Component Styling Patterns

**Card Component**:
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
  {/* Content */}
</div>
```

**Highlighted Card (dark)**:
```tsx
<div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-blue-500 shadow-glow-2xl">
  {/* Content */}
</div>
```

**Badge/Tag**:
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
  <span className="text-sm font-semibold text-blue-600">Label</span>
</div>
```

---

## 5. ALL PAGES & ROUTES

### 5.1 Public Pages (No Auth Required)

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/` | `src/app/page.tsx` | ✅ Done | Homepage with Hero, Features, Pricing, Footer |
| `/pricing` | `src/app/pricing/page.tsx` | ✅ Done | Pricing plans with feature comparison |
| `/about` | `src/app/about/page.tsx` | ✅ Done | About us, mission, vision |
| `/contact` | `src/app/contact/page.tsx` | ✅ Done | Contact form |
| `/help` | `src/app/help/page.tsx` | ✅ Done | Help center with FAQ |
| `/tutorials` | `src/app/tutorials/page.tsx` | ✅ Done | Tutorial listing |
| `/community` | `src/app/community/page.tsx` | ✅ Done | Community links |
| `/status` | `src/app/status/page.tsx` | ✅ Done | System status monitoring |
| `/blog` | `src/app/blog/page.tsx` | ✅ Done | Blog listing |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | ✅ Done | Individual blog post |
| `/templates` | `src/app/templates/page.tsx` | ✅ Done | Template gallery |
| `/terms` | `src/app/terms/page.tsx` | ✅ Done | Terms of service |
| `/privacy` | `src/app/privacy/page.tsx` | ✅ Done | Privacy policy |

### 5.2 Auth Pages

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/sign-in` | `src/app/sign-in/[[...sign-in]]/page.tsx` | ✅ Done | Login page |
| `/sign-up` | `src/app/sign-up/[[...sign-up]]/page.tsx` | ✅ Done | Registration page |
| `/reset-password` | `src/app/reset-password/page.tsx` | ✅ Done | Password reset request |
| `/auth/update-password` | `src/app/auth/update-password/page.tsx` | ✅ Done | New password form |
| `/auth/callback` | `src/app/auth/callback/route.ts` | ✅ Done | OAuth callback handler |

### 5.3 Protected Pages (Auth Required)

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | ✅ Done | User dashboard with tabs |
| `/dashboard/billing` | `src/app/dashboard/billing/page.tsx` | ✅ Done | Subscription management |
| `/builder` | `src/app/builder/page.tsx` | ✅ Done | AI website builder interface |
| `/onboarding` | `src/app/onboarding/page.tsx` | ✅ Done | New user onboarding flow |

### 5.4 Billing Pages

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/billing/success` | `src/app/billing/success/page.tsx` | ✅ Done | Payment success confirmation |
| `/billing/cancel` | `src/app/billing/cancel/page.tsx` | ✅ Done | Payment cancellation page |

### 5.5 Admin Pages (Admin Only)

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/admin` | `src/app/admin/page.tsx` | ✅ Done | Admin dashboard overview |
| `/admin/users` | `src/app/admin/users/page.tsx` | ✅ Done | User management |
| `/admin/projects` | `src/app/admin/projects/page.tsx` | ✅ Done | Project management |
| `/admin/templates` | `src/app/admin/templates/page.tsx` | ✅ Done | Template management |
| `/admin/billing` | `src/app/admin/billing/page.tsx` | ✅ Done | Billing/revenue analytics |
| `/admin/analytics` | `src/app/admin/analytics/page.tsx` | ✅ Done | Usage analytics |
| `/admin/blog` | `src/app/admin/blog/page.tsx` | ✅ Done | Blog post management |
| `/admin/blog/new` | `src/app/admin/blog/new/page.tsx` | ✅ Done | Create new blog post |
| `/admin/blog/analytics` | `src/app/admin/blog/analytics/page.tsx` | ✅ Done | Blog analytics |
| `/admin/referrals` | `src/app/admin/referrals/page.tsx` | ✅ Done | Referral program management |
| `/admin/logs` | `src/app/admin/logs/page.tsx` | ✅ Done | Audit logs viewer |
| `/admin/health` | `src/app/admin/health/page.tsx` | ✅ Done | System health monitoring |

---

## 6. ALL API ENDPOINTS

### 6.1 Project APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/projects` | GET | Yes | List user's projects |
| `/api/projects` | POST | Yes | Create new project |
| `/api/projects/[id]` | GET | Yes | Get single project |
| `/api/projects/[id]` | PATCH | Yes | Update project |
| `/api/projects/[id]` | DELETE | Yes | Delete project |
| `/api/projects/[id]/messages` | GET | Yes | Get project chat history |
| `/api/projects/[id]/messages` | POST | Yes | Add message to project |

### 6.2 AI Generation APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/generate` | POST | Yes | Generate React code from prompt |
| `/api/analyze` | POST | Yes | Analyze/improve existing code |

**`/api/generate` Request Body**:
```typescript
{
  prompt: string;           // Arabic prompt
  projectId?: string;       // Optional project ID
  generationType?: 'client_app' | 'internal_ui';
}
```

**`/api/generate` Response**:
```typescript
{
  success: boolean;
  code: string;             // Generated React code
  englishPrompt: string;    // Translated prompt
  tokensUsed: number;
  issues: string[];         // RTL issues found
  vulnerabilities: string[]; // Security issues found
}
```

### 6.3 Billing APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/billing/checkout` | POST | Yes | Create UPayments charge |
| `/api/billing/webhook` | POST | No* | UPayments webhook handler |

**`/api/billing/checkout` Request Body**:
```typescript
{
  plan_name: 'free' | 'builder' | 'pro' | 'hosting';
  save_card?: boolean;
}
```

**`/api/billing/webhook` Payload (from UPayments)**:
```typescript
{
  payment_id: string;
  result: 'CAPTURED' | 'NOT CAPTURED' | 'CANCELED' | 'FAILED';
  order_id: string;
  track_id: string;
  tran_id: string;
  payment_type: string;  // 'knet', 'cc', etc.
  amount: number;
}
```

### 6.4 Usage APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/usage` | GET | Yes | Get user's current usage stats |

### 6.5 Deployment APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/deploy` | POST | Yes | Deploy project to Vercel |

### 6.6 Referral APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/referrals/apply` | POST | Yes | Apply referral code |

### 6.7 Cron APIs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cron/subscriptions` | POST | Cron* | Process recurring subscriptions |

*Protected by `CRON_SECRET` header

---

## 7. UI COMPONENTS LIBRARY

### 7.1 Base Components (shadcn/ui)

Located in `src/components/ui/`:

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `button.tsx` | Primary button with variants |
| `Card` | `card.tsx` | Container component |
| `Dialog` | `dialog.tsx` | Modal dialogs |
| `Input` | `input.tsx` | Text input field |
| `Textarea` | `textarea.tsx` | Multi-line text input |
| `Select` | `select.tsx` | Dropdown select |
| `Checkbox` | `checkbox.tsx` | Checkbox input |
| `Switch` | `switch.tsx` | Toggle switch |
| `Tabs` | `tabs.tsx` | Tab navigation |
| `Table` | `table.tsx` | Data tables |
| `Badge` | `badge.tsx` | Status badges |
| `Avatar` | `avatar.tsx` | User avatars |
| `Tooltip` | `tooltip.tsx` | Hover tooltips |
| `Progress` | `progress.tsx` | Progress bars |
| `Skeleton` | `skeleton.tsx` | Loading skeletons |
| `Separator` | `separator.tsx` | Horizontal dividers |
| `ScrollArea` | `scroll-area.tsx` | Custom scrollbars |
| `Sheet` | `sheet.tsx` | Slide-out panels |
| `Popover` | `popover.tsx` | Floating content |
| `DropdownMenu` | `dropdown-menu.tsx` | Context menus |
| `AlertDialog` | `alert-dialog.tsx` | Confirmation dialogs |
| `Accordion` | `accordion.tsx` | Collapsible sections |
| `Form` | `form.tsx` | Form with react-hook-form |
| `Label` | `label.tsx` | Form labels |
| `Calendar` | `calendar.tsx` | Date picker |
| `Command` | `command.tsx` | Command palette |

### 7.2 Button Component Details

**Variants**:
```tsx
<Button variant="default">Primary</Button>   // bg-slate-900
<Button variant="destructive">Delete</Button> // bg-red-500
<Button variant="outline">Outline</Button>    // border only
<Button variant="secondary">Secondary</Button> // bg-slate-100
<Button variant="ghost">Ghost</Button>        // transparent
<Button variant="link">Link</Button>          // underline
```

**Sizes**:
```tsx
<Button size="default">Default</Button> // h-9
<Button size="sm">Small</Button>        // h-8
<Button size="lg">Large</Button>        // h-10
<Button size="icon">Icon</Button>       // square 36x36
```

**With Link**:
```tsx
<Button asChild>
  <Link href="/signup">Sign Up</Link>
</Button>
```

### 7.3 Landing Page Components

Located in `src/components/landing/`:

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `Header` | Navigation header | - |
| `Hero` | Main hero section with CTA | - |
| `Features` | Features grid | - |
| `Pricing` | Pricing cards (3 plans) | - |
| `Templates` | Template showcase | - |
| `Footer` | Site footer with links | - |

### 7.4 Builder Components

Located in `src/components/builder/`:

| Component | Description |
|-----------|-------------|
| `BuilderNav` | Top navigation in builder |
| `ChatPanel` | AI chat interface |
| `ChatPanelNew` | Updated chat interface |
| `PreviewPanel` | Live code preview |
| `ClarificationPanel` | AI clarification requests |
| `ErrorBoundary` | Error handling wrapper |

### 7.5 Background Components

Located in `src/components/background/`:

| Component | Description |
|-----------|-------------|
| `MeshGradient` | 4-corner radial gradient background |
| `NoiseTexture` | Film grain overlay |
| `FloatingShapes` | Animated geometric shapes |

### 7.6 Admin Components

Located in `src/components/admin/`:

| Component | Description |
|-----------|-------------|
| `AdminHeader` | Admin top bar |
| `AdminSidebar` | Navigation sidebar |
| `DataTable` | Generic data table |
| `FormBuilder` | Dynamic form generator |
| `FormModal` | Modal with form |
| `AreaChart` | Area chart component |
| `BarChart` | Bar chart component |
| `LineChart` | Line chart component |

---

## 8. DATABASE SCHEMA

### 8.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',  -- 'free', 'builder', 'pro', 'hosting_only'
  language TEXT DEFAULT 'ar', -- 'ar', 'en'
  is_admin BOOLEAN DEFAULT false,
  admin_role TEXT,  -- 'owner', 'support', 'content', 'readonly'
  tags TEXT[],
  internal_notes TEXT,
  preferred_language TEXT DEFAULT 'ar',
  onboarding_completed BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  arabic_prompt TEXT,
  english_prompt TEXT,
  generated_code TEXT,
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'draft',  -- 'draft', 'generating', 'preview', 'published', 'error'
  active_version INTEGER DEFAULT 1,
  deployed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.3 Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,  -- 'free', 'builder', 'pro', 'hosting'
  name_ar TEXT,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  price_monthly DECIMAL(10,3) DEFAULT 0,
  price_yearly DECIMAL(10,3),
  features JSONB,
  max_projects INTEGER DEFAULT 1,
  max_storage_mb INTEGER DEFAULT 100,
  max_prompts_per_day INTEGER DEFAULT 3,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.4 User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active',  -- 'active', 'canceled', 'past_due', 'expired'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  last_payment_amount DECIMAL(10,3),
  failed_payment_attempts INTEGER DEFAULT 0,
  card_token TEXT,
  card_last_four TEXT,
  card_type TEXT,
  payment_method TEXT,
  renewal_pending BOOLEAN DEFAULT false,
  renewal_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.5 Payment Transactions Table
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  upayments_order_id TEXT,
  upayments_track_id TEXT,
  upayments_payment_id TEXT,
  upayments_transaction_id TEXT,
  amount DECIMAL(10,3),
  currency TEXT DEFAULT 'KWD',
  status TEXT DEFAULT 'pending',  -- 'pending', 'success', 'failed', 'canceled'
  payment_method TEXT,
  transaction_type TEXT,  -- 'subscription', 'renewal', 'upgrade'
  metadata JSONB,
  webhook_received_at TIMESTAMPTZ,
  webhook_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.6 Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompts_today INTEGER DEFAULT 0,
  prompts_total INTEGER DEFAULT 0,
  tokens_today INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  last_prompt_at TIMESTAMPTZ,
  reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.7 Messages Table (Chat History)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,  -- 'user', 'assistant'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.8 Templates Table
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  category TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  code TEXT,
  is_premium BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.9 Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  excerpt TEXT,
  excerpt_ar TEXT,
  content TEXT,
  content_ar TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',  -- 'draft', 'published'
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.10 Admin Audit Logs Table
```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. AUTHENTICATION SYSTEM

### 9.1 Overview
- **Provider**: Supabase Auth
- **Methods**: Email/Password, OAuth (Google, GitHub)
- **Session**: JWT stored in cookies
- **Protection**: Middleware-based route protection

### 9.2 Auth Flow

```
User Sign-Up → Email Verification → /onboarding → /dashboard
User Sign-In → /dashboard (or redirect_url)
Password Reset → Email Link → /auth/update-password
```

### 9.3 Middleware Protection (`src/middleware.ts`)

**Protected Routes**:
- `/dashboard/*`
- `/builder/*`
- `/admin/*`
- `/onboarding/*`

**Admin Routes** (additional check):
- `/admin/*` - Requires `is_admin: true` in users table

### 9.4 Client-Side Auth Check

```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  router.push('/sign-in')
}
```

### 9.5 Server-Side Auth Check

```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

---

## 10. AI CODE GENERATION PIPELINE

### 10.1 Pipeline Overview

```
Arabic Prompt → Translate → Generate → RTL Verify → Security Validate → Output
```

### 10.2 Pipeline Stages

**Stage 1: Translation** (deepseek-chat)
- Input: Arabic prompt
- Output: English translation
- Temperature: 0.3 (accurate)

**Stage 2: Code Generation** (deepseek-coder)
- Input: English prompt + Master UI Prompt
- Output: React/TypeScript code
- Temperature: 0.7 (creative)

**Stage 3: RTL Verification** (deepseek-chat)
- Checks: `dir="rtl"`, Cairo font, Arabic text
- Auto-fixes issues

**Stage 4: Security Validation** (deepseek-chat)
- Blocks: `eval()`, `dangerouslySetInnerHTML`, external API calls
- Returns vulnerabilities list

### 10.3 DeepSeek Client (`src/lib/deepseek/client.ts`)

**Key Functions**:
```typescript
translateArabicToEnglish(arabicText: string): Promise<{english: string, tokensUsed: number}>
generateReactCode(params: {...}): Promise<{code: string, tokensUsed: number}>
ensureRTLArabic(code: string, arabicPrompt: string): Promise<{code: string, issues: string[]}>
validateSecurity(code: string): Promise<{code: string, vulnerabilities: string[]}>
generateCompleteCode(arabicPrompt: string): Promise<{...}>  // Full pipeline
```

### 10.4 Master UI Prompts

Located in `prompts/`:
- `master-ui-website.md` - For internal KW APPS UI
- `master-ui-deepseek-client.md` - For generated client apps

---

## 11. PAYMENT INTEGRATION (UPAYMENTS)

### 11.1 UPayments Client (`src/lib/upayments/client.ts`)

**Configuration**:
```typescript
UPAYMENTS_API_URL = 'https://api.upayments.com/api/v1'
UPAYMENTS_API_KEY = 'a9828a188bc512674712cc6fc647894cba3f1b7c'
UPAYMENTS_MERCHANT_ID = '69683'
UPAYMENTS_SANDBOX = 'false'  // Production mode
```

### 11.2 Supported Payment Methods
- KNET (Kuwait debit cards)
- Credit Cards (Visa, Mastercard)
- Apple Pay
- Google Pay
- Samsung Pay

### 11.3 Payment Flow

```
1. User selects plan → /api/billing/checkout
2. Create UPayments charge → Return payment link
3. User redirects to UPayments → Pays
4. UPayments webhook → /api/billing/webhook
5. Update subscription status → Redirect to /billing/success
```

### 11.4 Key API Methods

```typescript
// Create charge
upayments.createCharge({
  order: { id, description, currency: 'KWD', amount },
  returnUrl,
  cancelUrl,
  notificationUrl,
  customer: { uniqueId, name, email },
  products: [{ name, description, price, quantity }],
})

// Check payment status
upayments.getPaymentStatus(trackId)

// Create refund
upayments.createRefund({...})

// Verify webhook
upayments.verifyWebhookSignature(payload, signature)
```

### 11.5 Subscription Plans

| Plan | Price (KWD) | Projects | Storage | AI Prompts/Day |
|------|-------------|----------|---------|----------------|
| Free | 0 | 1 | 100 MB | 3 |
| Builder | 33 | 10 | 1 GB | 30 |
| Pro | 59 | 100 | 10 GB | 100 |
| Hosting Only | 5 | 0 (existing) | - | 0 |

---

## 12. MULTI-AGENT SYSTEM

### 12.1 Agent Types

| Agent | Role | Model |
|-------|------|-------|
| KWAPPS-CHIEF | Coordinator & Supervisor | deepseek-chat |
| KWAPPS-DESIGN | UI/UX Specialist | deepseek-chat |
| KWAPPS-DEV | Full-Stack Engineer | deepseek-coder |
| KWAPPS-OPS | DevOps Specialist | deepseek-chat |
| KWAPPS-GUARD | QA & Security | deepseek-chat |

### 12.2 Agent Files

Located in `src/lib/agents/`:

```
agents/
├── core/
│   ├── base-agent.ts      # Base agent class
│   └── types.ts           # Type definitions
├── prompts/
│   ├── chief-prompt.ts    # Chief agent instructions
│   ├── design-prompt.ts   # Design agent instructions
│   ├── dev-prompt.ts      # Dev agent instructions
│   ├── ops-prompt.ts      # Ops agent instructions
│   └── guard-prompt.ts    # Guard agent instructions
└── communication/
    └── message-bus.ts     # Inter-agent messaging
```

### 12.3 Message Types

```typescript
type MessageType =
  | 'TASK_DELEGATION'
  | 'REQUEST_APPROVAL'
  | 'BROADCAST_UPDATE'
  | 'DIRECT_MESSAGE'
  | 'STATUS_UPDATE'
  | 'ERROR_REPORT'
```

---

## 13. CODE PATTERNS & CONVENTIONS

### 13.1 File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `kebab-case.ts` (e.g., `date-utils.ts`)
- Types: `kebab-case.ts` (e.g., `database.ts`)

### 13.2 Component Structure

```tsx
'use client'  // If client component

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State
  const [loading, setLoading] = useState(false)

  // Hooks
  const router = useRouter()

  // Effects
  useEffect(() => {
    // Side effects
  }, [])

  // Handlers
  const handleClick = async () => {
    // Logic
  }

  // Render
  return (
    <div dir="rtl" className="...">
      {/* Content */}
    </div>
  )
}
```

### 13.3 API Route Structure

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body
    const body = await request.json()

    // Business logic

    // Return response
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### 13.4 Supabase Query Patterns

```tsx
// Select with relations
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    user:users(id, email, display_name)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Insert
const { data, error } = await supabase
  .from('projects')
  .insert({ name, user_id: userId })
  .select()
  .single()

// Update
const { error } = await supabase
  .from('projects')
  .update({ name: newName })
  .eq('id', projectId)

// Delete
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
```

### 13.5 Error Handling Pattern

```tsx
try {
  const result = await someAsyncOperation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  }
}
```

### 13.6 Arabic Text Convention

```tsx
// Always use Arabic for user-facing text
<h1>لوحة التحكم</h1>
<p>مرحباً بك في KW APPS</p>

// Bilingual error messages
return NextResponse.json({
  error: 'اسم المشروع مطلوب',
  errorEn: 'Project name is required'
}, { status: 400 })
```

---

## 14. FEATURE STATUS (DONE/UNDONE)

### 14.1 Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Done | Supabase Auth |
| User Dashboard | ✅ Done | Projects, Profile, Settings |
| AI Code Generation | ✅ Done | DeepSeek integration |
| Live Code Preview | ✅ Done | Sandboxed iframe |
| Project Management | ✅ Done | CRUD operations |
| Vercel Deployment | ✅ Done | One-click deploy |
| UPayments Integration | ✅ Done | All payment methods |
| Subscription Management | ✅ Done | Plans, billing |
| Admin Dashboard | ✅ Done | Full admin panel |
| Blog System | ✅ Done | Posts, analytics |
| Template Gallery | ✅ Done | Browse templates |

### 14.2 Pending/Incomplete Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Email Notifications | ❌ Not Done | High | Welcome, renewal, failed payment emails |
| Real-time Collaboration | ❌ Not Done | Medium | Multiple users on same project |
| Version History | ⚠️ Partial | Medium | DB schema exists, UI not done |
| Custom Domain | ❌ Not Done | Medium | User's own domain for deployed sites |
| Analytics Dashboard | ⚠️ Partial | Low | Basic stats exist, advanced pending |
| Multi-language UI | ⚠️ Partial | Low | AR done, EN translation pending |
| Mobile App | ❌ Not Done | Low | Future consideration |
| Team Workspaces | ❌ Not Done | Low | Organization-level accounts |

### 14.3 Known Issues

| Issue | Description | Severity |
|-------|-------------|----------|
| Cron Job Auth | Recurring billing needs testing | Medium |
| Large Code Preview | Very large generated code may slow preview | Low |
| Mobile Builder | Builder not optimized for mobile | Low |

---

## 15. ENVIRONMENT VARIABLES

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://iqwfyrijmsoddpoacinw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# DeepSeek AI
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_CODE_MODEL=deepseek-coder
DEEPSEEK_CHAT_MODEL=deepseek-chat

# UPayments (Production)
UPAYMENTS_API_KEY=a9828a188bc512674712cc6fc647894cba3f1b7c
UPAYMENTS_API_URL=https://api.upayments.com/api/v1
UPAYMENTS_MERCHANT_ID=69683
UPAYMENTS_USERNAME=Springwood
UPAYMENTS_PASSWORD=mNCMg5FTFVnp
UPAYMENTS_SANDBOX=false

# Vercel Deployment
VERCEL_TOKEN=vck_...
VERCEL_TEAM_ID=team_...

# GitHub (for auto-deployment)
GITHUB_TOKEN=ghp_...
GITHUB_ORG=binsaleem99

# App URLs
NEXT_PUBLIC_APP_URL=https://kwq8.com
NEXT_PUBLIC_SITE_URL=https://kwq8.com
NEXT_PUBLIC_APP_NAME=KW APPS

# Security
CRON_SECRET=kwapps-cron-secret-2024
ADMIN_EMAIL=admin@kwapps.com
```

---

## APPENDIX A: QUICK REFERENCE

### Common Import Paths

```tsx
// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Supabase
import { createClient } from '@/lib/supabase/client'  // Client-side
import { createClient } from '@/lib/supabase/server' // Server-side

// Icons
import { Sparkles, ArrowLeft, Check } from 'lucide-react'

// Types
import type { User, Project, Plan } from '@/types/database'

// Utilities
import { cn } from '@/lib/utils'
```

### Common Tailwind Classes

```tsx
// RTL Layout
dir="rtl" className="text-right"

// Card
className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"

// Gradient Text
className="bg-gradient-to-l from-blue-600 to-cyan-500 bg-clip-text text-transparent"

// Primary Button
className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-lg"

// Outline Button
className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
```

---

**END OF DOCUMENTATION**

*This documentation is complete as of December 2, 2025. For updates, regenerate from codebase.*
