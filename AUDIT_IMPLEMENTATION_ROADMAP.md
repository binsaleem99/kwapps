# KWQ8 Implementation Roadmap
## Prioritized Fix List with Timeline and Effort Estimates

**Generated:** December 27, 2025
**Project:** KW APPS (kwapps)
**Status:** Post-Audit Action Plan

---

## 🚨 P0: LAUNCH BLOCKERS (Must Fix Before ANY Launch)

### Total Estimated Time: 4-6 days
### Critical Path: Items must be completed in order

---

### P0-1: Fix Security Vulnerabilities
**Priority:** P0 - CRITICAL
**Impact:** HIGH - Security risk, potential data breach
**Effort:** 1 hour
**Dependencies:** None

**Issues:**
1. `form-data` package - CRITICAL vulnerability (unsafe random boundary)
2. `@modelcontextprotocol/sdk` <1.24.0 - HIGH vulnerability (DNS rebinding)

**Implementation Steps:**
```bash
# Step 1: Update vulnerable packages
npm update form-data @modelcontextprotocol/sdk

# Step 2: Run full audit and fix
npm audit fix

# Step 3: If force needed
npm audit fix --force

# Step 4: Verify no critical/high vulnerabilities remain
npm audit

# Step 5: Test application still works
npm run dev
# Test: Login, create project, AI generation

# Step 6: Commit changes
git add package.json package-lock.json
git commit -m "fix: resolve critical security vulnerabilities

- Update form-data to latest (fixes unsafe random boundary)
- Update @modelcontextprotocol/sdk to >=1.24.0 (fixes DNS rebinding)
- Run npm audit fix for remaining issues

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

git push
```

**Acceptance Criteria:**
- [ ] `npm audit` shows 0 critical vulnerabilities
- [ ] `npm audit` shows 0 high vulnerabilities
- [ ] Application runs without errors after update
- [ ] All core features still work (auth, AI generation, billing UI)

**Risk Level:** LOW (standard dependency updates)

---

### P0-2: Fix Deployment Pipeline (Browser Babel Issue)
**Priority:** P0 - LAUNCH BLOCKER
**Impact:** CRITICAL - Production deployments will fail
**Effort:** 3-5 days
**Dependencies:** P0-1 (security fixes first)

**Problem:**
Current deployment pipeline uses browser-based Babel compilation for React component wrapping. This is:
- Not production-ready
- Security risk (arbitrary code execution in browser)
- Performance bottleneck
- Will likely fail in production

**Files Affected:**
- `/src/lib/vercel/deployer.ts` (main deployment logic)
- `/src/app/api/deploy/route.ts` (deployment API endpoint)
- Any code transformation logic

**Option A: Quick Workaround (Recommended for Beta)**
**Effort:** 1-2 days
**Description:** Deploy generated code as static HTML without React transformation

```typescript
// In /src/lib/vercel/deployer.ts

export async function deployProject(params: {
  projectId: string
  code: string
  subdomain?: string
}) {
  // Instead of wrapping with React:
  // 1. Save generated code as static HTML
  const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${params.code}
</body>
</html>
  `

  // 2. Deploy to Vercel as static site
  const files = [
    { file: 'index.html', data: htmlContent }
  ]

  // 3. Upload and deploy
  return await vercelClient.deploy({
    name: projectName,
    files,
    projectSettings: {
      framework: null, // Static site
      buildCommand: null,
      outputDirectory: '.'
    }
  })
}
```

**Pros:**
- Quick fix (1-2 days)
- Low risk
- Gets deployments working
- Can launch beta

**Cons:**
- Limited to static HTML
- No React interactivity
- Not ideal long-term

**Option B: Server-Side Build (Production-Ready)**
**Effort:** 4-5 days
**Description:** Implement proper server-side Next.js build pipeline

**Implementation Steps:**
1. Create temporary Next.js project structure on server
2. Write generated code to proper component files
3. Run Next.js build process server-side
4. Deploy built output to Vercel
5. Add error handling and cleanup

```typescript
// Pseudocode for server-side build

