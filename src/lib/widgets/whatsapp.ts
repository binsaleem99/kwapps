/**
 * WhatsApp Widget Generator
 *
 * Generates embeddable WhatsApp chat widget code
 * - Click-to-chat: wa.me/[number]?text=[message]
 * - Floating bubble with animation
 * - RTL-aware positioning
 * - Mobile-friendly (44px+ touch targets)
 */

import type {
  WhatsAppWidgetConfig,
  GeneratedWidget,
  PhoneValidation,
} from './types'

import {
  DEFAULT_WIDGET_STYLE,
  WIDGET_SIZES,
  WIDGET_ICONS,
  GCC_COUNTRY_CODES,
  DEFAULT_MESSAGES_AR,
} from './types'

// ============================================
// Phone Number Validation
// ============================================

/**
 * Validate and format phone number for GCC countries
 */
export function validatePhoneNumber(phone: string): PhoneValidation {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Add + if missing
  const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned}`

  // Check each GCC country
  for (const [countryCode, info] of Object.entries(GCC_COUNTRY_CODES)) {
    if (normalized.startsWith(info.code)) {
      if (info.regex.test(normalized)) {
        return {
          valid: true,
          formatted: normalized,
          country: countryCode,
        }
      } else {
        return {
          valid: false,
          error: `Invalid ${info.name} phone number format`,
          errorAr: `صيغة رقم ${info.nameAr} غير صحيحة`,
        }
      }
    }
  }

  // Not a GCC number but might still be valid
  if (/^\+\d{10,15}$/.test(normalized)) {
    return {
      valid: true,
      formatted: normalized,
      country: 'OTHER',
    }
  }

  return {
    valid: false,
    error: 'Invalid phone number format. Include country code (e.g., +965)',
    errorAr: 'صيغة رقم الهاتف غير صحيحة. أضف رمز البلد (مثال: 965+)',
  }
}

/**
 * Format phone for WhatsApp link (remove +)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/^\+/, '').replace(/[\s\-\(\)]/g, '')
}

// ============================================
// WhatsApp Link Generator
// ============================================

/**
 * Generate WhatsApp click-to-chat URL
 */
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
  const encodedMessage = message ? encodeURIComponent(message) : ''

  if (encodedMessage) {
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }

  return `https://wa.me/${formattedPhone}`
}

// ============================================
// Widget Code Generator
// ============================================

/**
 * Generate WhatsApp widget HTML/CSS/JS snippet
 */
export function generateWhatsAppWidget(config: Partial<WhatsAppWidgetConfig>): GeneratedWidget {
  // Merge with defaults
  const fullConfig: WhatsAppWidgetConfig = {
    type: 'whatsapp',
    isActive: true,
    phoneNumber: config.phoneNumber || '',
    welcomeMessage: config.welcomeMessage || DEFAULT_MESSAGES_AR.welcomeMessage,
    buttonText: config.buttonText || DEFAULT_MESSAGES_AR.buttonText,
    showOnMobile: config.showOnMobile ?? true,
    showOnDesktop: config.showOnDesktop ?? true,
    showBadge: config.showBadge ?? false,
    badgeText: config.badgeText || '1',
    style: {
      ...DEFAULT_WIDGET_STYLE,
      primaryColor: '#25D366', // WhatsApp green
      ...config.style,
    },
    workingHours: config.workingHours,
  }

  const { style, phoneNumber, welcomeMessage, buttonText, showBadge, badgeText } = fullConfig
  const size = WIDGET_SIZES[style.size ?? 'medium']
  const waLink = generateWhatsAppLink(phoneNumber, welcomeMessage)

  // Position styles
  const positionStyles = getPositionStyles(style)

  // Generate unique ID
  const widgetId = `kwq8-wa-${Date.now()}`

  // CSS
  const css = `
/* KWq8 WhatsApp Widget */
#${widgetId} {
  position: fixed;
  ${positionStyles}
  z-index: ${style.zIndex};
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

#${widgetId} .kwq8-wa-bubble {
  width: ${size.width}px;
  height: ${size.height}px;
  background-color: ${style.primaryColor};
  border-radius: ${style.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  ${getShadowStyle(style.shadow)}
}

#${widgetId} .kwq8-wa-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
}

#${widgetId} .kwq8-wa-bubble svg {
  width: ${size.iconSize}px;
  height: ${size.iconSize}px;
  fill: ${style.textColor};
}

#${widgetId} .kwq8-wa-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

#${widgetId} .kwq8-wa-tooltip {
  position: absolute;
  ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'}: ${size.width + 15}px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  color: #333;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

#${widgetId} .kwq8-wa-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'}: -8px;
  transform: translateY(-50%);
  border: 8px solid transparent;
  border-${(style.position ?? 'bottom-right').includes('right') ? 'left' : 'right'}-color: white;
}

#${widgetId}:hover .kwq8-wa-tooltip {
  opacity: 1;
  visibility: visible;
}

${getAnimationStyles(style.animation, widgetId)}

@media (max-width: 768px) {
  #${widgetId} .kwq8-wa-tooltip {
    display: none;
  }
  #${widgetId} .kwq8-wa-bubble {
    width: ${Math.max(size.width, 56)}px;
    height: ${Math.max(size.height, 56)}px;
  }
}
`.trim()

  // HTML
  const html = `
<!-- KWq8 WhatsApp Widget -->
<div id="${widgetId}">
  <a href="${waLink}" target="_blank" rel="noopener noreferrer" aria-label="${buttonText}">
    <div class="kwq8-wa-bubble">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="${WIDGET_ICONS.whatsapp}"/>
      </svg>
      ${showBadge ? `<span class="kwq8-wa-badge">${badgeText}</span>` : ''}
    </div>
    <div class="kwq8-wa-tooltip">${buttonText}</div>
  </a>
</div>
`.trim()

  // JavaScript (minimal - for working hours check if needed)
  const js = fullConfig.workingHours?.enabled
    ? generateWorkingHoursScript(widgetId, fullConfig.workingHours)
    : ''

  // Combined snippet
  const snippet = `
<!-- KWq8 WhatsApp Widget - Start -->
<style>${css}</style>
${html}
${js ? `<script>${js}</script>` : ''}
<!-- KWq8 WhatsApp Widget - End -->
`.trim()

  // Minified version
  const minified = minifySnippet(snippet)

  return {
    html,
    css,
    js,
    snippet,
    minified,
  }
}

