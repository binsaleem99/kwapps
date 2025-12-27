# 🤖 CLAUDE CODE IMPLEMENTATION INSTRUCTIONS
## KWQ8.COM - Arabic-First Vibe Coding Platform
### Read This First Before Any Implementation

---

# PROJECT OVERVIEW

**KWQ8.com** is an AI-powered website builder for Arabic-speaking GCC businesses.

| Attribute | Value |
|-----------|-------|
| Company | Springwood |
| Location | Kuwait 🇰🇼 |
| Target Market | Arabic GCC businesses |
| Tech Stack | Next.js 16 + Supabase + Tailwind |
| AI System | Gemini 3 Pro (orchestration) + DeepSeek (code gen) |
| Payment | **Tap Payments** (NOT UPayments) |
| Currency | Multi-GCC with auto-detection |

---

# FILE READING ORDER

## 📋 Phase 1: Understand the Project (Read First)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 1 | `KWQ8_EXECUTIVE_LAUNCH_PACKAGE.md` | Overall vision, success metrics | 🔴 Critical |
| 2 | `KWQ8_COUNCIL_BRIEFING_COMPLETE.md` | Full project context | 🔴 Critical |
| 3 | `KWQ8_MASTER_TODO_v3.0.md` | All tasks organized by phase | 🔴 Critical |
| 4 | `KWQ8_SPRINT_PLANNING.md` | Week-by-week implementation | 🔴 Critical |

## 🏗️ Phase 2: Core Architecture (Build Foundation)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 5 | `KWQ8_AI_BUILDER_BLUEPRINT.md` | Core AI builder architecture | 🔴 Critical |
| 6 | `KWQ8_DUAL_AI_ORCHESTRATION.md` | Gemini + DeepSeek integration | 🔴 Critical |
| 7 | `GEMINI_ORCHESTRATOR_PROMPT.md` | Gemini system prompt | 🟡 High |
| 8 | `DEEPSEEK_GENERATOR_PROMPT.md` | DeepSeek system prompt | 🟡 High |

## 🎨 Phase 3: Design System (UI Foundation)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 9 | `KWQ8_ARABIC_DESIGN_SYSTEM.md` | Tailwind config, CSS variables | 🔴 Critical |
| 10 | `KWQ8_VALIDATION_RULES.md` | Design validation rules | 🟡 High |
| 11 | `KWQ8_VISUAL_EDITOR.md` | Chat-based editing system | 🟡 High |

## 📄 Phase 4: Templates & Components

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 12 | `KWQ8_TEMPLATE_SYSTEM.md` | 15 Arabic templates (85KB) | 🔴 Critical |
| 13 | `KWQ8_GCC_COMPONENTS.md` | VAT, phone, currency components | 🔴 Critical |
| 14 | `KWQ8_AUTO_PAGE_MEDIA.md` | Auto-page generation, media | 🟡 High |
| 15 | `KWQ8_IMAGE_WHATSAPP.md` | Image handling, WhatsApp bubble | 🟢 Medium |

## 💰 Phase 5: Business Logic (Payments & Credits)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 16 | `KWQ8_TAP_PAYMENTS_INTEGRATION.md` | **NEW: Tap Payments + Currency** | 🔴 Critical |
| 17 | `KWQ8_CREDIT_SYSTEM.md` | Credit-based pricing | 🔴 Critical |
| 18 | `KWQ8_PAYWALL_CONVERSION.md` | Multi-step paywall flows | 🟡 High |

## 🌐 Phase 6: Integrations

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 19 | `KWQ8_DOMAIN_INTEGRATION.md` | Namecheap API | 🟡 High |
| 20 | `KWQ8_ADMIN_DASHBOARD.md` | Auto-generated admin dashboards | 🟡 High |

## 📚 Phase 7: Reference (As Needed)

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 21 | `KWQ8_COMPETITOR_ANALYSIS.md` | Market research | 🟢 Low |
| 22 | Project knowledge files | n8n, Claude Code guides | 🟢 Low |

---

# CRITICAL IMPLEMENTATION RULES

## ⚠️ MUST FOLLOW

### 1. Payment System
```
❌ DO NOT USE: UPayments
✅ USE: Tap Payments (see KWQ8_TAP_PAYMENTS_INTEGRATION.md)
```

