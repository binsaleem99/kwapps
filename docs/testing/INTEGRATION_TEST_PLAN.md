# KWQ8 Integration Test Plan
**Version:** 1.0 | **Date:** 2025-12-27

## Overview
Comprehensive integration testing for all 6 phases of KWQ8 implementation.

---

## PHASE 1: GCC COMPONENTS & PAYWALL

### GCC Components Tests

#### VATCalculator
- [ ] Calculates 0% VAT for Kuwait correctly
- [ ] Calculates 15% VAT for Saudi Arabia correctly
- [ ] Calculates 5% VAT for UAE correctly
- [ ] Calculates 10% VAT for Bahrain correctly
- [ ] Shows correct decimals (3 for KWD/BHD/OMR, 2 for others)
- [ ] Formats currency symbols correctly (after amount)

#### GCCPhoneInput
- [ ] Validates Kuwait phone (8 digits, starts with 5/6/9)
- [ ] Validates Saudi phone (9 digits, starts with 5)
- [ ] Validates UAE phone (9 digits, starts with 50/51/52/54/55/56/58)
- [ ] Shows validation errors in Arabic
- [ ] Country selector works
- [ ] Phone formatting correct for all countries

#### CurrencyDisplay
- [ ] Shows 3 decimals for KWD (22.990 د.ك)
- [ ] Shows 2 decimals for SAR (279.00 ر.س)
- [ ] Symbol positioned after amount (RTL)
- [ ] Price comparison shows savings correctly

#### ArabicInvoice
- [ ] Prints correctly (print CSS works)
- [ ] VAT calculated correctly per country
- [ ] All text in Arabic and RTL
- [ ] Business and customer info displays correctly
- [ ] Items table calculates totals correctly

#### GCCAddressForm
- [ ] Shows correct fields per country (governorate for Kuwait, region for Saudi)
- [ ] Postal code validation works
- [ ] Required fields enforced
- [ ] Address display component works

#### ContactFormArabic
- [ ] Form validates all required fields
- [ ] GCC phone validation integrated
- [ ] Email validation works
- [ ] Success state shows after submission
- [ ] Form resets after submission

### Paywall Tests

#### 3-Step Funnel
- [ ] Step 1 (Benefits) displays correctly
- [ ] Step 2 (Timeline) shows trial timeline
- [ ] Step 3 (Offers) shows pricing tiers
- [ ] Progress bar updates correctly
- [ ] Back button works on steps 2-3
- [ ] All text in Arabic and RTL

#### Trial Toggle
- [ ] With trial option shows 0 د.ك for 7 days
- [ ] Without trial shows 15% discount
- [ ] Price calculation correct for both options
- [ ] Selection state persists

#### Spin Wheel
- [ ] Wheel rotates smoothly
- [ ] Prizes selected by weighted probability
- [ ] One spin per email enforced
- [ ] Discount code generated and saved
- [ ] Code auto-applied to checkout

#### Abandonment Recovery
- [ ] Popup shows when payment abandoned
- [ ] 15-minute timer counts down
- [ ] 20% discount offer displays
- [ ] Discount code generated
- [ ] Popup auto-closes when expired

#### Analytics Tracking
- [ ] All paywall events tracked to database
- [ ] Session ID generated and persists
- [ ] Conversion funnel view calculates correctly
- [ ] Event types all captured

---

## PHASE 2: TAP PAYMENTS

### Currency System
- [ ] Auto-detects currency from IP (Cloudflare headers)
- [ ] Manual currency selection works
- [ ] Exchange rates update daily
- [ ] Converts KWD to all 6 GCC currencies correctly
- [ ] Prices display with correct decimals

### Tap Integration
- [ ] Tap customer creation works
- [ ] Subscription creation successful
- [ ] Checkout flow completes (test cards)
- [ ] Multiple payment methods work (KNET, mada, cards)
- [ ] Apple Pay integration works

### Webhooks
- [ ] Signature verification works
- [ ] All event types handled (9 types)
- [ ] Subscription activated → credits granted
- [ ] Subscription renewed → credits refreshed
- [ ] Payment failed → dunning scheduled
- [ ] Webhook idempotency works

### Migration System
- [ ] Single user migration works
- [ ] Prorated credits calculated correctly
- [ ] Both systems run in parallel
- [ ] Migration cron job runs successfully
- [ ] Email notifications sent
- [ ] No billing gaps during migration

