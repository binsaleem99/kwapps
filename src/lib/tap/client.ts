/**
 * Tap Payments API Client
 *
 * Complete integration with Tap Payments API v2
 * Handles: Customers, Subscriptions, Charges, Refunds
 */

import { TAP_CONFIG, toSmallestUnit, fromSmallestUnit } from './config'

interface TapCustomer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: {
    country_code: string
    number: string
  }
  metadata?: Record<string, string>
}

interface TapSubscription {
  id: string
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'PAUSED'
  customer: { id: string }
  plan: {
    id: string
    amount: number
    currency: string
    interval: string
  }
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  metadata?: Record<string, string>
}

interface TapCharge {
  id: string
  status: 'INITIATED' | 'CAPTURED' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  customer: { id: string }
  source: { id: string }
  redirect: { url: string }
  transaction: { url: string }
}

export class TapClient {
  private headers = {
    'Authorization': `Bearer ${TAP_CONFIG.secretKey}`,
    'Content-Type': 'application/json',
  }

  // ============================================
  // CUSTOMERS
  // ============================================

  async createCustomer(params: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    phoneCountryCode?: string
    metadata?: Record<string, string>
  }): Promise<TapCustomer> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/customers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone && params.phoneCountryCode ? {
          country_code: params.phoneCountryCode,
          number: params.phone,
        } : undefined,
        metadata: params.metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Tap API error: ${error.message || 'Failed to create customer'}`)
    }

    return response.json()
  }

  async getCustomer(customerId: string): Promise<TapCustomer> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/customers/${customerId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch customer')
    }

    return response.json()
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  async createSubscription(params: {
    customerId: string
    planId: string
    amount: number
    currency: string
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount?: number
    trialDays?: number
    startDate?: string
    metadata?: Record<string, string>
    returnUrl?: string
    cancelUrl?: string
  }): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        term: {
          interval: params.interval,
          period: params.intervalCount || 1,
          from: params.startDate || new Date().toISOString(),
          due: 0, // Due immediately
          auto_renew: true,
        },
        trial: params.trialDays ? {
          days: params.trialDays,
        } : undefined,
        charge: {
          amount: params.amount,
          currency: params.currency,
          description: `KWQ8 Subscription - ${params.planId}`,
          receipt: {
            email: true,
            sms: false,
          },
          metadata: {
            ...params.metadata,
            plan_id: params.planId,
            platform: 'kwq8',
          },
        },
        customer: {
          id: params.customerId,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tap/webhooks`,
        },
        redirect: {
          url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Tap API error: ${error.message || 'Failed to create subscription'}`)
    }

    return response.json()
  }

  async getSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch subscription')
    }

    return response.json()
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: this.headers,
      body: JSON.stringify({
        cancel_at_period_end: cancelAtPeriodEnd,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    return response.json()
  }

  async updateSubscription(
    subscriptionId: string,
    params: {
      newPlanId?: string
      newAmount?: number
      prorate?: boolean
    }
  ): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        charge: params.newAmount ? {
          amount: params.newAmount,
        } : undefined,
        prorate: params.prorate !== false,
        metadata: params.newPlanId ? {
          plan_id: params.newPlanId,
        } : undefined,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update subscription')
    }

    return response.json()
  }

  async pauseSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to pause subscription')
    }

    return response.json()
  }

  async resumeSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to resume subscription')
    }

    return response.json()
  }

  async listSubscriptions(customerId: string): Promise<TapSubscription[]> {
    const response = await fetch(
      `${TAP_CONFIG.apiUrl}/subscriptions?customer=${customerId}`,
      { headers: this.headers }
    )

    if (!response.ok) {
      throw new Error('Failed to list subscriptions')
    }

    const data = await response.json()
    return data.subscriptions || []
  }

  async retryPayment(subscriptionId: string): Promise<void> {
    const response = await fetch(
      `${TAP_CONFIG.apiUrl}/subscriptions/${subscriptionId}/retry`,
      {
        method: 'POST',
        headers: this.headers,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to retry payment')
    }
  }

  // ============================================
  // ONE-TIME CHARGES
  // ============================================

  async createCharge(params: {
    amount: number
    currency: string
    customerId?: string
    email?: string
    description?: string
    metadata?: Record<string, string>
    returnUrl?: string
    cancelUrl?: string
  }): Promise<TapCharge> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/charges`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        customer: params.customerId ? { id: params.customerId } : params.email ? { email: params.email } : undefined,
        description: params.description || 'KWQ8 Purchase',
        metadata: params.metadata,
        receipt: {
          email: true,
        },
        redirect: {
          url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tap/webhooks`,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Tap API error: ${error.message || 'Failed to create charge'}`)
    }

    return response.json()
  }

  async getCharge(chargeId: string): Promise<TapCharge> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/charges/${chargeId}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch charge')
    }

    return response.json()
  }

  async refundCharge(chargeId: string, amount?: number): Promise<any> {
    const response = await fetch(`${TAP_CONFIG.apiUrl}/refunds`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        charge_id: chargeId,
        amount: amount, // Partial refund if specified
        reason: 'requested_by_customer',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refund charge')
    }

    return response.json()
  }
}

// Singleton instance
export const tapClient = new TapClient()
