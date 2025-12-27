# 📅 KWQ8.COM SPRINT PLANNING
## 10-Week Development Roadmap
### December 2025 - February 2026

---

# TEAM ALLOCATION

| Role | Responsibility | Sprints Active |
|------|---------------|----------------|
| **Backend Lead** | AI integration, API, tools | 1-10 |
| **Frontend Lead** | UI, templates, components | 1-10 |
| **Product Manager** | Prompts, validation, QA | 1-10 |
| **DevOps** | Infrastructure, deployment | 1, 7, 10 |
| **QA Engineer** | Testing, RTL validation | 5, 8, 10 |

---

# SPRINT 1: FOUNDATION (Week 1)
## December 29 - January 4

### 🎯 Goal: Core Tool System + Design System Infrastructure

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 1.1 | Implement CreateFile tool | Backend | 4 | ⬜ |
| 1.2 | Implement UpdateFile tool (line-based) | Backend | 6 | ⬜ |
| 1.3 | Implement ReplaceInFile tool (string-based) | Backend | 6 | ⬜ |
| 1.4 | Implement ReadFile with context tracking | Backend | 4 | ⬜ |
| 1.5 | Implement SearchFiles tool | Backend | 4 | ⬜ |
| 1.6 | Create default Arabic tailwind.config.ts | Frontend | 6 | ⬜ |
| 1.7 | Create default Arabic index.css | Frontend | 6 | ⬜ |
| 1.8 | Set up RTL-first base layout | Frontend | 4 | ⬜ |

### Deliverables:
- ✅ 5 core editing tools functional
- ✅ Arabic design system template ready
- ✅ RTL base layout established

### Definition of Done:
- All tools have unit tests
- Tools handle errors gracefully
- Design system renders correctly in browser

---

# SPRINT 2: AI ORCHESTRATION (Week 2)
## January 5 - January 11

### 🎯 Goal: Gemini Orchestrator + Parameter Extraction

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 2.1 | Set up Gemini 3 Pro API connection | Backend | 4 | ⬜ |
| 2.2 | Implement ExtractParameters function | Backend | 8 | ⬜ |
| 2.3 | Build Arabic/GCC language detection | Backend | 6 | ⬜ |
| 2.4 | Create completeness checker | Backend | 6 | ⬜ |
| 2.5 | Implement clarifying questions logic | Backend | 6 | ⬜ |
| 2.6 | Write Gemini orchestrator system prompt | Product | 8 | ⬜ |
| 2.7 | Build design inspiration generator | Backend | 6 | ⬜ |

### Deliverables:
- ✅ Gemini API integrated and tested
- ✅ Parameter extraction working
- ✅ Language/GCC detection functional
- ✅ Clarifying questions in Arabic working

### Definition of Done:
- Given "أريد موقع مطعم", system extracts parameters correctly
- Given incomplete request, system asks clarifying Q in Arabic
- Design inspiration generates valid JSON

---

# SPRINT 3: CODE GENERATION (Week 3)
## January 12 - January 18

### 🎯 Goal: DeepSeek Integration + Dual-AI Loop

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 3.1 | Configure DeepSeek API connection | Backend | 4 | ⬜ |
| 3.2 | Write DeepSeek system prompt | Product | 8 | ⬜ |
| 3.3 | Create structured prompt builder | Backend | 8 | ⬜ |
| 3.4 | Implement code generation templates | Backend | 8 | ⬜ |
| 3.5 | Build validation pipeline | Backend | 8 | ⬜ |
| 3.6 | Implement fix-and-revalidate loop | Backend | 6 | ⬜ |
| 3.7 | Add cost tracking per generation | Backend | 4 | ⬜ |

### Deliverables:
- ✅ DeepSeek generating valid code
- ✅ Gemini validating DeepSeek output
- ✅ Self-healing loop working (3 retries)
- ✅ Cost per generation tracked

### Definition of Done:
- Complete website generated from single Arabic prompt
- Validation catches explicit colors, RTL violations
- Failed validation triggers auto-fix

---

# SPRINT 4: DESIGN ENFORCEMENT (Week 4)
## January 19 - January 25

### 🎯 Goal: Design System Validator + Error Handling

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 4.1 | Implement semantic token validator | Backend | 6 | ⬜ |
| 4.2 | Block explicit colors (bg-blue-500) | Backend | 4 | ⬜ |
| 4.3 | Enforce 3-5 color maximum | Backend | 2 | ⬜ |
| 4.4 | Enforce 2 font maximum | Backend | 2 | ⬜ |
| 4.5 | Add HSL-only color format rule | Backend | 2 | ⬜ |
| 4.6 | Implement RTL validator | Backend | 4 | ⬜ |
| 4.7 | Block directional classes (ml, mr) | Backend | 2 | ⬜ |
| 4.8 | Create error→fix pattern database | Backend | 8 | ⬜ |
| 4.9 | Implement auto-fix for common errors | Backend | 8 | ⬜ |

