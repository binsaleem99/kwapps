# 📋 Manual Deployment Steps - Copy & Paste
**Simple steps to deploy everything**

## ✅ STEP-BY-STEP PROCESS

### Step 1: Open Supabase SQL Editor (Keep this tab open)
**Click here:** https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new

---

### Step 2: Apply Migration 1 - Paywall System

**Copy this file path and open it:**
```
/Users/Ahmadsaleem/desktop/kwq8/supabase/migrations/20251227_paywall_system.sql
```

1. Open the file above
2. Select All (Cmd+A)
3. Copy (Cmd+C)
4. Go to Supabase SQL Editor tab
5. Paste (Cmd+V)
6. Click **"RUN"** or press Cmd+Enter
7. Wait for ✅ **Success**

---

### Step 3: Apply Migration 2 - Tap Payments

**Copy this file path and open it:**
```
/Users/Ahmadsaleem/desktop/kwq8/supabase/migrations/20251227_tap_payments_infrastructure.sql
```

1. Clear SQL Editor (select all and delete)
2. Open the file above
3. Select All → Copy
4. Paste in SQL Editor
5. Click **"RUN"**
6. Wait for ✅ **Success**

---

### Step 4: Apply Migration 3 - Templates

**Copy this file path and open it:**
```
/Users/Ahmadsaleem/desktop/kwq8/supabase/migrations/20251227_template_system.sql
```

1. Clear SQL Editor
2. Open file → Copy
3. Paste in SQL Editor
4. Click **"RUN"**
5. Wait for ✅ **Success**

---

### Step 5: Apply Migration 4 - Admin Dashboard

**Copy this file path and open it:**
```
/Users/Ahmadsaleem/desktop/kwq8/supabase/migrations/20251227_admin_dashboard_system.sql
```

1. Clear SQL Editor
2. Open file → Copy
3. Paste in SQL Editor
4. Click **"RUN"**
5. Wait for ✅ **Success**

---

### Step 6: Apply Migration 5 - Visual Editor

**Copy this file path and open it:**
```
/Users/Ahmadsaleem/desktop/kwq8/supabase/migrations/20251227_visual_editor_system.sql
```

1. Clear SQL Editor
2. Open file → Copy
3. Paste in SQL Editor
4. Click **"RUN"**
5. Wait for ✅ **Success**

---

### Step 7: Create Test Users

**Open Auth Dashboard:** https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users

**User 1:**
1. Click **"Add User"** (green button, top right)
2. Enter:
   - Email: `test@test.com`
   - Password: `12345678`
   - Auto Confirm User: ✅ **CHECK THIS BOX**
3. Click **"Create User"**

**User 2:**
1. Click **"Add User"** again
2. Enter:
   - Email: `test1@test.com`
   - Password: `12345678`
   - Auto Confirm User: ✅ **CHECK THIS BOX**
3. Click **"Create User"**

---

### Step 8: Grant Credits to Test Users

**Back to SQL Editor, run this:**

```sql
-- Get user IDs and grant credits
DO $$
DECLARE
  test_user_id UUID;
  admin_user_id UUID;
BEGIN
  -- Find users
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@test.com';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'test1@test.com';

  -- Grant 10,000 credits each
  INSERT INTO user_credits (user_id, total_credits, used_credits)
  VALUES
    (test_user_id, 10000, 0),
    (admin_user_id, 10000, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET total_credits = 10000, used_credits = 0;

  -- Create Pro subscription for test@test.com
  INSERT INTO user_subscriptions (user_id, tier, status, amount_paid, currency, billing_interval, current_period_start, current_period_end)
  VALUES
    (test_user_id, 'pro', 'active', 37.50, 'KWD', 'monthly', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active', current_period_end = NOW() + INTERVAL '30 days';

  -- Create Premium subscription for test1@test.com
  INSERT INTO user_subscriptions (user_id, tier, status, amount_paid, currency, billing_interval, current_period_start, current_period_end)
  VALUES
    (admin_user_id, 'premium', 'active', 58.75, 'KWD', 'monthly', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active', current_period_end = NOW() + INTERVAL '30 days';

  RAISE NOTICE '✅ Credits granted: 10,000 each';
  RAISE NOTICE '✅ test@test.com: Pro tier';
  RAISE NOTICE '✅ test1@test.com: Premium tier';
END $$;
```

---

### Step 9: Verify Everything

**Run this in SQL Editor:**

```sql
-- Check test users
SELECT
  u.email,
  us.tier,
  us.status,
  uc.total_credits,
  uc.used_credits
FROM auth.users u
LEFT JOIN users u2 ON u.id = u2.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('test@test.com', 'test1@test.com');
```

**Expected output:**
```
test@test.com  | pro     | active | 10000 | 0
test1@test.com | premium | active | 10000 | 0
```

---

### Step 10: Test Login

```bash
cd /Users/Ahmadsaleem/desktop/kwq8
npm run dev
```

**Open:** http://localhost:3000

**Login with:**
- Email: `test@test.com`
- Password: `12345678`

---

## ✅ CHECKLIST

- [ ] Migration 1 applied (Paywall)
- [ ] Migration 2 applied (Tap)
- [ ] Migration 3 applied (Templates)
- [ ] Migration 4 applied (Admin)
- [ ] Migration 5 applied (Visual Editor)
- [ ] test@test.com created
- [ ] test1@test.com created
- [ ] Credits granted (10,000 each)
- [ ] Subscriptions created (Pro & Premium)
- [ ] Can login successfully
- [ ] No errors in console

---

**Total Time:** 20-25 minutes
**Difficulty:** Easy (just copy-paste!)

🎉 **After this, your KWQ8 platform is fully deployed and ready to use!**
