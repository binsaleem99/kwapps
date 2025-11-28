// KW APPS - TypeScript Type Definitions

export type UserPlan = 'free' | 'builder' | 'pro' | 'hosting_only';
export type ProjectStatus = 'draft' | 'generating' | 'preview' | 'published' | 'error';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'paused';
export type MessageRole = 'user' | 'assistant' | 'system';
export type AssetType = 'logo' | 'hero' | 'product' | 'banner' | 'icon' | 'other';
export type TemplateCategory = 'ecommerce' | 'restaurant' | 'saas' | 'landing' | 'portfolio' | 'booking' | 'social' | 'dashboard';

// User Interface
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  plan: UserPlan;
  language: 'ar' | 'en';
  created_at: string;
  updated_at: string;
}

// Project Interface
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  arabic_prompt?: string;
  english_prompt?: string;
  generated_code?: string;
  template_id?: string;
  status: ProjectStatus;
  active_version: number;
  deployed_url?: string;
  created_at: string;
  updated_at: string;
}

// Message Interface (Chat History)
export interface Message {
  id: string;
  project_id: string;
  role: MessageRole;
  content: string;
  tokens_used: number;
  created_at: string;
}

// Template Interface
export interface Template {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  category: TemplateCategory;
  preview_url?: string;
  thumbnail_url?: string;
  base_code: string;
  customizable_sections: Record<string, any>;
  color_scheme: Record<string, any>;
  is_rtl: boolean;
  is_premium: boolean;
  usage_count: number;
  created_at: string;
}

// User Asset Interface
export interface UserAsset {
  id: string;
  user_id: string;
  project_id?: string;
  asset_type: AssetType;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

// Subscription Interface
export interface Subscription {
  id: string;
  user_id: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  upayments_subscription_id?: string;
  upayments_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Usage Limits Interface
export interface UsageLimits {
  user_id: string;
  date: string;
  prompt_count: number;
  tokens_used: number;
}

// Project Version Interface
export interface ProjectVersion {
  id: string;
  project_id: string;
  version: number;
  code_snapshot: string;
  prompt_snapshot?: string;
  created_at: string;
}

// Billing Event Interface
export interface BillingEvent {
  id: string;
  user_id: string;
  event_type: string;
  upayments_event_id?: string;
  amount_kwd?: number;
  data?: Record<string, any>;
  created_at: string;
}

// Analytics Event Interface
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_name: string;
  event_data?: Record<string, any>;
  session_id?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    message_en?: string;
    status: number;
  };
}

// Generation Request/Response
export interface GenerationRequest {
  prompt: string;
  project_id?: string;
  current_code?: string;
}

export interface GenerationResponse {
  code: string;
  tokens_used: number;
}

// Usage Response
export interface UsageResponse {
  today: {
    count: number;
    limit: number;
  };
  month: {
    count: number;
    limit: number;
  };
}

// Plan Limits
export interface PlanLimits {
  plan: UserPlan;
  daily_limit: number;
  monthly_limit: number;
  features: string[];
}

// Template Customization
export interface TemplateCustomization {
  brand_name?: string;
  primary_color?: string;
  logo_url?: string;
  hero_image_url?: string;
  sections?: Record<string, boolean>;
}

// Checkout Request
export interface CheckoutRequest {
  plan: 'builder' | 'pro';
}

export interface CheckoutResponse {
  checkout_url: string;
}
