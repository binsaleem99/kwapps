# KW APPS - Complete Rebuild Instructions for Lovable AI

## 📋 Project Overview

**Project Name**: KW APPS
**Tagline**: AI Vibe Coder - منشئ المواقع بالذكاء الاصطناعي
**Purpose**: Arabic-first AI-powered website builder that generates React applications from natural language prompts
**Target Audience**: Arabic-speaking developers and non-developers in Kuwait and Middle East
**Business Model**: Freemium SaaS with tiered plans (Free, Builder, Pro, Hosting Only)

---

## 🎯 Core Functionality

Users can:
1. **Sign up/Login** with email/password (Supabase Auth)
2. **Create projects** (websites/apps)
3. **Chat with AI** in Arabic to describe what they want
4. **See live preview** of generated React code
5. **Edit and iterate** on generated code through conversation
6. **Save code history** with versioning
7. **Deploy** one-click to Vercel (hosting)
8. **Manage subscription** with UPayments (Kuwait payment gateway)
9. **Track usage** (generation limits, tokens used)

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Magic UI
- **Icons**: Lucide React
- **Font**: Cairo (Google Fonts) for Arabic
- **Preview**: react-live (for live code rendering)
- **Animations**: Framer Motion

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **Storage**: Supabase Storage (for assets)
- **API Routes**: Next.js API Routes
- **Edge Functions**: Supabase Edge Functions (Deno)

### AI & Integrations
- **AI Model**: DeepSeek API (deepseek-chat, deepseek-coder)
- **Payment**: UPayments Kuwait (K-Net + Credit Cards)
- **Deployment**: Vercel
- **Analytics**: (Future: Vercel Analytics)

### Key Libraries
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",
    "openai": "^4.20.0",
    "react-live": "^4.1.6",
    "lucide-react": "^0.263.1",
    "framer-motion": "^10.16.4",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest"
  }
}
```

---

## 🎨 Design System

### Brand Colors
- **Primary Blue**: `#3b82f6` (blue-500)
- **Dark Slate**: `#0f172a` (slate-900)
- **Background**: `#f8fafc` (slate-50)
- **White**: `#ffffff`
- **Success Green**: `#22c55e` (green-500)
- **Error Red**: `#ef4444` (red-500)

### Typography
- **Font Family**: 'Cairo', sans-serif (weights: 300, 400, 600, 700, 800)
- **Direction**: RTL (dir="rtl" on root elements)
- **Text Alignment**: text-right for Arabic

### Spacing & Layout
- **Grid**: 8px base unit (8, 16, 24, 32, 48, 64px)
- **Border Radius**: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
- **Shadows**: shadow-sm, shadow-md, shadow-lg, shadow-xl

### Gradient Patterns
```css
/* Primary Gradient */
bg-gradient-to-r from-blue-600 to-blue-500

/* Background Gradient */
bg-gradient-to-br from-slate-50 to-white

/* Dark Gradient */
bg-gradient-to-r from-slate-900 to-slate-800
```

### Component Style Rules
- **Buttons**: Bold text, rounded-xl, shadow-lg, hover:shadow-xl, transition-all
- **Cards**: bg-white, border-2 border-slate-200, rounded-2xl, p-6
- **Inputs**: border-2 border-slate-200, focus:border-blue-500, rounded-xl
- **Navigation**: sticky top-0, bg-white, border-b, shadow-sm

---

## 🗄️ Database Schema

### Tables Overview

