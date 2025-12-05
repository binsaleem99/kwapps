# KWq8.com Production Deployment Checklist

**Date:** 2025-12-05
**Status:** In Progress

---

## 1. Environment Check ✅

| Variable | Status | Value/Notes |
|----------|--------|-------------|
| UPAYMENTS_SANDBOX | ✅ Ready | `false` (production mode) |
| NAMECHEAP_SANDBOX | ✅ Fixed | Changed to `false` (production mode) |
| SUPABASE_URL | ✅ Set | Production URL configured |
| SUPABASE_ANON_KEY | ✅ Set | Production key configured |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Set | Production key configured |
| DEEPSEEK_API_KEY | ✅ Set | API key configured |
| GEMINI_API_KEY | ✅ Set | API key configured |
| VERCEL_API_KEY | ✅ Set | Deployment token configured |
| UPAYMENTS_API_KEY | ✅ Set | Production key configured |
| NAMECHEAP_API_KEY | ✅ Set | API key configured |

### Action Completed:
✅ NAMECHEAP_SANDBOX changed from `true` to `false` in .env.local

---

## 2. Build Verification ✅

**Build Status:** PASSED ✅

```
✓ Compiled successfully in 16.9s
✓ Generating static pages (62/62)
✓ All TypeScript errors resolved
```

### Files Modified to Fix Build Errors:

| File | Issue | Fix Applied |
|------|-------|-------------|
| `src/lib/admin-generator/schema-analyzer.ts` | Missing export | Added `export` to CONTENT_TYPE_FIELDS |
| `src/app/admin/[projectId]/[contentType]/page.tsx` | ReactNode type error | Wrapped value in `String()` |
| `src/app/api/projects/[projectId]/admin/route.ts` | Wrong function arguments | Added projectId parameter and await |
| `src/app/api/projects/[projectId]/publish/route.ts` | deductCredits signature | Changed to object-based signature |
| `src/app/api/projects/[projectId]/publish/route.ts` | Supabase .catch() error | Replaced with try-catch block |
| `src/app/api/widgets/[projectId]/route.ts` | phoneNumber type access | Added type assertion |
| `src/app/api/widgets/whatsapp/route.ts` | style type mismatch | Cast to correct type |
| `src/lib/widgets/widget-generator.ts` | WIDGET_SIZES index | Added nullish coalescing |
| `tsconfig.json` | Deno modules error | Excluded supabase/functions |

---

## 3. Vercel Deployment

### Vercel Project Configuration:
| Setting | Value |
|---------|-------|
| Project ID | `prj_7g5VzBrl2yjLD9l3iQJwstq6GGTR` |
| Project Name | `kwapps` |
| Team ID | `team_tcjxQPbWENd8QyN2mmFmhWpx` |
| GitHub Repo | `binsaleem99/kwapps` |
| Status | ✅ Linked |

### Pre-Deployment Checklist:
- [ ] All changes committed to git
- [ ] Push to main branch
- [ ] Verify automatic deployment triggers
- [ ] Check Vercel dashboard for build status

### Vercel Environment Variables Required:
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DEEPSEEK_API_KEY
- [ ] GEMINI_API_KEY
- [ ] UPAYMENTS_API_KEY
- [ ] UPAYMENTS_MERCHANT_ID
- [ ] NAMECHEAP_API_KEY
- [ ] NAMECHEAP_API_USER
- [ ] NEXT_PUBLIC_SITE_URL=https://kwq8.com

---

## 4. Domain Configuration

### DNS Settings for kwq8.com:
| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

### Verification Steps:
- [ ] DNS propagation complete
- [ ] SSL certificate active
- [ ] www → kwq8.com redirect working
- [ ] HTTPS enforced

---

## 5. Post-Deployment Checks

### Functional Tests:
- [ ] Homepage loads correctly
- [ ] Arabic RTL renders properly
- [ ] Sign up flow works
- [ ] Login flow works
- [ ] Builder page loads
- [ ] Project creation works
- [ ] Widget generation works
- [ ] Payment flow works (test with small amount)

