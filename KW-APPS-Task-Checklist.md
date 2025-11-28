# KW APPS — Complete Implementation Task List

## 📋 Overview

**Product Name:** KW APPS (كي دبليو آبس)
**Stack:** Next.js 14 + Supabase + DeepSeek + UPayments + Vercel
**Agent System:** 5 Agents (CHIEF, DEV, DESIGN, OPS, GUARD)
**Timeline:** 2-3 days with Claude Code

---

## ✅ Pre-Implementation Checklist

Before starting, ensure you have:

- [ ] Supabase account created (free tier)
- [ ] DeepSeek API key obtained (https://platform.deepseek.com)
- [ ] UPayments merchant account (apply at upayments.com)
- [ ] Vercel account (free tier)
- [ ] GitHub account connected
- [ ] Claude Code ($200 account) ready
- [ ] Domain purchased (kwapps.com or similar)

---

## 🎯 Phase 1: Foundation (Day 1 — 4-6 hours)

### 1.1 Project Setup
- [ ] Create Next.js project: `npx create-next-app@latest kwapps --typescript --tailwind --eslint --app`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install zustand @tanstack/react-query
  npm install framer-motion lucide-react zod
  ```
- [ ] Initialize shadcn/ui: `npx shadcn@latest init`
- [ ] Add 21st.dev components:
  ```bash
  npx shadcn@latest add button card input textarea dialog
  ```

### 1.2 Supabase Setup
- [ ] Create Supabase project (region: eu-central or me-south)
- [ ] Enable Email + Google auth providers
- [ ] Run complete database schema (all 10 tables)
- [ ] Configure RLS policies for each table
- [ ] Create storage bucket for user assets
- [ ] Copy URL, anon key, service role key

### 1.3 Environment Configuration
- [ ] Create `.env.local` with all variables
- [ ] Verify Supabase connection
- [ ] Test DeepSeek API key
- [ ] Configure NEXT_PUBLIC_APP_URL

### 1.4 Base Layout (RTL + Arabic)
- [ ] Configure Cairo font in layout.tsx
- [ ] Set `dir="rtl"` and `lang="ar"` on html
- [ ] Create basic navigation component
- [ ] Set up Tailwind RTL utilities
- [ ] Create i18n/ar.json with all UI strings

---

## 🎯 Phase 2: Core UI (Day 1-2 — 4-6 hours)

### 2.1 Landing Page
- [ ] Hero section with Arabic text
- [ ] Features section (3-4 cards)
- [ ] Template showcase section
- [ ] Pricing section (Free / 33 KWD / 59 KWD)
- [ ] CTA buttons
- [ ] Footer with links
- [ ] Framer Motion animations (staggered fade-up)

### 2.2 Authentication Pages
- [ ] Login page (email + Google)
- [ ] Signup page
- [ ] Password reset flow
- [ ] Protected route middleware
- [ ] Arabic error messages

### 2.3 Builder Workspace
- [ ] Two-column layout (RTL: chat right, preview left)
- [ ] Chat panel component with message list
- [ ] Prompt input with send button
- [ ] Preview iframe component
- [ ] Project sidebar with list
- [ ] "مشروع جديد" button
- [ ] Loading states in Arabic

---

## 🎯 Phase 3: AI Integration (Day 2 — 3-4 hours)

### 3.1 DeepSeek API Route
- [ ] Create `/api/generate/route.ts`
- [ ] Implement Arabic detection
- [ ] Translation via DeepSeek Chat
- [ ] Code generation via DeepSeek Coder
- [ ] Strip markdown fences from response
- [ ] Error handling with Arabic messages

### 3.2 Usage Tracking
- [ ] Create `/api/usage/route.ts`
- [ ] Track daily prompt count per user
- [ ] Check limits before generation:
  - Free: 3/day
  - Builder: 30/day
  - Pro: 100/day
- [ ] Show usage counter in UI
- [ ] Upgrade prompt when limit reached

### 3.3 Preview System
- [ ] Implement iframe preview with srcdoc
- [ ] Add sandbox security attributes
- [ ] Handle code rendering errors
- [ ] Add refresh/reload functionality

---

## 🎯 Phase 4: Projects & Templates (Day 2 — 3-4 hours)

### 4.1 Project CRUD
- [ ] Create `/api/projects/route.ts` (GET, POST)
- [ ] Create `/api/projects/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Implement project list in sidebar
- [ ] Auto-save generated code to project
- [ ] Project status tracking

### 4.2 Template Gallery
- [ ] Create `/app/templates/page.tsx`
- [ ] Seed 5 basic templates in database:
  - E-commerce (متجر)
  - Restaurant (مطعم)
  - Landing page (صفحة هبوط)
  - Portfolio (معرض أعمال)
  - Dashboard (لوحة تحكم)
- [ ] Template card component with preview
- [ ] "استخدم هذا القالب" button
- [ ] Template customization modal:
  - Brand name input
  - Color picker
  - Logo upload

### 4.3 Asset Management
- [ ] Create `/api/assets/upload/route.ts`
- [ ] Implement Supabase Storage upload
- [ ] Support: logo, hero, product images
- [ ] File size validation
- [ ] Format validation (PNG, JPG, WebP, SVG)

---

## 🎯 Phase 5: Billing (Day 3 — 2-3 hours)

### 5.1 UPayments Integration
- [ ] Create `/api/billing/checkout/route.ts`
- [ ] Create `/api/billing/webhook/route.ts`
- [ ] Implement checkout flow:
  - Builder: 33 KWD
  - Pro: 59 KWD
- [ ] Handle webhook signature verification
- [ ] Update subscription on payment success

### 5.2 Subscription Management
- [ ] Create `/api/billing/subscription/route.ts`
- [ ] Show current plan in dashboard
- [ ] Upgrade/downgrade flow
- [ ] Cancel subscription option
- [ ] Grace period handling

### 5.3 Pricing Page
- [ ] Create `/app/pricing/page.tsx`
- [ ] Three tier cards (مجاني، المطور، الاحترافي)
- [ ] Feature comparison table
- [ ] "اشترك الآن" buttons
- [ ] Current plan indicator

---

## 🎯 Phase 6: Polish & Testing (Day 3 — 2-3 hours)

### 6.1 Quality Assurance
- [ ] All text verified Arabic
- [ ] RTL layout on all pages
- [ ] Cairo font everywhere
- [ ] Mobile responsive (test on phone)
- [ ] Error messages in Arabic
- [ ] Loading states in Arabic
- [ ] No console errors

### 6.2 Testing
- [ ] Test auth flow (signup → login → logout)
- [ ] Test generation flow (prompt → preview)
- [ ] Test usage limits (free user hits limit)
- [ ] Test payment flow (with UPayments sandbox)
- [ ] Test template selection and customization
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### 6.3 Security Review
- [ ] Check all API routes have auth
- [ ] Verify RLS policies working
- [ ] Test iframe sandbox
- [ ] No exposed API keys in frontend
- [ ] Webhook signature verification

---

## 🎯 Phase 7: Deployment (30 minutes)

### 7.1 Prepare for Production
- [ ] Remove all console.logs
- [ ] Set NODE_ENV=production
- [ ] Optimize images
- [ ] Run `npm run build` locally

### 7.2 Deploy to Vercel
- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Verify deployment works

### 7.3 Configure Domain
- [ ] Add custom domain in Vercel
- [ ] Update DNS records
- [ ] Verify SSL certificate
- [ ] Update NEXT_PUBLIC_APP_URL
- [ ] Update UPayments return URLs

---

## 📝 Compliance Checklist

### Legal
- [ ] Privacy Policy (Arabic + English)
- [ ] Terms of Service (Arabic + English)
- [ ] Cookie consent banner
- [ ] Data processing agreement

### User Rights
- [ ] Account deletion option
- [ ] Data export capability
- [ ] Email preferences
- [ ] Clear pricing display

### Content
- [ ] AI-generated content disclaimer
- [ ] Prohibited content policy
- [ ] DMCA/takedown process

---

## 🔧 5-Agent System Activation

### KWAPPS-CHIEF (Supervisor)
```
"You are KWAPPS-CHIEF, supervisor for KW APPS. Only you talk to the human. 
Assign tasks to DEV/DESIGN/OPS/GUARD. Maintain memory. Approve deployments."
```

### KWAPPS-DEV (Engineer)
```
"You are KWAPPS-DEV, full-stack engineer. Build Next.js frontend + API routes.
Use Supabase. Follow RTL-first design. Never self-assign tasks."
```

### KWAPPS-DESIGN (Designer)
```
"You are KWAPPS-DESIGN, UX/UI designer. Create Arabic screens following 
Master UI Prompt. Avoid AI slop. Use Cairo font. Lovable-style aesthetic."
```

### KWAPPS-OPS (DevOps)
```
"You are KWAPPS-OPS, system integrator. Configure Supabase, DeepSeek, 
UPayments, Vercel. Manage environment variables and deployments."
```

### KWAPPS-GUARD (QA)
```
"You are KWAPPS-GUARD, QA enforcer. Validate all code. Run tests. 
Check Arabic text, RTL layout, security. Block dangerous code."
```

---

## 📊 Success Criteria

### Week 1
- [ ] Landing page live
- [ ] Auth working
- [ ] Basic generation working
- [ ] 10 test signups

### Week 2
- [ ] Templates available
- [ ] Payments working
- [ ] 50 signups
- [ ] 5 paid conversions

### Month 1
- [ ] 100 signups
- [ ] 20 paid users
- [ ] 50 apps generated
- [ ] < 5% churn

---

## 🚨 Known Issues to Handle

1. **DeepSeek Rate Limits**: Implement request queue if needed
2. **Large Code Generation**: May timeout — implement streaming
3. **Arabic Text in Iframe**: Ensure Cairo font loads in preview
4. **UPayments Sandbox**: Test thoroughly before going live
5. **Mobile RTL**: Test flex-row-reverse on all screen sizes

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **DeepSeek API**: https://platform.deepseek.com/docs
- **UPayments**: Contact merchant support
- **Next.js**: https://nextjs.org/docs
- **21st.dev**: https://21st.dev/docs

---

**Ready to build KW APPS! 🚀**

Start with Phase 1 and work through each phase systematically.