```sql
-- Users table (extends Supabase auth.users)
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT DEFAULT 'free', -- 'free', 'builder', 'pro', 'hosting_only'
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Projects table
projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  generated_code TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'preview', 'deployed'
  deployment_url TEXT,
  vercel_project_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Messages table (chat history)
messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Generated Code table (Lovable pattern)
generated_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'tsx',
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Usage Limits table
usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompt_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
)

-- Subscriptions table (UPayments integration)
subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'cancelled', 'past_due'
  upayments_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Templates table
templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'landing', 'dashboard', 'ecommerce', 'portfolio'
  thumbnail_url TEXT,
  code TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Row Level Security (RLS) Policies

Enable RLS on all tables and create policies:
- Users can only view/edit their own data
- Public templates are viewable by all
- Admin users (role='admin') have full access

---

## 📄 Pages & Routes

### Public Pages

#### 1. Landing Page (`/`)
**Purpose**: Marketing page to attract users
**Features**:
- Hero section with gradient background
- Feature showcase (3-4 key features)
- Pricing table preview
- Live demo video/GIF
- CTA buttons: "ابدأ مجاناً" (Start Free), "شاهد العرض" (Watch Demo)
- Testimonials section
- FAQ section
- Footer with links

**Key Elements**:
```tsx
- Hero:
  - Main heading: "أنشئ تطبيقك بالذكاء الاصطناعي"
  - Subheading: "من الفكرة إلى التطبيق في دقائق"
  - Primary CTA: gradient button linking to /sign-up
  - Secondary CTA: link to demo

- Features Grid:
  1. AI-Powered Generation (icon: Sparkles)
  2. Live Preview (icon: Monitor)
  3. One-Click Deploy (icon: Upload)
  4. RTL Support (icon: Globe)

- Pricing Cards:
  - Free: 3 generations/day
  - Builder: $4.99/month, 50 generations/day
  - Pro: $9.99/month, unlimited
  - Hosting Only: $2.99/month
