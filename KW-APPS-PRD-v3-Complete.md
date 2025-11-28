# KW APPS - Product Requirements Document

**Version 3.0 - Production Ready**  
*Arabic-First AI App Builder for Kuwait & GCC Markets*

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Version** | 3.0 - Claude Code Multi-Agent Ready |
| **Product Name** | KW APPS (كي دبليو آبس) |
| **Target Audience** | Claude Code 5-Agent System |
| **Tech Stack** | Next.js 14 + Supabase + DeepSeek + Vercel |
| **Market** | Kuwait + GCC (Arabic-First) |
| **Pricing** | Free / 33 KWD / 59 KWD / Hosting 5 KWD |
| **Payment Provider** | UPayments (Kuwait - K-Net + Cards) |
| **UI System** | 21st.dev + shadcn/ui + Master UI Prompt |
| **AI Model** | DeepSeek Coder + DeepSeek Chat |
| **Agent System** | 5 Agents: CHIEF, DEV, DESIGN, OPS, GUARD |

---

## 1. Executive Summary

### 1.1 Problem Statement

Arabic-speaking entrepreneurs, agencies, and founders in the GCC face a critical gap: while AI-powered app builders like Lovable, Bolt.new, and Replit exist, none are designed for Arabic-first experiences. These users must navigate English interfaces, translate prompts, and deal with LTR-designed outputs that don't respect RTL layouts. This creates friction, reduces productivity, and excludes non-English speakers from the AI development revolution.

### 1.2 Solution

KW APPS is an Arabic-first AI-powered SaaS builder that lets users create, preview, and deploy complete web applications through natural Arabic conversation. Built on Next.js + Supabase + DeepSeek, it combines a Lovable-inspired premium UI with instant Vercel deployment and a template gallery featuring clones of popular apps localized for Arabic markets.

### 1.3 Key Differentiators

- **Arabic-First**: Full RTL UI, Cairo font, Arabic prompts
- **Template Gallery**: Clone popular apps (e.g., "Mimic the App")
- **Instant Preview**: Live iframe updates as you chat
- **Kuwait Payments**: UPayments integration (K-Net + GCC cards)
- **DeepSeek AI**: 90% cheaper than GPT-4 (~$0.14/1M tokens)
- **Premium UI**: Lovable.dev aesthetic, avoiding AI slop

---

## 2. Platform Architecture

### 2.1 Architecture Decision: Fresh Build

**CRITICAL DECISION:** KW APPS v3 is a FRESH BUILD using Next.js + Supabase, NOT Cloudflare VibeSDK.

This decision was made because:
- Previous Cloudflare deployment had broken imports and UI mismatch
- Wrangler deployment complexity causing delays
- Next.js + Supabase is faster to develop and debug
- Vercel deployment is single-click vs Wrangler CLI issues
- Better developer experience for Claude Code agents

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | Fast SSR + API routes + Edge |
| **Styling** | Tailwind + 21st.dev + shadcn/ui | Premium UI components + RTL |
| **State** | React Query + Zustand | Server cache + client state |
| **Backend** | Next.js API Routes | Serverless edge functions |
| **Database** | Supabase (PostgreSQL) | Auth + DB + Storage + Realtime |
| **Auth** | Supabase Auth | Email + Google + Magic Link |
| **AI Engine** | DeepSeek Coder API | Code generation (~$0.14/1M tokens) |
| **AI Translation** | DeepSeek Chat API | Arabic → English translation |
| **Payments** | UPayments | KWD + K-Net + GCC cards |
| **Hosting** | Vercel | Auto-deploy + Edge + CDN |
| **File Storage** | Supabase Storage | User assets, templates, previews |
| **Dev Tool** | Claude Code (5-Agent) | AI-powered development team |