### 2. Currency System
```
✅ Auto-detect user's country from IP
✅ Display prices in local currency (KWD, SAR, AED, QAR, BHD, OMR)
✅ Allow manual currency switching
✅ Store all amounts in KWD internally, convert for display
```

### 3. Recurring Payments
```
✅ Use Tap Subscriptions API
✅ Support: weekly trial (1 KWD), monthly, annual
✅ Implement dunning (3 retry attempts over 7 days)
✅ Webhook handling for all subscription events
```

### 4. RTL-First Design
```
✅ dir="rtl" on html element by default
✅ Use Tailwind RTL utilities (start/end, not left/right)
✅ Arabic fonts: Tajawal (default), Cairo, Amiri
✅ All UI text in Arabic
```

### 5. AI Architecture
```
✅ Gemini 3 Pro = Orchestrator (understands user, asks questions)
✅ DeepSeek = Code Generator (writes actual code)
✅ Gemini validates DeepSeek output before sending to user
```

---

# SPRINT IMPLEMENTATION ORDER

## Sprint 1 (Week 1): Foundation
```bash
# Read these files:
- KWQ8_AI_BUILDER_BLUEPRINT.md (sections 1-3)
- KWQ8_ARABIC_DESIGN_SYSTEM.md (all)

# Implement:
- 5 core editing tools (str_replace_editor, create_file, etc.)
- Arabic design system in Tailwind
- RTL base layout
```

## Sprint 2 (Week 2): Gemini Integration
```bash
# Read these files:
- KWQ8_DUAL_AI_ORCHESTRATION.md (Gemini sections)
- GEMINI_ORCHESTRATOR_PROMPT.md

# Implement:
- Gemini API connection
- Parameter extraction (business type, language, styling)
- Clarifying questions system
- Arabic language detection
```

## Sprint 3 (Week 3): DeepSeek Integration
```bash
# Read these files:
- KWQ8_DUAL_AI_ORCHESTRATION.md (DeepSeek sections)
- DEEPSEEK_GENERATOR_PROMPT.md

# Implement:
- DeepSeek API connection
- Code generation pipeline
- Gemini validation loop
- Fix-and-revalidate system
```

## Sprint 4 (Week 4): Design Validation
```bash
# Read these files:
- KWQ8_VALIDATION_RULES.md
- KWQ8_VISUAL_EDITOR.md

# Implement:
- Design system validator
- Semantic token enforcement
- RTL auto-correction
- Chat-based visual editor
```

## Sprint 5 (Week 5): Templates
```bash
# Read these files:
- KWQ8_TEMPLATE_SYSTEM.md (85KB - critical!)

# Implement:
- Template 1: Arabic E-commerce
- Template 2: Arabic Restaurant
- Template 3: Arabic Corporate
- Template selection UI
```

## Sprint 6 (Week 6): GCC Components
```bash
# Read these files:
- KWQ8_GCC_COMPONENTS.md

# Implement:
- VATCalculator component
- GCCPhoneInput component
- CurrencyDisplay component
- ArabicInvoice component
- ArabicAddress component
- ContactFormArabic component
```

## Sprint 7 (Week 7): Payments ⚠️ CRITICAL
```bash
# Read these files:
- KWQ8_TAP_PAYMENTS_INTEGRATION.md (NEW - replaces UPayments)
- KWQ8_CREDIT_SYSTEM.md

# Implement:
- Tap Payments SDK integration
- Auto-currency detection
- Subscription plans (all tiers)
- Webhook handlers
- Dunning/retry logic
- Credit system
- 1 KWD/week trial
```

## Sprint 8 (Week 8): Publishing
```bash
# Read these files:
- KWQ8_DOMAIN_INTEGRATION.md

# Implement:
- Vercel deployment pipeline
- GitHub repo creation
- Namecheap domain API
- Domain search/purchase flow
- SSL provisioning
```

## Sprint 9 (Week 9): Admin Dashboards
```bash
# Read these files:
- KWQ8_ADMIN_DASHBOARD.md

# Implement:
- Auto-generated admin dashboard per project
- User management CRUD
- Product management
- Sales analytics
- Arabic admin UI
```

## Sprint 10 (Week 10): Launch
```bash
# Read these files:
- KWQ8_PAYWALL_CONVERSION.md
- KWQ8_EXECUTIVE_LAUNCH_PACKAGE.md

# Implement:
- Multi-step paywall (3 screens)
- Trial toggle
- Transaction abandonment recovery
- E2E testing
- Beta testing with 20 users
- Product Hunt submission
```

