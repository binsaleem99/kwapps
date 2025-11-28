export type AdminRole = 'owner' | 'support' | 'content' | 'readonly'

export type Plan = 'free' | 'builder' | 'pro' | 'hosting_only'

export type Language = 'ar' | 'en'

export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: Plan
  language: Language
  is_admin: boolean
  admin_role: AdminRole | null
  tags: string[]
  internal_notes: string | null
  preferred_language: string
  onboarding_completed: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  arabic_prompt: string | null
  english_prompt: string | null
  generated_code: string | null
  template_id: string | null
  status: 'draft' | 'generating' | 'preview' | 'published' | 'error'
  active_version: number
  deployed_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'paused'
  upayments_subscription_id: string | null
  upayments_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface ImpersonationLog {
  id: string
  admin_id: string
  target_user_id: string
  session_token: string | null
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  ip_address: string | null
}
