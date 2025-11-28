/**
 * UPayments API Client
 * Handles payment gateway integration for Kuwait market
 *
 * UPayments doesn't have native subscriptions, so we use:
 * - KFAST tokenization for K-Net (debit cards)
 * - MPGS tokenization for credit cards
 * - Manual recurring charges via cron jobs
 */

const UPAYMENTS_API_URL = process.env.UPAYMENTS_API_URL || 'https://api.upayments.com/api/v1'
const UPAYMENTS_API_KEY = process.env.UPAYMENTS_API_KEY || ''

export interface CreatePaymentLinkParams {
  amount: number // in KWD
  order_id: string
  customer_email: string
  customer_name: string
  redirect_url: string
  webhook_url: string
  reference?: string
  products?: Array<{
    name: string
    description: string
    price: number
    quantity: number
  }>
}

export interface PaymentLinkResponse {
  status: boolean
  message: string
  data: {
    link: string
    order_id: string
    payment_id: string
  }
}

export interface TokenizeCardParams {
  order_id: string
  customer_email: string
  customer_name: string
  redirect_url: string
  webhook_url: string
  tokenize: boolean
}

export interface TokenizeCardResponse {
  status: boolean
  message: string
  data: {
    link: string
    order_id: string
  }
}

export interface ChargeTokenParams {
  token: string
  amount: number
  order_id: string
  customer_email: string
}

export interface ChargeTokenResponse {
  status: boolean
  message: string
  data: {
    transaction_id: string
    status: 'success' | 'failed' | 'pending'
    amount: number
    order_id: string
  }
}

export interface WebhookPayload {
  order_id: string
  payment_id: string
  transaction_id: string
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
  customer_email: string
  payment_method: 'knet' | 'credit_card' | 'debit_card'
  card_token?: string // Only present if tokenization was requested
  card_last_four?: string
  created_at: string
}

class UPaymentsClient {
  private apiKey: string
  private apiUrl: string

  constructor() {
    this.apiKey = UPAYMENTS_API_KEY
    this.apiUrl = UPAYMENTS_API_URL

    if (!this.apiKey) {
      console.warn('UPayments API key not configured')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(`UPayments API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a one-time payment link
   */
  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    return this.request<PaymentLinkResponse>('/create-payment-link', {
      method: 'POST',
      body: JSON.stringify({
        amount: params.amount,
        order_id: params.order_id,
        customer_email: params.customer_email,
        customer_name: params.customer_name,
        redirect_url: params.redirect_url,
        webhook_url: params.webhook_url,
        reference: params.reference,
        products: params.products,
      }),
    })
  }

  /**
   * Create a tokenization link (for saving cards for recurring billing)
   * Customer will be redirected to UPayments to save their card
   */
  async createTokenizationLink(params: TokenizeCardParams): Promise<TokenizeCardResponse> {
    return this.request<TokenizeCardResponse>('/create-payment-link', {
      method: 'POST',
      body: JSON.stringify({
        amount: 0, // Zero amount for tokenization only
        order_id: params.order_id,
        customer_email: params.customer_email,
        customer_name: params.customer_name,
        redirect_url: params.redirect_url,
        webhook_url: params.webhook_url,
        tokenize: true, // Request card tokenization
      }),
    })
  }

  /**
   * Charge a saved card token (for recurring monthly billing)
   */
  async chargeToken(params: ChargeTokenParams): Promise<ChargeTokenResponse> {
    return this.request<ChargeTokenResponse>('/charge-token', {
      method: 'POST',
      body: JSON.stringify({
        token: params.token,
        amount: params.amount,
        order_id: params.order_id,
        customer_email: params.customer_email,
      }),
    })
  }

  /**
   * Verify webhook signature to ensure it came from UPayments
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // UPayments uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto')
    const webhookSecret = process.env.UPAYMENTS_WEBHOOK_SECRET || ''

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')

    return signature === expectedSignature
  }

  /**
   * Parse webhook payload
   */
  parseWebhook(body: any): WebhookPayload {
    return {
      order_id: body.order_id,
      payment_id: body.payment_id,
      transaction_id: body.transaction_id,
      status: body.status,
      amount: parseFloat(body.amount),
      currency: body.currency,
      customer_email: body.customer_email,
      payment_method: body.payment_method,
      card_token: body.card_token,
      card_last_four: body.card_last_four,
      created_at: body.created_at,
    }
  }
}

// Export singleton instance
export const upayments = new UPaymentsClient()