### Performance Checks:
- [ ] Core Web Vitals acceptable
- [ ] Images optimized
- [ ] API response times < 500ms

---

## 6. Edge Functions Deployment

### Functions to Deploy:
| Function | Cron Schedule | Status |
|----------|---------------|--------|
| daily-bonus | `0 0 * * *` (midnight) | Pending |
| period-rollover | `0 1 1 * *` (1st of month) | Pending |
| trial-expiry | `0 */6 * * *` (every 6 hours) | Pending |

### Deployment Commands:
```bash
# Deploy edge functions
npx supabase functions deploy daily-bonus
npx supabase functions deploy period-rollover
npx supabase functions deploy trial-expiry

# Set up cron jobs in Supabase Dashboard
# Dashboard → Database → Extensions → Enable pg_cron
# Dashboard → SQL Editor → Create cron jobs
```

### Cron Job SQL:
```sql
-- Daily bonus at midnight Kuwait time (UTC+3)
SELECT cron.schedule(
  'daily-bonus',
  '0 21 * * *',  -- 21:00 UTC = 00:00 Kuwait
  $$SELECT net.http_post(
    'https://iqwfyrijmsoddpoacinw.supabase.co/functions/v1/daily-bonus',
    '{}',
    'application/json'
  );$$
);

-- Period rollover on 1st of each month
SELECT cron.schedule(
  'period-rollover',
  '0 22 1 * *',  -- 22:00 UTC = 01:00 Kuwait
  $$SELECT net.http_post(
    'https://iqwfyrijmsoddpoacinw.supabase.co/functions/v1/period-rollover',
    '{}',
    'application/json'
  );$$
);

-- Trial expiry check every 6 hours
SELECT cron.schedule(
  'trial-expiry',
  '0 */6 * * *',
  $$SELECT net.http_post(
    'https://iqwfyrijmsoddpoacinw.supabase.co/functions/v1/trial-expiry',
    '{}',
    'application/json'
  );$$
);
```

---

## Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Environment Check | ✅ | All variables production-ready |
| Build Verification | ✅ | All errors fixed, build passes |
| Vercel Deployment | ✅ | Project linked, ready for push |
| Domain Configuration | ⏳ | Verify after deployment |
| Post-Deployment Checks | ⏳ | After deployment |
| Edge Functions | ⏳ | Deploy after main site |

---

## Next Steps

1. ✅ Fix NAMECHEAP_SANDBOX in .env.local
2. ✅ Verify Vercel project linked
3. ⏳ Commit all changes to git
4. ⏳ Push to main branch
5. ⏳ Monitor Vercel deployment
6. ⏳ Verify domain configuration (kwq8.com)
7. ⏳ Deploy edge functions
8. ⏳ Run post-deployment tests

---

## Git Changes to Commit

**Modified Files:**
- src/lib/admin-generator/schema-analyzer.ts
- src/app/admin/[projectId]/[contentType]/page.tsx
- src/app/api/projects/[projectId]/admin/route.ts
- src/app/api/projects/[projectId]/publish/route.ts
- src/app/api/widgets/[projectId]/route.ts
- src/app/api/widgets/whatsapp/route.ts
- src/lib/widgets/widget-generator.ts
- tsconfig.json

**New Files:**
- deployment-checklist.md
- Multiple new components, API routes, and migrations

**Commit Command:**
```bash
git add -A
git commit -m "fix: resolve TypeScript build errors for production deployment

- Add export to CONTENT_TYPE_FIELDS in schema-analyzer.ts
- Fix ReactNode type in admin page
- Correct analyzeProjectSchema function calls
- Update deductCredits to object-based signature
- Replace .catch() with try-catch for Supabase queries
- Add type assertions for widget phoneNumber access
- Cast WhatsApp widget style to correct type
- Add nullish coalescing for WIDGET_SIZES access
- Exclude supabase/functions from tsconfig

🤖 Generated with Claude Code"
git push origin main
```