### Feature Flags
- [ ] Rollout percentage works (0% → 5% → 100%)
- [ ] Provider detection logic correct
- [ ] Existing users stay on their provider
- [ ] New users assigned per rollout %

---

## PHASE 3: TEMPLATES

### Template System
- [ ] All 7+ templates load from registry
- [ ] Template categories filter correctly
- [ ] Template search works (Arabic & English)
- [ ] Featured templates displayed separately
- [ ] Template ratings display

### Customization Wizard
- [ ] All 5 steps navigate correctly
- [ ] Progress bar updates
- [ ] Basic info validation works
- [ ] Color scheme selection applies
- [ ] Content fields save correctly
- [ ] Image upload placeholders work
- [ ] Review step shows all customizations

### Template Generation
- [ ] DeepSeek generates code from template + customizations
- [ ] GCC components auto-included
- [ ] Credits deducted correctly
- [ ] Generation completes in 30-60 seconds
- [ ] Generated code is valid React/Next.js
- [ ] RTL compliance maintained

### Database
- [ ] Templates table populated
- [ ] Template usage tracked
- [ ] Ratings update template stats
- [ ] Popularity score increments
- [ ] Usage count accurate

---

## PHASE 4: ADMIN DASHBOARD

### Auto-Generation
- [ ] Dashboard generates on project deployment
- [ ] Feature detection works correctly
- [ ] Admin credentials created
- [ ] Email sent with credentials
- [ ] Dashboard URL accessible

### Feature Detection
- [ ] E-commerce template → products + orders enabled
- [ ] Restaurant template → menu + bookings enabled
- [ ] Service template → services + bookings enabled
- [ ] Portfolio template → gallery + blog enabled

### CRUD Components
- [ ] DataTable displays items correctly
- [ ] Sorting works on sortable columns
- [ ] Filtering/search works
- [ ] Bulk selection works
- [ ] Edit action opens form
- [ ] Delete action removes item
- [ ] FormBuilder generates forms from fields
- [ ] Form validation works
- [ ] Form submission successful

### Admin Operations
- [ ] Product CRUD (create, read, update, delete)
- [ ] Operations are FREE (0 credits)
- [ ] Changes saved to database
- [ ] Activity logs created
- [ ] Two-way sync works (admin → frontend)

---

## PHASE 5: VISUAL EDITOR

### Session Management
- [ ] Editor session created on open
- [ ] Session persists across refreshes
- [ ] Multiple concurrent sessions work
- [ ] Session cleanup after inactivity

### DOM Analysis (Gemini)
- [ ] Arabic requests understood correctly
- [ ] Elements identified accurately
- [ ] CSS selectors generated correctly
- [ ] Confidence scores reasonable
- [ ] Clarification requested when needed

### Code Modification (DeepSeek)
- [ ] Changes applied surgically (no rewrites)
- [ ] RTL preserved after modifications
- [ ] Existing code not broken
- [ ] Preview updates immediately
- [ ] Credits calculated correctly

### Undo/Redo
- [ ] Undo works (FREE - 0 credits)
- [ ] Redo works (FREE - 0 credits)
- [ ] 50-step history maintained
- [ ] Circular buffer works correctly
- [ ] Snapshots saved to database

### Real-Time Preview
- [ ] Preview iframe updates instantly
- [ ] Device switching works (desktop/mobile)
- [ ] Element highlighting on hover
- [ ] Click-to-select functional

### Credit System
- [ ] Text edit: 3 credits
- [ ] Color change: 5 credits
- [ ] Add element: 10 credits
- [ ] Add section: 20 credits
- [ ] Undo/redo: 0 credits (FREE)

---

## PHASE 6: INTEGRATIONS

### Domain Integration
- [ ] Domain search returns availability
- [ ] Pricing calculated correctly
- [ ] Free domain logic works (≤$15 for Pro+)
- [ ] Domain purchase via Tap/UPayments
- [ ] Registration completes successfully
- [ ] DNS auto-configured for Vercel
- [ ] SSL provisions within 5 minutes
- [ ] Domain connects to deployment

### WhatsApp Widget
- [ ] Configuration UI saves settings
- [ ] GCC phone validation works
- [ ] Widget code generated correctly
- [ ] Widget injected into project code
- [ ] Widget appears in preview
- [ ] WhatsApp link opens correctly
- [ ] Pre-filled message works
- [ ] Position options all work (4 corners)
- [ ] Working hours feature functions

---

## CROSS-FEATURE INTEGRATION TESTS

### End-to-End User Journeys