### Deliverables:
- ✅ All design rules enforced
- ✅ Common errors auto-fixed
- ✅ Clear error messages for manual fixes

### Definition of Done:
- Code with bg-blue-500 gets rejected
- Code with ml-4 gets auto-fixed to ms-4
- Validation report clearly lists issues

---

# SPRINT 5: TEMPLATES (Week 5)
## January 26 - February 1

### 🎯 Goal: First 3 Arabic Templates

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 5.1 | Template #1: Arabic E-commerce | Frontend | 16 | ⬜ |
| 5.2 | Template #2: Arabic Restaurant | Frontend | 12 | ⬜ |
| 5.3 | Template #3: Arabic Corporate | Frontend | 12 | ⬜ |
| 5.4 | Create template selection popup | Frontend | 6 | ⬜ |
| 5.5 | Add "Build from Scratch" option | Frontend | 4 | ⬜ |
| 5.6 | QA: Test all templates RTL | QA | 8 | ⬜ |

### Deliverables:
- ✅ 3 production-ready Arabic templates
- ✅ Template selection flow working
- ✅ All templates pass RTL validation

### Definition of Done:
- Templates load correctly on mobile/desktop
- RTL layout perfect on all breakpoints
- Arabic text renders with correct fonts

---

# SPRINT 6: GCC COMPONENTS (Week 6)
## February 2 - February 8

### 🎯 Goal: GCC-Specific Functionality

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 6.1 | VATCalculator component | Frontend | 8 | ⬜ |
| 6.2 | GCCPhoneInput component | Frontend | 6 | ⬜ |
| 6.3 | CurrencyDisplay component | Frontend | 4 | ⬜ |
| 6.4 | ArabicInvoice component | Frontend | 8 | ⬜ |
| 6.5 | GCCAddressForm component | Frontend | 6 | ⬜ |
| 6.6 | ContactFormArabic component | Frontend | 4 | ⬜ |
| 6.7 | Create GCC config object | Backend | 4 | ⬜ |
| 6.8 | Implement country detection | Backend | 4 | ⬜ |

### Deliverables:
- ✅ All 6 GCC components ready
- ✅ Country auto-detection working
- ✅ VAT/currency formatting correct

### Definition of Done:
- KWD shows 3 decimals, SAR shows 2
- VAT calculates correctly per country
- Phone validates per country format

---

# SPRINT 7: PRICING & PAYMENTS (Week 7)
## February 9 - February 15

### 🎯 Goal: Credit System + UPayments

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 7.1 | Remove FREE tier completely | Backend | 2 | ⬜ |
| 7.2 | Implement credit-based system | Backend | 16 | ⬜ |
| 7.3 | Add daily bonus credits per tier | Backend | 6 | ⬜ |
| 7.4 | Implement credit rollover | Backend | 4 | ⬜ |
| 7.5 | Show credit cost before action | Frontend | 4 | ⬜ |
| 7.6 | Complete UPayments production setup | Backend | 8 | ⬜ |
| 7.7 | Implement subscription management | Backend | 12 | ⬜ |
| 7.8 | Implement 1 KWD/week trial | Backend | 6 | ⬜ |

### Deliverables:
- ✅ Credit system fully functional
- ✅ All 4 pricing tiers working
- ✅ UPayments processing live
- ✅ Trial flow operational

### Definition of Done:
- User can subscribe to any tier
- Credits deduct per AI action
- Daily bonus credits apply at midnight
- Trial converts to paid correctly

---

# SPRINT 8: PUBLISHING (Week 8)
## February 16 - February 22

### 🎯 Goal: Vercel Deployment + Domain Purchase

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 8.1 | Implement Vercel API integration | Backend | 12 | ⬜ |
| 8.2 | Create GitHub repo per project | Backend | 6 | ⬜ |
| 8.3 | Implement one-click publish | Frontend | 6 | ⬜ |
| 8.4 | Add deployment status tracking | Frontend | 4 | ⬜ |
| 8.5 | Integrate Namecheap API | Backend | 12 | ⬜ |
| 8.6 | Create domain search interface | Frontend | 6 | ⬜ |
| 8.7 | Implement domain purchase flow | Backend | 8 | ⬜ |
| 8.8 | Auto-provision SSL | Backend | 4 | ⬜ |