// ============================================
// Helper Functions
// ============================================

function getPositionStyles(style: WhatsAppWidgetConfig['style']): string {
  const { position, bottomOffset, sideOffset } = style
  const bottom = bottomOffset ?? 20
  const side = sideOffset ?? 20

  switch (position) {
    case 'bottom-right':
      return `bottom: ${bottom}px; right: ${side}px;`
    case 'bottom-left':
      return `bottom: ${bottom}px; left: ${side}px;`
    case 'top-right':
      return `top: ${bottom}px; right: ${side}px;`
    case 'top-left':
      return `top: ${bottom}px; left: ${side}px;`
    default:
      return `bottom: ${bottom}px; right: ${side}px;`
  }
}

function getShadowStyle(shadow?: string): string {
  switch (shadow) {
    case 'none':
      return ''
    case 'light':
      return 'box-shadow: 0 2px 10px rgba(0,0,0,0.1);'
    case 'heavy':
      return 'box-shadow: 0 8px 30px rgba(0,0,0,0.3);'
    case 'medium':
    default:
      return 'box-shadow: 0 4px 15px rgba(0,0,0,0.2);'
  }
}

function getAnimationStyles(animation?: string, widgetId?: string): string {
  if (!animation || animation === 'none') return ''

  switch (animation) {
    case 'bounce':
      return `
@keyframes kwq8-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
#${widgetId} .kwq8-wa-bubble { animation: kwq8-bounce 2s infinite; }
`
    case 'pulse':
      return `
@keyframes kwq8-pulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
#${widgetId} .kwq8-wa-bubble { animation: kwq8-pulse 2s infinite; }
`
    case 'shake':
      return `
@keyframes kwq8-shake {
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-5deg); }
  20%, 40%, 60%, 80% { transform: rotate(5deg); }
}
#${widgetId} .kwq8-wa-bubble { animation: kwq8-shake 2s ease-in-out infinite; animation-delay: 3s; }
`
    case 'fade-in':
      return `
@keyframes kwq8-fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
#${widgetId} { animation: kwq8-fadeIn 0.5s ease-out; }
`
    default:
      return ''
  }
}

function generateWorkingHoursScript(
  widgetId: string,
  workingHours: NonNullable<WhatsAppWidgetConfig['workingHours']>
): string {
  return `
(function() {
  var widget = document.getElementById('${widgetId}');
  var schedule = ${JSON.stringify(workingHours.schedule)};
  var offlineMsg = '${workingHours.offlineMessage || DEFAULT_MESSAGES_AR.offlineMessage}';

  function checkWorkingHours() {
    var now = new Date();
    var day = now.getDay();
    var time = now.getHours() * 100 + now.getMinutes();

    var todaySchedule = schedule.find(function(s) { return s.day === day; });
    if (!todaySchedule) {
      showOffline();
      return;
    }

    var start = parseInt(todaySchedule.start.replace(':', ''));
    var end = parseInt(todaySchedule.end.replace(':', ''));

    if (time >= start && time <= end) {
      showOnline();
    } else {
      showOffline();
    }
  }

  function showOffline() {
    var tooltip = widget.querySelector('.kwq8-wa-tooltip');
    if (tooltip) tooltip.textContent = offlineMsg;
    widget.style.opacity = '0.6';
  }

  function showOnline() {
    widget.style.opacity = '1';
  }

  checkWorkingHours();
  setInterval(checkWorkingHours, 60000);
})();
`.trim()
}

function minifySnippet(code: string): string {
  return code
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/;\s+/g, ';')
    .replace(/{\s+/g, '{')
    .replace(/\s+}/g, '}')
    .replace(/:\s+/g, ':')
    .replace(/,\s+/g, ',')
    .trim()
}

// ============================================
// Export Default Config
// ============================================

export function getDefaultWhatsAppConfig(): Partial<WhatsAppWidgetConfig> {
  return {
    type: 'whatsapp',
    isActive: true,
    welcomeMessage: DEFAULT_MESSAGES_AR.welcomeMessage,
    buttonText: DEFAULT_MESSAGES_AR.buttonText,
    showOnMobile: true,
    showOnDesktop: true,
    style: {
      ...DEFAULT_WIDGET_STYLE,
      primaryColor: '#25D366',
    },
  }
}