#### Journey 1: New User → Template → Deploy
1. [ ] User signs up
2. [ ] Paywall shows (post-onboarding placement)
3. [ ] User starts trial (1 KWD/week)
4. [ ] User browses templates
5. [ ] User selects template (REST-01 المائدة)
6. [ ] Wizard: completes 5 steps
7. [ ] Template generates (25 credits deducted)
8. [ ] Preview shows generated site
9. [ ] User opens visual editor
10. [ ] User makes 2 edits (Arabic chat)
11. [ ] Changes apply correctly
12. [ ] User deploys project
13. [ ] Admin dashboard auto-generates
14. [ ] User receives admin credentials email
15. [ ] User adds WhatsApp widget
16. [ ] User purchases domain (.com)
17. [ ] DNS auto-configures
18. [ ] Site accessible via custom domain
19. [ ] SSL active within 5 minutes

#### Journey 2: Currency & Payment
1. [ ] User from Saudi Arabia visits site
2. [ ] Currency auto-detects to SAR
3. [ ] Prices show in SAR (2 decimals)
4. [ ] User selects Pro plan
5. [ ] Sees price in SAR
6. [ ] Completes payment via mada
7. [ ] Tap webhook received
8. [ ] Subscription activated
9. [ ] Credits granted (200/day)
10. [ ] User can generate sites

#### Journey 3: Migration
1. [ ] Existing UPayments user nearing renewal
2. [ ] Migration cron detects user
3. [ ] Tap subscription created (starts after UPayments)
4. [ ] Prorated credits granted
5. [ ] Email notification sent
6. [ ] UPayments subscription marked as migrating
7. [ ] At period end: Tap activates
8. [ ] Credits refresh
9. [ ] User sees no disruption

---

## PERFORMANCE TESTS

### Load Testing
- [ ] 100 concurrent users browsing templates
- [ ] 50 concurrent AI generations
- [ ] Database handles 1000+ requests/minute
- [ ] Preview iframe loads in <2 seconds
- [ ] Template generation completes in 30-60s
- [ ] Visual editor changes apply in 5-10s

### API Response Times
- [ ] Template search: <200ms
- [ ] Domain availability: <500ms
- [ ] Paywall tracking: <100ms
- [ ] Credit deduction: <200ms
- [ ] Webhook processing: <1s

---

## SECURITY TESTS

### Authentication
- [ ] User sessions secure
- [ ] Password hashing works
- [ ] JWT tokens validated
- [ ] Admin dashboard has separate auth
- [ ] API routes protected by RLS

### Payment Security
- [ ] Tap webhook signature verified
- [ ] No payment data stored locally
- [ ] Refund process secure
- [ ] Discount codes can't be brute-forced

### XSS Protection
- [ ] User input sanitized
- [ ] Generated code escapes user content
- [ ] No dangerouslySetInnerHTML in generated code
- [ ] Widget injection validates code

### SQL Injection
- [ ] All queries parameterized
- [ ] Supabase RLS enforced
- [ ] No raw SQL from user input

---

## BROWSER COMPATIBILITY

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## RTL & ARABIC VALIDATION

- [ ] All pages have dir="rtl"
- [ ] No ml/mr/pl/pr/text-left/text-right classes
- [ ] Only ms/me/ps/pe/text-start/text-end used
- [ ] Arabic text renders with correct fonts
- [ ] Numbers display correctly (ltr vs rtl)
- [ ] Forms work in RTL mode

---

## CREDITS & BILLING

- [ ] Credits deduct correctly per action
- [ ] Daily bonus credits grant at midnight
- [ ] Credit rollover works (30-day limit)
- [ ] Negative credits prevented
- [ ] Credit history accurate
- [ ] Subscription renewal grants credits

---

## SUCCESS CRITERIA

### Phase 7 Complete When:
- [ ] 0 critical bugs
- [ ] All integration tests passing
- [ ] Security audit passed
- [ ] 20 beta testers recruited
- [ ] Beta feedback collected
- [ ] >80% beta satisfaction
- [ ] Performance benchmarks met
- [ ] Production deployment successful

### Launch Ready When:
- [ ] All features functional
- [ ] 99.9% uptime in staging
- [ ] All payment flows tested
- [ ] All currencies tested
- [ ] RTL perfect on all pages
- [ ] Mobile responsive everywhere
- [ ] Documentation complete
- [ ] Support team trained

---

**Test Coverage Target:** 80%+
**Critical Path Tests:** 100%
**Security Tests:** 100%