async function buildAndDeployNextApp(params: {
  code: string
  projectId: string
}) {
  const tempDir = `/tmp/kwapps-build-${projectId}`

  try {
    // 1. Create Next.js project structure
    await createNextProject(tempDir)

    // 2. Write generated code
    await fs.writeFile(
      `${tempDir}/app/page.tsx`,
      wrapAsNextComponent(params.code)
    )

    // 3. Build Next.js app
    await exec('npm run build', { cwd: tempDir })

    // 4. Deploy to Vercel
    return await deployToVercel({
      buildDir: `${tempDir}/.next`,
      // ... other params
    })
  } finally {
    // 5. Cleanup
    await fs.rm(tempDir, { recursive: true })
  }
}
```

**Pros:**
- Production-ready
- Full React support
- Proper Next.js features
- Long-term solution

**Cons:**
- More complex
- Longer implementation time
- Higher risk
- Requires server resources

**RECOMMENDATION:**
- **For Beta Launch:** Use Option A (Quick Workaround)
- **Timeline:** Implement Option A this week (1-2 days)
- **Post-Beta:** Implement Option B (4-5 days) for v2.0

**Acceptance Criteria:**
- [ ] Can deploy generated code to Vercel successfully
- [ ] Deployed site loads without errors
- [ ] Deployed site displays correct content
- [ ] RTL and Arabic text render correctly
- [ ] No console errors on deployed site
- [ ] Deployment completes within 5 minutes

**Risk Level:** MEDIUM (new deployment logic)

---

### P0-3: UPayments Production Testing
**Priority:** P0 - REVENUE BLOCKER
**Impact:** CRITICAL - Cannot accept payments without testing
**Effort:** 2-3 days (including coordination)
**Dependencies:** P0-1 (security fixes)

**Current Status:**
- ✅ API client implemented
- ✅ Webhook handler implemented
- ✅ Signature verification implemented
- ✅ Idempotency handling implemented
- ⚠️ **NOT TESTED** in production environment

**Testing Checklist:**

#### Phase 1: Sandbox Testing (Day 1)
- [ ] Configure UPayments sandbox credentials
- [ ] Test payment flow end-to-end in sandbox
- [ ] Verify webhook delivery
- [ ] Verify signature validation
- [ ] Test credit allocation after payment
- [ ] Test failed payment handling
- [ ] Test duplicate webhook handling (idempotency)

#### Phase 2: Production Setup (Day 2)
- [ ] Obtain production UPayments API key
- [ ] Configure production webhook URL (https://kwq8.com/api/billing/webhook)
- [ ] Set UPAYMENTS_SANDBOX=false in Vercel
- [ ] Set production UPAYMENTS_API_KEY in Vercel
- [ ] Whitelist kwq8.com in UPayments dashboard
- [ ] Configure return URLs in UPayments dashboard

#### Phase 3: Production Testing (Day 2-3)
- [ ] Test with real payment (1 KWD trial)
- [ ] Verify webhook received in production
- [ ] Verify signature validation works
- [ ] Confirm credits allocated correctly
- [ ] Test subscription status update
- [ ] Test user can access paid features
- [ ] Document any issues found

#### Phase 4: Card Tokenization (Day 3)
- [ ] Test saving card (KFAST for KNET)
- [ ] Test saving card (MPGS for credit cards)
- [ ] Verify token stored securely
- [ ] Test recurring charge with saved card
- [ ] Verify card deletion works

**Files to Review:**
- `/src/lib/upayments/client.ts` - API client
- `/src/app/api/billing/webhook/route.ts` - Webhook handler
- `/src/app/api/billing/checkout/route.ts` - Checkout creation
- `/src/lib/billing/credit-service.ts` - Credit allocation

**Known Risks:**
1. Webhook signature format may differ in production
2. Webhook delivery delays
3. Card tokenization may require additional setup
4. Return URL redirects may fail

**Mitigation:**
- Add comprehensive logging
- Test in sandbox thoroughly first
- Have UPayments support contact ready
- Implement retry logic for failed webhooks

**Acceptance Criteria:**
- [ ] Can complete payment with KNET in production
- [ ] Can complete payment with credit card in production
- [ ] Webhook received within 30 seconds
- [ ] Signature validation passes
- [ ] Credits allocated correctly
- [ ] User subscription status updated to "active"
- [ ] User can access paid features immediately
- [ ] Duplicate webhooks don't cause double-crediting
- [ ] Failed payments handled gracefully
- [ ] Card tokenization works for recurring payments

**Risk Level:** MEDIUM (external dependency, requires coordination)

**Coordination Required:**
- UPayments support team
- Test with real payment method (cost: ~1-5 KWD for testing)
- May need to adjust webhook handler based on production data format

---

## ⚠️ P1: CRITICAL ISSUES (Fix Within 1 Week of Launch)

### Total Estimated Time: 2-3 days

---

### P1-1: Fix Password Reset 404 Error
**Priority:** P1 - HIGH
**Impact:** HIGH - Users cannot reset forgotten passwords
**Effort:** 4 hours
**Dependencies:** None

**Problem:**
Password reset route returns 404 error. Route doesn't exist.

**Solution:**
Create `/src/app/reset-password/page.tsx`

**Implementation:**
```typescript
// /src/app/reset-password/page.tsx

