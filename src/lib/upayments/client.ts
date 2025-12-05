/**
 * UPayments API Client
 * Official API Integration for Kuwait Payment Gateway
 *
 * Documentation: https://developers.upayments.com/
 *
 * Supports:
 * - KNET (Kuwait debit cards)
 * - Credit Cards (Visa, Mastercard)
 * - Apple Pay, Google Pay, Samsung Pay
 * - Card tokenization for recurring payments
 */

const UPAYMENTS_API_URL = (process.env.UPAYMENTS_API_URL || 'https://uapi.upayments.com/api/v1').trim().replace(/[\r\n\s]/g, '')
const UPAYMENTS_SANDBOX_URL = 'https://sandboxapi.upayments.com/api/v1'
const UPAYMENTS_API_KEY = process.env.UPAYMENTS_API_KEY || ''
const IS_SANDBOX = process.env.UPAYMENTS_SANDBOX === 'true'

// =============================================================================
// TYPE DEFINITIONS - Based on Official UPayments API
// =============================================================================

export type PaymentGatewaySource = 'knet' | 'cc' | 'samsung-pay' | 'apple-pay' | 'google-pay' | 'create-invoice'
export type PaymentResult = 'CAPTURED' | 'NOT CAPTURED' | 'CANCELED' | 'FAILED'
export type Language = 'ar' | 'en'

/**
 * Order object for charge request
 */
export interface OrderInfo {
  id: string              // Order/transaction ID (max 40 chars)
  reference?: string      // Alternative reference (max 255 chars)
  description: string     // Order description (max 500 chars)
  currency: string        // Currency code (max 3 chars) - typically "KWD"
  amount: number          // Charge amount (supports decimals)
}

/**
 * Reference object for charge request
 */
export interface ReferenceInfo {
  id: string              // Merchant's internal order ID (max 150 chars)
}

/**
 * Customer information
 */
export interface CustomerInfo {
  uniqueId?: string       // Customer unique identifier
  name: string            // Customer name
  email: string           // Customer email
  mobile?: string         // Customer mobile number
}

/**
 * Product item for itemized orders
 */
export interface ProductItem {
  name: string
  description: string
  price: number
  quantity: number
}

/**
 * Token configuration for saved cards
 */
export interface TokenConfig {
  customerUniqueToken: string  // 8-18 characters
}

/**
 * Payment gateway configuration (for white-label)
 */
export interface PaymentGatewayConfig {
  src: PaymentGatewaySource
}

/**
 * Extra merchant data for multi-merchant setups
 */
export interface ExtraMerchantData {
  amount?: number
  knetCharge?: number
  knetChargeType?: 'fixed' | 'percentage'
  ccCharge?: number
  ccChargeType?: 'fixed' | 'percentage'
  ibanNumber?: string
}

/**
 * Main charge request parameters
 */
export interface CreateChargeParams {
  order: OrderInfo
  reference: ReferenceInfo
  language: Language
  returnUrl: string           // Success redirect URL (mandatory)
  cancelUrl: string           // Cancel redirect URL (mandatory)
  notificationUrl: string     // Webhook URL (mandatory)
  customer?: CustomerInfo
  products?: ProductItem[]
  tokens?: TokenConfig
  paymentGateway?: PaymentGatewayConfig
  extraMerchantData?: ExtraMerchantData[]
  isWhiteLabel?: boolean
  paymentLinkExpiryInMinutes?: number
}

/**
 * Charge API response
 */
export interface ChargeResponse {
  status: boolean
  message: string
  data: {
    link: string
    trackId: string
    paymentId: string
    orderId: string
  }
}

/**
 * Customer token creation request
 */
export interface CreateCustomerTokenParams {
  customerUniqueToken: string | number  // 8-18 characters
}

/**
 * Customer token response
 */
export interface CustomerTokenResponse {
  status: boolean
  message: string
  data: {
    customerUniqueToken: string
  }
}

/**
 * Payment status check response
 */
export interface PaymentStatusResponse {
  status: boolean
  message: string
  data: {
    paymentId: string
    orderId: string
    trackId: string
    result: PaymentResult
    amount: number
    currency: string
    paymentType: string
    transactionDate: string
    customerEmail?: string
    customerName?: string
    cardToken?: string
    cardLastFour?: string
  }
}

/**
 * Official webhook payload from UPayments
 */
export interface WebhookPayload {
  payment_id: string
  result: PaymentResult
  post_date: string
  tran_id: string
  ref: string
  track_id: string
  auth: string
  order_id: string
  requested_order_id?: string
  refund_order_id?: string
  payment_type: string        // 'knet', 'cc', 'apple-pay', etc.
  invoice_id?: string
  transaction_date: string
  receipt_id?: string
  trn_udf?: string
  // Additional fields that may be present
  amount?: string | number
  currency?: string
  customer_email?: string
  customer_name?: string
  card_token?: string
  card_last_four?: string
}

/**
 * Refund request parameters
 */
