# KW APPS - Quick Start Guide

**Status:** ✅ MVP Complete - Ready for Testing

---

## 🎯 Critical First Steps (Do These Now!)

### Step 1: Run Database Migration

```bash
# 1. Open Supabase Dashboard
https://supabase.com/dashboard → Project: iqwfyrijmsoddpoacinw

# 2. Go to SQL Editor → New Query

# 3. Copy and run this file:
/supabase/migrations/002_fix_rls_and_functions.sql

# 4. Verify success ✅
```

### Step 2: Add UPayments Key (For Billing)

```bash
# Add to .env.local
UPAYMENTS_API_KEY=<get-from-upayments.com>

# Then restart server:
# Press Ctrl+C, then: npm run dev
```

---

## 🚀 Test the Platform

### Quick Test Flow (5 Minutes)

1. **Open Browser:** http://localhost:3000

2. **Create Account:** `/signup`
   - Email: test@example.com
   - Password: anything
   - Full Name: Test User

3. **Create Project:** Go to Dashboard → Click "مشروع جديد"

4. **Test AI Generation:** `/builder`
   - Enter: `أريد موقع لمطعم مع قائمة الطعام`
   - Click: "إنشاء"
   - Wait: ~30-60 seconds
   - See: Code appears in preview ✅

5. **Test Referral System:** `/admin/referrals`
   - Click: "إنشاء رمز جديد"
   - Code: `TEST2024`
   - Name: `Test Influencer`
   - Discount: `10`
   - Click: "إنشاء" ✅

6. **Test Blog:** `/admin/blog`
   - Click: "مقالة جديدة"
   - Fill in Arabic and English titles
   - Click: "نشر" ✅

---

## 📁 Key Files to Know

### Where Everything Is

```
kwapps/
├── PROGRESS-REPORT.md          ← Full progress tracking
├── TESTING-GUIDE.md            ← Complete test checklist
├── IMPLEMENTATION-COMPLETE.md  ← Summary of what's built
├── QUICK-START.md              ← This file
│
├── supabase/migrations/
│   └── 002_fix_rls_and_functions.sql  ← RUN THIS FIRST!
│
├── src/
│   ├── lib/deepseek/
│   │   ├── master-ui-prompt.ts    ← AI generation rules
│   │   └── client.ts              ← DeepSeek API wrapper
│   │
│   ├── components/builder/
│   │   ├── chat-panel.tsx         ← Chat interface
│   │   └── preview-panel.tsx      ← Live preview
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts       ← AI generation
│   │   │   ├── referrals/apply/route.ts ← Referral codes
│   │   │   └── billing/
│   │   │       ├── checkout/route.ts   ← UPayments checkout
│   │   │       └── webhook/route.ts    ← Payment webhooks
│   │   │
│   │   ├── builder/page.tsx       ← Main builder UI
│   │   ├── blog/page.tsx          ← Public blog
│   │   └── admin/
│   │       ├── referrals/page.tsx ← Referral admin
│   │       └── blog/page.tsx      ← Blog admin
```

---

## 🎨 What You Can Do Now

### User Features
- ✅ Generate apps from Arabic prompts
- ✅ Live preview with device modes
- ✅ Per-project chat history
- ✅ Usage limits (3/30/100 per day)
- ✅ Apply referral codes

### Admin Features
- ✅ Manage referral codes
- ✅ Track commissions and revenue
- ✅ Create and publish blog posts
- ✅ View all projects and users

### Business Features
- ✅ Subscription plans (Free, Builder, Pro)
- ✅ UPayments integration (K-Net + Cards)
- ✅ Automatic commission calculation
- ✅ Lifetime recurring commissions

---

## 🐛 Common Issues & Fixes

### Issue: "ENOTFOUND your-project.supabase.co"
**Fix:** Run the migration in Step 1 above

### Issue: "Usage limit exceeded"
**Expected:** Free plan = 3 prompts/day
**Fix:** Upgrade to Builder (30) or Pro (100)

### Issue: Billing doesn't work
**Fix:** Add `UPAYMENTS_API_KEY` to .env.local

### Issue: Slow dashboard (10s load)
**Expected:** Will improve after migration runs
**Already Optimized:** Profile tab uses parallel queries

---

## 📊 Usage Limits by Plan

| Plan     | Price (KWD) | Prompts/Day | Features                |
|----------|-------------|-------------|-------------------------|
| Free     | 0           | 3           | Basic generation        |
| Builder  | 33/month    | 30          | All features            |
| Pro      | 59/month    | 100         | All features + priority |

---

## 💡 Pro Tips

1. **Test with Arabic first** - That's where the magic happens!
2. **Watch the preview update** - It's sandboxed and safe
3. **Check device modes** - Mobile/tablet/desktop all work
4. **Messages persist** - Refresh the page, history stays
5. **Referral codes** - 30% lifetime commission per influencer

---

## 🚀 Ready to Deploy?

When testing is complete:

```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Add environment variables in Vercel dashboard

# 3. Update UPayments webhook to production URL

# 4. Go live! 🎉
```

---

## 📞 Need More Help?

- **Full Testing:** See `TESTING-GUIDE.md`
- **Progress Details:** See `PROGRESS-REPORT.md`
- **Implementation Summary:** See `IMPLEMENTATION-COMPLETE.md`

---

## ✅ Success Checklist

Quick verification:

- [ ] Migration ran successfully
- [ ] Can create account
- [ ] Can generate code from Arabic
- [ ] Preview shows generated app
- [ ] Can create referral code
- [ ] Can create blog post
- [ ] UPayments key added (for billing)

**All checked?** You're ready to test! 🎉

---

**Server Running At:** http://localhost:3000
**Status:** Ready for Testing ✅
**Time to Production:** 2-3 hours of testing away!