### Deliverables:
- ✅ One-click publish to Vercel
- ✅ Domain search and purchase in-platform
- ✅ SSL auto-provisioned

### Definition of Done:
- User clicks "نشر" → site live within 2 minutes
- Domain search shows availability and price
- Purchased domain auto-connects with SSL

---

# SPRINT 9: ADMIN DASHBOARD (Week 9)
## February 23 - March 1

### 🎯 Goal: Auto-Generated Admin Dashboards

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 9.1 | Create admin dashboard template | Frontend | 12 | ⬜ |
| 9.2 | Implement auto-generation logic | Backend | 12 | ⬜ |
| 9.3 | Generate admin credentials | Backend | 4 | ⬜ |
| 9.4 | Add user management | Backend | 8 | ⬜ |
| 9.5 | Add product management | Backend | 8 | ⬜ |
| 9.6 | Add sales analytics | Backend | 6 | ⬜ |
| 9.7 | Implement Supabase button | Frontend | 4 | ⬜ |
| 9.8 | Create two-way content update | Backend | 6 | ⬜ |

### Deliverables:
- ✅ Every project gets admin dashboard
- ✅ CRUD for users and products
- ✅ Analytics visible
- ✅ Dashboard edits are FREE (no credits)

### Definition of Done:
- Admin dashboard matches site design
- Products added via dashboard appear on site
- User can access Supabase directly

---

# SPRINT 10: LAUNCH PREP (Week 10)
## March 2 - March 8

### 🎯 Goal: QA + Beta + Public Launch

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 10.1 | Full E2E testing suite | QA | 16 | ⬜ |
| 10.2 | RTL validation all components | QA | 8 | ⬜ |
| 10.3 | GCC compliance verification | QA | 4 | ⬜ |
| 10.4 | Recruit 20 beta testers | Support | 8 | ⬜ |
| 10.5 | Beta feedback collection | Product | 8 | ⬜ |
| 10.6 | Fix critical bugs | Backend+Frontend | 16 | ⬜ |
| 10.7 | Multi-step paywall implementation | Frontend | 8 | ⬜ |
| 10.8 | Arabic marketing campaign prep | Marketing | 8 | ⬜ |
| 10.9 | Product Hunt submission | Marketing | 4 | ⬜ |
| 10.10 | Public launch | All | 8 | ⬜ |

### Deliverables:
- ✅ All critical bugs fixed
- ✅ 20 beta testers validated platform
- ✅ Marketing campaign ready
- ✅ Platform publicly launched

### Definition of Done:
- Zero critical bugs in production
- 80%+ beta tester satisfaction
- Product Hunt launched
- First paying customers

---

# VELOCITY TRACKING

## Sprint Points

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 1 | 40 | - | - |
| Sprint 2 | 44 | - | - |
| Sprint 3 | 46 | - | - |
| Sprint 4 | 40 | - | - |
| Sprint 5 | 58 | - | - |
| Sprint 6 | 44 | - | - |
| Sprint 7 | 58 | - | - |
| Sprint 8 | 58 | - | - |
| Sprint 9 | 60 | - | - |
| Sprint 10 | 88 | - | - |

## Key Milestones

| Date | Milestone | Status |
|------|-----------|--------|
| Jan 4 | Core tools ready | ⬜ |
| Jan 18 | Full AI loop working | ⬜ |
| Feb 1 | First 3 templates live | ⬜ |
| Feb 15 | Payments operational | ⬜ |
| Feb 22 | Publishing working | ⬜ |
| Mar 1 | Admin dashboards ready | ⬜ |
| Mar 8 | **PUBLIC LAUNCH** | ⬜ |

---

# DAILY STANDUPS

**Time:** 9:00 AM Kuwait Time (daily)  
**Format:** 15 minutes max

Each team member answers:
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

---

# WEEKLY DEMOS

**Time:** Sunday 2:00 PM Kuwait Time  
**Format:** 30-minute demo of completed work

**Sprint Review Agenda:**
1. Demo completed features (15 min)
2. Discuss blockers/learnings (10 min)
3. Plan next sprint (5 min)

---

# RISK REGISTER

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| DeepSeek API latency | High | Medium | Cache common patterns |
| UPayments integration delay | High | Low | Have backup (PayTabs) |
| RTL bugs in templates | Medium | Medium | QA every sprint |
| Beta tester recruitment | Medium | Low | Use existing test groups |
| Gemini prompt tuning | Medium | Medium | Allow extra sprint |

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Sprint Duration:** 7 days  
**Team Size:** 5 core + contractors  
**Total Timeline:** 10 weeks