```

#### 2. Pricing Page (`/pricing`)
**Purpose**: Detailed plan comparison
**Features**:
- 4 pricing cards (Free, Builder, Pro, Hosting Only)
- Feature comparison table
- Monthly/Yearly toggle (10% discount for yearly)
- FAQ section specific to pricing
- CTA: "اشترك الآن" buttons

**Pricing Details**:
```typescript
const plans = {
  free: {
    name: 'مجاني',
    price: 0,
    limits: { daily: 3, tokens: 50000 },
    features: ['3 توليدات يومياً', 'معاينة مباشرة', 'حفظ المشاريع']
  },
  builder: {
    name: 'باني',
    price: 4.99,
    limits: { daily: 50, tokens: 500000 },
    features: ['50 توليداً يومياً', 'تاريخ الكود', 'أولوية الدعم']
  },
  pro: {
    name: 'محترف',
    price: 9.99,
    limits: { daily: -1, tokens: -1 }, // unlimited
    features: ['توليدات غير محدودة', 'نشر مباشر', 'دعم VIP']
  },
  hosting_only: {
    name: 'استضافة فقط',
    price: 2.99,
    limits: { daily: 0, tokens: 0 },
    features: ['استضافة على Vercel', 'دومين مخصص', 'SSL مجاني']
  }
}
```

#### 3. Sign Up Page (`/sign-up`)
**Purpose**: User registration
**Features**:
- Email + Password fields
- Password confirmation field
- Name field (optional)
- Terms & Privacy checkboxes
- Social auth buttons (Google, GitHub) - optional
- Link to /sign-in
- RTL form layout

**Validation Rules**:
- Email: valid format, unique
- Password: min 8 chars, 1 uppercase, 1 number
- Password confirmation: must match

#### 4. Sign In Page (`/sign-in`)
**Purpose**: User login
**Features**:
- Email + Password fields
- "Remember me" checkbox
- "Forgot password?" link to /reset-password
- Link to /sign-up
- Same social auth as sign-up

#### 5. Reset Password Page (`/reset-password`)
**Purpose**: Password recovery
**Features**:
- Email field (step 1)
- New password fields (step 2, after email link)
- Success message with redirect to /sign-in

#### 6. Privacy Policy Page (`/privacy`)
**Content**:
- Data collection practices
- Cookie usage
- Third-party services (generic, NOT specific vendors)
- User rights (GDPR compliance)
- Contact information

#### 7. Terms of Service Page (`/terms`)
**Content**:
- Acceptable use policy
- Service limitations
- Refund policy
- Liability disclaimers

### Protected Pages (Require Auth)

#### 8. Dashboard (`/dashboard`)
**Purpose**: Main user hub
**Layout**: Two-column with sidebar
**Features**:
- Left sidebar: Navigation menu
  - Projects (active)
  - Templates
  - Account
  - Billing
  - Logout
- Main area: Project list or selected tab content

**Projects Tab**:
- Grid of project cards (3 columns)
- Each card shows:
  - Project name
  - Created date
  - Status badge (draft/preview/deployed)
  - Thumbnail (if deployed)
  - Action buttons: Open, Delete
- "New Project" button (prominent, gradient)
- Search/filter bar

**Templates Tab**:
- Grid of template cards
- Categories: Landing, Dashboard, E-commerce, Portfolio
- Each template card:
  - Name
  - Thumbnail
  - "Use Template" button
  - Preview button

**Account Tab**:
- User info form (name, email)
- Change password section
- Delete account (danger zone)

**Billing Tab**:
- Current plan card
- Usage stats (generations used today)
- Upgrade/Downgrade buttons
- Payment method (UPayments)
- Invoice history table

#### 9. Builder (`/builder?project=<id>`)
**Purpose**: Main code generation workspace
**Layout**: 3-column resizable panels
**Features**:

**Top Navigation Bar**:
- Logo + "KW APPS" branding
- Project name (editable)
- Save button (shows "Saving..." when active)
- Deploy button (green gradient)
- User menu dropdown (account, logout)

**Column 1 - Chat Panel (30% width)**:
- Header: "محادثة المشروع"
- Usage indicator: "X/Y متبقي" (remaining generations)
- Messages area (scrollable):
  - User messages: right-aligned, blue gradient bubble
  - AI messages: left-aligned, white bubble with border
  - Show timestamps
  - Show token usage per message
- Input area:
  - Textarea (auto-resize, 80-200px)
  - Placeholder: "صف التطبيق الذي تريد إنشاءه..."
  - Send button (blue gradient)
  - "Ctrl+Enter to send" hint
- Loading states:
  - "جاري تحليل الطلب..." (analyzing)
  - Progress bar with stages:
    1. Analyzing (20%)
    2. Generating (30-60%)
    3. Verifying (80%)
    4. Securing (90%)
    5. Complete (100%)

**Column 2 - Preview Panel (70% width)**:
- Header: "معاينة مباشرة"
- Device mode selector (Desktop/Tablet/Mobile icons)
- Toolbar:
  - "Show Code" / "Live Preview" toggle
  - Copy button
  - Download button
  - Reload button
  - Fullscreen button
- Preview area:
  - react-live LiveProvider wrapper
  - LiveError component (shows errors in red box)
  - LivePreview component (renders generated code)
  - Sandbox message: "معاينة مباشرة بدون عزل"

**Code View** (when "Show Code" toggled):
- Syntax-highlighted code block
- Line numbers
- Copy button

**Empty States**:
- Chat: "ابدأ بإنشاء تطبيقك" with Sparkles icon
- Preview: "لا يوجد معاينة بعد" with Monitor icon

#### 10. Deploy Success Page (`/deploy/success?project=<id>`)
**Purpose**: Confirmation after deployment
**Features**:
- Success icon/animation
- Deployed URL (clickable link)
- "View Site" button
- "Back to Builder" button
- Social share buttons (optional)

---

## 🔧 API Routes

### 1. `/api/generate` (POST)
**Purpose**: Main AI code generation endpoint
**Method**: POST with SSE streaming
**Authentication**: Required (Supabase session)

**Request Body**:
```typescript
{
  prompt: string,         // Arabic prompt
  project_id?: string,    // Optional, creates new if not provided
  current_code?: string   // Optional, for iteration
}
```

**Response**: Server-Sent Events (SSE)
```typescript
// Progress events
data: {"type":"progress","data":{"stage":"generating","percent":50,"message":"جاري إنشاء الكود..."}}

// Code chunk events
data: {"type":"code_chunk","data":"function App() {"}

// Complete event
data: {"type":"complete","data":{"code":"...","tokens":1500,"projectId":"..."}}

