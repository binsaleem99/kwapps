# 🚀 KWQ8.COM MASTER TODO v3.0
## Updated Based on Competitor Analysis (Lovable, v0, Bolt, Cursor)
### Springwood | Kuwait | December 2025

---

# EXECUTIVE SUMMARY: WHAT CHANGED

Based on our competitor analysis of Lovable, v0, Bolt, and Cursor system prompts, we've identified **critical architectural patterns** that ALL successful AI builders use. This TODO has been restructured to implement these patterns FIRST.

## 🔑 KEY DISCOVERIES TO IMPLEMENT

| Discovery | Source | Priority | Impact |
|-----------|--------|----------|--------|
| **Design-First Protocol** | Lovable | P0 | Forces consistent, beautiful output |
| **GenerateDesignInspiration Tool** | v0 | P0 | Automated design brief before coding |
| **Brief Planning (2-4 lines)** | Bolt | P0 | Fast, clear execution path |
| **Semantic Tokens ONLY** | ALL | P0 | Consistent design system |
| **Line-Replace Editing** | Lovable+Cursor | P0 | Surgical edits, token efficient |
| **Parallel Tool Calls** | v0 | P1 | 40-60% faster responses |
| **"Never Re-Read" Rule** | ALL | P1 | Token efficiency |
| **Self-Healing Loop** | Cursor | P1 | Autonomous error fixing |

---

# PHASE 0: CRITICAL ARCHITECTURE (Days 1-5)
## "Must Have Before ANY Code Generation"

### 0.1 FIRST MESSAGE PROTOCOL [From Lovable + v0 + Bolt]

| # | Task | Source | Est | Owner |
|---|------|--------|-----|-------|
| 0.1.1 | Implement ExtractParameters function | v0 pattern | 4h | Backend |
| 0.1.2 | Build Arabic/GCC language detection | KWQ8 unique | 4h | Backend |
| 0.1.3 | Create GenerateDesignInspiration tool | v0 exact copy | 8h | Backend |
| 0.1.4 | Write first-message Gemini prompt | Lovable pattern | 4h | Product |
| 0.1.5 | Add "brief planning" step (2-4 lines) | Bolt pattern | 2h | Product |
| 0.1.6 | Implement design-system-first rule | Lovable CRITICAL | 4h | Backend |
| 0.1.7 | Create completeness checker (ask Qs if missing) | Lovable pattern | 4h | Backend |

**First Message Flow:**
```
User Message → Extract Parameters → Check Completeness
                                          ↓
                    [Missing?] → Ask clarifying Q (in Arabic)
                    [Complete?] → Generate Design Inspiration
                                          ↓
                              Brief Plan (2-4 lines)
                                          ↓
                              Design System First (tailwind + css)
                                          ↓
                              Generate Code
                                          ↓
                              Validate Output
```

### 0.2 TOOL SYSTEM [From All Competitors]

| # | Task | Source | Est | Owner |
|---|------|--------|-----|-------|
| 0.2.1 | Implement CreateFile tool | Standard | 2h | Backend |
| 0.2.2 | Implement UpdateFile tool (line-based) | Lovable | 4h | Backend |
| 0.2.3 | Implement ReplaceInFile tool (string-based) | Cursor | 4h | Backend |
| 0.2.4 | Implement ReadFile with context check | All | 2h | Backend |
| 0.2.5 | Implement SearchFiles tool | v0 | 2h | Backend |
| 0.2.6 | Implement RunTerminal tool | Bolt | 2h | Backend |
| 0.2.7 | Implement GetConsoleLogs tool | Lovable | 2h | Backend |
| 0.2.8 | Implement ValidateOutput tool | KWQ8 unique | 4h | Backend |
| 0.2.9 | Add parallel tool call support | v0 pattern | 8h | Backend |

