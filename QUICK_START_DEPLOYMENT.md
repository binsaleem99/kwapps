# 🚀 Quick Start Deployment Guide
**Follow these steps to deploy KWQ8**

## STEP 1: Create Test Users (5 minutes)

### Go to Supabase Auth Dashboard
**URL:** https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users

### Create User 1 (Regular User)
1. Click **"Add User"** (top right, green button)
2. Fill in:
   - **Email:** `test@test.com`
   - **Password:** `12345678`
   - **Auto Confirm User:** ✅ YES (check this!)
3. Click **"Create User"**
4. **Copy the UUID** that appears (you'll need it)

### Create User 2 (Admin User)
1. Click **"Add User"** again
2. Fill in:
   - **Email:** `test1@test.com`
   - **Password:** `12345678`
   - **Auto Confirm User:** ✅ YES
3. Click **"Create User"**
4. **Copy the UUID**

---

## STEP 2: Apply Database Migrations (15 minutes)

### Go to Supabase SQL Editor
**URL:** https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new

### Migration 1: Paywall System
1. Open file: `/supabase/migrations/20251227_paywall_system.sql`
2. **Copy entire contents**
3. **Paste into Supabase SQL Editor**
4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. Wait for ✅ Success

### Migration 2: Tap Payments
1. Open file: `/supabase/migrations/20251227_tap_payments_infrastructure.sql`
2. **Copy entire contents**
3. **Paste into SQL Editor**
4. Click **"Run"**
5. Wait for ✅ Success

### Migration 3: Templates
1. Open file: `/supabase/migrations/20251227_template_system.sql`
2. **Copy entire contents**
3. **Paste into SQL Editor**
4. Click **"Run"**
5. Wait for ✅ Success

### Migration 4: Admin Dashboard
1. Open file: `/supabase/migrations/20251227_admin_dashboard_system.sql`
2. **Copy entire contents**
3. **Paste into SQL Editor**
4. Click **"Run"**
5. Wait for ✅ Success

### Migration 5: Visual Editor
1. Open file: `/supabase/migrations/20251227_visual_editor_system.sql`
2. **Copy entire contents**
3. **Paste into SQL Editor**
4. Click **"Run"**
5. Wait for ✅ Success

### Migration 6: Fix Generated Code (If needed)
1. Open file: `/supabase/migrations/FIXED_generated_code.sql`
2. **Copy entire contents**
3. **Paste into SQL Editor**
4. Click **"Run"**
5. Wait for ✅ Success

---

## STEP 3: Grant Test Users Credits

### Run this SQL in Supabase
**Replace `<user1-uuid>` and `<user2-uuid>` with the UUIDs you copied:**

```sql
-- Grant 10,000 credits to test users
INSERT INTO user_credits (user_id, total_credits, used_credits)
VALUES
  ('<user1-uuid>', 10000, 0),
  ('<user2-uuid>', 10000, 0)
ON CONFLICT (user_id) DO UPDATE
  SET total_credits = 10000, used_credits = 0;

-- Create test subscriptions (Pro tier)
INSERT INTO user_subscriptions (user_id, tier, status, amount_paid, current_period_start, current_period_end)
VALUES
  ('<user1-uuid>', 'pro', 'active', 37.50, NOW(), NOW() + INTERVAL '30 days'),
  ('<user2-uuid>', 'premium', 'active', 58.75, NOW(), NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Verify
SELECT u.email, uc.total_credits, us.tier, us.status
FROM auth.users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email IN ('test@test.com', 'test1@test.com');
```

---

## STEP 4: Verify Everything Works

### Check Tables Were Created
```sql
-- Should return 20+ tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE ANY (ARRAY[
    '%paywall%',
    '%tap%',
    '%template%',
    '%admin%',
    '%editor%'
  ]);
```

### Check Users Exist
```sql
-- Should return 2 users
SELECT email, created_at
FROM auth.users
WHERE email IN ('test@test.com', 'test1@test.com');
```

### Check Credits Granted
```sql
-- Should show 10,000 credits each
SELECT
  u.email,
  uc.total_credits,
  uc.used_credits,
  (uc.total_credits - uc.used_credits) as available
FROM auth.users u
JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('test@test.com', 'test1@test.com');
```

---

## STEP 5: Test Login Locally

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Try logging in:
# Email: test@test.com
# Password: 12345678
```

---

## ✅ CHECKLIST

- [ ] Test users created in Supabase Auth
- [ ] All 5 migrations applied successfully
- [ ] User credits granted (10,000 each)
- [ ] Test subscriptions created
- [ ] Users can login
- [ ] No errors in console

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"
- Migration was already partially applied
- Skip that CREATE TABLE or use CREATE TABLE IF NOT EXISTS

### Error: "user already exists"
- User already created
- Use SQL UPDATE instead of INSERT

### Can't login
- Check user email is confirmed in Auth dashboard
- Check password is correct
- Check user exists in auth.users table

---

## 🎯 AFTER SUCCESSFUL MIGRATION

You can now:
1. ✅ Login with test@test.com
2. ✅ Browse templates
3. ✅ Generate websites (10,000 credits available)
4. ✅ Use visual editor
5. ✅ Test all features

**Ready to deploy to production when you are!** 🚀