### 2.3 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER (RTL Arabic)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Landing    │  │    Auth     │  │   Builder   │  │  Templates  │   │
│  │  Page (AR)  │  │    Flow     │  │  Workspace  │  │   Gallery   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE (Next.js 14)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ API Routes  │  │ Middleware  │  │    Edge     │  │     ISR     │   │
│  │   /api/*    │  │   (Auth)    │  │   Cache     │  │    Pages    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    SUPABASE     │      │    DEEPSEEK     │      │    UPAYMENTS    │
│  ┌───────────┐  │      │  ┌───────────┐  │      │  ┌───────────┐  │
│  │PostgreSQL │  │      │  │   Coder   │  │      │  │ Checkout  │  │
│  │   Auth    │  │      │  │   Chat    │  │      │  │ Webhooks  │  │
│  │  Storage  │  │      │  │  (Trans)  │  │      │  │   K-Net   │  │
│  │ Realtime  │  │      │  └───────────┘  │      │  └───────────┘  │
│  └───────────┘  │      └─────────────────┘      └─────────────────┘
└─────────────────┘
```

---

## 3. Claude Code 5-Agent System

KW APPS is built by a coordinated team of 5 AI agents, each with specific responsibilities and limitations. This architecture ensures quality, prevents conflicts, and enables autonomous development.

### 3.1 Agent Overview

| Agent | Role | Responsibilities | Cannot Do |
|-------|------|------------------|-----------|
| **KWAPPS-CHIEF** | Supervisor & Spokesperson | Task assignment, memory, approvals, human communication | Write production code |
| **KWAPPS-DEV** | Full-Stack Engineer | Frontend, backend, APIs, DB, tests | Self-assign tasks, modify UX |
| **KWAPPS-DESIGN** | UX/UI Designer | Screens, flows, UI logic, content, Arabic text | Write backend code |
| **KWAPPS-OPS** | Tools & System Integrator | Auth, DB, APIs, storage, payments, deploy | Redesign product |
| **KWAPPS-GUARD** | QA & Guidelines | Tests, validation, security, guidelines | Create features |

### 3.2 KWAPPS-CHIEF (Supervisor Agent)

**Purpose:** Only agent that communicates with the human. Coordinates all other agents.

**Responsibilities:**
- Receives goals/features/issues from human
- Creates and assigns tasks to DEV/DESIGN/OPS/GUARD
- Maintains long-term memory (decisions, plans, approved designs, code)
- Validates and approves major decisions
- Ensures agents don't overwrite each other's work
- Approves deployments and architectural choices
- Reports progress back to human

**System Prompt for KWAPPS-CHIEF:**
```
You are KWAPPS-CHIEF, the supervisor agent for the KW APPS project. Your role:
1. ONLY you communicate with the human
2. Assign tasks to: KWAPPS-DEV, KWAPPS-DESIGN, KWAPPS-OPS, KWAPPS-GUARD
3. Maintain memory of all decisions and approved work
4. Validate outputs before deployment
5. Never write production code yourself
6. Route all major decisions through approval workflow
7. Store context in /memory directory structure
```

### 3.3 KWAPPS-DEV (Full-Stack Engineer Agent)

**Purpose:** Builds and maintains the entire SaaS codebase.

**Responsibilities:**
- Write Next.js frontend components
- Create API routes and backend logic
- Implement database queries and migrations
- Write TypeScript with strict types
- Follow designs from KWAPPS-DESIGN exactly
- Pass all QA checks from KWAPPS-GUARD
- Never deploy without CHIEF approval

**System Prompt for KWAPPS-DEV:**
```
You are KWAPPS-DEV, the full-stack engineer for KW APPS. Your role:
1. Build frontend with Next.js 14 + Tailwind + shadcn/ui
2. Create API routes in /app/api/*
3. Use Supabase for all database operations
4. Follow RTL-first design (dir='rtl', text-right)
5. Use Cairo font for all Arabic text
6. NEVER self-assign tasks - wait for CHIEF
7. ALWAYS follow KWAPPS-DESIGN specifications exactly
8. Submit all code to KWAPPS-GUARD for review
```

### 3.4 KWAPPS-DESIGN (UX/UI Designer Agent)

**Purpose:** Designs all screens, flows, and content.

**Responsibilities:**
- Create screen layouts and component specs
- Define user flows and navigation
- Write all Arabic content and UI text
- Apply Master UI Prompt principles
- Ensure Lovable-style premium aesthetic
- Provide component specs to KWAPPS-DEV

**System Prompt for KWAPPS-DESIGN:**
```
You are KWAPPS-DESIGN, the UX/UI designer for KW APPS. Your role:
1. Design all screens following Master UI Prompt
2. AVOID AI slop aesthetic (generic purple gradients, Inter font)
3. USE Cairo font, high-contrast colors, purposeful motion
4. All text must be Arabic (RTL layout)
5. Create Lovable.dev-style premium feel
6. Provide detailed specs for KWAPPS-DEV
7. NEVER write backend code
8. Focus on: Typography, Color, Motion, Backgrounds
```

### 3.5 KWAPPS-OPS (Tools & System Integrator Agent)

**Purpose:** Connects and runs all external services.

**Responsibilities:**
- Configure Supabase (Auth, DB, Storage, RLS)
- Set up DeepSeek API integration
- Implement UPayments checkout and webhooks
- Configure Vercel deployment
- Set up environment variables
- Monitor logs and analytics

**System Prompt for KWAPPS-OPS:**
```
You are KWAPPS-OPS, the system integrator for KW APPS. Your role:
1. Configure all external services
2. Set up Supabase: Auth, Database, Storage, RLS policies
3. Integrate DeepSeek API for AI generation
4. Implement UPayments for billing
5. Configure Vercel deployment pipeline
6. Manage environment variables and secrets
7. NEVER modify product design or UX
8. Focus on: Infrastructure, Security, DevOps
```

### 3.6 KWAPPS-GUARD (QA & Guidelines Agent)

**Purpose:** Quality assurance and guidelines enforcement.

**Responsibilities:**
- Run all tests (unit, integration, E2E)
- Validate code against TypeScript rules
- Check Arabic text and RTL compliance
- Enforce security best practices
- Block dangerous or conflicting work
- Monitor system health

**System Prompt for KWAPPS-GUARD:**
```
You are KWAPPS-GUARD, the QA and guidelines enforcer for KW APPS. Your role:
1. Validate ALL code before approval
2. Run tests: Unit (Vitest), E2E (Playwright)
3. Check: TypeScript strict mode, ESLint, Prettier
4. Verify: Arabic text present, RTL layout correct, Cairo font used
5. Security: Check for XSS, SQL injection, auth bypass
6. Block: Dangerous code, conflicting changes, guideline violations
7. NEVER create features - only validate
8. Report issues to KWAPPS-CHIEF for resolution
```

### 3.7 Agent Communication Flow

```
Human → KWAPPS-CHIEF (Goal/Feature/Issue)
            │
            ▼
KWAPPS-CHIEF → Creates Tasks → Memory Update
            │
  ┌────┼────┬────────┬────────┐
  ▼         ▼         ▼         ▼         ▼
DEV      DESIGN     OPS     GUARD
  │         │         │         │
  └────┴──────┴────────┘
            │
            ▼
     (All submit to GUARD)
   KWAPPS-GUARD → Validates
            │
            ▼
KWAPPS-CHIEF → Approves/Denies
            │
            ▼
     (If approved)
    KWAPPS-OPS → Deploys
            │
            ▼
KWAPPS-CHIEF → Updates Memory → Reports to Human
```

### 3.8 Agent Memory Structure

```
/memory
├── /goals       # Human-defined objectives
├── /tasks       # Current task assignments
├── /designs     # Approved UI/UX specs
├── /code        # Approved code snapshots
├── /ops         # Infrastructure configs
├── /qa          # Test results, validations
├── /decisions   # Major architectural decisions
├── /assets      # Images, logos, templates
└── /history     # Conversation and action logs
```

---

## 4. Master UI Prompt Integration

KW APPS follows the Master UI Prompt to avoid generic 'AI slop aesthetic' and produce distinctive, premium interfaces.

### 4.1 Design Principles

#### 4.1.1 Typography
- Use Cairo font (Arabic-friendly, Google Fonts)
- Bold, expressive headings with character
- **AVOID:** Inter, Arial, Roboto, system-ui, Space Grotesk
- Typography should DEFINE the aesthetic, not decorate
- Establish clear hierarchy: Titles > Headers > Body

#### 4.1.2 Color & Theme
- Commit to ONE clear aesthetic direction
- Use CSS variables / design tokens for consistency
- High-contrast dominant colors with selective accents
- **AVOID:** Purple/indigo gradients on white (AI cliché)
- Draw from real references: Lovable, Linear, Vercel

#### 4.1.3 Motion & Interactions
- Motion must be PURPOSEFUL, not random
- Use Framer Motion for React animations
- Focus on sequence and rhythm (staggered reveals)
- One high-quality animation beats many scattered ones
- Page load: deliberate staggered reveal

#### 4.1.4 Backgrounds & Atmosphere
- **AVOID** flat solid-color backgrounds
- Use layered gradients, noise textures, subtle geometry
- Backgrounds add depth, ambiance, and identity
- Consider: grids, patterns, contextual imagery

### 4.2 What to AVOID (AI Slop)

- ❌ Overused system fonts (Inter, Roboto)
- ❌ Purple/indigo gradients on plain white
- ❌ Generic hero sections with 2-column layouts
- ❌ Homogenous bland components with no identity
- ❌ Repeating the same patterns across pages
- ❌ Falling back to 'safe' defaults

### 4.3 KW APPS Design System

| Element | Specification |
|---------|---------------|
| **Primary Font** | Cairo (Google Fonts) - weights: 400, 500, 600, 700 |
| **Direction** | RTL (dir='rtl' on `<html>`) |
| **Primary Color** | #0f172a (Slate 900) - Dark, professional |
| **Accent Color** | #3b82f6 (Blue 500) - CTAs, highlights |
| **Background** | Subtle gradient: slate-50 → white with noise texture |
| **Cards** | White with subtle shadow, rounded-xl, hover lift |
| **Animations** | Framer Motion: staggered fade-up on page load |
| **Icons** | Lucide React - consistent stroke width |
| **Component Lib** | 21st.dev + shadcn/ui (free tier) |

---

## 5. Template Gallery System (Mimic the App)

The Template Gallery is KW APPS's key differentiator - users can start from professionally designed templates inspired by successful apps, then customize with their branding and content.

### 5.1 Template Categories

1. **E-Commerce** (مواقع تجارة إلكترونية)
   - Product catalog with Arabic RTL
   - Shopping cart
   - Checkout flow
   - Example: Mimic Noon.com, Amazon

2. **Restaurant** (مواقع مطاعم)
   - Menu display with images
   - Online ordering
   - Table reservation
   - Example: Mimic Talabat, Deliveroo

3. **SaaS Landing** (صفحات هبوط)
   - Hero + Features + Pricing
   - Email capture
   - Video embed
   - Example: Mimic Linear, Notion

4. **Portfolio** (معرض أعمال)
   - Project showcase
   - About page
   - Contact form
   - Example: Mimic Dribbble profiles

5. **Booking** (حجوزات)
   - Calendar integration
   - Time slot selection
   - Payment
   - Example: Mimic Calendly

6. **Dashboard** (لوحات تحكم)
   - Charts and metrics
   - Data tables
   - Filters
   - Example: Mimic Stripe Dashboard

### 5.2 Template Structure

Each template includes:
- **Base Code**: Complete React component with Tailwind
- **Customizable Sections**: JSON mapping of editable content
- **Color Scheme**: Primary/accent colors that can be swapped
- **Image Placeholders**: User can upload their own images
- **Arabic Text**: Default content in Arabic
- **Preview URL**: Live hosted demo
- **Thumbnail**: Screenshot for gallery display

### 5.3 Template Customization Flow

1. User selects template from gallery
2. Sidebar shows customization options:
   - Brand name
   - Primary color (color picker)
   - Logo upload
   - Hero image upload
   - Section visibility toggles
3. Live preview updates in real-time
4. User can switch to "Chat Mode" to further customize with AI
5. Final app can be deployed or exported

---

## 6. AI Generation Pipeline

KW APPS uses a multi-agent pipeline to convert Arabic prompts into production-ready React code.

### 6.1 Pipeline Architecture

```
┌─────────────────────┐
│  1. TRANSLATOR      │  ← Converts Arabic to English
│      AGENT          │    (DeepSeek Chat)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. ARCHITECT       │  ← Creates file structure
│      AGENT          │    (DeepSeek Coder)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. CODE            │  ← Writes actual code
│    GENERATOR        │    (DeepSeek Coder)
│                     │    React + Tailwind
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. RTL/ARABIC      │  ← Ensures RTL layout
│      AGENT          │    Arabic text, Cairo font
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. FIXER           │  ← Removes unused imports
│      AGENT          │    Fixes syntax errors, lints
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  6. VALIDATOR       │  ← Security checks
│      AGENT          │    No malicious code
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  7. BUILD           │  ← Bundles for preview
│      AGENT          │    Creates iframe-ready code
└──────────┬──────────┘
           │
           ▼
    Preview / Deploy
```

### 6.2 Agent System Prompts

#### 6.2.1 Translator Agent
```
Translate Arabic text to English accurately. Preserve:
- Technical terms (React, API, database)
- Brand names
- Numbers and measurements

Only return the translation, nothing else.
```

#### 6.2.2 Architect Agent
```
You are an expert software architect for React applications.
Given a user's app description, create a detailed file structure.

REQUIREMENTS:
1. Use React 18 with functional components
2. Use Tailwind CSS for styling
3. All layouts must be RTL-compatible (dir='rtl')
4. Use Cairo font (Google Fonts)
5. Keep bundle size under 500KB
6. No external API calls from generated apps

OUTPUT FORMAT:
{
  'files': [
    { 'path': 'src/App.tsx', 'purpose': 'Main app component' },
    { 'path': 'src/components/Header.tsx', 'purpose': 'Header with navigation' }
  ],
  'dependencies': ['react', 'react-dom', 'tailwindcss'],
  'routes': ['/', '/about', '/contact']
}
```

#### 6.2.3 Generator Agent
```
You are an expert React developer. Generate production-ready code.

REQUIREMENTS:
1. Write TypeScript with strict types
2. Use functional components with hooks
3. Apply RTL-first styling with Tailwind
4. Include Arabic text as provided
5. Use semantic HTML elements
6. Ensure accessibility (aria labels in Arabic)
7. Handle loading and error states
8. NO inline styles - only Tailwind classes

STYLE GUIDE:
- RTL: Use 'rtl:mr-4' or flex-row-reverse
- Colors: Use Tailwind color classes
- Spacing: Consistent 4px grid
- Text: text-right for Arabic, Cairo font
```

#### 6.2.4 Validator Agent (Safety)
```
Check generated code for security issues.

BLOCK if found:
- eval() or Function() constructor
- dangerouslySetInnerHTML without sanitization
- External script loading (except whitelisted CDNs)
- localStorage/sessionStorage abuse
- Inline event handlers
- SQL-like strings (shouldn't query DBs)

ALLOW:
- Standard React patterns
- Tailwind classes
- Lucide React icons
- Google Fonts
```

### 6.3 Cost Optimization

**DeepSeek Pricing:** ~$0.14 per 1M tokens (90% cheaper than GPT-4)

**Token Budget per Generation:**
- Translation: ~500 tokens
- Architecture: ~1,000 tokens
- Code generation: ~3,000 tokens
- RTL fixes: ~500 tokens
- Total: ~5,000 tokens = $0.0007 per generation

**Monthly Cost Projections:**

| Plan | Prompts/Month | Cost per User | Margin |
|------|---------------|---------------|--------|
| FREE | 90 | $0.06 | N/A (free tier) |
| BUILDER (33 KWD) | 300 | $0.21 | 99.4% |
| PRO (59 KWD) | 1,500 | $1.05 | 98.2% |

---

## 7. Database Schema (Complete)

All tables use Supabase PostgreSQL with Row-Level Security (RLS) enabled.

### 7.1 Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'builder', 'pro', 'hosting_only')),
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
```

### 7.2 Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  arabic_prompt TEXT,
  english_prompt TEXT,
  generated_code TEXT,
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'preview', 'published', 'error')),
  active_version INTEGER DEFAULT 1,
  deployed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own projects" ON projects FOR ALL USING (auth.uid() = user_id);
```

### 7.3 Messages Table (Chat History)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS via project ownership
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own project messages" ON messages FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);
```

### 7.4 Templates Table

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'ecommerce', 'restaurant', 'saas', 'landing', 'portfolio', 'booking', 'social', 'dashboard'
  )),
  preview_url TEXT,
  thumbnail_url TEXT,
  base_code TEXT NOT NULL,
  customizable_sections JSONB DEFAULT '{}',
  color_scheme JSONB DEFAULT '{}',
  is_rtl BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, admin write
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read templates" ON templates FOR SELECT USING (true);
```

### 7.5 User Assets Table

```sql
CREATE TABLE user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'logo', 'hero', 'product', 'banner', 'icon', 'other'
  )),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own assets" ON user_assets FOR ALL USING (auth.uid() = user_id);
```

### 7.6 Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'builder', 'pro', 'hosting_only')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  upayments_subscription_id TEXT,
  upayments_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.7 Usage Limits Table

```sql
CREATE TABLE usage_limits (
  user_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  prompt_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Function to check limits
CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM subscriptions WHERE user_id = p_user_id;
  SELECT prompt_count INTO v_count FROM usage_limits WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  v_limit := CASE v_plan
    WHEN 'free' THEN 3
    WHEN 'builder' THEN 30
    WHEN 'pro' THEN 100
    ELSE 0
  END;
  
  RETURN COALESCE(v_count, 0) < v_limit;
END;
$$ LANGUAGE plpgsql;
```

### 7.8 Project Versions Table

```sql
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  code_snapshot TEXT NOT NULL,
  prompt_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, version)
);

-- Auto-increment version on save
CREATE OR REPLACE FUNCTION save_project_version() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_versions (project_id, version, code_snapshot, prompt_snapshot)
  VALUES (
    NEW.id,
    COALESCE((SELECT MAX(version) FROM project_versions WHERE project_id = NEW.id), 0) + 1,
    NEW.generated_code,
    NEW.arabic_prompt
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.9 Billing Events Table

```sql
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL,
  upayments_event_id TEXT,
  amount_kwd DECIMAL(10,3),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.10 Analytics Events Table

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_name TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_event ON analytics_events(event_name);
CREATE INDEX idx_analytics_date ON analytics_events(created_at);
```

---

## 8. Complete API Routes

### 8.1 Authentication Routes

**POST** `/api/auth/signup`
- Body: `{ email, password }`
- Response: `{ user, session }` | `{ error }`

**POST** `/api/auth/login`
- Body: `{ email, password }`
- Response: `{ user, session }` | `{ error }`

**POST** `/api/auth/logout`
- Response: `{ success: true }`

**POST** `/api/auth/callback`
- Query: `{ code }` (OAuth callback)
- Response: Redirect to /builder

**GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Response: `{ user }` | `{ error: 'Unauthorized' }`

**PATCH** `/api/auth/me`
- Body: `{ display_name?, avatar_url?, language? }`
- Response: `{ user }`

### 8.2 Project Routes

**GET** `/api/projects`
- Response: `{ projects: Project[] }`

**POST** `/api/projects`
- Body: `{ name, description?, template_id? }`
- Response: `{ project }`

**GET** `/api/projects/:id`
- Response: `{ project, messages }`

**PATCH** `/api/projects/:id`
- Body: `{ name?, description?, status? }`
- Response: `{ project }`

**DELETE** `/api/projects/:id`
- Response: `{ success: true }`

**GET** `/api/projects/:id/versions`
- Response: `{ versions: ProjectVersion[] }`

**POST** `/api/projects/:id/rollback/:version`
- Response: `{ project }`

### 8.3 AI Generation Routes

**POST** `/api/generate`
- Body: `{ prompt, project_id }`
- Response: `{ code, tokens_used }` | `{ error }`
- Errors:
  - 400: Invalid prompt
  - 401: Unauthorized
  - 429: Daily limit exceeded
  - 500: Generation failed

**POST** `/api/refine`
- Body: `{ prompt, project_id, current_code }`
- Response: `{ code, tokens_used }`

**GET** `/api/usage`
- Response: `{ today: { count, limit }, month: { count, limit } }`

**GET** `/api/limits`
- Response: `{ plan: 'free' | 'builder' | 'pro', daily_limit: number, monthly_limit: number, features: string[] }`

### 8.4 Template Routes

**GET** `/api/templates`
- Query: `{ category?, premium? }`
- Response: `{ templates: Template[] }`

**GET** `/api/templates/:id`
- Response: `{ template }`

**GET** `/api/templates/:id/preview`
- Response: `{ preview_url, thumbnail_url }`

**POST** `/api/templates/:id/use`
- Body: `{ brand_name, primary_color, logo_url? }`
- Response: `{ project_id }`

### 8.5 Asset Routes

**GET** `/api/assets`
- Response: `{ assets: UserAsset[] }`

**POST** `/api/assets/upload`
- Body: `FormData { file, asset_type, project_id? }`
- Response: `{ asset, url }`

**DELETE** `/api/assets/:id`
- Response: `{ success: true }`

### 8.6 Billing Routes (UPayments)

**GET** `/api/billing/subscription`
- Response: `{ subscription, plan, features }`

**POST** `/api/billing/checkout`
- Body: `{ plan: 'builder' | 'pro' }`
- Response: `{ checkout_url }`

**POST** `/api/billing/webhook`
- Headers: `X-UPayments-Signature`
- Body: UPayments webhook payload
- Response: `{ received: true }`

**GET** `/api/billing/invoices`
- Response: `{ invoices: Invoice[] }`

**POST** `/api/billing/cancel`
- Response: `{ subscription }`

### 8.7 Error Response Format

```json
// Standard Error Response
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "لقد تجاوزت الحد اليومي للتوليد",
    "message_en": "Daily generation limit exceeded",
    "status": 429
  }
}

// Error Codes
// 400 - BAD_REQUEST: Invalid input data
// 401 - UNAUTHORIZED: Not authenticated
// 403 - FORBIDDEN: Not allowed (wrong plan)
// 404 - NOT_FOUND: Resource not found
// 429 - LIMIT_EXCEEDED: Usage limit reached
// 500 - SERVER_ERROR: Internal error
```

---

## 9. Pricing & Business Model

### 9.1 Pricing Tiers

| Tier | Price | Daily Limit | Monthly Limit | Features |
|------|-------|-------------|---------------|----------|
| **FREE** | 0 KWD | 3 prompts | 90 prompts | Basic templates, Preview only |
| **BUILDER** | 33 KWD/mo | 30 prompts | 300 prompts | All templates, Code export, Priority support |
| **PRO** | 59 KWD/mo | 100 prompts | 1,500 prompts | Premium templates, Version control, Team sharing |
| **HOSTING** | 5 KWD/mo | 0 prompts | 0 prompts | App hosting only (for canceled users) |

### 9.2 Revenue Model

**Target Market:** Kuwait + GCC (Saudi, UAE, Qatar, Bahrain, Oman)

**Month 1 Goals:**
- 100 signups
- 20% conversion (20 paid users)
- Revenue: 20 × 33 = 660 KWD
- Costs: ~100 KWD (DeepSeek + hosting)
- Profit: 560 KWD (85% margin)

**Month 6 Goals:**
- 1,000 users
- 200 paying customers
- MRR: 8,000 KWD
- Annual recurring revenue (ARR): 96,000 KWD

### 9.3 Cost Structure

**Per User Costs:**
- DeepSeek API: ~$0.21/month (BUILDER tier)
- Supabase: Free tier (up to 50K MAU)
- Vercel: Free tier (hobby)
- UPayments: 2.5% transaction fee

**Total cost per BUILDER user:** ~1 KWD/month  
**Profit per BUILDER user:** 32 KWD/month (97% margin)

### 9.4 UPayments Integration

**Payment Methods:**
- K-Net (Kuwait debit cards)
- Visa/Mastercard (GCC)
- Apple Pay / Google Pay

**Webhook Events:**
- `payment.succeeded` - Activate subscription
- `payment.failed` - Send retry email
- `subscription.canceled` - Downgrade to Hosting tier
- `subscription.renewed` - Continue service

---

## 10. User Flows

### 10.1 New User Sign-Up Flow

1. User lands on homepage (Arabic)
2. Clicks "ابدأ مجاناً" (Start Free)
3. Redirected to `/signup`
4. Enters email + password OR clicks "Google"
5. Email verification sent (if email/password)
6. Redirected to `/builder` (onboarding)
7. Modal: "Create your first app" or "Browse templates"

### 10.2 App Generation Flow

1. User in `/builder` workspace
2. Types Arabic prompt: "أريد موقع مطعم مع قائمة الطعام"
3. Clicks "إنشاء" (Generate)
4. Loading state shows in preview panel
5. AI pipeline runs (translate → architect → generate → validate)
6. Preview updates with generated app
7. User can:
   - Continue chatting to refine
   - Export code (if BUILDER+)
   - Deploy (if PRO)
   - Save project

### 10.3 Template Customization Flow

1. User clicks "قوالب جاهزة" (Templates)
2. Gallery shows categories
3. User selects template (e.g., "Restaurant")
4. Customization sidebar appears:
   - Brand name input
   - Color picker
   - Logo upload
   - Hero image upload
5. Preview updates in real-time
6. User clicks "استخدم هذا القالب" (Use Template)
7. Project created with customized code
8. User can further refine with AI chat

### 10.4 Payment Flow

1. Free user hits daily limit (3 prompts)
2. Modal appears: "ترقية لاستمرار الإنشاء" (Upgrade to Continue)
3. Shows pricing table (BUILDER vs PRO)
4. User selects plan
5. Redirected to UPayments checkout
6. Enters K-Net card or Visa/Mastercard
7. Payment processed
8. Webhook triggers subscription activation
9. User redirected back to `/builder`
10. Success message: "تم الترقية بنجاح!" (Upgraded Successfully)

### 10.5 Deployment Flow (PRO Only)

1. User finishes app in builder
2. Clicks "نشر التطبيق" (Deploy App)
3. Modal: Choose subdomain (e.g., `myrestaurant.kwapps.com`)
4. Click "نشر" (Deploy)
5. Backend:
   - Creates Vercel project
   - Pushes code to GitHub
   - Triggers deployment
6. Loading: "جاري النشر..." (Deploying...)
7. Success: "تم النشر! 🎉"
8. Shows live URL + QR code
9. User can share link

---

## 11. Feature Specifications

### 11.1 Arabic Chat Interface

**Appearance:**
- RTL chat bubbles
- User messages: Blue background, aligned right
- AI messages: White background with subtle border, aligned left
- Cairo font throughout
- Smooth scroll behavior
- Auto-scroll to bottom on new message

**Behavior:**
- User types Arabic prompt
- Presses Enter or clicks "إرسال" button
- Loading spinner shows in chat
- AI response streams in (optional: typing indicator)
- Code preview updates automatically

**Error Handling:**
- Invalid prompt: "يرجى إدخال وصف أوضح للتطبيق"
- API error: "حدث خطأ. يرجى المحاولة مرة أخرى"
- Rate limit: "تجاوزت الحد اليومي. ترقية الآن؟"

### 11.2 Live Preview Panel

**Features:**
- Sandboxed iframe (prevents XSS)
- Responsive device modes (mobile/tablet/desktop)
- Reload button
- Full-screen toggle
- Loading skeleton while generating
- Error state if code doesn't compile

**Implementation:**
```tsx
<iframe
  srcDoc={generatedCode}
  sandbox="allow-scripts allow-same-origin"
  className="w-full h-full border-0"
  title="App Preview"
/>
```

### 11.3 Template Gallery

**Layout:**
- Grid view (3 columns on desktop, 1 on mobile)
- Category filters at top
- Search bar (Arabic)
- Sort options: "الأحدث" (Newest), "الأكثر استخداماً" (Most Used)

**Template Card:**
- Thumbnail image
- Arabic name
- Category badge
- "استخدم" (Use) button
- "معاينة" (Preview) button

**Premium Templates:**
- Lock icon overlay
- "ترقية للوصول" (Upgrade to Access)

### 11.4 Code Export (BUILDER+)

**Export Options:**
- **Download ZIP:** Complete Next.js project
- **Copy Code:** Single component code
- **GitHub Export:** (PRO only) Push to new repo

**ZIP Contents:**
```
exported-app/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── README.md (Arabic)
├── public/
│   └── favicon.ico
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

### 11.5 Version Control (PRO Only)

**Features:**
- Auto-save every prompt
- Version history sidebar
- Click version to preview
- Rollback button
- Compare versions (diff view)

**UI:**
```
التاريخ (History)
└── v3 - الآن (Now) ✓
└── v2 - منذ 5 دقائق (5 min ago)
└── v1 - منذ ساعة (1 hour ago)
```

### 11.6 Team Sharing (PRO Only - V2)

**Features:**
- Invite by email
- Read-only vs Edit permissions
- Shared workspace
- Comment threads on code
- Activity log

---

## 12. Internationalization (i18n)

### 12.1 Language Support

**Phase 1 (MVP):**
- Arabic (primary)
- English (secondary, for API responses)

**Phase 2:**
- Full English UI
- User can toggle: `lang="ar"` ↔ `lang="en"`

### 12.2 RTL Implementation

**HTML:**
```html
<html dir="rtl" lang="ar">
```

**Tailwind Config:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // RTL-aware utilities
    }
  },
  plugins: [
    require('tailwindcss-rtl')
  ]
}
```

**Component Example:**
```tsx
<div className="flex flex-row-reverse gap-4">
  <button className="mr-auto rtl:ml-auto">زر</button>
</div>
```

### 12.3 Arabic Content Guidelines

- All UI text must be in Modern Standard Arabic (MSA)
- Avoid colloquial dialects for consistency
- Use formal tone for error messages
- Friendly, casual tone for onboarding
- Technical terms in English if no common Arabic equivalent

---

## 13. Security & Compliance

### 13.1 Authentication Security

**Supabase Auth:**
- Email verification required
- Password min length: 8 characters
- Password complexity: 1 uppercase, 1 number
- Magic link expiry: 1 hour
- Session expiry: 7 days
- Refresh token rotation

**OAuth (Google):**
- Scopes: `email`, `profile`
- PKCE flow for security
- No password storage

### 13.2 Data Privacy

**GDPR-Equivalent Compliance:**
- User can export all data (JSON)
- User can delete account + all data
- Data retention: 30 days after delete
- No third-party analytics without consent

**Cookie Policy:**
- Essential cookies only (auth session)
- No tracking cookies in MVP
- Banner: "نستخدم ملفات تعريف الارتباط الضرورية فقط"

### 13.3 Content Security

**Generated Code Validation:**
- No `eval()` or `Function()` constructor
- No external script loading
- No SQL queries (apps are static)
- Iframe sandbox: `allow-scripts allow-same-origin`

**User Uploads:**
- Max file size: 5MB
- Allowed types: PNG, JPG, SVG only
- Virus scan via ClamAV (optional)
- Store in Supabase Storage with RLS

### 13.4 Rate Limiting

**API Rate Limits:**
- Auth endpoints: 10 requests/minute
- Generation: Based on plan limits
- Asset upload: 20 files/hour
- Webhook: 1000 requests/hour (UPayments)

**Implementation:**
```ts
// middleware.ts
import { ratelimit } from '@/lib/ratelimit'

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

---

## 14. Claude Code Implementation Guide

### 14.1 Project Setup

```bash
# Step 1: Create Next.js project
npx create-next-app@latest kwapps --typescript --tailwind --eslint --app

# Step 2: Install dependencies
cd kwapps
npm install @supabase/supabase-js @supabase/ssr
npm install zustand @tanstack/react-query
npm install framer-motion lucide-react
npm install zod

# Step 3: Install shadcn/ui
npx shadcn@latest init

# Step 4: Add 21st.dev components
npx shadcn@latest add button card input textarea dialog
npx shadcn@latest add "https://21st.dev/r/shadcn/accordion"

# Step 5: Start development
npm run dev
```

### 14.2 Implementation Order

**CRITICAL:** Follow this exact order to avoid dependency issues:

1. Supabase Setup - Create project, configure auth, run schema
2. Authentication - Login/signup pages with Supabase Auth
3. Arabic UI Shell - Layout, fonts, RTL, navigation
4. Landing Page - Hero, features, pricing sections
5. Builder UI - Chat panel, preview iframe, prompt input
6. DeepSeek Integration - /api/generate route
7. Usage Limits - Track prompts, enforce limits
8. Projects CRUD - Create, list, update, delete
9. Templates - Gallery page, customization flow
10. UPayments - Checkout, webhooks, subscription
11. Testing - Unit, E2E, manual QA
12. Deploy - Push to GitHub, connect Vercel

### 14.3 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepSeek
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_CODE_MODEL=deepseek-coder
DEEPSEEK_CHAT_MODEL=deepseek-chat

# UPayments
UPAYMENTS_API_KEY=your_api_key
UPAYMENTS_MERCHANT_ID=your_merchant_id
UPAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://kwapps.com
NEXT_PUBLIC_APP_NAME=KW APPS
```

### 14.4 Quality Checklist

Before marking any feature complete, KWAPPS-GUARD must verify:

- [ ] All text is in Arabic (no English placeholders)
- [ ] Layout is RTL (flex-row-reverse, text-right)
- [ ] Cairo font is applied consistently
- [ ] Error messages are in Arabic
- [ ] Loading states have Arabic text
- [ ] Responsive on mobile (vertical stack)
- [ ] Accessibility labels are in Arabic
- [ ] TypeScript strict mode passes
- [ ] No console errors
- [ ] Master UI Prompt principles followed

---

## 15. Complete Task Checklist

### 15.1 Phase 1: Foundation (Day 1)

- [ ] Create Next.js project with TypeScript + Tailwind
- [ ] Set up Supabase project
- [ ] Configure authentication (email + Google)
- [ ] Create database schema (all tables)
- [ ] Set up RLS policies
- [ ] Configure Cairo font + RTL layout
- [ ] Create basic page structure

### 15.2 Phase 2: Core Features (Day 2)

- [ ] Build landing page (Arabic)
- [ ] Build login/signup pages
- [ ] Build builder workspace UI
- [ ] Implement DeepSeek API integration
- [ ] Create /api/generate route
- [ ] Implement preview iframe
- [ ] Add usage tracking

### 15.3 Phase 3: Business Logic (Day 3)

- [ ] Implement project CRUD
- [ ] Build template gallery
- [ ] Add template customization
- [ ] Integrate UPayments checkout
- [ ] Handle webhooks
- [ ] Implement subscription management

### 15.4 Phase 4: Polish & Deploy

- [ ] Add all Arabic translations
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Mobile responsive testing
- [ ] Run E2E tests
- [ ] Security review
- [ ] Deploy to Vercel
- [ ] Configure custom domain

### 15.5 Compliance Checklist

- [ ] GDPR-equivalent privacy policy
- [ ] Terms of service (Arabic + English)
- [ ] Cookie consent banner
- [ ] Data export capability
- [ ] Account deletion flow
- [ ] UPayments compliance
- [ ] Content moderation policy

---

## 16. Success Metrics

### 16.1 Month 1 Targets

- 100 total signups
- 20 paid conversions (20% rate)
- 50 apps generated
- 10 apps deployed
- < 5% churn rate
- < 2s page load time

### 16.2 Month 6 Targets

- 1,000 total users
- 200 paying customers
- 8,000 KWD MRR
- 500 deployed apps
- 3 association partnerships

### 16.3 KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Free → Paid Conversion | > 15% | Weekly cohort analysis |
| Monthly Churn | < 5% | Subscription cancellations |
| AI Cost per User | < 0.5 KWD | DeepSeek API usage |
| Generation Success Rate | > 90% | Successful vs failed builds |
| NPS Score | > 40 | User surveys |

---

## 17. Product Roadmap

### 17.1 V1 MVP (Week 1-2)

- Core builder with Arabic UI
- 5 basic templates
- DeepSeek AI pipeline
- Preview iframe
- Free + Builder tier
- UPayments integration

### 17.2 V1.5 (Month 2)

- Full template gallery (20+ templates)
- Image upload and replacement
- Pro tier launch
- Project versioning
- Code export (Pro)

### 17.3 V2 (Month 3-4)

- Custom domains
- GitHub export
- Multi-page apps
- AI debugging agent
- Team collaboration

### 17.4 Future

- Backend generation (Supabase integration)
- Mobile app generation (React Native)
- Plugin marketplace
- White-label for agencies

---

*--- End of Document ---*

**KW APPS PRD v3.0**  
Next.js + Supabase + DeepSeek + UPayments  
5-Agent System: CHIEF • DEV • DESIGN • OPS • GUARD

**Ready for Production Implementation**