---

# KEY ARCHITECTURE DECISIONS

## Database: Supabase

```sql
-- Core tables (see individual specs for full schemas)
- users
- projects  
- messages (AI conversation history)
- templates
- user_assets
- subscriptions (Tap integration)
- user_credits
- billing_events
- exchange_rates
- webhook_events
```

## AI Flow

```
User Prompt (Arabic)
       ↓
┌─────────────────┐
│  Gemini 3 Pro   │ ← Orchestrator
│  - Analyze      │
│  - Ask questions│
│  - Build prompt │
└────────┬────────┘
         ↓
┌─────────────────┐
│    DeepSeek     │ ← Code Generator
│  - Generate code│
│  - RTL default  │
│  - Arabic fonts │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Gemini 3 Pro   │ ← Validator
│  - Check RTL    │
│  - Check design │
│  - Check GCC    │
└────────┬────────┘
         ↓
    User Preview
```

## Payment Flow (Tap)

```
User Selects Plan
       ↓
Currency Auto-Detected (IP)
       ↓
Price Displayed in Local Currency
       ↓
┌─────────────────┐
│   goSell.js     │ ← Tap Checkout
│  - Card/KNET    │
│  - Apple Pay    │
│  - mada         │
└────────┬────────┘
         ↓
Tap Webhook → Supabase
         ↓
Credits Granted to User
         ↓
Subscription Active
```

---

# ENVIRONMENT VARIABLES NEEDED

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI APIs
GEMINI_API_KEY=
DEEPSEEK_API_KEY=

# Tap Payments (NOT UPayments!)
TAP_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_TAP_PUBLIC_KEY=pk_live_xxx
TAP_WEBHOOK_SECRET=whsec_xxx

# Currency Exchange
EXCHANGE_API_KEY=

# Namecheap
NAMECHEAP_API_USER=
NAMECHEAP_API_KEY=

# Vercel
VERCEL_TOKEN=

# GitHub
GITHUB_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://kwq8.com
```

---

# COMMON MISTAKES TO AVOID

| ❌ Don't | ✅ Do |
|----------|-------|
| Use UPayments | Use Tap Payments |
| Hard-code prices in KWD | Auto-convert to user's currency |
| Use `left/right` in CSS | Use `start/end` for RTL |
| English-first UI | Arabic-first, RTL default |
| Single currency | Support all 6 GCC currencies |
| Skip Gemini validation | Always validate DeepSeek output |
| Ignore VAT | Calculate VAT per country (0-15%) |
| One-time payments only | Recurring subscriptions |
| Manual admin dashboards | Auto-generate per project |

---

# SUCCESS CRITERIA

Before considering implementation complete:

- [ ] All UI displays in Arabic (RTL)
- [ ] Currency auto-detects from IP
- [ ] Prices show in local currency
- [ ] Tap Payments checkout works
- [ ] Subscriptions renew automatically
- [ ] Failed payments retry 3 times
- [ ] Gemini asks clarifying questions
- [ ] DeepSeek generates RTL code
- [ ] Gemini validates all output
- [ ] 3+ templates working
- [ ] Admin dashboard auto-generates
- [ ] Domain purchase works
- [ ] Credits deduct correctly
- [ ] VAT calculates per country

---

# QUICK REFERENCE

## Pricing Tiers (KWD)
| Tier | Monthly | Annual | Credits/Day |
|------|---------|--------|-------------|
| Basic | 22.99 | 229.90 | 100 |
| Pro | 37.50 | 375.00 | 200 |
| Premium | 58.75 | 587.50 | 400 |
| Enterprise | 74.50 | 745.00 | 800 |
| Trial | 1.00/week | - | 100 |

## VAT Rates
| Country | VAT |
|---------|-----|
| Kuwait | 0% |
| Saudi Arabia | 15% |
| UAE | 5% |
| Bahrain | 10% |
| Oman | 5% |
| Qatar | 0% |

## Currency Decimals
| Currency | Decimals |
|----------|----------|
| KWD, BHD, OMR | 3 |
| SAR, AED, QAR | 2 |

---

**Document Version:** 1.0  
**For:** Claude Code Implementation  
**Created:** December 27, 2025  
**Start Sprint 1:** December 29, 2025
