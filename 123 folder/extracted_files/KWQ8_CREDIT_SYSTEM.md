# 💳 KWQ8 CREDIT-BASED PRICING SYSTEM
## Consumption Model & Subscription Tiers
### Version 1.0 | December 2025

---

## OVERVIEW

KWQ8 uses a credit-based consumption model similar to Lovable.dev. Users subscribe to tiers that provide daily bonus credits, with the option to purchase additional credit packs.

**Key Principles:**
- NO free tier (1 KWD/week trial for Basic only)
- Credits consumed per AI action
- Daily bonus credits refresh
- Unused credits roll over (within limits)
- Transparent credit costs before execution

---

# SECTION 1: SUBSCRIPTION TIERS

## 1.1 Tier Overview

| Tier | Price (KWD/month) | Daily Credits | Trial | Max Rollover |
|------|-------------------|---------------|-------|--------------|
| **Basic** | 23 | 100 | 1 KWD/week | 300 |
| **Pro** | 38 | 200 | — | 600 |
| **Premium** | 59 | 400 | — | 1200 |
| **Enterprise** | 75 | 800 | — | 2400 |

## 1.2 Tier Features

### Basic (23 KWD/month)
```yaml
credits_per_day: 100
max_rollover: 300
trial: "1 KWD/week"
features:
  - AI website generation
  - 3 active projects
  - Basic templates
  - Community support
  - Vercel deployment
  - GitHub repository
restrictions:
  - No Banana.dev image AI
  - No priority generation
  - No custom domains included
```

### Pro (38 KWD/month)
```yaml
credits_per_day: 200
max_rollover: 600
trial: null
features:
  - Everything in Basic
  - 10 active projects
  - All templates
  - Email support
  - Priority generation queue
  - Custom domain (1 free up to $15)
restrictions:
  - No Banana.dev image AI
```

### Premium (59 KWD/month)
```yaml
credits_per_day: 400
max_rollover: 1200
trial: null
features:
  - Everything in Pro
  - 25 active projects
  - Banana.dev image AI
  - Priority support (WhatsApp)
  - Advanced analytics
  - Custom domain (2 free up to $15 each)
  - White-glove onboarding
```

### Enterprise (75 KWD/month)
```yaml
credits_per_day: 800
max_rollover: 2400
trial: null
features:
  - Everything in Premium
  - Unlimited projects
  - Dedicated account manager
  - Phone support
  - Custom domain (5 free up to $15 each)
  - Team collaboration (coming soon)
  - Custom integrations
  - SLA guarantee
```

---

# SECTION 2: CREDIT CONSUMPTION

## 2.1 Credit Costs by Action

### Code Generation
| Action | Credits | Description |
|--------|---------|-------------|
| New project from template | 10 | Starting from pre-built template |
| New project from scratch | 25 | AI generates from prompt |
| Edit component (small) | 5 | Change color, text, small adjustment |
| Edit component (medium) | 15 | Add section, modify layout |
| Edit component (large) | 30 | Major structural changes |
| Add new page | 20 | Generate new page for project |
| Fix error (auto-fix) | 3 | Automatic validation fix |
| Regenerate failed | 0 | Free retry on failed generation |

### Image Operations
| Action | Credits | Tier Requirement |
|--------|---------|------------------|
| Image placement analysis | 2 | All tiers |
| Image upscaling (Banana) | 15 | Premium+ |
| Image ratio adjustment | 10 | Premium+ |
| AI image suggestion | 8 | Premium+ |

### Database Operations
| Action | Credits | Description |
|--------|---------|-------------|
| Schema generation | 15 | Create Supabase tables |
| Schema modification | 10 | Add/change columns |
| RLS policy generation | 5 | Generate security policies |
| Migration script | 10 | Create migration file |

### Publishing Operations
| Action | Credits | Description |
|--------|---------|-------------|
| Deploy to Vercel | 5 | Push to production |
| Domain connection | 0 | Free (domain purchase separate) |
| SSL provisioning | 0 | Included with domain |
| Rollback deployment | 0 | Free safety feature |

### Admin Dashboard
| Action | Credits | Description |
|--------|---------|-------------|
| Generate admin dashboard | 30 | First-time generation |
| Update admin dashboard | 15 | Modify admin features |
| Add dashboard page | 10 | New admin section |

## 2.2 Credit Estimation Before Execution