import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور | KW APPS',
  description: 'إعادة تعيين كلمة مرور حسابك',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-slate-400">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
```

```typescript
// /src/components/auth/reset-password-form.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    setLoading(false)

    if (error) {
      setMessage({
        type: 'error',
        text: 'حدث خطأ. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.'
      })
    } else {
      setMessage({
        type: 'success',
        text: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.'
      })
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleReset} className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription className="text-right">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white text-right block">
          البريد الإلكتروني
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
          className="text-right"
          dir="ltr"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
      </Button>

      <div className="text-center">
        <a
          href="/sign-in"
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          العودة إلى تسجيل الدخول
        </a>
      </div>
    </form>
  )
}
```

**Verification:**
1. Navigate to `/reset-password`
2. Enter email address
3. Click submit
4. Check email for reset link
5. Click link → redirects to `/auth/update-password`
6. Enter new password
7. Verify can login with new password

**Acceptance Criteria:**
- [ ] `/reset-password` route loads without 404
- [ ] Form validates email format
- [ ] Email sent successfully for valid email
- [ ] Error message shown for invalid email
- [ ] Reset link in email works
- [ ] Can set new password
- [ ] Can login with new password
- [ ] RTL layout correct
- [ ] Mobile responsive

**Risk Level:** LOW (standard Supabase auth flow)

---

### P1-2: Set Up CI/CD Pipeline
**Priority:** P1 - HIGH
**Impact:** MEDIUM - No automated quality checks
**Effort:** 1 day
**Dependencies:** P0-1 (security fixes), P1-3 (TypeScript install)

**Implementation:**

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: Check for security vulnerabilities
        run: npm audit --audit-level=high

  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js app
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/
```

**Additional Files:**

```yaml
# .github/workflows/security-scan.yml

name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Mondays
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan (optional)
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Acceptance Criteria:**
- [ ] GitHub Actions workflow runs on push to main
- [ ] GitHub Actions runs on pull requests
- [ ] TypeScript compilation verified
- [ ] ESLint checks pass
- [ ] Build completes successfully
- [ ] Security audit runs
- [ ] Failed checks block merge (if configured)

**Risk Level:** LOW (standard CI/CD setup)

---

### P1-3: Install TypeScript and Run Type Check
**Priority:** P1 - MEDIUM
**Impact:** MEDIUM - Unknown type errors may exist
**Effort:** 2-4 hours
**Dependencies:** None

**Steps:**
```bash
# 1. Install all dependencies (TypeScript included)
npm install

# 2. Run TypeScript compiler (no emit, just check)
npx tsc --noEmit

# 3. Fix any type errors found
# (Likely errors: missing types, improper use of 'any', etc.)

# 4. Verify no errors
npx tsc --noEmit
# Should output: "No errors found"

# 5. Add to package.json scripts
# Edit package.json:
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}