**Tool Call Rules:**
- ✅ Parallel: ExtractParameters + SearchFiles (don't depend on each other)
- ❌ Sequential: CreateFile → UpdateFile (must wait for file to exist)
- 🚫 Never: Re-read file already in context

### 0.3 DESIGN SYSTEM ENFORCEMENT [From ALL Competitors]

| # | Task | Source | Est | Owner |
|---|------|--------|-----|-------|
| 0.3.1 | Create default Arabic tailwind.config.ts | Lovable pattern | 4h | Frontend |
| 0.3.2 | Create default Arabic index.css with CSS vars | Lovable pattern | 4h | Frontend |
| 0.3.3 | Implement semantic token validator | ALL require | 4h | Backend |
| 0.3.4 | Block explicit colors (bg-blue-500) | Lovable rule | 2h | Backend |
| 0.3.5 | Enforce 3-5 color maximum | Lovable rule | 1h | Backend |
| 0.3.6 | Enforce 2 font maximum | Lovable rule | 1h | Backend |
| 0.3.7 | Add HSL-only color format rule | Lovable rule | 1h | Backend |

**Semantic Tokens (Mandatory):**
```
✅ ALLOWED: bg-primary, bg-secondary, bg-accent, text-foreground
❌ BLOCKED: bg-blue-500, bg-red-600, text-white, text-gray-700
```

### 0.4 RTL-FIRST ARCHITECTURE [KWQ8 Unique]

| # | Task | Source | Est | Owner |
|---|------|--------|-----|-------|
| 0.4.1 | Set dir="rtl" as default | KWQ8 | 1h | Frontend |
| 0.4.2 | Configure logical properties (ms, me, ps, pe) | RTL best practice | 2h | Frontend |
| 0.4.3 | Add RTL validator to ValidateOutput | KWQ8 | 2h | Backend |
| 0.4.4 | Block directional classes (ml, mr, pl, pr) | RTL rule | 2h | Backend |
| 0.4.5 | Configure Arabic fonts (Tajawal, Cairo, Amiri) | KWQ8 | 2h | Frontend |
| 0.4.6 | Create RTL testing checklist | QA | 2h | QA |

**RTL Rules:**
```
✅ ALLOWED: ms-4, me-4, ps-4, pe-4, text-start, text-end
❌ BLOCKED: ml-4, mr-4, pl-4, pr-4, text-left, text-right
```

---

# PHASE 1: DUAL-AI SYSTEM (Days 6-10)
## Gemini Orchestrator + DeepSeek Generator

### 1.1 GEMINI ORCHESTRATOR

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 1.1.1 | Write Gemini system prompt | Full orchestrator prompt | 8h | Product |
| 1.1.2 | Implement parameter extraction | Language, business, styling | 4h | Backend |
| 1.1.3 | Implement clarifying questions logic | Ask if incomplete | 4h | Backend |
| 1.1.4 | Build design inspiration generator | Arabic design briefs | 4h | Backend |
| 1.1.5 | Create structured prompt builder | For DeepSeek | 4h | Backend |
| 1.1.6 | Implement validation checker | Post-generation | 4h | Backend |

**Gemini's Role:**
```
1. ANALYZE user request (language, business, features)
2. ASK clarifying questions if parameters missing
3. GENERATE design inspiration brief
4. BUILD structured prompt for DeepSeek
5. VALIDATE DeepSeek's output
6. FIX issues if validation fails
```

### 1.2 DEEPSEEK GENERATOR

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 1.2.1 | Write DeepSeek system prompt | Code generation rules | 4h | Product |
| 1.2.2 | Configure DeepSeek API connection | API setup | 2h | Backend |
| 1.2.3 | Create code generation templates | RTL, Arabic, Supabase | 8h | Backend |
| 1.2.4 | Implement error handling | Retry logic | 2h | Backend |
| 1.2.5 | Add cost tracking | Per generation | 2h | Backend |

**DeepSeek's Role:**
```
1. RECEIVE structured prompt from Gemini
2. GENERATE code following rules (RTL, semantic, Arabic)
3. RETURN code for validation
```

### 1.3 DUAL-AI VALIDATION LOOP

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 1.3.1 | Build validation pipeline | Gemini validates DeepSeek | 4h | Backend |
| 1.3.2 | Create validation checklist | RTL, tokens, fonts, etc. | 2h | Backend |
| 1.3.3 | Implement fix-and-revalidate loop | Max 3 retries | 4h | Backend |
| 1.3.4 | Add user escalation | After 3 failures | 2h | Backend |

**Validation Loop:**
```
DeepSeek Output → Gemini Validation
                        ↓
        [PASS] → Send to preview
        [FAIL] → Fix → Revalidate (max 3x)
                        ↓
        [Still FAIL after 3x] → Ask user for help
```

---

# PHASE 2: EDITING SYSTEM (Days 11-14)
## Surgical Edits vs Full Rewrites

### 2.1 LINE-BASED EDITING [From Lovable]

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 2.1.1 | Implement UpdateFile with line ranges | line_start, line_end, new_content | 4h | Backend |
| 2.1.2 | Add line validation | Check ranges exist | 2h | Backend |
| 2.1.3 | Handle multiple updates in one call | Sort descending to avoid index shift | 2h | Backend |

### 2.2 STRING-BASED EDITING [From Cursor]

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 2.2.1 | Implement ReplaceInFile | old_string → new_string | 4h | Backend |
| 2.2.2 | Add uniqueness check | String must appear exactly once | 2h | Backend |
| 2.2.3 | Provide helpful errors | "Found 3 times, add more context" | 1h | Backend |

### 2.3 EDIT PREFERENCE RULES

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 2.3.1 | Write edit selection logic | When to use which tool | 2h | Product |
| 2.3.2 | Implement "// ... existing code ..." markers | For partial display | 2h | Backend |
| 2.3.3 | Add full-rewrite detection | When >50% changes | 1h | Backend |

**Edit Selection Rules:**
```
< 30% file changes → Use UpdateFile or ReplaceInFile
> 50% file changes → Use CreateFile (full rewrite)
New file → Use CreateFile
```

---

# PHASE 3: ERROR HANDLING (Days 15-17)
## Self-Healing Loop [From Cursor]

### 3.1 ERROR DETECTION

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 3.1.1 | Implement build error detection | TypeScript, imports | 2h | Backend |
| 3.1.2 | Implement runtime error detection | React, console | 2h | Backend |
| 3.1.3 | Implement design violation detection | Explicit colors, wrong fonts | 2h | Backend |
| 3.1.4 | Implement Supabase error detection | RLS, schema | 2h | Backend |

### 3.2 AUTO-FIX PATTERNS

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 3.2.1 | Create error→fix pattern database | Common errors + solutions | 4h | Backend |
| 3.2.2 | Implement missing import fixer | Auto-add imports | 2h | Backend |
| 3.2.3 | Implement design violation fixer | Map explicit→semantic | 2h | Backend |
| 3.2.4 | Implement RTL violation fixer | Map ml→ms, etc. | 2h | Backend |

### 3.3 SELF-HEALING LOOP

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 3.3.1 | Build error→analyze→fix→validate loop | Core loop | 4h | Backend |
| 3.3.2 | Add max retry limit (3) | Prevent infinite loops | 1h | Backend |
| 3.3.3 | Implement user escalation | Clear error summary | 2h | Backend |

---

# PHASE 4: CONTEXT MANAGEMENT (Days 18-19)
## Token Efficiency [From All]

### 4.1 "NEVER RE-READ" RULE

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 4.1.1 | Track files in context | file_path, last_read, version | 2h | Backend |
| 4.1.2 | Block ReadFile for known files | Return cached content | 2h | Backend |
| 4.1.3 | Detect external modifications | User says file changed | 1h | Backend |

### 4.2 CONTEXT COMPRESSION

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 4.2.1 | Implement conversation summarization | After 20 turns | 4h | Backend |
| 4.2.2 | Implement file content compression | Show changed sections only | 2h | Backend |
| 4.2.3 | Add priority-based context trimming | Keep recent, trim old | 2h | Backend |

---

# PHASE 5: TEMPLATES & GCC (Days 20-27)
## Arabic-First Templates

### 5.1 ARABIC TEMPLATES

| # | Template | Industry | Est | Owner |
|---|----------|----------|-----|-------|
| 5.1.1 | Arabic E-commerce | Retail | 8h | Frontend |
| 5.1.2 | Arabic Restaurant | Food | 6h | Frontend |
| 5.1.3 | Arabic Corporate | Business | 6h | Frontend |
| 5.1.4 | Arabic Salon/Spa | Beauty | 6h | Frontend |
| 5.1.5 | Arabic Portfolio | Creative | 4h | Frontend |
| 5.1.6 | Arabic Real Estate | Property | 6h | Frontend |
| 5.1.7 | Arabic Healthcare | Medical | 6h | Frontend |

### 5.2 GCC COMPONENTS

| # | Component | Description | Est | Owner |
|---|-----------|-------------|-----|-------|
| 5.2.1 | VATCalculator | Auto-calculate by country | 4h | Frontend |
| 5.2.2 | GCCPhoneInput | Country-specific validation | 4h | Frontend |
| 5.2.3 | CurrencyDisplay | KWD (3 decimals), SAR (2), etc. | 2h | Frontend |
| 5.2.4 | ArabicInvoice | RTL invoice template | 4h | Frontend |
| 5.2.5 | GCCAddressForm | Country-specific fields | 4h | Frontend |
| 5.2.6 | ContactFormArabic | RTL contact form | 2h | Frontend |

### 5.3 GCC CONFIGURATION

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 5.3.1 | Create GCC config object | All 6 countries | 2h | Backend |
| 5.3.2 | Implement country detection | From user message | 2h | Backend |
| 5.3.3 | Auto-apply VAT rates | Based on country | 2h | Backend |
| 5.3.4 | Currency formatting | Correct decimals, position | 2h | Backend |

---

# PHASE 6: PRICING & PAYMENTS (Days 28-32)
## Credit-Based System

### 6.1 PRICING STRUCTURE

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 6.1.1 | Remove FREE tier completely | Config change | 1h | Backend |
| 6.1.2 | Implement credit-based system | Credits per action | 8h | Backend |
| 6.1.3 | Add daily bonus credits | Per tier | 4h | Backend |
| 6.1.4 | Implement credit rollover | Unused credits carry over | 2h | Backend |
| 6.1.5 | Create add-on credit packs | Purchasable packs | 4h | Backend |
| 6.1.6 | Show credit cost before action | User transparency | 2h | Frontend |

**Pricing Tiers:**
| Tier | KWD/month | Credits/Day |
|------|-----------|-------------|
| Basic | 23 | 100 |
| Pro | 38 | 200 |
| Premium | 59 | 400 |
| Enterprise | 75 | 800 |

### 6.2 UPAYMENTS INTEGRATION

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 6.2.1 | Complete UPayments production setup | API keys, webhooks | 4h | Backend |
| 6.2.2 | Implement subscription management | Create, cancel, upgrade | 8h | Backend |
| 6.2.3 | Implement 1 KWD/week trial (Basic only) | Trial flow | 4h | Backend |
| 6.2.4 | Add Arabic invoice generation | For all transactions | 4h | Backend |

---

# PHASE 7: PUBLISHING & DOMAINS (Days 33-37)
## One-Click Deployment

### 7.1 VERCEL DEPLOYMENT

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 7.1.1 | Implement Vercel API integration | Deploy projects | 8h | Backend |
| 7.1.2 | Create GitHub repo per project | Auto-create | 4h | Backend |
| 7.1.3 | Implement one-click publish | User flow | 4h | Frontend |
| 7.1.4 | Add deployment status tracking | In dashboard | 2h | Frontend |

### 7.2 NAMECHEAP DOMAINS

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 7.2.1 | Integrate Namecheap API | Search, purchase | 8h | Backend |
| 7.2.2 | Create domain search interface | In publish flow | 4h | Frontend |
| 7.2.3 | Implement domain purchase flow | In-platform | 4h | Backend |
| 7.2.4 | Auto-provision SSL | For all domains | 2h | Backend |

**Domain Pricing:**
| Domain Cost | User Pays |
|-------------|-----------|
| ≤ $15 USD | FREE (1/year + SSL) |
| > $15 USD | Cost + 20% markup |

---

# PHASE 8: ADMIN DASHBOARD (Days 38-42)
## Auto-Generated Per Project

### 8.1 DASHBOARD GENERATION

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 8.1.1 | Create admin dashboard template | Base layout | 8h | Frontend |
| 8.1.2 | Implement auto-generation logic | Per project | 8h | Backend |
| 8.1.3 | Generate admin credentials | Auto-create | 2h | Backend |
| 8.1.4 | Add user management | View, delete users | 4h | Backend |
| 8.1.5 | Add product management | CRUD products | 4h | Backend |
| 8.1.6 | Add sales analytics | Revenue, orders | 4h | Backend |

### 8.2 DASHBOARD ACCESS

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 8.2.1 | Implement Supabase button (Lovable-style) | Access database | 2h | Frontend |
| 8.2.2 | Create two-way content update | AI or Dashboard | 4h | Backend |
| 8.2.3 | Free dashboard edits | No credit cost | 1h | Backend |

---

# PHASE 9: PAYWALL OPTIMIZATION (Days 43-45)
## [From Paywall Methodology Document]

### 9.1 MULTI-STEP PAYWALL

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 9.1.1 | Create 3-screen paywall flow | Step 1: Benefits, Step 2: Trial info, Step 3: Offer | 8h | Frontend |
| 9.1.2 | Add "FREE TRIAL" 5+ times | Across all screens | 2h | Frontend |
| 9.1.3 | Implement trial toggle | With/without trial pricing | 4h | Frontend |
| 9.1.4 | Add price framing | "$1/week" not "$59/year" | 2h | Frontend |

### 9.2 CONVERSION TACTICS

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 9.2.1 | Add transaction abandonment paywall | When cancel payment | 4h | Frontend |
| 9.2.2 | Create social proof section | Reviews, logos | 2h | Frontend |
| 9.2.3 | Implement urgency elements | Limited offer | 2h | Frontend |

---

# PHASE 10: TESTING & LAUNCH (Days 46-50)
## Quality Assurance

### 10.1 TESTING

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 10.1.1 | Set up Jest testing | Framework | 2h | QA |
| 10.1.2 | Write unit tests for AI tools | All 12 tools | 8h | QA |
| 10.1.3 | Write E2E tests (Playwright) | Critical flows | 8h | QA |
| 10.1.4 | RTL testing suite | All components | 4h | QA |
| 10.1.5 | GCC compliance testing | VAT, currency | 4h | QA |

### 10.2 SOFT LAUNCH

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 10.2.1 | Recruit 20 beta testers | From test groups | 3d | Support |
| 10.2.2 | Collect feedback | Forms, calls | Ongoing | Support |
| 10.2.3 | Fix critical bugs | Priority fixes | 3d | Engineering |
| 10.2.4 | Monitor error rates | Sentry | Ongoing | DevOps |

### 10.3 PUBLIC LAUNCH

| # | Task | Description | Est | Owner |
|---|------|-------------|-----|-------|
| 10.3.1 | Launch marketing campaign | Arabic social | Launch day | Marketing |
| 10.3.2 | Product Hunt launch | Submission | Launch day | Marketing |
| 10.3.3 | Influencer outreach | Arabic tech | Week 1 | Collab |
| 10.3.4 | Monitor KPIs | Revenue, signups | Ongoing | All |

---

# SUMMARY: TOTAL ITEMS & TIMELINE

## By Phase

| Phase | Items | Days | Focus |
|-------|-------|------|-------|
| Phase 0: Critical Architecture | 28 | 5 | Tools, Design System, RTL |
| Phase 1: Dual-AI System | 17 | 5 | Gemini + DeepSeek |
| Phase 2: Editing System | 9 | 4 | Line/String edits |
| Phase 3: Error Handling | 11 | 3 | Self-healing |
| Phase 4: Context Management | 6 | 2 | Token efficiency |
| Phase 5: Templates & GCC | 17 | 8 | Arabic templates |
| Phase 6: Pricing & Payments | 10 | 5 | Credit system |
| Phase 7: Publishing | 8 | 5 | Vercel + Domains |
| Phase 8: Admin Dashboard | 9 | 5 | Auto-generated |
| Phase 9: Paywall | 7 | 3 | Conversion |
| Phase 10: Testing & Launch | 12 | 5 | QA + Launch |
| **TOTAL** | **134** | **50 days** | |

## By Priority

| Priority | Description | Items |
|----------|-------------|-------|
| **P0 Critical** | Must have for MVP | 45 |
| **P1 Important** | Should have for launch | 52 |
| **P2 Nice-to-have** | Can add post-launch | 37 |

## Success Metrics

| Metric | Week 2 | Week 4 | Week 8 |
|--------|--------|--------|--------|
| AI Response Time | < 8s | < 5s | < 3s |
| RTL Pass Rate | 90% | 98% | 100% |
| User Signups | 50 | 200 | 500 |
| Trial Conversion | 20% | 30% | 40% |
| Revenue (KWD) | 500 | 3,000 | 10,000 |

---

# KEY COMPETITOR INSIGHTS INTEGRATED

## From Lovable:
- ✅ Design-first approach (edit tailwind + css FIRST)
- ✅ Semantic tokens only (no explicit colors)
- ✅ Discussion mode (ask before build)
- ✅ Line-based editing tool

## From v0:
- ✅ GenerateDesignInspiration tool
- ✅ Parallel tool calls
- ✅ SearchFiles before editing

## From Bolt:
- ✅ Brief planning (2-4 lines)
- ✅ Immediate execution after plan

## From Cursor:
- ✅ Agent autonomy (keep going until resolved)
- ✅ Self-healing loop
- ✅ String-based ReplaceInFile tool

## KWQ8 Unique:
- ✅ Arabic-first (RTL default)
- ✅ GCC country detection
- ✅ Dual-AI validation (Gemini validates DeepSeek)
- ✅ Credit-based pricing
- ✅ Auto-generated admin dashboards

---

**Document Version:** 3.0  
**Last Updated:** December 27, 2025  
**Based On:** Competitor Analysis + Council Input  
**Status:** READY FOR EXECUTION