// Error event
data: {"type":"error","data":{"message":"...","messageAr":"..."}}
```

**Logic Flow**:
1. Validate auth & prompt
2. Check user plan limits
3. Create/load project
4. Save user message to DB
5. Call DeepSeek API with streaming
6. Extract code from markdown response
7. Clean code (remove imports/exports for react-live)
8. Stream code chunks to client
9. Save assistant message to DB
10. Save code to generated_code table
11. Update project with latest code
12. Track usage (tokens, daily count)

**DeepSeek Integration**:
```typescript
// System Prompt (Markdown format)
const systemPrompt = `You are an expert React developer...

RESPONSE FORMAT:
- Brief explanation in Arabic (2-3 sentences)
- Code in markdown block:

\`\`\`tsx
function App() {
  return <div dir="rtl">...</div>
}
\`\`\`

CODE REQUIREMENTS:
- Single function component
- No imports (React available globally)
- RTL support (dir="rtl")
- Cairo font
- Inline all JSX
`

// Code Extraction
const codeBlockRegex = /```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/g
const matches = []
while ((match = regex.exec(response))) {
  matches.push(match[1].trim())
}
const code = matches[0] || response // fallback

// Clean for react-live
code = code.replace(/^import\s+.*$/gm, '')
code = code.replace(/^export\s+default\s+/gm, '')
```

### 2. `/api/analyze` (POST)
**Purpose**: Pre-generation prompt analysis for clarification
**Method**: POST
**Authentication**: Required

**Request Body**:
```typescript
{
  prompt: string
}
```

**Response**:
```typescript
{
  needsClarification: boolean,
  questions?: [{
    id: string,
    question: string,
    options: [{
      value: string,
      label: string,
      description: string
    }]
  }]
}
```

**Logic**: Use DeepSeek to analyze if prompt is ambiguous, return clarifying questions

### 3. `/api/projects` (GET, POST, PUT, DELETE)
**Purpose**: CRUD operations for projects

**GET /api/projects**:
- Returns user's projects list
- Query params: limit, offset, status

**POST /api/projects**:
- Creates new project
- Body: { name, description }

**PUT /api/projects/:id**:
- Updates project
- Body: { name?, description?, generated_code?, status? }

**DELETE /api/projects/:id**:
- Deletes project and all related data

### 4. `/api/projects/:id/messages` (GET)
**Purpose**: Get chat history for a project

**Response**:
```typescript
{
  messages: [{
    id: string,
    role: 'user' | 'assistant',
    content: string,
    tokens_used: number,
    created_at: string
  }]
}
```

### 5. `/api/deploy` (POST)
**Purpose**: Deploy project to Vercel

**Request Body**:
```typescript
{
  projectId: string
}
```

**Logic**:
1. Get project code from DB
2. Create Vercel project via Vercel API
3. Deploy code
4. Return deployment URL
5. Update project with deployment_url

**Response**:
```typescript
{
  success: boolean,
  url?: string,
  error?: string
}
```

### 6. `/api/billing/create-checkout` (POST)
**Purpose**: Create UPayments checkout session

**Request Body**:
```typescript
{
  plan: 'builder' | 'pro' | 'hosting_only',
  billingCycle: 'monthly' | 'yearly'
}
```

**Response**:
```typescript
{
  checkoutUrl: string
}
```

### 7. `/api/billing/webhook` (POST)
**Purpose**: Handle UPayments webhooks

**Logic**:
- Verify webhook signature
- Update subscription status in DB
- Send confirmation email

---

## 🔐 Authentication Flow

### Sign Up Flow
1. User fills form on /sign-up
2. Call `supabase.auth.signUp({ email, password })`
3. Supabase sends confirmation email
4. User clicks email link → auto-login
5. Redirect to /dashboard
6. Create user record in users table (trigger)

### Sign In Flow
1. User fills form on /sign-in
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. On success, redirect to /dashboard
4. On error, show error message

