/**
 * Widget System - Public API
 *
 * KWq8.com Widget Integration System
 * Export all widget generators and utilities
 */

// Types
export type {
  WidgetType,
  WidgetPosition,
  WidgetSize,
  WidgetAnimation,
  WidgetStyleConfig,
  WidgetBaseConfig,
  WhatsAppWidgetConfig,
  TelegramWidgetConfig,
  InstagramWidgetConfig,
  CustomChatWidgetConfig,
  AnyWidgetConfig,
  ProjectWidget,
  GeneratedWidget,
  PhoneValidation,
} from './types'

// Constants
export {
  GCC_COUNTRY_CODES,
  DEFAULT_WIDGET_STYLE,
  WIDGET_SIZES,
  WIDGET_COLORS,
  WIDGET_ICONS,
  WIDGET_LABELS_AR,
  DEFAULT_MESSAGES_AR,
} from './types'

// Widget Generators
export {
  generateWidget,
  generateMultipleWidgets,
  generateWhatsAppWidget,
  generateTelegramWidget,
  generateInstagramWidget,
  generateMessengerWidget,
  generateCustomChatWidget,
  generateCallbackWidget,
  validatePhoneNumber,
  generateWhatsAppLink,
} from './widget-generator'

// Embed Injector
export type { InjectionOptions, InjectionResult } from './embed-injector'
export {
  injectWidgets,
  injectSingleWidget,
  generateReactWidgetComponent,
  generateEmbedScript,
  validateHtmlStructure,
  DEFAULT_INJECTION_OPTIONS,
} from './embed-injector'
