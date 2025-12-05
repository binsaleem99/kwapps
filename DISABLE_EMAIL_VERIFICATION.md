# Disable Email Verification in Supabase

## Step 1: Disable Email Verification (Manual - Supabase Dashboard)

Since Supabase doesn't provide an API to disable email verification, you must do this manually in the Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/providers
2. Click on "Email" provider
3. **Uncheck** "Confirm email" option
4. Click "Save"

**Alternative URL Pattern:**
- Direct link: `https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/providers`

---

## Step 2: Apply Database Migration (Automated)

Run this command to apply the payment gate migration:

```bash
cd /c/Users/abins/OneDrive/Desktop/kwapps/kwapps
npx supabase db push
```

This will:
- Add `payment_status` field to users table
- Add `payment_verified_at` timestamp
- Update trigger to set `payment_required` for new users
- Create helper functions for payment checks
- Update RLS policies
- Sync subscriptions with payment status

---

## Step 3: Verify Migration

After running the migration, verify with these SQL queries in Supabase SQL Editor:

```sql
-- 1. Check payment_status column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('payment_status', 'payment_verified_at');

-- 2. Check existing users (should have payment_required by default)
SELECT id, email, payment_status, payment_verified_at, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Test payment gate function
SELECT user_has_paid();
```

---

## Step 4: Test Registration Flow

1. Register a new user at: https://kwq8.com/sign-up
2. User should be created WITHOUT email verification
3. User should be redirected to pricing/payment page
4. After payment, user should have access to dashboard

---

## What This Changes

### Before:
1. User registers → Email verification required
2. User clicks email link → Account activated
3. User can access dashboard without payment

### After:
1. User registers → Account created immediately (NO email verification)
2. User redirected to payment selection
3. User CANNOT access dashboard/builder until payment completed
4. After payment → Full access granted

### Payment Status Flow:
```
payment_required → (user pays) → trial/active → (subscription expires) → expired
                                               → (user cancels) → cancelled
```

---

## Admin Override

Admins can bypass payment gate. The middleware automatically allows admins to access all routes regardless of payment status.

---

## Troubleshooting

### Issue: Users still receiving verification emails
**Solution:** Make sure you unchecked "Confirm email" in Auth → Providers → Email

### Issue: Migration fails
**Solution:** Check if columns already exist:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```

### Issue: Users stuck on payment page
**Solution:** Check webhook is processing payments correctly:
```sql
SELECT * FROM processed_webhooks ORDER BY created_at DESC LIMIT 5;
```