### Password Reset Flow
1. User enters email on /reset-password
2. Call `supabase.auth.resetPasswordForEmail(email)`
3. Supabase sends reset email with link
4. Link goes to /reset-password?token=xxx
5. User enters new password
6. Call `supabase.auth.updateUser({ password })`
7. Redirect to /sign-in

### Session Management
- Use `@supabase/ssr` for server-side session handling
- Middleware checks auth on protected routes
- Auto-redirect to /sign-in if not authenticated
- Refresh tokens automatically

---

## 🎨 Component Structure

### Shared Components

#### `<Button />`
- Variants: default, outline, ghost, destructive
- Sizes: sm, md, lg
- Props: loading?, disabled?, icon?
- Styling: shadcn/ui with Cairo font

#### `<Input />`, `<Textarea />`
- RTL-aware
- Cairo font
- Border focus states
- Error states with red border

#### `<Card />`
- Container component
- Consistent padding, shadows, borders
- Variants: default, outlined, elevated

#### `<BuilderNav />`
- Top navigation for builder page
- Props: projectName, onSave, onDeploy, isSaving, isDeploying, hasChanges

#### `<ChatPanel />`
- Chat interface for builder
- Props: projectId, onCodeGenerated, currentCode
- Manages message history and streaming

#### `<PreviewPanel />`
- Live code preview using react-live
- Props: code, isLoading
- Device mode switching
- Code/Preview toggle

#### `<ClarificationPanel />`
- Shows clarifying questions before generation
- Props: questions, onConfirm, onSkip
- Radio button options

#### `<PricingCard />`
- Displays plan details
- Props: plan, isPopular?, onSelect
- Feature list with checkmarks

#### `<ProjectCard />`
- Grid card for project display
- Props: project, onOpen, onDelete
- Hover effects, status badges

#### `<TemplateCard />`
- Grid card for templates
- Props: template, onUse, onPreview
- Thumbnail image, category badge

---

## 🔄 State Management

### Global State (Context)
- AuthContext: user, session, loading
- ThemeContext: theme (future: dark mode)

### Local State (useState, useReducer)
- Component-specific state
- Form state
- UI state (modals, loading, etc.)

### Server State (React Query - optional)
- Projects list
- Messages history
- User data
- Cached with react-query

---

## 🚀 Deployment & Environment

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# DeepSeek API
DEEPSEEK_API_KEY=sk-xxx

# UPayments
UPAYMENTS_API_KEY=xxx
UPAYMENTS_SECRET_KEY=xxx

# Vercel
VERCEL_TOKEN=xxx

