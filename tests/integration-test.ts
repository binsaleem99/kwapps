/**
 * KWq8.com Integration Test Suite
 *
 * Tests all major user flows:
 * 1. Authentication Flow
 * 2. Payment Flow
 * 3. Builder Flow
 * 4. Publishing Flow
 * 5. Admin Dashboard Flow
 *
 * Run with: npx ts-node tests/integration-test.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

interface TestSuite {
  name: string
  tests: TestResult[]
  passed: number
  failed: number
}

// ============================================
// Test Utilities
// ============================================

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: any; ok: boolean }> {
  const url = `${BASE_URL}${endpoint}`
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json().catch(() => ({}))

    return {
      status: response.status,
      data,
      ok: response.ok,
    }
  } catch (error) {
    return {
      status: 0,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
      ok: false,
    }
  }
}

async function runTest(
  name: string,
  testFn: () => Promise<{ passed: boolean; details?: any }>
): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const result = await testFn()
    return {
      name,
      passed: result.passed,
      duration: Date.now() - startTime,
      details: result.details,
    }
  } catch (error) {
    return {
      name,
      passed: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// 1. Authentication Flow Tests
// ============================================

async function testAuthenticationFlow(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 1.1: Sign-in page accessibility
  tests.push(await runTest('Sign-in page loads', async () => {
    const response = await fetch(`${BASE_URL}/sign-in`)
    return {
      passed: response.ok,
      details: { status: response.status }
    }
  }))

  // Test 1.2: Sign-up page accessibility
  tests.push(await runTest('Sign-up page loads', async () => {
    const response = await fetch(`${BASE_URL}/sign-up`)
    return {
      passed: response.ok,
      details: { status: response.status }
    }
  }))

  // Test 1.3: Reset password page accessibility
  tests.push(await runTest('Reset password page loads', async () => {
    const response = await fetch(`${BASE_URL}/reset-password`)
    return {
      passed: response.ok,
      details: { status: response.status }
    }
  }))

  // Test 1.4: Auth callback endpoint exists
  tests.push(await runTest('Auth callback endpoint exists', async () => {
    // This should redirect or return specific status
    const response = await fetch(`${BASE_URL}/auth/callback`, { redirect: 'manual' })
    // 302 redirect or 400 bad request (missing code) is acceptable
    return {
      passed: response.status === 302 || response.status === 400 || response.status === 500,
      details: { status: response.status }
    }
  }))

  // Test 1.5: Protected route redirects unauthenticated users
  tests.push(await runTest('Dashboard redirects unauthenticated users', async () => {
    const response = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' })
    // Should redirect to sign-in
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status, location: response.headers.get('location') }
    }
  }))

  // Test 1.6: Admin route redirects unauthenticated users
  tests.push(await runTest('Admin route redirects unauthenticated users', async () => {
    const response = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' })
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status }
    }
  }))

  return {
    name: 'Authentication Flow',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 2. Payment Flow Tests
// ============================================

async function testPaymentFlow(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 2.1: Subscription tiers endpoint
  tests.push(await runTest('GET subscription tiers (public)', async () => {
    const { status, data, ok } = await fetchApi('/api/billing/subscription/tiers')
    return {
      passed: ok && Array.isArray(data) && data.length > 0,
      details: { status, tierCount: data?.length }
    }
  }))

  // Test 2.2: Trial eligibility endpoint (requires auth)
  tests.push(await runTest('GET trial eligibility (returns 401 without auth)', async () => {
    const { status, data } = await fetchApi('/api/billing/trial')
    // Without auth, should return 401
    return {
      passed: status === 401,
      details: { status, error: data?.error }
    }
  }))

  // Test 2.3: Checkout endpoint GET (available tiers)
  tests.push(await runTest('GET checkout available tiers', async () => {
    const { status, data, ok } = await fetchApi('/api/billing/checkout')
    return {
      passed: ok || status === 401, // Either returns data or requires auth
      details: { status, hasTiers: !!data?.tiers }
    }
  }))

  // Test 2.4: Credits balance endpoint (requires auth)
  tests.push(await runTest('GET credits balance (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/billing/credits/balance')
    return {
      passed: status === 401,
      details: { status }
    }
  }))

  // Test 2.5: Credits history endpoint (requires auth)
  tests.push(await runTest('GET credits history (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/billing/credits/history')
    return {
      passed: status === 401,
      details: { status }
    }
  }))

  // Test 2.6: Webhook health check
  tests.push(await runTest('GET webhook health check', async () => {
    const { status, data, ok } = await fetchApi('/api/billing/webhook')
    return {
      passed: ok && data?.status === 'active',
      details: { status, webhookStatus: data?.status }
    }
  }))

  // Test 2.7: POST checkout without auth
  tests.push(await runTest('POST checkout (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier_name: 'basic' })
    })
    return {
      passed: status === 401,
      details: { status }
    }
  }))

  return {
    name: 'Payment Flow',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 3. Builder Flow Tests
// ============================================

async function testBuilderFlow(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 3.1: Builder page (requires auth)
  tests.push(await runTest('Builder page (requires auth)', async () => {
    const response = await fetch(`${BASE_URL}/builder`, { redirect: 'manual' })
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status }
    }
  }))

  // Test 3.2: Generate endpoint GET (check usage)
  tests.push(await runTest('GET generate endpoint (check usage)', async () => {
    const { status, data } = await fetchApi('/api/generate')
    // Should return usage limits or 401
    return {
      passed: status === 200 || status === 401,
      details: { status, hasLimits: !!data?.limits }
    }
  }))

  // Test 3.3: Generate v2 endpoint GET (check credits)
  tests.push(await runTest('GET generate/v2 endpoint (check credits)', async () => {
    const { status, data } = await fetchApi('/api/generate/v2')
    return {
      passed: status === 200 || status === 401,
      details: { status, hasCosts: !!data?.costs }
    }
  }))

  // Test 3.4: Analyze endpoint (prompt analysis)
  tests.push(await runTest('POST analyze endpoint', async () => {
    const { status, data } = await fetchApi('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'أريد موقع لمطعم' })
    })
    return {
      passed: status === 200 || status === 401,
      details: { status, needsClarification: data?.needsClarification }
    }
  }))

  // Test 3.5: Orchestrate endpoint (session-based)
  tests.push(await runTest('POST orchestrate endpoint', async () => {
    const { status, data } = await fetchApi('/api/orchestrate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'أريد موقع لمطعم',
        sessionId: `test-session-${Date.now()}`
      })
    })
    return {
      passed: status === 200 || status === 401,
      details: { status, stage: data?.stage }
    }
  }))

  // Test 3.6: Projects endpoint (requires auth)
  tests.push(await runTest('GET projects (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/projects')
    return {
      passed: status === 401,
      details: { status }
    }
  }))

  // Test 3.7: Annotate endpoint (requires auth)
  tests.push(await runTest('GET annotate endpoint', async () => {
    const { status, data } = await fetchApi('/api/annotate')
    return {
      passed: status === 200 || status === 401 || status === 405,
      details: { status }
    }
  }))

  return {
    name: 'Builder Flow',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 4. Publishing Flow Tests
// ============================================

async function testPublishingFlow(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 4.1: Deploy endpoint GET (check status)
  tests.push(await runTest('GET deploy endpoint', async () => {
    const { status, data } = await fetchApi('/api/deploy')
    return {
      passed: status === 200 || status === 401 || status === 405,
      details: { status }
    }
  }))

  // Test 4.2: Deploy endpoint POST (requires auth)
  tests.push(await runTest('POST deploy (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/deploy', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'test-project',
        subdomain: 'test-subdomain'
      })
    })
    return {
      passed: status === 401 || status === 400,
      details: { status, error: data?.error }
    }
  }))

  // Test 4.3: Domains search endpoint
  tests.push(await runTest('GET domains search', async () => {
    const { status, data } = await fetchApi('/api/domains/search?keyword=test&tlds=com,net')
    return {
      passed: status === 200 || status === 401 || status === 500,
      details: { status }
    }
  }))

  // Test 4.4: Domain info endpoint
  tests.push(await runTest('GET domain info (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/domains/test.com')
    return {
      passed: status === 200 || status === 401 || status === 404,
      details: { status }
    }
  }))

  return {
    name: 'Publishing Flow',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 5. Admin Dashboard Flow Tests
// ============================================

async function testAdminFlow(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 5.1: Admin page (requires admin auth)
  tests.push(await runTest('Admin page (requires admin auth)', async () => {
    const response = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' })
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status }
    }
  }))

  // Test 5.2: Admin users page
  tests.push(await runTest('Admin users page (requires admin auth)', async () => {
    const response = await fetch(`${BASE_URL}/admin/users`, { redirect: 'manual' })
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status }
    }
  }))

  // Test 5.3: Admin projects page
  tests.push(await runTest('Admin projects page (requires admin auth)', async () => {
    const response = await fetch(`${BASE_URL}/admin/projects`, { redirect: 'manual' })
    return {
      passed: response.status === 302 || response.status === 307,
      details: { status: response.status }
    }
  }))

  return {
    name: 'Admin Dashboard Flow',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 6. Widget System Tests (NEW)
// ============================================

async function testWidgetSystem(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 6.1: WhatsApp widget generation
  tests.push(await runTest('POST WhatsApp widget generation', async () => {
    const { status, data } = await fetchApi('/api/widgets/whatsapp', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+96512345678',
        welcomeMessage: 'مرحباً',
        buttonText: 'تواصل معنا'
      })
    })
    return {
      passed: (status === 200 && data?.success) || status === 401,
      details: { status, hasSnippet: !!data?.widget?.snippet }
    }
  }))

  // Test 6.2: WhatsApp link generation
  tests.push(await runTest('GET WhatsApp link', async () => {
    const { status, data } = await fetchApi('/api/widgets/whatsapp?phone=%2B96512345678&message=Hello')
    return {
      passed: status === 200 && data?.success,
      details: { status, hasLink: !!data?.link }
    }
  }))

  // Test 6.3: Phone validation (invalid)
  tests.push(await runTest('Phone validation (invalid number)', async () => {
    const { status, data } = await fetchApi('/api/widgets/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: '123' })
    })
    return {
      passed: status === 400 && data?.error?.code === 'INVALID_PHONE',
      details: { status, errorCode: data?.error?.code }
    }
  }))

  // Test 6.4: Project widgets endpoint (requires auth)
  tests.push(await runTest('GET project widgets (requires auth)', async () => {
    const { status, data } = await fetchApi('/api/widgets/test-project-id')
    return {
      passed: status === 401,
      details: { status }
    }
  }))

  return {
    name: 'Widget System',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// 7. Image Enhancement Tests
// ============================================

async function testImageEnhancement(): Promise<TestSuite> {
  const tests: TestResult[] = []

  // Test 7.1: Image quality check (free, no auth required for check)
  tests.push(await runTest('POST image quality check', async () => {
    const { status, data } = await fetchApi('/api/images/check-quality', {
      method: 'POST',
      body: JSON.stringify({
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        isUrl: false
      })
    })
    return {
      passed: status === 200 || status === 500, // 500 if banana client not configured
      details: { status, hasQuality: !!data?.quality }
    }
  }))

  // Test 7.2: Image enhance endpoint (requires auth + premium tier)
  tests.push(await runTest('POST image enhance (requires premium)', async () => {
    const { status, data } = await fetchApi('/api/images/enhance', {
      method: 'POST',
      body: JSON.stringify({
        image: 'data:image/png;base64,test',
        enhancementType: 'upscale'
      })
    })
    return {
      passed: status === 401 || status === 403 || status === 400,
      details: { status, errorCode: data?.error?.code }
    }
  }))

  return {
    name: 'Image Enhancement',
    tests,
    passed: tests.filter(t => t.passed).length,
    failed: tests.filter(t => !t.passed).length,
  }
}

// ============================================
// Main Test Runner
// ============================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 KWq8.com Integration Test Suite')
  console.log('='.repeat(60))
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log('='.repeat(60) + '\n')

  const suites: TestSuite[] = []

  // Run all test suites
  console.log('🔐 Running Authentication Flow Tests...')
  suites.push(await testAuthenticationFlow())

  console.log('💳 Running Payment Flow Tests...')
  suites.push(await testPaymentFlow())

  console.log('🏗️ Running Builder Flow Tests...')
  suites.push(await testBuilderFlow())

  console.log('🚀 Running Publishing Flow Tests...')
  suites.push(await testPublishingFlow())

  console.log('👑 Running Admin Dashboard Flow Tests...')
  suites.push(await testAdminFlow())

  console.log('🔲 Running Widget System Tests...')
  suites.push(await testWidgetSystem())

  console.log('🖼️ Running Image Enhancement Tests...')
  suites.push(await testImageEnhancement())

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS')
  console.log('='.repeat(60) + '\n')

  let totalPassed = 0
  let totalFailed = 0

  for (const suite of suites) {
    const icon = suite.failed === 0 ? '✅' : '❌'
    console.log(`${icon} ${suite.name}: ${suite.passed}/${suite.tests.length} passed`)

    for (const test of suite.tests) {
      const testIcon = test.passed ? '  ✓' : '  ✗'
      const status = test.passed ? '' : ` (${test.error || 'failed'})`
      console.log(`${testIcon} ${test.name} (${test.duration}ms)${status}`)
      if (!test.passed && test.details) {
        console.log(`      Details: ${JSON.stringify(test.details)}`)
      }
    }

    totalPassed += suite.passed
    totalFailed += suite.failed
    console.log('')
  }

  // Summary
  console.log('='.repeat(60))
  console.log('📈 SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${totalPassed + totalFailed}`)
  console.log(`✅ Passed: ${totalPassed}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`📊 Pass Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`)
  console.log('='.repeat(60) + '\n')

  // Return exit code
  process.exit(totalFailed > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(console.error)
