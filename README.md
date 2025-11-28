# KW APPS - كي دبليو آبس

**Arabic-First AI App Builder for Kuwait & GCC Markets**

Build complete web applications using natural Arabic conversation, powered by DeepSeek AI.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and DeepSeek credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

## ✨ Features

- **🇸🇦 Arabic-First**: Full RTL UI with Cairo font
- **🤖 AI-Powered**: Generate apps using natural Arabic prompts
- **⚡ Instant Preview**: Live iframe updates as you chat
- **📦 Template Gallery**: Pre-built templates for common use cases
- **💳 Kuwait Payments**: UPayments integration (K-Net + Cards)
- **🚀 One-Click Deploy**: Instant Vercel deployment

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Engine**: DeepSeek Coder + Chat
- **Payments**: UPayments (Kuwait)
- **Hosting**: Vercel
- **Animations**: Framer Motion

## 📁 Project Structure

```
kwapps/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout (RTL + Arabic)
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Brand colors + styles
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── landing/         # Landing page sections
│   ├── lib/
│   │   ├── supabase/        # Supabase clients
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── index.ts         # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## 🎨 Design System

### Brand Colors
- **Primary**: `#0f172a` (Slate 900) - Dark, professional
- **Accent**: `#3b82f6` (Blue 500) - CTAs, highlights
- **Background**: Gradient from slate-50 to white with noise texture

### Typography
- **Font**: Cairo (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Direction**: RTL (Right-to-Left)

### Components
- Cards: White background, shadow-md, rounded-xl, hover lift
- Buttons: Primary (accent) + Outline variants
- Inputs: Slate border, focus ring
- Animations: Framer Motion (staggered fade-up)

## 💰 Pricing

| Tier | Price | Daily Limit | Features |
|------|-------|-------------|----------|
| **FREE** | 0 KWD | 3 prompts | Basic templates, Preview only |
| **BUILDER** | 33 KWD/mo | 30 prompts | All templates, Code export, Priority support |
| **PRO** | 59 KWD/mo | 100 prompts | Premium templates, Deploy, Version control |

**Hosting**: 5 KWD/month per app

## 🗄 Database Schema

Run `supabase/schema.sql` in your Supabase SQL Editor to create:

- `users` - User accounts
- `projects` - User projects
- `messages` - Chat history
- `templates` - App templates
- `subscriptions` - Billing
- `usage_limits` - Usage tracking
- `project_versions` - Version control
- `user_assets` - File uploads
- `billing_events` - Payment logs
- `analytics_events` - Analytics

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DeepSeek AI
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_CODE_MODEL=deepseek-coder
DEEPSEEK_CHAT_MODEL=deepseek-chat

# UPayments
UPAYMENTS_API_KEY=your_upayments_key
UPAYMENTS_MERCHANT_ID=your_merchant_id
UPAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://kwapps.com
NEXT_PUBLIC_APP_NAME=KW APPS
```

## 📋 Development Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Next.js + TypeScript setup
- [x] shadcn/ui + Tailwind CSS
- [x] Arabic landing page
- [x] Brand colors + gradients
- [x] Database schema
- [x] Supabase configuration

### 🚧 Phase 2: Core Features (IN PROGRESS)
- [ ] Authentication (login/signup)
- [ ] Builder workspace UI
- [ ] DeepSeek AI integration
- [ ] Project CRUD
- [ ] Template gallery

### 📅 Phase 3: Business Logic
- [ ] UPayments integration
- [ ] Subscription management
- [ ] Usage tracking
- [ ] Billing webhooks

### 🎯 Phase 4: Polish & Deploy
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] E2E tests
- [ ] Production deployment

## 🧪 Testing

```bash
# Run build
npm run build

# Run linter
npm run lint

# Type check
npm run type-check
```

## 📚 Documentation

- [PRD (Product Requirements Document)](./KW-APPS-PRD-v3-Complete.md)
- [Phase 1 Complete](./PHASE-1-COMPLETE.md)
- [Task Checklist](./KW-APPS-Task-Checklist.md)

## 🤝 Contributing

This project is built by Claude Code 5-Agent System:
- **KWAPPS-CHIEF**: Supervisor
- **KWAPPS-DEV**: Full-stack engineer
- **KWAPPS-DESIGN**: UX/UI designer
- **KWAPPS-OPS**: System integrator
- **KWAPPS-GUARD**: QA & guidelines

## 📄 License

Proprietary - All rights reserved © 2025 KW APPS

## 🌐 Links

- Website: [kwapps.com](https://kwapps.com) (coming soon)
- Documentation: [docs.kwapps.com](https://docs.kwapps.com) (coming soon)
- Support: support@kwapps.com

---

**Made with ❤️ for the Arabic-speaking developer community**

صُنع بـ ❤️ للمطور العربي