# 6. Commit changes
git add .
git commit -m "chore: run TypeScript type check and fix errors"
```

**Acceptance Criteria:**
- [ ] `npm install` completes successfully
- [ ] TypeScript installed in node_modules
- [ ] `npx tsc --noEmit` runs without errors
- [ ] All type errors fixed
- [ ] `npm run type-check` script works

**Risk Level:** LOW (standard verification)

---

### P1-4: Create .env.example File
**Priority:** P1 - MEDIUM
**Impact:** LOW - Team onboarding difficulty
**Effort:** 1 hour
**Dependencies:** None

**Implementation:**

```bash
# .env.example

# ==============================================
# KW APPS Environment Variables
# ==============================================
# Copy this file to .env.local and fill in your values

# ==============================================
# Supabase Configuration
# ==============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ==============================================
# AI Providers
# ==============================================
# DeepSeek API (for code generation)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
# Optional: Override default models
# DEEPSEEK_CHAT_MODEL=deepseek-chat
# DEEPSEEK_CODE_MODEL=deepseek-coder

# Gemini API (for orchestration)
GEMINI_API_KEY=your-gemini-api-key
# Optional: Override default model
# GEMINI_MODEL_ID=gemini-2.0-flash-exp

# ==============================================
# Payment Gateway (UPayments)
# ==============================================
UPAYMENTS_API_KEY=your-upayments-api-key
UPAYMENTS_API_URL=https://uapi.upayments.com/api/v1
UPAYMENTS_SANDBOX=true
UPAYMENTS_WEBHOOK_SECRET=your-webhook-secret

# ==============================================
# Deployment Services
# ==============================================
# Vercel API (for deployments)
VERCEL_API_TOKEN=your-vercel-token
VERCEL_TEAM_ID=your-team-id (optional)

# GitHub API (for repo creation)
GITHUB_TOKEN=ghp_your-github-token

# ==============================================
# Domain Management (Namecheap)
# ==============================================
NAMECHEAP_API_KEY=your-api-key
NAMECHEAP_USERNAME=your-username
NAMECHEAP_API_USER=your-api-user
NAMECHEAP_CLIENT_IP=your-whitelisted-ip
NAMECHEAP_SANDBOX=true

# ==============================================
# Image Enhancement (Banana.dev)
# ==============================================
BANANA_API_KEY=your-banana-api-key (optional)

# ==============================================
# Application Settings
# ==============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=KW APPS

# ==============================================
# Optional: Development Settings
# ==============================================
# NODE_ENV=development
# NEXT_PUBLIC_DEBUG=true
```

**Also Create:**

```markdown
# .env.local.setup.md

# Environment Setup Guide

## Required Services

Before running KW APPS locally, you need accounts for:

1. **Supabase** (https://supabase.com)
   - Create project
   - Get URL and anon key from Settings → API
   - Get service role key (keep secret!)

2. **DeepSeek** (https://platform.deepseek.com)
   - Sign up for API access
   - Generate API key
   - Add credits to account

3. **Google AI Studio** (https://ai.google.dev)
   - Get Gemini API key

4. **UPayments** (https://upayments.com)
   - Contact for API access (Kuwait only)
   - Get sandbox credentials first
   - Set up webhook endpoint

## Quick Setup

```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Edit .env.local with your values
nano .env.local

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

## Testing Locally

- Supabase: Use local project or staging database
- UPayments: Always use sandbox mode locally
- Vercel: Use personal account token
- GitHub: Use personal access token with repo scope
```

**Acceptance Criteria:**
- [ ] `.env.example` file created with all variables
- [ ] Each variable has descriptive comment
- [ ] Grouped by service/category
- [ ] `.env.local.setup.md` created with setup instructions
- [ ] Added to repository (git add + commit)

**Risk Level:** NONE (documentation only)

---

## 📊 P2: IMPORTANT ISSUES (Fix Within 1 Month)

### Total Estimated Time: 3-4 weeks

---

### P2-1: Migrate Templates to Database
**Priority:** P2 - MEDIUM
**Effort:** 1 week
**Dependencies:** None

**Current State:**
Templates hardcoded in `/src/types/templates.ts` as TypeScript constants

**Target State:**
Templates stored in database `templates` table with admin UI for management

**Implementation Steps:**

1. **Database Migration (Already Done!)**
   - ✅ `templates` table exists (from migration 006)
   - ✅ Columns: name_ar, name_en, category, base_code, etc.

2. **Seed Database with Existing Templates**
   ```typescript
   // scripts/seed-templates.ts
   import { mockTemplates } from '@/types/templates'
   import { createClient } from '@supabase/supabase-js'

   async function seedTemplates() {
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     )

     for (const template of mockTemplates) {
       await supabase.from('templates').insert({
         name_ar: template.nameAr,
         name_en: template.nameEn,
         category: template.category,
         description_ar: template.descriptionAr,
         description_en: template.descriptionEn,
         base_code: template.baseCode,
         preview_url: template.previewUrl,
         thumbnail_url: template.thumbnailUrl,
         is_premium: template.isPremium,
         is_rtl: true,
         customizable_sections: template.customizableSections,
         color_scheme: template.colorScheme
       })
     }
   }
   ```

3. **Update Template Fetching**
   ```typescript
   // src/lib/templates/get-templates.ts
   export async function getTemplates() {
     const supabase = createClient()
     const { data, error } = await supabase
       .from('templates')
       .select('*')
       .eq('is_active', true)
       .order('use_count', { ascending: false })

     if (error) throw error
     return data
   }
   ```

4. **Admin UI for Template Management**
   - ✅ Admin templates page exists (`/src/app/admin/templates/page.tsx`)
   - Add template create/edit/delete forms
   - Add base_code editor (Monaco editor)
   - Add preview functionality

**Acceptance Criteria:**
- [ ] All existing templates migrated to database
- [ ] Templates fetched from database (not TS file)
- [ ] Admin can create new templates via UI
- [ ] Admin can edit existing templates
- [ ] Admin can delete templates
- [ ] Admin can preview templates
- [ ] Template usage count increments
- [ ] Category filtering works

**Risk Level:** LOW (database already structured)

---

### P2-2: Implement Automated Testing
**Priority:** P2 - MEDIUM
**Effort:** 2-3 weeks
**Dependencies:** P1-2 (CI/CD setup)

**Current State:**
- 0% test coverage
- Playwright installed but no tests written
- No unit tests, no integration tests

**Target State:**
- E2E tests for critical user flows
- Integration tests for API endpoints
- Unit tests for business logic
- 60%+ code coverage

**Phase 1: E2E Tests (Week 1)**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/sign-up')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="full_name"]', 'Test User')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('user can login', async ({ page }) => {
    await page.goto('/sign-in')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('user can reset password', async ({ page }) => {
    await page.goto('/reset-password')
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=تم إرسال')).toBeVisible()
  })
})
```

**Phase 2: API Integration Tests (Week 2)**
```typescript
// tests/integration/api/projects.test.ts
import { describe, it, expect } from 'vitest'

describe('POST /api/projects', () => {
  it('creates project for authenticated user', async () => {
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        name: 'Test Project',
        arabicPrompt: 'موقع تجريبي'
      })
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBeDefined()
  })

  it('returns 401 for unauthenticated requests', async () => {
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    })

    expect(response.status).toBe(401)
  })
})
```

**Phase 3: Unit Tests (Week 3)**
```typescript
// tests/unit/credit-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { CreditService } from '@/lib/billing/credit-service'

