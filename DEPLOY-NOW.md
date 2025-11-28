# 🚀 Deploy KW APPS to Vercel - Quick Start

Your code is ready for deployment! Follow these steps to deploy to Vercel.

## ✅ Pre-Deployment Checklist

All code is committed and ready:
- ✅ Billing system implemented
- ✅ Database migration file created
- ✅ Environment variables documented
- ✅ Vercel cron job configured
- ✅ All changes committed to git

## 🎯 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Create GitHub Repository**
   ```bash
   # Go to github.com and create a new repository
   # Then run:
   git remote add origin https://github.com/YOUR_USERNAME/kwapps.git
   git branch -M main
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your kwapps repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Click **Deploy**

4. **Add Environment Variables** (IMPORTANT!)

   After first deployment (will fail without env vars):
   - Go to project **Settings** → **Environment Variables**
   - Copy each variable from `.env.local` file
   - Add to all environments: Production, Preview, Development

   **Required Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL (use your vercel URL)
   NEXT_PUBLIC_SITE_URL (use your vercel URL)
   DEEPSEEK_API_KEY
   UPAYMENTS_API_KEY
   UPAYMENTS_WEBHOOK_SECRET
   CRON_SECRET (generate a random string)
   GITHUB_TOKEN
   VERCEL_TOKEN
   ```

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts and set up environment variables when asked
```

## 📊 Post-Deployment Tasks

### 1. Run Database Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy contents of `supabase/migrations/005_billing_and_subscriptions.sql`
5. Paste and execute
6. Verify tables created:
   ```sql
   SELECT * FROM subscription_plans;
   ```

### 2. Configure UPayments Webhook

1. Login to [UPayments Dashboard](https://dashboard.upayments.com)
2. Go to **Settings** → **Webhooks**
3. Add webhook URL: `https://YOUR_APP.vercel.app/api/billing/webhook`
4. Copy the **Webhook Secret**
5. Add to Vercel env vars as `UPAYMENTS_WEBHOOK_SECRET`

### 3. Test the Deployment

1. Visit your deployed app: `https://YOUR_APP.vercel.app`
2. Go to `/pricing` page
3. Try selecting a plan
4. Complete test payment (use UPayments test mode)
5. Verify subscription activated

### 4. Verify Cron Job

1. In Vercel dashboard → **Cron Jobs**
2. Should see: `process-subscriptions` at `0 2 * * *`
3. Manually trigger to test:
   ```bash
   curl -X GET https://YOUR_APP.vercel.app/api/cron/subscriptions \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## 🔐 Environment Variables Reference

Create these in Vercel (Settings → Environment Variables):

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### App URLs (Update with your Vercel URL)
```bash
NEXT_PUBLIC_APP_URL=https://kwapps.vercel.app
NEXT_PUBLIC_SITE_URL=https://kwapps.vercel.app
```

### DeepSeek AI
```bash
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_API_URL=https://api.deepseek.com
```

### UPayments (Kuwait Payment Gateway)
```bash
UPAYMENTS_API_URL=https://api.upayments.com/api/v1
UPAYMENTS_API_KEY=your_api_key
UPAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

### GitHub (for auto-deployments)
```bash
GITHUB_TOKEN=ghp_...
GITHUB_ORG=your_github_username
```

### Vercel API
```bash
VERCEL_TOKEN=your_token
VERCEL_TEAM_ID=team_... (if using team)
```

### Security
```bash
CRON_SECRET=random_secure_string_here
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

## 🎉 Success Checklist

After deployment, verify:

- ✅ App loads at production URL
- ✅ Pricing page displays all 4 plans
- ✅ Can create account and login
- ✅ Dashboard loads without errors
- ✅ Billing page shows subscription status
- ✅ Database migration completed
- ✅ UPayments webhook configured
- ✅ Cron job appears in Vercel dashboard
- ✅ Test payment flow works
- ✅ All environment variables set

## 🚨 Troubleshooting

### Build Fails
**Error: Missing environment variables**
→ Add all required env vars in Vercel dashboard

**Error: Cannot find module**
→ Check package.json and run `npm install` locally

### Runtime Errors
**Supabase connection fails**
→ Verify SUPABASE_URL and ANON_KEY are correct

**Payment flow doesn't work**
→ Check UPAYMENTS_API_KEY and webhook URL

### Cron Job Not Running
**Subscriptions not being charged**
→ Verify `vercel.json` is in root directory
→ Check CRON_SECRET is set
→ Review cron job logs in Vercel

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- UPayments Docs: https://upayments.com/docs

---

## 🎊 You're Almost There!

Once deployed, your KW APPS platform will have:
- ✅ Full billing and subscription system
- ✅ Automatic monthly recurring charges
- ✅ Usage tracking and limits
- ✅ Payment processing via UPayments
- ✅ Secure webhook handling
- ✅ Admin dashboard
- ✅ Blog system
- ✅ AI-powered app builder

**Let's deploy! 🚀**