# App URL
NEXT_PUBLIC_APP_URL=https://kwq8.com
```

### Deployment Checklist
1. Database migrations applied
2. RLS policies enabled
3. Environment variables set
4. Edge functions deployed
5. DNS configured
6. SSL certificate active

---

## 🧪 Testing Requirements

### Unit Tests
- API route handlers
- Utility functions (code extraction, cleaning)
- Component rendering

### Integration Tests
- Auth flow (sign up, sign in, reset)
- Generation flow (prompt → code → preview)
- Billing flow (checkout → webhook → upgrade)

### E2E Tests (Playwright)
- Complete user journey:
  1. Sign up
  2. Create project
  3. Generate code
  4. Edit/iterate
  5. Deploy
  6. Upgrade plan

---

## 📊 Analytics & Monitoring

### Track Events
- Page views
- Sign ups
- Generations (successful, failed)
- Deploys
- Upgrades
- Errors

### Metrics Dashboard
- Daily active users
- Generations per day
- Conversion rate (free → paid)
- Churn rate
- Revenue

---

## 🔒 Security Requirements

### Input Validation
- Sanitize all user inputs
- Validate prompt length (max 5000 chars)
- Rate limiting on API routes (10 req/min per user)

### Code Execution Safety
- react-live sandbox mode
- No eval() of untrusted code
- XSS prevention

### Data Protection
- RLS on all tables
- Encrypt sensitive data
- HTTPS only
- CORS restrictions

---

## 🌐 Internationalization (Future)

### Arabic (Primary)
- All UI text in Arabic
- RTL layout
- Cairo font

### English (Secondary - Future)
- Translation files
- Language switcher
- LTR layout support

---

## 🎯 Performance Optimization

### Frontend
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Lazy loading components
- Debounce inputs
- Memoize expensive computations

### Backend
- Database indexes on foreign keys
- Connection pooling
- Caching (Redis - future)
- CDN for static assets

### Monitoring
- Vercel Analytics
- Sentry for error tracking
- Database query performance

---

## 📱 Mobile Responsiveness

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Design
- Stack panels vertically on mobile
- Touch-friendly buttons (min 44x44px)
- Collapsible navigation
- Swipeable cards

### Builder Mobile Layout
- Single column
- Tabs: Chat | Preview
- Bottom navigation

---

## 🔄 Version Control & Collaboration

### Git Workflow
- Main branch: production
- Develop branch: staging
- Feature branches: feature/xxx
- Commit format: type(scope): message

### CI/CD Pipeline
- GitHub Actions
- Auto-deploy to Vercel on push
- Run tests before deploy
- Database migrations in CI

---

## 📚 Documentation

### Code Documentation
- JSDoc comments for functions
- README for each major feature
- API documentation (Swagger/OpenAPI)

### User Documentation
- Help center articles
- Video tutorials
- FAQ
- In-app tooltips

---

## 🚧 Future Features (Phase 2)

1. **Component Library**:
   - Pre-built UI components users can request
   - "Add a navbar" → inserts navbar code

2. **Code Editor**:
   - Monaco editor for manual editing
   - Syntax highlighting
   - Auto-save

3. **Collaboration**:
   - Share projects with team members
   - Real-time co-editing
   - Comments on code

4. **Version Control**:
   - Git integration
   - Commit history
   - Rollback to previous versions

5. **Custom Domains**:
   - Link custom domains to deployed sites
   - SSL certificates

6. **Templates Marketplace**:
   - User-submitted templates
   - Premium templates

7. **AI Improvements**:
   - Multi-file projects
   - Backend code generation (API routes)
   - Database schema generation

---

## 🎬 Getting Started Instructions for Lovable

### Step 1: Initial Prompt
```
Create a new Next.js 16 project called "KW APPS" - an Arabic-first AI-powered website builder.

Technology stack:
- Next.js 16 (App Router, TypeScript)
- Supabase (auth + database)
- Tailwind CSS + shadcn/ui
- react-live for preview
- DeepSeek AI integration
- RTL layout with Cairo font

Start with the landing page (/) with:
- Hero section with gradient background
- "أنشئ تطبيقك بالذكاء الاصطناعي" as main heading
- CTA button "ابدأ مجاناً" linking to /sign-up
- Features grid (4 cards with icons)
- Pricing preview section
```

### Step 2: Authentication Pages
```
Add authentication pages using Supabase:

1. Sign Up page (/sign-up):
   - Email, password, password confirmation, name
   - Validation: email format, password strength (min 8, 1 upper, 1 number)
   - Link to /sign-in
   - RTL form with Cairo font

2. Sign In page (/sign-in):
   - Email, password
   - "Remember me" checkbox
   - "Forgot password?" link
   - Link to /sign-up

3. Reset Password page (/reset-password):
   - Email input (step 1)
   - New password fields (step 2)
```

### Step 3: Dashboard
```
Create protected dashboard (/dashboard) with:
- Sidebar navigation (Projects, Templates, Account, Billing, Logout)
- Projects grid (3 columns)
- Each project card shows name, date, status, actions
- "New Project" button (gradient, prominent)
- Requires authentication (redirect to /sign-in if not logged in)
```

### Step 4: Builder Interface
```
Create builder page (/builder?project=<id>) with resizable 3-column layout:

Left Panel (30%): Chat Interface
- Header "محادثة المشروع"
- Messages area (scrollable)
- Input textarea with send button
- Loading states with progress bar

Right Panel (70%): Preview
- Header "معاينة مباشرة"
- Device selector (Desktop/Tablet/Mobile)
- react-live LiveProvider for rendering code
- Error display with LiveError
- Code/Preview toggle

