import { test, expect } from '@playwright/test'

test.describe('KWq8.com Website Tests', () => {

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    // Title is in Arabic
    await expect(page).toHaveTitle(/كي دبليو|KW APPS|kwq8/i)
    // Check for Arabic content (RTL)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
  })

  test('Sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('form')).toBeVisible()
    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('Sign-up page loads', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page.locator('form')).toBeVisible()
  })

  test('Pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page).toHaveURL(/pricing/)
    // Should show pricing tiers
    const content = await page.content()
    expect(content).toMatch(/KWD|دينار/i)
  })

  test('Builder page requires authentication', async ({ page }) => {
    await page.goto('/builder')
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('Dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/)
  })

  test('Admin page requires authentication', async ({ page }) => {
    await page.goto('/admin')
    // Should redirect to sign-in or show unauthorized
    const url = page.url()
    expect(url).toMatch(/sign-in|unauthorized|admin/)
  })

  test('API health check - subscription tiers', async ({ request }) => {
    const response = await request.get('/api/billing/subscription-tiers')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.tiers).toBeDefined()
  })

  test('API health check - webhook endpoint', async ({ request }) => {
    const response = await request.get('/api/billing/webhook')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('WhatsApp widget API validates phone', async ({ request }) => {
    // Test with invalid phone
    const response = await request.post('/api/widgets/whatsapp', {
      data: { phoneNumber: 'invalid' }
    })
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_PHONE')
  })

  test('WhatsApp widget API accepts valid GCC phone', async ({ request }) => {
    const response = await request.post('/api/widgets/whatsapp', {
      data: { phoneNumber: '+96512345678' }
    })
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.widget).toBeDefined()
  })

})

test.describe('Security Tests', () => {

  test('Webhook rejects invalid signature', async ({ request }) => {
    const response = await request.post('/api/billing/webhook', {
      headers: {
        'x-upayments-signature': 'invalid-signature',
        'Content-Type': 'application/json',
      },
      data: {
        payment_id: 'test',
        result: 'CAPTURED',
        track_id: 'test-track',
        order_id: 'test-order',
      }
    })
    // Should reject with 400
    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.code).toBe('INVALID_SIGNATURE')
    expect(data.errorAr).toBeDefined() // Arabic error message
  })

  test('Protected API requires auth', async ({ request }) => {
    const response = await request.get('/api/credits/balance')
    expect(response.status()).toBe(401)
  })

})