```typescript
interface CreditEstimate {
  action: string;
  estimated_credits: number;
  confidence: 'exact' | 'estimated' | 'variable';
  breakdown: {
    base_cost: number;
    complexity_modifier: number;
    total: number;
  };
  user_balance: number;
  can_afford: boolean;
}

// Example response before generation
const estimate: CreditEstimate = {
  action: "إنشاء صفحة جديدة للمنتجات",
  estimated_credits: 20,
  confidence: "estimated",
  breakdown: {
    base_cost: 15,
    complexity_modifier: 5, // E-commerce features detected
    total: 20,
  },
  user_balance: 85,
  can_afford: true,
};
```

## 2.3 Display in UI (Arabic)

```tsx
// Before execution prompt
function CreditConfirmation({ estimate }: { estimate: CreditEstimate }) {
  return (
    <div className="p-4 bg-muted rounded-lg" dir="rtl">
      <div className="flex justify-between items-center mb-3">
        <span className="text-muted-foreground">التكلفة المتوقعة</span>
        <span className="font-heading font-bold text-primary">
          {estimate.estimated_credits} رصيد
        </span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-muted-foreground">رصيدك الحالي</span>
        <span className="font-heading">
          {estimate.user_balance} رصيد
        </span>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className="text-muted-foreground">الرصيد المتبقي</span>
        <span className={`font-heading ${
          estimate.can_afford ? 'text-green-600' : 'text-destructive'
        }`}>
          {estimate.user_balance - estimate.estimated_credits} رصيد
        </span>
      </div>
      
      {!estimate.can_afford && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
          رصيدك غير كافٍ. يمكنك شراء رصيد إضافي أو الانتظار للرصيد اليومي.
        </div>
      )}
    </div>
  );
}
```

---

# SECTION 3: CREDIT MANAGEMENT

## 3.1 Daily Credit Refresh

```typescript
// Cron job: runs at 00:00 Kuwait time daily
async function refreshDailyCredits() {
  const tiers = {
    basic: 100,
    pro: 200,
    premium: 400,
    enterprise: 800,
  };
  
  const maxRollover = {
    basic: 300,
    pro: 600,
    premium: 1200,
    enterprise: 2400,
  };

  // Get all active subscribers
  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select('user_id, tier')
    .eq('status', 'active');

  for (const sub of subscribers) {
    const dailyBonus = tiers[sub.tier];
    const maxCap = maxRollover[sub.tier];

    // Get current balance
    const { data: balance } = await supabase
      .from('credit_balances')
      .select('credits')
      .eq('user_id', sub.user_id)
      .single();

    // Add daily credits, cap at max rollover
    const newBalance = Math.min(
      (balance?.credits || 0) + dailyBonus,
      maxCap
    );

    await supabase
      .from('credit_balances')
      .upsert({
        user_id: sub.user_id,
        credits: newBalance,
        last_refresh: new Date().toISOString(),
      });

    // Log the refresh
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: sub.user_id,
        type: 'daily_bonus',
        amount: dailyBonus,
        balance_after: newBalance,
      });
  }
}
```

## 3.2 Credit Deduction

```typescript
interface DeductCreditsParams {
  user_id: string;
  amount: number;
  action: string;
  project_id?: string;
  metadata?: Record<string, any>;
}

async function deductCredits(params: DeductCreditsParams): Promise<{
  success: boolean;
  new_balance: number;
  error?: string;
}> {
  const { user_id, amount, action, project_id, metadata } = params;

  // Get current balance
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('credits')
    .eq('user_id', user_id)
    .single();

  if (!balance || balance.credits < amount) {
    return {
      success: false,
      new_balance: balance?.credits || 0,
      error: 'INSUFFICIENT_CREDITS',
    };
  }

  const new_balance = balance.credits - amount;

  // Update balance
  await supabase
    .from('credit_balances')
    .update({ credits: new_balance })
    .eq('user_id', user_id);

  // Log transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id,
      type: 'deduction',
      amount: -amount,
      balance_after: new_balance,
      action,
      project_id,
      metadata,
    });

  return { success: true, new_balance };
}
```

## 3.3 Credit Balance Display

```tsx
function CreditBalance({ userId }: { userId: string }) {
  const { data, isLoading } = useCredits(userId);

  if (isLoading) return <CreditSkeleton />;

  const percentage = (data.credits / data.max_rollover) * 100;

  return (
    <div className="p-4 bg-card rounded-lg border" dir="rtl">
      <div className="flex justify-between items-center mb-2">
        <span className="font-heading font-bold">رصيدك</span>
        <span className="text-2xl font-heading text-primary">
          {data.credits}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground mt-2">
        <span>الحد الأقصى: {data.max_rollover}</span>
        <span>يتجدد خلال: {data.hours_until_refresh} ساعة</span>
      </div>
      
      {data.credits < 50 && (
        <button className="w-full mt-4 btn-primary btn-sm">
          شراء رصيد إضافي
        </button>
      )}
    </div>
  );
}
```

