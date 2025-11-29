# 🚀 Deploy KW APPS to Vercel - Step by Step

## ✅ Pre-Deployment Checklist

Your code is ready:
- ✅ All features implemented and tested
- ✅ Billing system complete
- ✅ Deployment system with GitHub integration
- ✅ Template gallery with database
- ✅ Navigation system complete
- ✅ All changes committed to git

---

## 📋 Deployment Steps

### Step 1: Create GitHub Repository

Since you don't have GitHub CLI, follow these manual steps:

1. **Go to GitHub.com** and log in
2. **Click the "+" icon** in the top right → "New repository"
3. **Repository settings:**
   - Name: `kwapps` (or any name you prefer)
   - Description: `KW APPS - AI-powered app builder platform`
   - Visibility: **Public** or **Private** (your choice)
   - **DO NOT** initialize with README (we already have one)
4. **Click "Create repository"**

5. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kwapps.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 2: Deploy to Vercel via Dashboard

#### Option A: Import from GitHub (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Click "Import Git Repository"**
3. **Select your GitHub account** and find `kwapps` repository
4. **Click "Import"**
5. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Click "Deploy"** (will fail without env vars - that's expected)

#### Option B: Deploy via Vercel CLI

If you prefer CLI:

```bash
# Login to Vercel
npx vercel login

# Deploy to production
npx vercel --prod
```

---

### Step 3: Add Environment Variables

After the first deployment attempt, add environment variables:

1. **Go to your Vercel project dashboard**
2. **Click "Settings"** → **"Environment Variables"**
3. **Add each variable below** to **all environments** (Production, Preview, Development)

#### Required Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://iqwfyrijmsoddpoacinw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxd2Z5cmlqbXNvZGRwb2FjaW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTYwMjQsImV4cCI6MjA3OTg5MjAyNH0.KpTWdunPKJWGvQ4MGgqkPo-FbO-Uq0iA0aXB6qtEesI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxd2Z5cmlqbXNvZGRwb2FjaW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMxNjAyNCwiZXhwIjoyMDc5ODkyMDI0fQ.F3qniAo6rQpLBHZ4P3oD8SHPagi3k6Xwq_p2uGUGtO0

# App URLs (Update with your Vercel URL after deployment)
NEXT_PUBLIC_APP_URL=https://YOUR_APP.vercel.app
NEXT_PUBLIC_SITE_URL=https://YOUR_APP.vercel.app
NEXT_PUBLIC_APP_NAME=KW APPS

# DeepSeek AI
DEEPSEEK_API_KEY=sk-18f9cc8cac954248885cdc7d058b83ee
DEEPSEEK_CODE_MODEL=deepseek-coder
DEEPSEEK_CHAT_MODEL=deepseek-chat

# UPayments
UPAYMENTS_API_KEY=a9828a188bc512674712cc6fc647894cba3f1b7c
UPAYMENTS_MERCHANT_ID=69683
UPAYMENTS_WEBHOOK_SECRET=$2y$10$3yZitPLqL37Jpf4rZnzUGeRZD1fJytpP/kezZx2ajjmmefaQyukwq

# GitHub
GITHUB_TOKEN=89755bbd3f60eb01648ef272c97b41b4088589e0
GITHUB_ORG=Iv23lidSRQZhabTUJNRp

# Vercel (for deployment features)
VERCEL_TOKEN=vck_4IU7jY9zrsgf3Mft5lbRpE2SsXBTZyq3Zx7IUfVSAcfAZ2EWwb2VMN30
VERCEL_TEAM_ID=team_tcjxQPbWENd8QyN2mmFmhWpx

# Security
CRON_SECRET=kwapps-cron-secret-2024

# Admin
ADMIN_EMAIL=admin@kwapps.com
```

**Important:** After adding env vars, you need to redeploy!

---

### Step 4: Redeploy with Environment Variables

1. **Go to "Deployments" tab**
2. **Click the "..." menu** on your latest deployment
3. **Click "Redeploy"**
4. **Wait for deployment to complete** (2-5 minutes)

---

### Step 5: Update App URLs

After successful deployment:

1. **Copy your Vercel URL** (e.g., `https://kwapps.vercel.app`)
2. **Go back to Settings** → **Environment Variables**
3. **Update these variables:**
   - `NEXT_PUBLIC_APP_URL` → Your Vercel URL
   - `NEXT_PUBLIC_SITE_URL` → Your Vercel URL
4. **Redeploy again**

---

### Step 6: Configure UPayments Webhook

1. **Login to [UPayments Dashboard](https://dashboard.upayments.com)**
2. **Go to Settings** → **Webhooks**
3. **Add webhook URL:**
   ```
   https://YOUR_APP.vercel.app/api/billing/webhook
   ```
4. **Copy the webhook secret** and update `UPAYMENTS_WEBHOOK_SECRET` in Vercel
5. **Redeploy**

---

### Step 7: Run Database Migrations

You mentioned you ran migration 006. Make sure all migrations are executed:

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Select your project**
3. **Go to SQL Editor**
4. **Run these migrations in order:**

```sql
-- Check which migrations you've run
SELECT * FROM supabase_migrations.schema_migrations;

-- If you haven't run all, execute them in order:
-- 001_initial_schema.sql (if exists)
-- 002_auth_and_profiles.sql (if exists)
-- ...
-- 005_billing_and_subscriptions.sql
-- 006_templates_system.sql
```

5. **Verify templates seeded:**
   ```sql
   SELECT id, name, slug, is_active FROM app_templates;
   ```

   You should see 6 templates.

---

### Step 8: Verify Deployment

Test these pages on your deployed URL:

1. **Homepage:** `https://YOUR_APP.vercel.app`
   - ✅ Navigation works
   - ✅ Hero section loads
   - ✅ Features display
   - ✅ Templates section shows (or loads from DB)
   - ✅ Pricing section

2. **Pricing Page:** `/pricing`
   - ✅ 4 plans display
   - ✅ Checkout buttons work

3. **Templates Page:** `/templates`
   - ✅ Templates load from database
   - ✅ Category filtering works
   - ✅ Template cards display

4. **Blog Page:** `/blog`
   - ✅ Blog posts display

5. **Auth Pages:**
   - ✅ `/login` - Login form works
   - ✅ `/signup` - Signup form works

6. **Builder:** `/builder`
   - ✅ AI builder loads
   - ✅ Can generate code

7. **Dashboard:** `/dashboard`
   - ✅ Requires authentication
   - ✅ Projects tab works
   - ✅ Billing tab works (after subscribing)

---

### Step 9: Test Key Features

1. **Create an account**
   - Signup with email
   - Verify email works (check Supabase auth)

2. **Test AI builder**
   - Create a project
   - Generate code with AI
   - Preview works

3. **Test deployment**
   - Deploy a project
   - Verify GitHub repo created
   - Verify Vercel deployment
   - Check both URLs display

4. **Test billing (optional for now)**
   - View pricing page
   - Click subscribe (use UPayments test mode)
   - Verify subscription activates

---

## 🐛 Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Add all env vars in Vercel dashboard, then redeploy

**Error: Cannot find module**
- Solution: Make sure `package.json` has all dependencies
- Run locally: `npm install` and check for errors

### Runtime Errors

**Supabase connection fails**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is active

**Templates don't load**
- Run migration 006 in Supabase SQL Editor
- Check RLS policies allow public read

**Deployment doesn't create GitHub repo**
- Verify `GITHUB_TOKEN` has `repo` scope
- Check `GITHUB_ORG` is your username

### Cron Job Issues

**Subscriptions not being charged**
- Verify `vercel.json` is committed
- Check `CRON_SECRET` is set in Vercel
- View cron logs in Vercel dashboard

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ App loads at Vercel URL
- ✅ All pages accessible
- ✅ Can create account
- ✅ Can login/logout
- ✅ AI builder works
- ✅ Templates page loads
- ✅ Pricing page displays
- ✅ Blog page works
- ✅ Can create project
- ✅ Can deploy project
- ✅ GitHub repo created
- ✅ Vercel deployment works
- ✅ Both URLs display in dashboard
- ✅ Navigation works on mobile

---

## 📝 Post-Deployment Tasks

1. **Custom Domain (Optional)**
   - Buy domain (e.g., kwapps.com)
   - Add to Vercel project
   - Configure DNS

2. **Analytics**
   - Add Vercel Analytics
   - Add Google Analytics

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor cron jobs

4. **SEO**
   - Add sitemap.xml
   - Add robots.txt
   - Optimize meta tags

5. **Performance**
   - Enable Vercel Image Optimization
   - Add CDN caching
   - Optimize bundle size

---

## 🔗 Important URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **UPayments Dashboard:** https://dashboard.upayments.com
- **GitHub:** https://github.com

---

## 📞 Need Help?

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Supabase logs
4. Review error messages carefully

---

**Ready to deploy! Follow the steps above and let me know if you need help with any step.**
