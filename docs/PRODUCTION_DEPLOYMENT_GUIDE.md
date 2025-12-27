# KWQ8 Production Deployment Guide
**Version:** 1.0 | **Date:** 2025-12-27

## PRE-DEPLOYMENT CHECKLIST

### Environment Setup
- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied to production Supabase
- [ ] API keys verified (Tap, DeepSeek, Gemini, Namecheap)
- [ ] CRON_SECRET generated
- [ ] TAP_WEBHOOK_SECRET configured
- [ ] EXCHANGE_API_KEY active

### Required Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://iqwfyrijmsoddpoacinw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# AI APIs
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=AI...

# Tap Payments (PRODUCTION KEYS)
TAP_SECRET_KEY=sk_live_...
NEXT_PUBLIC_TAP_PUBLIC_KEY=pk_live_...
TAP_WEBHOOK_SECRET=whsec_...

# UPayments (Keep during migration)
UPAYMENTS_API_KEY=...
UPAYMENTS_SECRET_KEY=...

# Currency
EXCHANGE_API_KEY=...

# Namecheap
NAMECHEAP_API_USER=...
NAMECHEAP_API_KEY=...
NAMECHEAP_USERNAME=...
NAMECHEAP_CLIENT_IP=...
NAMECHEAP_SANDBOX=false

# Vercel
VERCEL_TOKEN=...

# Feature Flags
NEXT_PUBLIC_ENABLE_TAP_PAYMENTS=true
NEXT_PUBLIC_TAP_ROLLOUT_PERCENTAGE=5  # Start at 5%
NEXT_PUBLIC_FORCE_PROVIDER=  # Leave empty

# Security
CRON_SECRET=<generate-random-secret>

# App
NEXT_PUBLIC_APP_URL=https://kwq8.com
NODE_ENV=production
```

---

## DATABASE MIGRATION SEQUENCE

### Pre-Production Migration Test
```bash
# 1. Backup production database
supabase db dump > backup-$(date +%Y%m%d).sql

# 2. Test migrations on staging
supabase db push --db-url <staging-url>

# 3. Verify data integrity
npm run test:db-integrity

# 4. If successful, apply to production
supabase db push --db-url <production-url>
```

### Apply All Migrations
```bash
# Run in order:
supabase db push --file supabase/migrations/20251227_paywall_system.sql
supabase db push --file supabase/migrations/20251227_tap_payments_infrastructure.sql
supabase db push --file supabase/migrations/20251227_template_system.sql
supabase db push --file supabase/migrations/20251227_admin_dashboard_system.sql
supabase db push --file supabase/migrations/20251227_visual_editor_system.sql
```

### Verify Migrations
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables (30+):
-- paywall_events, trial_tracking, discount_codes
-- tap_subscriptions, exchange_rates, tap_billing_events
-- templates, template_usage, template_ratings
-- admin_dashboards, project_admin_users, admin_activity_logs
-- visual_editor_sessions, editor_messages, code_snapshots
-- (+ existing tables)
```

---

## DEPLOYMENT STEPS

### Week 21: Staging Deployment

**Day 1-2: Deploy to Staging**
```bash
# 1. Build and test locally
npm run build
npm run start  # Test production build

# 2. Deploy to Vercel staging
vercel --prod=false

# 3. Run smoke tests
npm run test:smoke
```

**Day 3-4: Integration Testing**
- Run all integration tests from test plan
- Fix any bugs found
- Performance testing

**Day 5: Staging Sign-Off**
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] No critical bugs
- [ ] Ready for production

---

### Week 22: Beta Testing

**Recruit Beta Testers (20 users)**
```markdown
# Beta Tester Profile:
- Arabic speakers
- GCC residents (mix of countries)
- Business owners (ideal) or tech-savvy
- Mix of industries (restaurant, salon, portfolio, etc.)

# Recruitment Sources:
- Existing test group
- Kuwait Tech Hub
- Social media (Instagram, Twitter)
- Business WhatsApp groups
```

**Beta Access:**
- [ ] Create beta user group in database
- [ ] Grant free Premium access (30 days)
- [ ] Send welcome email with instructions
- [ ] Create private WhatsApp group for support

**Feedback Collection:**
```markdown
# Daily Check-Ins (WhatsApp):
- What did you try today?
- Any bugs or issues?
- Features you loved?
- Features you hated?

# End of Week Survey:
- Overall satisfaction (1-5)
- Would you pay for this? (Y/N)
- Suggested price point
- Missing features
- NPS: Recommend to colleague? (0-10)
```

**Beta Metrics:**
- [ ] Track all usage (projects created, templates used, edits made)
- [ ] Monitor error rates
- [ ] Track conversion (beta → paying)
- [ ] Collect 20+ testimonials

---

### Week 23: Security & Performance

**Security Audit:**
```bash
# 1. Run automated scans
npm audit
npm audit fix

# 2. OWASP ZAP scan
# Download: https://www.zaproxy.org/
# Scan: https://staging.kwq8.com

# 3. Check dependencies
npm outdated
npx snyk test

# 4. Manual testing (from checklist)
```

**Performance Optimization:**
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting verified
- [ ] Lazy loading components
- [ ] Database query optimization
- [ ] CDN configured for static assets
- [ ] Compression enabled (gzip/brotli)

**Benchmarks to Meet:**
- Template generation: <60s
- Visual editor changes: <10s
- Page load (First Contentful Paint): <2s
- Time to Interactive: <4s
- API responses: <500ms average

---

### Week 24: Production Launch