---

# SECTION 4: CREDIT PACKS (ADD-ONS)

## 4.1 Available Packs

| Pack | Credits | Price (KWD) | Per Credit | Savings |
|------|---------|-------------|------------|---------|
| **Starter** | 100 | 3 | 0.030 | — |
| **Growth** | 300 | 8 | 0.027 | 10% |
| **Power** | 600 | 14 | 0.023 | 22% |
| **Ultimate** | 1500 | 30 | 0.020 | 33% |

## 4.2 Pack Purchase Flow

```typescript
interface CreditPack {
  id: string;
  name: string;
  name_ar: string;
  credits: number;
  price_kwd: number;
  savings_percent: number;
}

const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    name_ar: 'البداية',
    credits: 100,
    price_kwd: 3,
    savings_percent: 0,
  },
  {
    id: 'growth',
    name: 'Growth',
    name_ar: 'النمو',
    credits: 300,
    price_kwd: 8,
    savings_percent: 10,
  },
  {
    id: 'power',
    name: 'Power',
    name_ar: 'القوة',
    credits: 600,
    price_kwd: 14,
    savings_percent: 22,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    name_ar: 'الأقصى',
    credits: 1500,
    price_kwd: 30,
    savings_percent: 33,
  },
];

async function purchaseCreditPack(
  user_id: string,
  pack_id: string
): Promise<{ checkout_url: string }> {
  const pack = CREDIT_PACKS.find(p => p.id === pack_id);
  if (!pack) throw new Error('Invalid pack');

  // Create UPayments checkout
  const checkout = await upayments.createCheckout({
    amount: pack.price_kwd,
    currency: 'KWD',
    description: `${pack.credits} رصيد - باقة ${pack.name_ar}`,
    metadata: {
      user_id,
      pack_id,
      credits: pack.credits,
      type: 'credit_pack',
    },
    success_url: `${BASE_URL}/billing/success`,
    cancel_url: `${BASE_URL}/billing/cancel`,
  });

  return { checkout_url: checkout.url };
}

// Webhook handler for successful purchase
async function handleCreditPackPayment(payment: PaymentWebhook) {
  const { user_id, credits } = payment.metadata;

  // Get current balance
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('credits')
    .eq('user_id', user_id)
    .single();

  // Add purchased credits (no cap for purchased credits)
  const newBalance = (balance?.credits || 0) + credits;

  await supabase
    .from('credit_balances')
    .upsert({
      user_id,
      credits: newBalance,
    });

  // Log transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id,
      type: 'purchase',
      amount: credits,
      balance_after: newBalance,
      payment_id: payment.id,
    });
}
```

## 4.3 Credit Pack UI

```tsx
function CreditPacksGrid() {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    try {
      const { checkout_url } = await purchaseCreditPack(userId, packId);
      window.location.href = checkout_url;
    } catch (error) {
      toast.error('حدث خطأ في عملية الشراء');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {CREDIT_PACKS.map((pack) => (
        <div 
          key={pack.id}
          className="relative p-6 bg-card rounded-lg border hover:border-primary transition-colors"
        >
          {pack.savings_percent > 0 && (
            <div className="absolute -top-3 start-4 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
              وفّر {pack.savings_percent}%
            </div>
          )}
          
          <h3 className="font-heading text-xl font-bold mb-2">
            {pack.name_ar}
          </h3>
          
          <div className="text-3xl font-heading font-bold text-primary mb-1">
            {pack.credits}
          </div>
          <div className="text-muted-foreground text-sm mb-4">رصيد</div>
          
          <div className="text-xl font-heading mb-4">
            {pack.price_kwd} د.ك
          </div>
          
          <button
            onClick={() => handlePurchase(pack.id)}
            disabled={purchasing === pack.id}
            className="w-full btn-primary btn-md"
          >
            {purchasing === pack.id ? 'جاري الشراء...' : 'شراء الآن'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

# SECTION 5: TRIAL SYSTEM

## 5.1 Basic Tier Trial

```typescript
interface TrialConfig {
  tier: 'basic';
  price_kwd: 1;
  duration_days: 7;
  credits_per_day: 100;
}