describe('CreditService', () => {
  let service: CreditService

  beforeEach(() => {
    service = new CreditService()
  })

  it('deducts credits correctly', async () => {
    const result = await service.deductCredits({
      userId: 'test-user',
      operationType: 'chat',
      amount: 1.0
    })

    expect(result.success).toBe(true)
    expect(result.balanceAfter).toBe(99)
  })

  it('prevents negative balance', async () => {
    const result = await service.deductCredits({
      userId: 'user-with-0-credits',
      operationType: 'page',
      amount: 3.0
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Insufficient credits')
  })
})
```

**Acceptance Criteria:**
- [ ] 10+ E2E tests covering critical flows
- [ ] 20+ API integration tests
- [ ] 50+ unit tests for business logic
- [ ] 60%+ code coverage
- [ ] All tests pass in CI/CD
- [ ] Tests run on every PR

**Risk Level:** LOW (testing improves quality)

---

### P2-3: Configure Error Tracking
**Priority:** P2 - MEDIUM
**Effort:** 1 day
**Dependencies:** None

**Recommended:** Sentry

**Implementation:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'kwq8.com'],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

**Acceptance Criteria:**
- [ ] Sentry configured for client
- [ ] Sentry configured for server
- [ ] Errors reported to Sentry
- [ ] Source maps uploaded
- [ ] Alerts configured
- [ ] Team invited to Sentry project

**Risk Level:** NONE (external service, no code changes)

---

### P2-4: Add Rate Limiting
**Priority:** P2 - MEDIUM
**Effort:** 2 days
**Dependencies:** None

**Implementation:**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

// 5 requests per 10 seconds per IP
export const rateLimitAuth = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
  prefix: 'rl:auth',
})

// 100 requests per minute per user
export const rateLimitAPI = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'rl:api',
})
```

**Usage:**
```typescript
// src/app/api/auth/route.ts
import { rateLimitAuth } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await rateLimitAuth.limit(ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  // ... continue with auth
}
```

**Acceptance Criteria:**
- [ ] Rate limiting on auth endpoints
- [ ] Rate limiting on AI generation endpoints
- [ ] Rate limiting on API routes
- [ ] Proper 429 responses
- [ ] Analytics tracking

**Risk Level:** LOW (improves security)

---

## 🎯 P3: NICE-TO-HAVE (Backlog)

### Total Estimated Time: 2-3 weeks

---

### P3-1: Configure CSP Headers
**Effort:** 4 hours
**Priority:** P3 - LOW

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://api.deepseek.com https://generativelanguage.googleapis.com https://*.supabase.co;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

### P3-2: Performance Optimization
**Effort:** 1 week
**Priority:** P3 - LOW

**Tasks:**
- [ ] Bundle size analysis
- [ ] Code splitting optimization
- [ ] Image optimization
- [ ] Font loading optimization
- [ ] Database query optimization
- [ ] Caching strategy

---

### P3-3: Documentation Updates
**Effort:** 3 days
**Priority:** P3 - LOW

**Tasks:**
- [ ] Update README with setup instructions
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Contributing guidelines

---

## 📅 SUGGESTED TIMELINE

### Week 1: Launch Blockers
**Days 1-2:** Security + Password Reset + TypeScript + .env.example
**Days 3-5:** Deployment Pipeline (Option A: Quick Workaround)
**Day 6-7:** UPayments Production Testing

### Week 2: Critical Issues + Beta Launch
**Days 1-2:** CI/CD Setup + Final Testing
**Day 3:** Beta Launch Preparation
**Day 4:** Beta Launch to 50-100 users
**Days 5-7:** Monitor, gather feedback, fix critical issues

### Week 3-4: Important Issues
**Week 3:** Template Migration + Error Tracking + Rate Limiting
**Week 4:** Automated Testing (E2E + Integration)

### Month 2+: Nice-to-Have + Iteration
- Performance optimization
- Full test coverage
- Documentation
- Server-side deployment pipeline (Option B)
- Feature enhancements based on beta feedback

---

## ✅ COMPLETION CHECKLIST

### Pre-Beta Launch
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved or documented workarounds
- [ ] Production testing complete
- [ ] Monitoring configured
- [ ] Team trained on deployment process
- [ ] Rollback plan documented
- [ ] Beta user communications prepared

### Beta Launch Success Criteria
- [ ] 50-100 beta users onboarded
- [ ] Payment processing working (> 90% success rate)
- [ ] AI generation working (> 95% success rate)
- [ ] No critical bugs reported
- [ ] Average uptime > 99%
- [ ] Response time < 2s for p95

### Full Production Launch
- [ ] All P1 issues resolved
- [ ] Most P2 issues resolved
- [ ] Beta feedback incorporated
- [ ] Automated testing in place
- [ ] Performance optimized (Lighthouse > 90)
- [ ] Security audit passed
- [ ] Legal/compliance ready

---

**Last Updated:** December 27, 2025
**Next Review:** After P0 fixes complete
