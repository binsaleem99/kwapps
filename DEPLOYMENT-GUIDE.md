# KW APPS - Deployment Guide to Vercel

This guide will walk you through deploying KW APPS to Vercel with all necessary configurations.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project** - Your database should be set up and running
3. **UPayments Account** - For payment processing (Kuwait)
4. **GitHub Account** - For repository hosting and auto-deployments
5. **Domain Name** (optional) - For custom domain

## Step 1: Prepare Your Database

### Run the Billing Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/005_billing_and_subscriptions.sql`
4. Paste and execute in SQL Editor
5. Verify tables were created:
   - `subscription_plans`
   - `user_subscriptions`
   - `payment_transactions`
   - `usage_tracking`

### Verify Default Plans

Run this query to check that default plans were inserted:

```sql
SELECT * FROM subscription_plans ORDER BY price_monthly;
```

You should see 4 plans: Free (0 KWD), Hosting (5 KWD), Builder (33 KWD), Pro (59 KWD)

## Step 2: Commit Your Code to GitHub

```bash
# Add all files
git add .

# Commit with descriptive message
git commit -m "feat: Complete billing system with UPayments integration

- Add UPayments API client with card tokenization
- Implement subscription management with recurring billing
- Create pricing page with 4 plan tiers
- Add billing dashboard with usage tracking
- Implement Vercel cron job for monthly charges
- Add webhook handler for payment confirmations
- Create usage limits system with database functions

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your KW APPS repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Click **Deploy** (will fail first time - we need to add env vars)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

### Supabase Variables
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
```

### App URLs
```
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL = https://your-app.vercel.app
```

### DeepSeek AI
```
DEEPSEEK_API_KEY = your_deepseek_key
DEEPSEEK_API_URL = https://api.deepseek.com
```

### UPayments (Kuwait Payment Gateway)
```
UPAYMENTS_API_URL = https://api.upayments.com/api/v1
UPAYMENTS_API_KEY = your_upayments_api_key
UPAYMENTS_WEBHOOK_SECRET = your_webhook_secret
```

### GitHub API (for auto-deployments)
```
GITHUB_TOKEN = ghp_your_personal_access_token
GITHUB_ORG = your_github_username_or_org
```

### Vercel API (for deployments)
```
VERCEL_TOKEN = your_vercel_token
VERCEL_TEAM_ID = team_xxxxxxxxxxxxx (optional)
```

### Cron Security
```
CRON_SECRET = generate_a_random_secure_string_here
```

**Important:** Make sure to set all variables for **Production**, **Preview**, and **Development** environments.

## Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **...** menu on latest deployment
3. Click **Redeploy**

Or via CLI:
```bash
vercel --prod
```

## Step 6: Configure UPayments Webhook

1. Get your production URL: `https://your-app.vercel.app`
2. Log into UPayments dashboard
3. Go to **Webhooks** settings
4. Add webhook URL: `https://your-app.vercel.app/api/billing/webhook`
5. Copy the **Webhook Secret** and add it to Vercel env vars as `UPAYMENTS_WEBHOOK_SECRET`

## Step 7: Verify Cron Job

The subscription billing cron job should now be active. To verify:

1. Go to Vercel dashboard → **Cron Jobs**
2. You should see: `process-subscriptions` running at `0 2 * * *` (2 AM UTC daily)
3. You can manually trigger it for testing

## Step 8: Test the Deployment

### Test Billing Flow

1. Go to `https://your-app.vercel.app/pricing`
2. Try selecting a plan (use test mode if available)
3. Complete payment flow
4. Verify webhook receives payment confirmation
5. Check that subscription is activated in database
6. Visit `/dashboard/billing` to see subscription details

### Test Usage Limits

1. Create a project to increment project count
2. Check `/dashboard/billing` - usage should update
3. Try to exceed limits to verify enforcement

### Test Cron Job Manually

```bash
# Call the cron endpoint with authorization
curl -X GET https://your-app.vercel.app/api/cron/subscriptions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Step 9: Set Up Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., `kwapps.com`)
3. Follow DNS configuration instructions
4. Update environment variables:
   ```
   NEXT_PUBLIC_APP_URL = https://kwapps.com
   NEXT_PUBLIC_SITE_URL = https://kwapps.com
   ```
5. Update UPayments webhook URL to new domain
6. Redeploy

## Step 10: Enable Analytics (Optional)

1. In Vercel dashboard → **Analytics**
2. Enable **Web Analytics**
3. Enable **Speed Insights**
4. Monitor performance and user behavior

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Ensure all required env vars are set in Vercel
- Check for typos in variable names

**Error: Supabase connection fails**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is accessible

### Webhook Not Working

**Payments complete but subscription not activated**
- Check webhook URL in UPayments dashboard
- Verify `UPAYMENTS_WEBHOOK_SECRET` matches
- Check Vercel logs for webhook errors
- Ensure webhook signature verification is working

### Cron Job Not Running

**Subscriptions not being charged monthly**
- Verify cron job is listed in Vercel dashboard
- Check `vercel.json` has correct cron configuration
- Ensure `CRON_SECRET` is set
- Check cron job logs in Vercel

### Database Errors

**Error: relation does not exist**
- Run all migrations in Supabase SQL Editor
- Check migration 005_billing_and_subscriptions.sql completed successfully

**Error: permission denied**
- Verify RLS policies are set correctly
- Check service role key for cron jobs

## Monitoring & Maintenance

### Daily Checks
- Monitor cron job execution logs
- Check for failed payments
- Review error logs in Vercel

### Weekly Checks
- Review subscription status
- Check usage tracking accuracy
- Monitor webhook success rate

### Monthly Checks
- Verify all recurring charges processed
- Review payment transaction records
- Check for abandoned subscriptions

## Security Best Practices

1. **Rotate API Keys Regularly**
   - Change UPayments API key every 90 days
   - Rotate CRON_SECRET periodically

2. **Monitor Logs**
   - Set up alerts for failed payments
   - Watch for suspicious webhook calls
   - Track API rate limits

3. **Backup Database**
   - Supabase has automatic backups
   - Consider exporting critical data weekly

4. **Test in Staging First**
   - Use Vercel preview deployments for testing
   - Test payment flows in UPayments sandbox mode

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **UPayments Docs**: https://upayments.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Next Steps After Deployment

1. ✅ Monitor first few transactions closely
2. ✅ Set up email notifications for failed payments
3. ✅ Create admin dashboard for subscription management
4. ✅ Implement referral system for growth
5. ✅ Add deployment system (GitHub + Vercel integration)
6. ✅ Build homepage and marketing pages

---

**Deployment Complete!** 🎉

Your KW APPS platform is now live with full billing, subscription management, and usage tracking.