export interface CreateRefundParams {
  orderId: string
  totalPrice: number
  customerFirstName: string
  customerEmail: string
  customerMobileNumber: string
  reference: string
  notifyUrl: string
}

/**
 * Refund response
 */
export interface RefundResponse {
  status: boolean
  message: string
  data: {
    refundOrderId: string
    orderId: string
    refundId: string
    refundArn: string
  }
}

// =============================================================================
// UPAYMENTS CLIENT CLASS
// =============================================================================

class UPaymentsClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = UPAYMENTS_API_KEY
    this.baseUrl = IS_SANDBOX ? UPAYMENTS_SANDBOX_URL : UPAYMENTS_API_URL

    if (!this.apiKey) {
      console.warn('UPayments API key not configured. Set UPAYMENTS_API_KEY environment variable.')
    }
  }

  /**
   * Make authenticated request to UPayments API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    console.log(`[UPayments] Requesting: ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    // Check content-type before parsing
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[UPayments] Non-JSON response (${response.status}):`, text.substring(0, 200))
      throw new Error(`UPayments API Error: Server returned non-JSON response (status ${response.status})`)
    }

    const data = await response.json()

    if (!response.ok || data.status === false) {
      const errorMessage = data.message || data.error?.message || response.statusText
      console.error(`[UPayments] API Error:`, data)
      throw new Error(`UPayments API Error: ${errorMessage}`)
    }

    return data
  }

  // ===========================================================================
  // PAYMENT METHODS
  // ===========================================================================

  /**
   * Create a payment charge
   * Endpoint: POST /charge
   *
   * @param params - Charge parameters following official API structure
   * @returns Payment link and tracking information
   */
  async createCharge(params: CreateChargeParams): Promise<ChargeResponse> {
    const body: Record<string, any> = {
      order: {
        id: params.order.id,
        reference: params.order.reference || params.order.id,
        description: params.order.description,
        currency: params.order.currency,
        amount: params.order.amount,
      },
      reference: {
        id: params.reference.id,
      },
      language: params.language,
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
      notificationUrl: params.notificationUrl,
    }

    // Add optional customer info
    if (params.customer) {
      body.customer = {
        uniqueId: params.customer.uniqueId,
        name: params.customer.name,
        email: params.customer.email,
        mobile: params.customer.mobile,
      }
    }

    // Add optional products
    if (params.products && params.products.length > 0) {
      body.products = params.products.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price,
        quantity: p.quantity,
      }))
    }

    // Add tokens for saved card payments
    if (params.tokens) {
      body.tokens = {
        customerUniqueToken: params.tokens.customerUniqueToken,
      }
    }

    // Add payment gateway for white-label
    if (params.paymentGateway) {
      body.paymentGateway = {
        src: params.paymentGateway.src,
      }
    }

    // Add extra merchant data for multi-merchant
    if (params.extraMerchantData) {
      body.extraMerchantData = params.extraMerchantData
    }

    // Add white-label flag
    if (params.isWhiteLabel) {
      body.isWhiteLabel = params.isWhiteLabel
    }

    // Add payment link expiry
    if (params.paymentLinkExpiryInMinutes) {
      body.paymentLinkExpiryInMinutes = params.paymentLinkExpiryInMinutes
    }

    return this.request<ChargeResponse>('/charge', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * Create a customer unique token for card saving
   * Endpoint: POST /create-customer-unique-token
   *
   * @param params - Token parameters
   * @returns Created token information
   */
  async createCustomerToken(params: CreateCustomerTokenParams): Promise<CustomerTokenResponse> {
    return this.request<CustomerTokenResponse>('/create-customer-unique-token', {
      method: 'POST',
      body: JSON.stringify({
        customerUniqueToken: params.customerUniqueToken,
      }),
    })
  }

  /**
   * Get payment status by track ID
   * Endpoint: GET /get-payment-status/{track_id}
   *
   * @param trackId - The track ID from charge response or webhook
   * @returns Payment status details
   */
  async getPaymentStatus(trackId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/get-payment-status/${trackId}`, {
      method: 'GET',
    })
  }

  /**
   * Create a refund
   * Endpoint: POST /create-refund
   *
   * @param params - Refund parameters
   * @returns Refund information
   */
  async createRefund(params: CreateRefundParams): Promise<RefundResponse> {
    return this.request<RefundResponse>('/create-refund', {
      method: 'POST',
      body: JSON.stringify({
        orderId: params.orderId,
        totalPrice: params.totalPrice,
        customerFirstName: params.customerFirstName,
        customerEmail: params.customerEmail,
        customerMobileNumber: params.customerMobileNumber,
        reference: params.reference,
        notifyUrl: params.notifyUrl,
      }),
    })
  }

  /**
   * Check refund status
   * Endpoint: GET /check-refund/{order_id}
   *
   * @param orderId - The order ID of the refund
   * @returns Refund status
   */
  async checkRefundStatus(orderId: string): Promise<any> {
    return this.request(`/check-refund/${orderId}`, {
      method: 'GET',
    })
  }

  // ===========================================================================
  // CARD MANAGEMENT
  // ===========================================================================

  /**
   * Retrieve saved cards for a customer
   * Endpoint: POST /retrieve-customer-cards
   *
   * @param customerUniqueToken - The customer's unique token
   * @returns List of saved cards
   */
  async retrieveCustomerCards(customerUniqueToken: string): Promise<any> {
    return this.request('/retrieve-customer-cards', {
      method: 'POST',
      body: JSON.stringify({
        customerUniqueToken,
      }),
    })
  }

  /**
   * Delete a saved card
   * Endpoint: POST /delete-customer-card
   *
   * @param customerUniqueToken - The customer's unique token
   * @param cardToken - The card token to delete
   */
  async deleteCustomerCard(customerUniqueToken: string, cardToken: string): Promise<any> {
    return this.request('/delete-customer-card', {
      method: 'POST',
      body: JSON.stringify({
        customerUniqueToken,
        cardToken,
      }),
    })
  }

  // ===========================================================================
  // WEBHOOK HANDLING
  // ===========================================================================

  /**
   * Verify webhook signature using HMAC-SHA256
   * SECURITY: Returns false when secret is missing (fail-secure)
   *
   * @param payload - Raw webhook payload string
   * @param signature - Signature from webhook headers (X-UPayments-Signature)
   * @returns Whether signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.UPAYMENTS_WEBHOOK_SECRET

    // SECURITY: Fail-secure - reject when secret is not configured
    if (!webhookSecret) {
      console.error('[UPayments] SECURITY: UPAYMENTS_WEBHOOK_SECRET not configured - rejecting webhook')
      return false
    }

    // Reject empty signatures
    if (!signature || signature.trim() === '') {
      console.error('[UPayments] SECURITY: Empty signature received - rejecting webhook')
      return false
    }

    // Reject empty payload
    if (!payload || payload.trim() === '') {
      console.error('[UPayments] SECURITY: Empty payload received - rejecting webhook')
      return false
    }

    try {
      const crypto = require('crypto')

      // Calculate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex')

      // Use constant-time comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, 'hex')
      const expectedBuffer = Buffer.from(expectedSignature, 'hex')

      // Ensure buffers are same length before comparison
      if (signatureBuffer.length !== expectedBuffer.length) {
        console.error('[UPayments] SECURITY: Signature length mismatch - rejecting webhook')
        return false
      }

      const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

      if (!isValid) {
        console.error('[UPayments] SECURITY: Invalid signature - rejecting webhook', {
          receivedLength: signature.length,
          expectedLength: expectedSignature.length,
        })
      }

      return isValid
    } catch (error) {
      console.error('[UPayments] SECURITY: Signature verification error:', error)
      return false
    }
  }

  /**
   * Check if webhook secret is properly configured
   * Used for health checks and startup validation
   */
  isWebhookSecretConfigured(): boolean {
    const secret = process.env.UPAYMENTS_WEBHOOK_SECRET
    return !!secret && secret.length >= 16
  }

  /**
   * Parse and validate webhook payload
   *
   * @param body - Raw webhook body (parsed JSON)
   * @returns Typed webhook payload
   */
  parseWebhook(body: any): WebhookPayload {
    return {
      payment_id: body.payment_id || '',
      result: body.result || 'NOT CAPTURED',
      post_date: body.post_date || '',
      tran_id: body.tran_id || '',
      ref: body.ref || '',
      track_id: body.track_id || '',
      auth: body.auth || '',
      order_id: body.order_id || '',
      requested_order_id: body.requested_order_id,
      refund_order_id: body.refund_order_id,
      payment_type: body.payment_type || '',
      invoice_id: body.invoice_id,
      transaction_date: body.transaction_date || '',
      receipt_id: body.receipt_id,
      trn_udf: body.trn_udf,
      amount: body.amount,
      currency: body.currency,
      customer_email: body.customer_email,
      customer_name: body.customer_name,
      card_token: body.card_token,
      card_last_four: body.card_last_four,
    }
  }

  /**
   * Check if payment was successful based on webhook result
   *
   * @param result - The result field from webhook
   * @returns Whether payment was successful
   */
  isPaymentSuccessful(result: PaymentResult | string): boolean {
    return result === 'CAPTURED'
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Generate a unique order ID
   * Format: prefix_userId_timestamp
   */
  generateOrderId(prefix: string, userId: string): string {
    return `${prefix}_${userId}_${Date.now()}`
  }

  /**
   * Generate a customer unique token (8-18 characters)
   * Based on user ID for consistency
   */
  generateCustomerToken(userId: string): string {
    // Remove hyphens from UUID and take first 12 characters
    return userId.replace(/-/g, '').substring(0, 12)
  }
}

// Export singleton instance
export const upayments = new UPaymentsClient()
