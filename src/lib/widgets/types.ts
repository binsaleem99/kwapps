/**
 * Widget System Types
 *
 * KWq8.com Widget Integration System
 * - WhatsApp, Telegram, Instagram chat widgets
 * - Embeddable code for client websites
 * - RTL-aware, Arabic-first
 */

// ============================================
// Widget Types
// ============================================

export type WidgetType =
  | 'whatsapp'
  | 'telegram'
  | 'instagram'
  | 'facebook_messenger'
  | 'custom_chat'
  | 'callback_request'

export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type WidgetSize = 'small' | 'medium' | 'large'

export type WidgetAnimation =
  | 'none'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'fade-in'

// ============================================
// Widget Configuration
// ============================================

export interface WidgetStyleConfig {
  /** Primary color (hex) - defaults to widget type color */
  primaryColor?: string
  /** Secondary/text color - defaults to white */
  textColor?: string
  /** Widget size - defaults to medium */
  size?: WidgetSize
  /** Widget position - defaults to bottom-right */
  position?: WidgetPosition
  /** Border radius */
  borderRadius?: number
  /** Shadow intensity */
  shadow?: 'none' | 'light' | 'medium' | 'heavy'
  /** Animation type */
  animation?: WidgetAnimation
  /** Z-index */
  zIndex?: number
  /** Bottom offset in pixels */
  bottomOffset?: number
  /** Side offset in pixels */
  sideOffset?: number
}

export interface WidgetBaseConfig {
  /** Widget type */
  type: WidgetType
  /** Is widget active */
  isActive: boolean
  /** Widget styling */
  style: WidgetStyleConfig
  /** Show on mobile */
  showOnMobile: boolean
  /** Show on desktop */
  showOnDesktop: boolean
  /** Delay before showing (ms) */
  showDelay?: number
  /** Custom CSS class */
  customClass?: string
}

// ============================================
// WhatsApp Widget Config
// ============================================

export interface WhatsAppWidgetConfig extends WidgetBaseConfig {
  type: 'whatsapp'
  /** Phone number with country code (e.g., +96512345678) */
  phoneNumber: string
  /** Pre-filled message (Arabic) */
  welcomeMessage: string
  /** Button/tooltip text */
  buttonText: string
  /** Show notification badge */
  showBadge?: boolean
  /** Badge text (e.g., "1") */
  badgeText?: string
  /** Working hours (null = always available) */
  workingHours?: {
    enabled: boolean
    timezone: string
    schedule: {
      day: number // 0-6 (Sunday-Saturday)
      start: string // "09:00"
      end: string // "18:00"
    }[]
    offlineMessage?: string
  }
}

// ============================================
// Telegram Widget Config
// ============================================

export interface TelegramWidgetConfig extends WidgetBaseConfig {
  type: 'telegram'
  /** Telegram username (without @) */
  username: string
  /** Pre-filled message */
  welcomeMessage: string
  /** Button text */
  buttonText: string
}

// ============================================
// Instagram Widget Config
// ============================================

export interface InstagramWidgetConfig extends WidgetBaseConfig {
  type: 'instagram'
  /** Instagram username (without @) */
  username: string
  /** Button text */
  buttonText: string
}

// ============================================
// Facebook Messenger Widget Config
// ============================================

export interface FacebookMessengerWidgetConfig extends WidgetBaseConfig {
  type: 'facebook_messenger'
  /** Facebook Page ID */
  pageId: string
  /** Button text */
  buttonText: string
}

// ============================================
// Callback Request Widget Config
// ============================================

export interface CallbackRequestWidgetConfig extends WidgetBaseConfig {
  type: 'callback_request'
  /** Phone number to receive callbacks */
  phoneNumber: string
  /** Button text */
  buttonText: string
  /** Form placeholder */
  placeholderText?: string
}

// ============================================
// Custom Chat Widget Config
// ============================================

export interface CustomChatWidgetConfig extends WidgetBaseConfig {
  type: 'custom_chat'
  /** Chat endpoint URL */
  endpointUrl: string
  /** Button text */
  buttonText: string
  /** Placeholder text */
  placeholderText: string
}

// ============================================
// Union Type for All Widget Configs
// ============================================

export type AnyWidgetConfig =
  | WhatsAppWidgetConfig
  | TelegramWidgetConfig
  | InstagramWidgetConfig
  | FacebookMessengerWidgetConfig
  | CallbackRequestWidgetConfig
  | CustomChatWidgetConfig

// ============================================
// Database Types
// ============================================

export interface ProjectWidget {
  id: string
  project_id: string
  widget_type: WidgetType
  config: AnyWidgetConfig
  is_active: boolean
  position: WidgetPosition
  /** Generated embeddable snippet */
  generated_snippet?: string
  created_at: string
  updated_at: string
}

// ============================================
// Generated Widget Output
// ============================================

export interface GeneratedWidget {
  /** HTML snippet */
  html: string
  /** CSS styles */
  css: string
  /** JavaScript code */
  js: string
  /** Combined embeddable snippet */
  snippet: string
  /** Minified version */
  minified: string
}

// ============================================
// Phone Validation
// ============================================

export interface PhoneValidation {
  valid: boolean
  formatted?: string
  country?: string
  error?: string
  errorAr?: string
}

// ============================================
// Constants
// ============================================

