# KWQ8 Database Schema Documentation

**Generated:** December 27, 2025
**Database:** Supabase (PostgreSQL)
**Total Tables:** 30+
**Total Migrations:** 22

---

## Table of Contents

1. [Core Tables](#core-tables)
2. [Billing System Tables](#billing-system-tables)
3. [Multi-Agent System Tables](#multi-agent-system-tables)
4. [Additional Features](#additional-features)
5. [RLS Policies Summary](#rls-policies-summary)
6. [Indexes Summary](#indexes-summary)
7. [Foreign Key Relationships](#foreign-key-relationships)

---

## Core Tables

### `users` (auth.users + profiles)
**Purpose:** User accounts and profile information

**Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  plan TEXT, -- 'free', 'basic', 'pro', 'premium', 'enterprise'
  is_admin BOOLEAN DEFAULT false,
  admin_role TEXT, -- 'owner', 'support', 'content', 'readonly'
  payment_status TEXT, -- 'payment_required', 'trial', 'active', 'cancelled', 'expired'
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_profiles_email` on email
- `idx_profiles_plan` on plan
- `idx_profiles_admin` on is_admin
- `idx_profiles_payment_status` on payment_status

**RLS:** Enabled
- Users can read/update their own profile
- Service role has full access

---

### `projects`
**Purpose:** User-created websites/projects

**Schema:**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  arabic_prompt TEXT,
  english_prompt TEXT,
  generated_code TEXT,
  template_id UUID REFERENCES templates(id),
  status TEXT, -- 'draft', 'generating', 'preview', 'published', 'error'
  active_version INTEGER DEFAULT 1,
  deployed_url TEXT,
  vercel_project_id TEXT,
  github_repo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_projects_user_id` on user_id
- `idx_projects_status` on status
- `idx_projects_created_at` on created_at DESC

**RLS:** Enabled
- Users can only access their own projects
- Admins can access all projects (via service role)

---

### `messages`
**Purpose:** Chat history for AI conversations

**Schema:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_messages_project_id` on project_id
- `idx_messages_created_at` on created_at DESC

**RLS:** Enabled
- Users can only see messages from their own projects

---

### `templates`
**Purpose:** Pre-built website templates

**Schema:**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  category TEXT NOT NULL, -- 'salon', 'restaurant', 'store', 'portfolio'
  preview_url TEXT,
  thumbnail_url TEXT,
  base_code TEXT NOT NULL,
  customizable_sections JSONB,
  color_scheme JSONB,
  features TEXT[],
  is_rtl BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_templates_category` on category
- `idx_templates_premium` on is_premium
- `idx_templates_active` on is_active
- `idx_templates_use_count` on use_count DESC

**RLS:** Enabled
- All authenticated users can read active templates
- Only admins can modify

---

### `deployments`
**Purpose:** Track deployment history

**Schema:**
```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vercel_deployment_id TEXT,
  vercel_url TEXT,
  status TEXT, -- 'pending', 'building', 'deployed', 'failed'
  build_logs TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_deployments_project_id` on project_id
- `idx_deployments_user_id` on user_id
- `idx_deployments_status` on status

**RLS:** Enabled
- Users can only see their own deployments

---

## Billing System Tables

### `subscription_tiers`
**Purpose:** Define subscription plans

**Schema:**
```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'basic', 'pro', 'premium', 'enterprise'
  display_name_ar TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  price_kwd DECIMAL(10, 2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  daily_bonus_credits INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data:**
| name | price_kwd | credits_per_month | daily_bonus_credits |
|------|-----------|-------------------|---------------------|
| basic | 23.00 | 100 | 5 |
| pro | 38.00 | 200 | 8 |
| premium | 59.00 | 350 | 12 |
| enterprise | 75.00 | 500 | 15 |

**Indexes:**
- `idx_subscription_tiers_name` on name
- `idx_subscription_tiers_active` on is_active

**RLS:** Enabled (read-only for authenticated users)

---

### `user_subscriptions`
**Purpose:** Track user subscriptions and credits

**Schema:**
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES subscription_tiers(id),

  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,

  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,

  credits_balance INTEGER DEFAULT 0,
  credits_allocated_this_period INTEGER DEFAULT 0,
  credits_bonus_earned INTEGER DEFAULT 0,
  credits_rollover INTEGER DEFAULT 0,

  last_payment_amount DECIMAL(10, 2),
  last_payment_date TIMESTAMPTZ,
  payment_method TEXT,
  payment_provider_subscription_id TEXT,

  failed_payment_attempts INTEGER DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_active_per_user UNIQUE (user_id) WHERE status = 'active'
);
```

**Indexes:**
- `idx_user_subscriptions_user_id` on user_id
- `idx_user_subscriptions_status` on status
- `idx_user_subscriptions_period_end` on current_period_end

**RLS:** Enabled
- Users can view/update their own subscription

---

### `credit_operations`
**Purpose:** Define operation costs

**Schema:**
```sql
CREATE TABLE credit_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL UNIQUE,
  display_name_ar TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  credit_cost DECIMAL(10, 2) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data:**
| operation_type | credit_cost | description |
|----------------|-------------|-------------|
| chat | 1.0 | Chat message |
| simple_edit | 0.5 | Simple edit |
| component | 2.0 | Component generation |
| page | 3.0 | Page generation |
| complex | 4.0 | Complex operation |
| banana_image | 2.5 | AI image generation |
| deploy | 1.0 | Deployment |

**RLS:** Enabled (read-only)

---

### `credit_transactions`
**Purpose:** Credit transaction log

**Schema:**
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,

  transaction_type TEXT NOT NULL, -- 'debit', 'credit', 'bonus', 'rollover', 'refund', 'allocation'
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,

  operation_type TEXT REFERENCES credit_operations(operation_type),
  operation_metadata JSONB,
  bonus_date DATE,

  description_ar TEXT,
  description_en TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_credit_transactions_user_id` on user_id
- `idx_credit_transactions_subscription_id` on subscription_id
- `idx_credit_transactions_type` on transaction_type
- `idx_credit_transactions_created_at` on created_at DESC
- `idx_credit_transactions_bonus_date` on bonus_date WHERE transaction_type = 'bonus'

**RLS:** Enabled (users can only see their own)

---

### `daily_bonus_log`
**Purpose:** Track daily bonus claims

**Schema:**
```sql
CREATE TABLE daily_bonus_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  bonus_date DATE NOT NULL,
  bonus_amount INTEGER NOT NULL,
  transaction_id UUID REFERENCES credit_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_bonus_per_day UNIQUE (user_id, bonus_date)
);
```

**Indexes:**
- `idx_daily_bonus_log_user_date` on (user_id, bonus_date)
- `idx_daily_bonus_log_subscription` on subscription_id

**RLS:** Enabled

---

### `trial_subscriptions`
**Purpose:** Track trial subscriptions

**Schema:**
```sql
CREATE TABLE trial_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,

  trial_price_kwd DECIMAL(10, 2) DEFAULT 1.00,
  trial_duration_days INTEGER DEFAULT 7,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,

  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_transaction_id TEXT,
  payment_date TIMESTAMPTZ,

  converted_to_paid BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_trial_subscriptions_user_id` on user_id
- `idx_trial_subscriptions_ends_at` on ends_at
- `idx_trial_subscriptions_payment_status` on payment_status

**RLS:** Enabled

---

### `payment_transactions`
**Purpose:** UPayments transaction log

**Schema:**
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  trial_id UUID REFERENCES trial_subscriptions(id) ON DELETE SET NULL,

  upayments_order_id TEXT NOT NULL UNIQUE,
  upayments_track_id TEXT,
  upayments_payment_id TEXT,
  upayments_transaction_id TEXT,

  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KWD',
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'canceled', 'refunded'
  payment_method TEXT, -- 'knet', 'cc', 'apple-pay', etc.
  transaction_type TEXT NOT NULL, -- 'subscription', 'trial', 'renewal', 'upgrade'

  metadata JSONB DEFAULT '{}',
  card_token TEXT,
  card_last_four TEXT,
  card_type TEXT,

  webhook_received_at TIMESTAMPTZ,
  webhook_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_payment_transactions_user_id` on user_id
- `idx_payment_transactions_order_id` on upayments_order_id
- `idx_payment_transactions_track_id` on upayments_track_id
- `idx_payment_transactions_status` on status
- `idx_payment_transactions_created_at` on created_at DESC

**RLS:** Enabled

---

### `processed_webhooks`
**Purpose:** Webhook idempotency

**Schema:**
```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- 'upayments', 'stripe', etc.
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_processed_webhooks_webhook_id` on webhook_id
- `idx_processed_webhooks_source` on source

**RLS:** Service role only

---

## Multi-Agent System Tables

### `agent_sessions`
**Purpose:** Track agent collaboration sessions

**Schema:**
```sql
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT, -- 'generation', 'editing', 'debugging', 'deployment'
  status TEXT, -- 'active', 'completed', 'failed', 'aborted'
  chief_agent_id TEXT,
  active_agents TEXT[],
  context JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_agent_sessions_project_id` on project_id
- `idx_agent_sessions_status` on status

---

### `agent_tasks`
**Purpose:** Track tasks assigned to agents

**Schema:**
```sql
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL, -- 'chief', 'design', 'dev', 'ops', 'guard'
  task_type TEXT NOT NULL,
  task_description TEXT,
  status TEXT, -- 'pending', 'in_progress', 'completed', 'failed'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB
);
```

**Indexes:**
- `idx_agent_tasks_session_id` on session_id
- `idx_agent_tasks_agent_type` on agent_type
- `idx_agent_tasks_status` on status

---

### `agent_messages`
**Purpose:** Inter-agent communication log

**Schema:**
```sql
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  from_agent TEXT NOT NULL, -- 'chief', 'design', 'dev', 'ops', 'guard', 'user'
  to_agent TEXT, -- null = broadcast
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_agent_messages_session_id` on session_id
- `idx_agent_messages_priority` on priority DESC

---

### `agent_decisions`
**Purpose:** Log important agent decisions

**Schema:**
```sql
CREATE TABLE agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  decision_type TEXT,
  decision_data JSONB,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `agent_state_snapshots`
**Purpose:** State checkpoints for debugging

**Schema:**
```sql
CREATE TABLE agent_state_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_type TEXT,
  state_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `agent_metrics`
**Purpose:** Performance tracking

**Schema:**
```sql
CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_type TEXT,
  metric_type TEXT,
  metric_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `agent_prompt_cache`
**Purpose:** Cache frequently used prompts

**Schema:**
```sql
CREATE TABLE agent_prompt_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  prompt_template TEXT,
  parameters JSONB,
  cached_result TEXT,
  hit_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Additional Features

### `orchestration_sessions`
**Purpose:** Persistent AI orchestration state

**Schema:**
```sql
CREATE TABLE orchestration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  stage TEXT NOT NULL, -- 'detection', 'clarifying', 'constructing', 'generating', 'validating', 'completed'
  detected_params JSONB,
  clarifying_questions JSONB,
  answers JSONB,
  deepseek_prompt TEXT,
  validation_result JSONB,
  messages JSONB DEFAULT '[]',

  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Prevents session loss on serverless deployments

---

### `domain_purchases`
**Purpose:** Track domain registrations

**Schema:**
```sql
CREATE TABLE domain_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  domain_name TEXT NOT NULL UNIQUE,
  registrar TEXT DEFAULT 'namecheap',
  purchase_price_usd DECIMAL(10, 2),
  registration_years INTEGER DEFAULT 1,

  status TEXT, -- 'pending', 'active', 'failed', 'expired'
  is_free_domain BOOLEAN DEFAULT false,

  nameservers JSONB,
  dns_configured BOOLEAN DEFAULT false,
  ssl_configured BOOLEAN DEFAULT false,

  registered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `project_widgets`
**Purpose:** Widget configurations

**Schema:**
```sql
CREATE TABLE project_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'whatsapp', 'chatbot', 'analytics', etc.
  config JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  position TEXT, -- 'bottom-right', 'bottom-left', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `blog_posts`
**Purpose:** Blog content management

**Schema:**
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id),

  title_ar TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  content_ar TEXT NOT NULL,
  content_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,

  featured_image TEXT,
  tags TEXT[],
  category TEXT,

  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,

  seo_title TEXT,
  seo_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Policies Summary

### General Pattern
All tables follow this RLS pattern:
- **Authenticated users** can read their own data
- **Service role** has full access (for backend operations)
- **Anon users** have no access (except public-facing tables)

### Specific Policies

**Read Policies:**
- `subscription_tiers`: All authenticated users (active tiers only)
- `credit_operations`: All authenticated users (active operations only)
- `templates`: All authenticated users (active templates only)
- `blog_posts`: All users including anon (published posts only)

**Write Policies:**
- Users can only modify their own data
- Service role required for:
  - Payment transactions
  - Webhook processing
  - Credit allocation
  - Admin operations

---

## Indexes Summary

### Performance-Critical Indexes

**User Lookups:**
- `idx_profiles_email` - Login queries
- `idx_user_subscriptions_user_id` - Subscription checks

**Foreign Key Indexes:**
- All foreign key columns indexed for join performance
- CASCADE deletes optimized

**Temporal Queries:**
- `created_at DESC` indexes on all tables with timestamps
- `current_period_end` for subscription expiration checks
- `expires_at` for trial/domain expiration

**Status Filters:**
- `status` columns indexed on projects, deployments, subscriptions
- `is_active`, `is_admin`, `published` for boolean filters

---

## Foreign Key Relationships

### Cascade Behavior

**ON DELETE CASCADE:**
- `projects` → Deleting user deletes all their projects
- `messages` → Deleting project deletes all messages
- `credit_transactions` → Deleting user deletes transaction history

**ON DELETE SET NULL:**
- `payment_transactions.subscription_id` → Preserves payment record even if subscription deleted
- `projects.template_id` → Preserves project even if template deleted

**No CASCADE:**
- `subscription_tiers` cannot be deleted if in use

---

## Database Statistics

**Total Tables:** 30+
**Total Migrations:** 22
**Total Indexes:** 80+
**Total RLS Policies:** 50+
**Total Functions:** 20+
**Total Triggers:** 15+

**Migration File Locations:**
- `/supabase/migrations/*.sql`

**Latest Migration:**
- `20251205_security_fixes.sql` (Dec 5, 2025)

---

## Notes

### Security Features
1. All tables have RLS enabled
2. All functions use `SET search_path = public` (prevents injection)
3. All functions use `SECURITY INVOKER` (respects RLS)
4. Webhook idempotency prevents duplicate processing
5. Signature verification for all external webhooks

### Performance Considerations
1. Comprehensive indexing strategy
2. JSONB columns for flexible schema
3. Partial unique indexes where applicable
4. Timestamp-based partitioning ready (for future scaling)

### Data Integrity
1. Foreign key constraints on all relationships
2. CHECK constraints on enums
3. UNIQUE constraints on business keys
4. NOT NULL constraints on required fields

---

**Last Updated:** December 27, 2025
**Database Version:** PostgreSQL 15 (Supabase)