Top: Navigation bar with project name, save, deploy buttons
```

### Step 5: API Routes
```
Create API routes:

1. /api/generate (POST):
   - Accepts: { prompt, project_id?, current_code? }
   - Streams SSE events for progress
   - Calls DeepSeek API
   - Extracts code from markdown
   - Returns generated code

2. /api/projects (CRUD):
   - GET: list user's projects
   - POST: create new project
   - PUT: update project
   - DELETE: delete project

3. /api/deploy (POST):
   - Deploy to Vercel
   - Return deployment URL
```

### Step 6: Database Schema
```
Create Supabase tables with RLS:
- users (extends auth.users)
- projects
- messages
- generated_code
- usage_limits
- subscriptions
- templates

(Provide full SQL schema from above)
```

### Step 7: Integrate DeepSeek AI
```
Add DeepSeek integration in /api/generate:
- System prompt encouraging markdown format
- Code extraction regex: /```(?:tsx?|jsx?)?\s*\n([\s\S]*?)```/g
- Clean code (remove imports/exports for react-live)
- Stream responses with SSE
```

### Step 8: Pricing & Billing
```
Create pricing page (/pricing) with:
- 4 pricing cards (Free, Builder, Pro, Hosting Only)
- Feature comparison table
- "اشترك الآن" buttons
- Integrate UPayments checkout
```

### Step 9: Polish & Deploy
```
Final polish:
- Mobile responsive design
- Loading states
- Error handling
- Empty states
- Success messages
- Deploy to Vercel
```

---

## 📋 Acceptance Criteria

The rebuilt KW APPS should have:

✅ **Functionality**:
- User can sign up, sign in, reset password
- User can create projects
- User can chat with AI in Arabic
- AI generates React code from prompts
- Live preview updates automatically
- User can save and deploy projects
- Usage limits enforced per plan
- Billing integration with UPayments

✅ **UI/UX**:
- Fully RTL layout
- Arabic text with Cairo font
- Blue & Slate color scheme
- Smooth animations (Framer Motion)
- Mobile responsive
- Loading states for all async actions
- Error messages in Arabic

✅ **Performance**:
- Page load < 3s
- Code generation < 10s
- Preview updates instantly
- No hydration errors
- SEO optimized (meta tags, sitemap)

✅ **Security**:
- RLS enabled on all tables
- Input validation
- Rate limiting
- HTTPS only
- XSS prevention

✅ **Code Quality**:
- TypeScript strict mode
- ESLint + Prettier
- Component documentation
- Clean architecture (separation of concerns)
- Reusable components

---

## 🎓 Additional Context

### Why This Architecture?

1. **Lovable Pattern** - Code extraction from markdown:
   - More reliable than forcing AI format
   - AI can add explanations (better UX)
   - Works with any AI output

2. **react-live** - Live preview:
   - No iframe complexity
   - Instant rendering
   - Shows errors inline
   - Battle-tested library

3. **Supabase** - Backend:
   - Handles auth, database, storage
   - RLS for security
   - Real-time subscriptions
   - Edge functions for serverless

4. **Next.js 16** - Frontend:
   - Server components (performance)
   - App Router (modern)
   - API routes (backend logic)
   - Vercel deployment

### Key Differentiators

- **Arabic-First**: Not just translated, designed for Arabic from ground up
- **AI-Powered**: Not templates, actual code generation
- **Local Market**: UPayments for Kuwait, K-Net support
- **Simple UX**: Chat interface, not complex form builders
- **Instant Preview**: See your app while AI builds it

---

## 🏁 Final Notes

This is a **complete specification** for rebuilding KW APPS. Implement features **iteratively**:

1. Start with landing page + auth
2. Add dashboard + project management
3. Build the builder (chat + preview)
4. Integrate AI generation
5. Add billing & deployment
6. Polish & launch

Ask clarifying questions if anything is unclear. Prioritize **core functionality** over nice-to-haves.

**Good luck building KW APPS! 🚀**