/** GCC Country codes */
export const GCC_COUNTRY_CODES: Record<string, { code: string; name: string; nameAr: string; regex: RegExp }> = {
  KW: {
    code: '+965',
    name: 'Kuwait',
    nameAr: 'الكويت',
    regex: /^\+965[569]\d{7}$/,
  },
  SA: {
    code: '+966',
    name: 'Saudi Arabia',
    nameAr: 'السعودية',
    regex: /^\+966[5]\d{8}$/,
  },
  AE: {
    code: '+971',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات',
    regex: /^\+971[5]\d{8}$/,
  },
  BH: {
    code: '+973',
    name: 'Bahrain',
    nameAr: 'البحرين',
    regex: /^\+973[3]\d{7}$/,
  },
  OM: {
    code: '+968',
    name: 'Oman',
    nameAr: 'عمان',
    regex: /^\+968[79]\d{7}$/,
  },
  QA: {
    code: '+974',
    name: 'Qatar',
    nameAr: 'قطر',
    regex: /^\+974[3567]\d{7}$/,
  },
}

/** Default widget styles */
export const DEFAULT_WIDGET_STYLE: WidgetStyleConfig = {
  primaryColor: '#25D366', // WhatsApp green
  textColor: '#ffffff',
  size: 'medium',
  position: 'bottom-right',
  borderRadius: 50,
  shadow: 'medium',
  animation: 'pulse',
  zIndex: 9999,
  bottomOffset: 20,
  sideOffset: 20,
}

/** Size dimensions in pixels */
export const WIDGET_SIZES: Record<WidgetSize, { width: number; height: number; iconSize: number }> = {
  small: { width: 50, height: 50, iconSize: 24 },
  medium: { width: 60, height: 60, iconSize: 32 },
  large: { width: 70, height: 70, iconSize: 40 },
}

/** Widget type colors */
export const WIDGET_COLORS: Record<WidgetType, string> = {
  whatsapp: '#25D366',
  telegram: '#0088cc',
  instagram: '#E4405F',
  facebook_messenger: '#0084FF',
  custom_chat: '#3b82f6',
  callback_request: '#8b5cf6',
}

/** Widget type icons (SVG paths) */
export const WIDGET_ICONS: Record<WidgetType, string> = {
  whatsapp: 'M12 2C6.48 2 2 6.48 2 12C2 14.17 2.74 16.17 4 17.77L2.5 22L6.87 20.5C8.5 21.47 10.17 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.5 15.5C16.25 16.17 15.17 16.75 14.5 16.83C13.87 16.92 13.08 16.92 12.17 16.58C11.58 16.37 10.83 16.08 9.92 15.58C7.58 14.25 6.08 11.83 5.92 11.58C5.75 11.33 4.75 10 4.75 8.58C4.75 7.17 5.42 6.5 5.67 6.17C5.92 5.83 6.25 5.75 6.42 5.75C6.58 5.75 6.75 5.75 6.92 5.75C7.08 5.75 7.33 5.67 7.58 6.25C7.83 6.83 8.42 8.25 8.5 8.42C8.58 8.58 8.58 8.75 8.5 8.92C8.42 9.08 8.33 9.25 8.17 9.42C8 9.58 7.83 9.83 7.67 9.92C7.5 10.08 7.33 10.25 7.5 10.5C7.67 10.75 8.33 11.83 9.33 12.67C10.58 13.75 11.67 14.08 11.92 14.25C12.17 14.42 12.33 14.42 12.5 14.17C12.67 14 13.25 13.33 13.42 13.08C13.58 12.83 13.75 12.92 14 13C14.25 13.08 15.67 13.75 15.92 13.92C16.17 14.08 16.33 14.17 16.42 14.25C16.5 14.42 16.5 14.92 16.5 15.5Z',
  telegram: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8L15.01 15.93C14.89 16.49 14.55 16.63 14.1 16.37L11.6 14.5L10.4 15.67C10.27 15.8 10.15 15.93 9.89 15.93L10.08 13.37L14.7 9.17C14.9 8.99 14.67 8.89 14.4 9.07L8.75 12.6L6.25 11.8C5.68 11.6 5.67 11.2 6.4 10.93L15.88 7.52C16.35 7.35 16.77 7.62 16.64 8.8Z',
  instagram: 'M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z',
  facebook_messenger: 'M12 2C6.477 2 2 6.145 2 11.259C2 14.019 3.308 16.479 5.5 18.149V22L9.139 19.996C10.054 20.261 11.015 20.398 12 20.398C17.523 20.398 22 16.253 22 11.139C22 6.025 17.523 2 12 2ZM13.001 14.431L10.47 11.757L5.508 14.517L10.939 8.741L13.53 11.415L18.432 8.741L13.001 14.431Z',
  custom_chat: 'M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16ZM7 9H9V11H7V9ZM11 9H13V11H11V9ZM15 9H17V11H15V9Z',
  callback_request: 'M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z',
}

/** Arabic labels */
export const WIDGET_LABELS_AR: Record<WidgetType, string> = {
  whatsapp: 'واتساب',
  telegram: 'تيليجرام',
  instagram: 'انستجرام',
  facebook_messenger: 'ماسنجر',
  custom_chat: 'دردشة مخصصة',
  callback_request: 'طلب اتصال',
}

/** Default Arabic messages */
export const DEFAULT_MESSAGES_AR = {
  welcomeMessage: 'مرحباً، كيف يمكنني مساعدتك؟',
  buttonText: 'تواصل معنا',
  offlineMessage: 'نحن غير متاحين حالياً. سنرد عليك في أقرب وقت.',
  placeholderText: 'اكتب رسالتك هنا...',
}