**Day 1 (Sunday): Final Preparations**
```bash
# 1. Final build
npm run build

# 2. Run full test suite
npm run test
npm run test:e2e

# 3. Database backup
supabase db dump > pre-launch-backup.sql

# 4. Deploy to production
vercel --prod

# 5. Verify deployment
curl https://kwq8.com/api/health
```

- [ ] All tests passing
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health checks green

**Day 2 (Monday): Gradual Rollout**

**Stage 1: 10% Traffic (Hours 0-6)**
```env
NEXT_PUBLIC_TAP_ROLLOUT_PERCENTAGE=10
```
- [ ] Monitor errors (0 critical)
- [ ] Monitor payment success rate (>98%)
- [ ] Monitor API response times (<500ms)
- [ ] Check user feedback

**Stage 2: 50% Traffic (Hours 6-12)**
```env
NEXT_PUBLIC_TAP_ROLLOUT_PERCENTAGE=50
```
- [ ] Error rate stable
- [ ] Database performance good
- [ ] No webhook delays
- [ ] Support tickets manageable

**Stage 3: 100% Traffic (Hours 12-24)**
```env
NEXT_PUBLIC_TAP_ROLLOUT_PERCENTAGE=100
```
- [ ] Full rollout successful
- [ ] All systems operational
- [ ] Support team ready

**Day 3 (Tuesday): Monitor & Support**
- [ ] 24/7 monitoring active
- [ ] Support team responding (<2h response time)
- [ ] Bug triage process active
- [ ] Hot-fix deployment ready if needed

**Day 4 (Wednesday): Marketing Launch**
- [ ] Product Hunt submission
- [ ] Social media campaign
- [ ] Email to waitlist (if applicable)
- [ ] Press release distribution
- [ ] Influencer outreach

**Day 5-7: Stabilization**
- [ ] Monitor KPIs (signups, conversions, revenue)
- [ ] Fix non-critical bugs
- [ ] Collect user feedback
- [ ] Optimize based on real usage

---

## ROLLBACK PLAN

### If Critical Issues Arise:

**Immediate Actions (< 5 minutes):**
```bash
# 1. Revert to previous deployment
vercel rollback

# 2. Disable Tap if payment issues
NEXT_PUBLIC_ENABLE_TAP_PAYMENTS=false
vercel env add NEXT_PUBLIC_ENABLE_TAP_PAYMENTS
```

**Communication:**
- [ ] Alert users via banner
- [ ] Send email notification
- [ ] Update status page
- [ ] Social media update

**Investigation:**
- [ ] Review error logs
- [ ] Check database state
- [ ] Verify API connections
- [ ] Test payment flows

**Resolution:**
- [ ] Fix identified issues
- [ ] Test fix in staging
- [ ] Gradual re-deployment

---

## MONITORING SETUP

### Vercel Analytics
- [ ] Enable Web Analytics
- [ ] Enable Speed Insights
- [ ] Configure custom events

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Uptime Monitoring (UptimeRobot)
- [ ] Monitor https://kwq8.com (every 5 min)
- [ ] Monitor https://kwq8.com/api/health
- [ ] Alert via email + SMS on downtime

### Database Monitoring (Supabase)
- [ ] Enable Postgres logs
- [ ] Set up slow query alerts (>1s)
- [ ] Monitor connection pool
- [ ] Daily backup schedule

---

## POST-LAUNCH CHECKLIST

### Day 1-7
- [ ] Monitor error rates (target: <0.1%)
- [ ] Monitor conversion rates (target: 15%+)
- [ ] Respond to all support tickets
- [ ] Daily metrics review
- [ ] Hot-fix critical bugs only

### Week 2-4
- [ ] Collect user feedback
- [ ] A/B test paywall variations
- [ ] Optimize slow queries
- [ ] Add most-requested features to roadmap
- [ ] Plan next sprint

### Month 2-3
- [ ] Analyze cohorts (retention, churn)
- [ ] Optimize pricing if needed
- [ ] Expand to UAE/Saudi (if ready)
- [ ] Launch mobile app (if planned)

---

## SUCCESS METRICS

### Technical KPIs
- **Uptime:** 99.9%+ (target: 99.95%)
- **Error Rate:** <0.1%
- **API Response Time:** <500ms average
- **Template Generation:** <60s
- **Visual Editor:** <10s per change

### Business KPIs
- **Week 1:** 50+ trial starts
- **Month 1:** 100+ paying customers
- **Month 1 Revenue:** 3,000+ KWD
- **Conversion Rate:** 15%+ (paywall impression → payment)
- **Trial → Paid:** 30%+
- **Churn:** <5% monthly

### User Experience KPIs
- **NPS Score:** 40+ (target: 50+)
- **Support Response Time:** <2 hours
- **Bug Resolution Time:** <24h (critical), <7d (normal)
- **User Satisfaction:** 4.5+ stars

---

## LAUNCH ANNOUNCEMENT

### Channels
- [ ] Product Hunt (Thursday optimal)
- [ ] Instagram post + stories
- [ ] Twitter/X announcement
- [ ] LinkedIn post
- [ ] Kuwait Tech Hub announcement
- [ ] Reddit r/Kuwait, r/sideproject
- [ ] Email to waitlist
- [ ] WhatsApp business groups

### Message
```
🚀 إطلاق KWQ8.com - أول منصة عربية لبناء المواقع بالذكاء الاصطناعي!

✨ ابنِ موقعك الاحترافي في دقائق
🎨 15+ قالب عربي جاهز
💎 تجربة مجانية 7 أيام
🌍 دعم جميع دول الخليج

ابدأ الآن → kwq8.com
```

---

**Document Owner:** DevOps Lead
**Last Updated:** 2025-12-27
**Next Review:** Launch Day
