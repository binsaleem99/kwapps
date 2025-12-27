# 🗄️ Database Migrations - Application Guide

## Migration Files Created (5 new + 1 fixed)

All migrations are located in: `/supabase/migrations/`

### New Migrations from Implementation:
1. **20251227_paywall_system.sql** (17KB) - Paywall & conversion
2. **20251227_tap_payments_infrastructure.sql** (19KB) - Tap payments
3. **20251227_template_system.sql** (11KB) - Template system
4. **20251227_admin_dashboard_system.sql** (10KB) - Admin dashboards
5. **20251227_visual_editor_system.sql** (10KB) - Visual editor

### Fixed Migration:
6. **FIXED_generated_code.sql** - Fixes existing policy conflict

---

## 🚨 IMPORTANT: Apply in This Order

### Step 1: Fix Existing Conflict (if error occurs)
```sql
-- Run this FIRST in Supabase SQL Editor if you get policy errors:
-- https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new

-- Copy and paste content from:
supabase/migrations/FIXED_generated_code.sql
```

### Step 2: Apply New Migrations (In Order)

**Migration 1: Paywall System**
```sql
-- Copy from: supabase/migrations/20251227_paywall_system.sql
-- Tables: paywall_events, trial_tracking, discount_codes, discount_usage, spin_wheel_entries
```

**Migration 2: Tap Payments**
```sql
-- Copy from: supabase/migrations/20251227_tap_payments_infrastructure.sql
-- Tables: tap_subscriptions, exchange_rates, tap_billing_events, webhook_events, payment_retry_schedule, tap_customers, tap_plans
```

**Migration 3: Templates**
```sql
-- Copy from: supabase/migrations/20251227_template_system.sql
-- Tables: templates, template_usage, template_ratings
```

**Migration 4: Admin Dashboard**
```sql
-- Copy from: supabase/migrations/20251227_admin_dashboard_system.sql
-- Tables: admin_dashboards, project_admin_users, admin_activity_logs, admin_products
```

**Migration 5: Visual Editor**
```sql
-- Copy from: supabase/migrations/20251227_visual_editor_system.sql
-- Tables: visual_editor_sessions, editor_messages, code_snapshots, element_selections
```

---

## ✅ Verification After Each Migration

Run this query after each migration:

```sql
-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    -- Paywall
    'paywall_events', 'trial_tracking', 'discount_codes',
    -- Tap
    'tap_subscriptions', 'exchange_rates', 'tap_billing_events',
    -- Templates
    'templates', 'template_usage', 'template_ratings',
    -- Admin
    'admin_dashboards', 'project_admin_users', 'admin_activity_logs',
    -- Visual Editor
    'visual_editor_sessions', 'editor_messages', 'code_snapshots'
  )
ORDER BY table_name;
```

**Expected Result:** All table names listed above should appear.

---

## 🔍 Post-Migration Checks

### 1. Check Row Level Security
```sql
-- All new tables should have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%paywall%'
   OR tablename LIKE '%tap%'
   OR tablename LIKE '%template%'
   OR tablename LIKE '%admin%'
   OR tablename LIKE '%editor%';
```

**Expected:** All rows show `rowsecurity = true`

### 2. Check Policies
```sql
-- Count policies per table
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Expected:** Each table should have 1-3 policies

### 3. Check Functions
```sql
-- Verify helper functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_discount_code',
    'is_discount_code_valid',
    'convert_from_kwd',
    'convert_to_kwd',
    'get_latest_snapshot'
  );
```

### 4. Check Views
```sql
-- Verify analytics views exist
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'paywall_conversion_funnel',
    'subscription_overview',
    'tap_currency_distribution',
    'popular_templates',
    'visual_editor_stats'
  );
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
```sql
-- If table already exists, skip that CREATE TABLE
-- OR drop and recreate:
DROP TABLE IF EXISTS <table_name> CASCADE;
-- Then run CREATE TABLE again
```

### Error: "policy already exists"
```sql
-- Drop existing policy first:
DROP POLICY IF EXISTS "<policy_name>" ON <table_name>;
-- Then run CREATE POLICY again
```

### Error: "function already exists"
```sql
-- Use CREATE OR REPLACE instead of CREATE:
CREATE OR REPLACE FUNCTION function_name() ...
```

### Error: "permission denied"
```
Make sure you're logged in as the database owner
or have sufficient privileges.
```

---

## 📊 Expected Database State After All Migrations

### Total Tables: 30+
- **Existing:** ~15 tables (users, projects, messages, etc.)
- **New from Paywall:** 5 tables
- **New from Tap:** 7 tables
- **New from Templates:** 3 tables
- **New from Admin:** 4 tables
- **New from Visual Editor:** 4 tables

### Total Views: 7+
- paywall_conversion_funnel
- subscription_overview
- tap_currency_distribution
- migration_progress
- popular_templates
- template_category_stats
- visual_editor_stats
- popular_change_types
- admin_dashboard_stats

### Total Functions: 10+
- generate_discount_code
- is_discount_code_valid
- apply_discount
- convert_from_kwd
- convert_to_kwd
- has_active_upayments_subscription
- has_active_tap_subscription
- get_user_payment_provider
- get_latest_snapshot
- get_snapshot_history

---

## ⚡ Quick Apply (If you have Supabase CLI)

```bash
# Apply all migrations at once
cd supabase/migrations
for file in 20251227*.sql; do
  echo "Applying $file..."
  supabase db push --file $file
done
```

---

## ✅ Final Verification Query

```sql
-- Run this to get a complete overview
SELECT
  'Tables' as type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT
  'Views' as type,
  COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT
  'Functions' as type,
  COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
UNION ALL
SELECT
  'Policies' as type,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';
```

**Expected Output:**
- Tables: 30+
- Views: 7+
- Functions: 10+
- Policies: 40+

---

## 🎯 Post-Migration Actions

After all migrations succeed:

1. **Verify Data Access**
```sql
-- Test RLS is working
SET ROLE authenticated;
SELECT * FROM templates LIMIT 1;
SELECT * FROM paywall_events LIMIT 1;
```

2. **Insert Sample Data** (Optional)
```sql
-- Sample discount codes already inserted by migration
SELECT code, discount_percent FROM discount_codes;

-- Sample Tap plans already inserted
SELECT id, name_ar FROM tap_plans;
```

3. **Update Application**
```bash
# Restart application to pick up new schema
vercel redeploy
```

---

**Status:** Ready to Apply ✅
**Estimated Time:** 5-10 minutes
**Risk Level:** Low (all have rollback capability)

**Supabase SQL Editor:** https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new