async function startTrial(user_id: string): Promise<void> {
  // Check if user already had a trial
  const { data: existingTrial } = await supabase
    .from('trials')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (existingTrial) {
    throw new Error('TRIAL_ALREADY_USED');
  }

  // Create trial subscription
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  await supabase
    .from('subscriptions')
    .insert({
      user_id,
      tier: 'basic',
      status: 'trial',
      trial_end: trialEnd.toISOString(),
      amount_paid: 1, // 1 KWD
    });

  // Record trial usage
  await supabase
    .from('trials')
    .insert({
      user_id,
      started_at: new Date().toISOString(),
      ends_at: trialEnd.toISOString(),
    });

  // Initialize credits
  await supabase
    .from('credit_balances')
    .insert({
      user_id,
      credits: 100, // First day credits
    });
}
```

## 5.2 Trial Expiry Handling

```typescript
// Cron job: runs hourly
async function checkTrialExpiry() {
  const now = new Date().toISOString();

  // Get expiring trials
  const { data: expiringTrials } = await supabase
    .from('subscriptions')
    .select('user_id, trial_end')
    .eq('status', 'trial')
    .lte('trial_end', now);

  for (const trial of expiringTrials) {
    // Update status to expired
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', trial.user_id);

    // Send email reminder
    await sendEmail({
      to: trial.user_id,
      template: 'trial_expired',
      data: {
        upgrade_url: `${BASE_URL}/upgrade`,
      },
    });
  }
}

// Pre-expiry reminder (2 days before)
async function sendTrialReminders() {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  const { data: expiringTrials } = await supabase
    .from('subscriptions')
    .select('user_id, trial_end')
    .eq('status', 'trial')
    .gte('trial_end', new Date().toISOString())
    .lte('trial_end', twoDaysFromNow.toISOString());

  for (const trial of expiringTrials) {
    await sendEmail({
      to: trial.user_id,
      template: 'trial_expiring_soon',
      data: {
        days_left: 2,
        upgrade_url: `${BASE_URL}/upgrade`,
      },
    });
  }
}
```

---

# SECTION 6: DATABASE SCHEMA

```sql
-- Credit balances table
CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 0,
  last_refresh TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
  ON credit_balances FOR SELECT
  USING (auth.uid() = user_id);

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL, -- 'daily_bonus', 'deduction', 'purchase', 'refund'
  amount INTEGER NOT NULL, -- positive for credits, negative for deductions
  balance_after INTEGER NOT NULL,
  action TEXT, -- 'new_project', 'edit_component', etc.
  project_id UUID REFERENCES projects(id),
  payment_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT NOT NULL, -- 'basic', 'pro', 'premium', 'enterprise'
  status TEXT NOT NULL, -- 'active', 'trial', 'expired', 'cancelled'
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  amount_paid DECIMAL(10, 3),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Trials tracking
CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_credit_balances_user ON credit_balances(user_id);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

# SECTION 7: ANALYTICS & REPORTING

## 7.1 Key Metrics

```sql
-- Daily credit consumption
SELECT 
  DATE(created_at) as date,
  SUM(ABS(amount)) FILTER (WHERE type = 'deduction') as credits_used,
  SUM(amount) FILTER (WHERE type = 'purchase') as credits_purchased,
  COUNT(DISTINCT user_id) as active_users
FROM credit_transactions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most common actions
SELECT 
  action,
  COUNT(*) as count,
  SUM(ABS(amount)) as total_credits
FROM credit_transactions
WHERE type = 'deduction'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY action
ORDER BY total_credits DESC;

-- Users running low on credits
SELECT 
  u.email,
  cb.credits,
  s.tier
FROM credit_balances cb
JOIN auth.users u ON u.id = cb.user_id
JOIN subscriptions s ON s.user_id = cb.user_id
WHERE cb.credits < 20
  AND s.status = 'active'
ORDER BY cb.credits ASC;
```

## 7.2 Conversion Metrics

```sql
-- Trial to paid conversion rate
SELECT 
  COUNT(*) FILTER (WHERE converted_at IS NOT NULL) as converted,
  COUNT(*) as total_trials,
  ROUND(
    COUNT(*) FILTER (WHERE converted_at IS NOT NULL)::DECIMAL / 
    COUNT(*)::DECIMAL * 100, 2
  ) as conversion_rate
FROM trials
WHERE started_at > NOW() - INTERVAL '90 days';

-- Revenue by tier
SELECT 
  tier,
  COUNT(*) as subscribers,
  SUM(amount_paid) as monthly_revenue
FROM subscriptions
WHERE status = 'active'
GROUP BY tier
ORDER BY monthly_revenue DESC;
```

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
