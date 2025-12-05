/**
 * Universal Widget Generator
 *
 * Generates embeddable widget code for multiple platforms
 * - WhatsApp, Telegram, Instagram, Facebook Messenger
 * - RTL-aware positioning
 * - Mobile-friendly (44px+ touch targets)
 * - Minified output for production
 */

import type {
  WidgetType,
  AnyWidgetConfig,
  WhatsAppWidgetConfig,
  TelegramWidgetConfig,
  InstagramWidgetConfig,
  CustomChatWidgetConfig,
  GeneratedWidget,
  WidgetStyleConfig,
} from './types'

import {
  WIDGET_SIZES,
  WIDGET_ICONS,
  WIDGET_COLORS,
  DEFAULT_WIDGET_STYLE,
} from './types'

import {
  generateWhatsAppWidget,
  validatePhoneNumber,
  generateWhatsAppLink,
} from './whatsapp'

// ============================================
// Telegram Widget Generator
// ============================================

export function generateTelegramWidget(config: Partial<TelegramWidgetConfig>): GeneratedWidget {
  const fullConfig: TelegramWidgetConfig = {
    type: 'telegram',
    isActive: true,
    username: config.username || '',
    welcomeMessage: config.welcomeMessage || 'مرحباً، كيف يمكنني مساعدتك؟',
    buttonText: config.buttonText || 'تواصل عبر تيليجرام',
    showOnMobile: config.showOnMobile ?? true,
    showOnDesktop: config.showOnDesktop ?? true,
    style: {
      ...DEFAULT_WIDGET_STYLE,
      primaryColor: WIDGET_COLORS.telegram,
      ...config.style,
    },
  }

  const { style, username, buttonText } = fullConfig
  const size = WIDGET_SIZES[style.size ?? 'medium']
  const telegramLink = `https://t.me/${username}`

  const widgetId = `kwq8-tg-${Date.now()}`
  const positionStyles = getPositionStyles(style)

  const css = generateWidgetCSS({
    widgetId,
    positionStyles,
    style,
    size,
    hoverColor: 'rgba(0, 136, 204, 0.4)',
  })

  const html = `
<!-- KWq8 Telegram Widget -->
<div id="${widgetId}">
  <a href="${telegramLink}" target="_blank" rel="noopener noreferrer" aria-label="${buttonText}">
    <div class="kwq8-widget-bubble">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="${WIDGET_ICONS.telegram}"/>
      </svg>
    </div>
    <div class="kwq8-widget-tooltip">${buttonText}</div>
  </a>
</div>
`.trim()

  const snippet = `
<!-- KWq8 Telegram Widget - Start -->
<style>${css}</style>
${html}
<!-- KWq8 Telegram Widget - End -->
`.trim()

  return {
    html,
    css,
    js: '',
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Instagram Widget Generator
// ============================================

export function generateInstagramWidget(config: Partial<InstagramWidgetConfig>): GeneratedWidget {
  const fullConfig: InstagramWidgetConfig = {
    type: 'instagram',
    isActive: true,
    username: config.username || '',
    buttonText: config.buttonText || 'تابعنا على انستجرام',
    showOnMobile: config.showOnMobile ?? true,
    showOnDesktop: config.showOnDesktop ?? true,
    style: {
      ...DEFAULT_WIDGET_STYLE,
      primaryColor: WIDGET_COLORS.instagram,
      ...config.style,
    },
  }

  const { style, username, buttonText } = fullConfig
  const size = WIDGET_SIZES[style.size ?? 'medium']
  const instagramLink = `https://instagram.com/${username}`

  const widgetId = `kwq8-ig-${Date.now()}`
  const positionStyles = getPositionStyles(style)

  // Instagram gradient CSS
  const instagramGradient = `
#${widgetId} .kwq8-widget-bubble {
  background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
}
#${widgetId} .kwq8-widget-bubble:hover {
  box-shadow: 0 8px 25px rgba(228, 64, 95, 0.4);
}
`

  const css = generateWidgetCSS({
    widgetId,
    positionStyles,
    style,
    size,
    hoverColor: 'rgba(228, 64, 95, 0.4)',
    additionalCSS: instagramGradient,
    skipBackgroundColor: true,
  })

  const html = `
<!-- KWq8 Instagram Widget -->
<div id="${widgetId}">
  <a href="${instagramLink}" target="_blank" rel="noopener noreferrer" aria-label="${buttonText}">
    <div class="kwq8-widget-bubble">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="${WIDGET_ICONS.instagram}"/>
      </svg>
    </div>
    <div class="kwq8-widget-tooltip">${buttonText}</div>
  </a>
</div>
`.trim()

  const snippet = `
<!-- KWq8 Instagram Widget - Start -->
<style>${css}</style>
${html}
<!-- KWq8 Instagram Widget - End -->
`.trim()

  return {
    html,
    css,
    js: '',
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Facebook Messenger Widget Generator
// ============================================

export function generateMessengerWidget(config: {
  pageId: string
  buttonText?: string
  style?: Partial<WidgetStyleConfig>
}): GeneratedWidget {
  const style: WidgetStyleConfig = {
    ...DEFAULT_WIDGET_STYLE,
    primaryColor: WIDGET_COLORS.facebook_messenger,
    ...config.style,
  }

  const size = WIDGET_SIZES[style.size ?? 'medium']
  const messengerLink = `https://m.me/${config.pageId}`
  const buttonText = config.buttonText || 'تواصل عبر ماسنجر'

  const widgetId = `kwq8-fb-${Date.now()}`
  const positionStyles = getPositionStyles(style)

  const css = generateWidgetCSS({
    widgetId,
    positionStyles,
    style,
    size,
    hoverColor: 'rgba(0, 132, 255, 0.4)',
  })

  const html = `
<!-- KWq8 Messenger Widget -->
<div id="${widgetId}">
  <a href="${messengerLink}" target="_blank" rel="noopener noreferrer" aria-label="${buttonText}">
    <div class="kwq8-widget-bubble">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="${WIDGET_ICONS.facebook_messenger}"/>
      </svg>
    </div>
    <div class="kwq8-widget-tooltip">${buttonText}</div>
  </a>
</div>
`.trim()

  const snippet = `
<!-- KWq8 Messenger Widget - Start -->
<style>${css}</style>
${html}
<!-- KWq8 Messenger Widget - End -->
`.trim()

  return {
    html,
    css,
    js: '',
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Custom Chat Widget Generator
// ============================================

export function generateCustomChatWidget(config: Partial<CustomChatWidgetConfig>): GeneratedWidget {
  const fullConfig: CustomChatWidgetConfig = {
    type: 'custom_chat',
    isActive: true,
    endpointUrl: config.endpointUrl || '',
    buttonText: config.buttonText || 'دردشة مباشرة',
    placeholderText: config.placeholderText || 'اكتب رسالتك هنا...',
    showOnMobile: config.showOnMobile ?? true,
    showOnDesktop: config.showOnDesktop ?? true,
    style: {
      ...DEFAULT_WIDGET_STYLE,
      primaryColor: WIDGET_COLORS.custom_chat,
      ...config.style,
    },
  }

  const { style, buttonText, placeholderText, endpointUrl } = fullConfig
  const size = WIDGET_SIZES[style.size ?? 'medium']

  const widgetId = `kwq8-chat-${Date.now()}`
  const positionStyles = getPositionStyles(style)

  const css = `
/* KWq8 Custom Chat Widget */
#${widgetId} {
  position: fixed;
  ${positionStyles}
  z-index: ${style.zIndex};
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

#${widgetId} .kwq8-chat-bubble {
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

#${widgetId} .kwq8-chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

#${widgetId} .kwq8-chat-bubble svg {
  width: ${size.iconSize}px;
  height: ${size.iconSize}px;
  fill: ${style.textColor};
}

#${widgetId} .kwq8-chat-window {
  position: absolute;
  ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'}: 0;
  bottom: ${size.height + 15}px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 40px rgba(0,0,0,0.16);
  overflow: hidden;
  transform: scale(0.9);
  opacity: 0;
  visibility: hidden;
  transform-origin: bottom ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'};
  transition: all 0.3s ease;
}

#${widgetId}.kwq8-open .kwq8-chat-window {
  transform: scale(1);
  opacity: 1;
  visibility: visible;
}

#${widgetId} .kwq8-chat-header {
  background-color: ${style.primaryColor};
  color: ${style.textColor};
  padding: 16px;
  font-weight: 600;
}

#${widgetId} .kwq8-chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 16px;
}

#${widgetId} .kwq8-chat-input {
  display: flex;
  border-top: 1px solid #e2e8f0;
  padding: 12px;
}

#${widgetId} .kwq8-chat-input input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 8px 16px;
  outline: none;
  font-family: inherit;
  direction: rtl;
}

#${widgetId} .kwq8-chat-input button {
  background-color: ${style.primaryColor};
  color: ${style.textColor};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  #${widgetId} .kwq8-chat-window {
    width: calc(100vw - 40px);
    max-width: 320px;
  }
  #${widgetId} .kwq8-chat-bubble {
    width: ${Math.max(size.width, 56)}px;
    height: ${Math.max(size.height, 56)}px;
  }
}

${getAnimationStyles(style.animation, widgetId, 'kwq8-chat-bubble')}
`.trim()

  const html = `
<!-- KWq8 Custom Chat Widget -->
<div id="${widgetId}">
  <div class="kwq8-chat-bubble" onclick="this.parentElement.classList.toggle('kwq8-open')">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="${WIDGET_ICONS.custom_chat}"/>
    </svg>
  </div>
  <div class="kwq8-chat-window">
    <div class="kwq8-chat-header">${buttonText}</div>
    <div class="kwq8-chat-messages" id="${widgetId}-messages"></div>
    <div class="kwq8-chat-input">
      <input type="text" id="${widgetId}-input" placeholder="${placeholderText}" />
      <button onclick="kwq8SendMessage('${widgetId}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </div>
</div>
`.trim()

  const js = `
(function() {
  window.kwq8SendMessage = function(widgetId) {
    var input = document.getElementById(widgetId + '-input');
    var messages = document.getElementById(widgetId + '-messages');
    var message = input.value.trim();

    if (!message) return;

    // Add user message
    var userMsg = document.createElement('div');
    userMsg.style.cssText = 'background:#e3f2fd;padding:8px 12px;border-radius:12px;margin-bottom:8px;text-align:right;';
    userMsg.textContent = message;
    messages.appendChild(userMsg);

    // Clear input
    input.value = '';

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;

    // Send to endpoint
    fetch('${endpointUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, widgetId: widgetId })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.reply) {
        var botMsg = document.createElement('div');
        botMsg.style.cssText = 'background:#f1f5f9;padding:8px 12px;border-radius:12px;margin-bottom:8px;text-align:right;';
        botMsg.textContent = data.reply;
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
      }
    })
    .catch(function(err) {
      console.error('Chat error:', err);
    });
  };

  // Enter key handler
  document.getElementById('${widgetId}-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      kwq8SendMessage('${widgetId}');
    }
  });
})();
`.trim()

  const snippet = `
<!-- KWq8 Custom Chat Widget - Start -->
<style>${css}</style>
${html}
<script>${js}</script>
<!-- KWq8 Custom Chat Widget - End -->
`.trim()

  return {
    html,
    css,
    js,
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Universal Widget Generator
// ============================================

/**
 * Generate widget code for any supported type
 */
export function generateWidget(
  type: WidgetType,
  config: Partial<AnyWidgetConfig> & { pageId?: string }
): GeneratedWidget {
  switch (type) {
    case 'whatsapp':
      return generateWhatsAppWidget(config as Partial<WhatsAppWidgetConfig>)

    case 'telegram':
      return generateTelegramWidget(config as Partial<TelegramWidgetConfig>)

    case 'instagram':
      return generateInstagramWidget(config as Partial<InstagramWidgetConfig>)

    case 'facebook_messenger':
      return generateMessengerWidget({
        pageId: config.pageId || '',
        buttonText: (config as any).buttonText,
        style: config.style,
      })

    case 'custom_chat':
      return generateCustomChatWidget(config as Partial<CustomChatWidgetConfig>)

    case 'callback_request':
      return generateCallbackWidget(config)

    default:
      throw new Error(`Unsupported widget type: ${type}`)
  }
}

// ============================================
// Callback Request Widget
// ============================================

export function generateCallbackWidget(config: Partial<AnyWidgetConfig> & {
  phoneNumber?: string
  formEndpoint?: string
}): GeneratedWidget {
  const style: WidgetStyleConfig = {
    ...DEFAULT_WIDGET_STYLE,
    primaryColor: WIDGET_COLORS.callback_request,
    ...config.style,
  }

  const size = WIDGET_SIZES[style.size ?? 'medium']
  const buttonText = (config as any).buttonText || 'اطلب اتصال'
  const formEndpoint = config.formEndpoint || '/api/callback-request'

  const widgetId = `kwq8-cb-${Date.now()}`
  const positionStyles = getPositionStyles(style)

  const css = `
/* KWq8 Callback Request Widget */
#${widgetId} {
  position: fixed;
  ${positionStyles}
  z-index: ${style.zIndex};
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

#${widgetId} .kwq8-cb-bubble {
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

#${widgetId} .kwq8-cb-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

#${widgetId} .kwq8-cb-bubble svg {
  width: ${size.iconSize}px;
  height: ${size.iconSize}px;
  fill: ${style.textColor};
}

#${widgetId} .kwq8-cb-form {
  position: absolute;
  ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'}: 0;
  bottom: ${size.height + 15}px;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 40px rgba(0,0,0,0.16);
  padding: 20px;
  transform: scale(0.9);
  opacity: 0;
  visibility: hidden;
  transform-origin: bottom ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'};
  transition: all 0.3s ease;
}

#${widgetId}.kwq8-open .kwq8-cb-form {
  transform: scale(1);
  opacity: 1;
  visibility: visible;
}

#${widgetId} .kwq8-cb-form h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #1e293b;
}

#${widgetId} .kwq8-cb-form input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  outline: none;
  font-family: inherit;
  direction: rtl;
}

#${widgetId} .kwq8-cb-form input:focus {
  border-color: ${style.primaryColor};
}

#${widgetId} .kwq8-cb-form button {
  width: 100%;
  background-color: ${style.primaryColor};
  color: ${style.textColor};
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

#${widgetId} .kwq8-cb-success {
  display: none;
  text-align: center;
  color: #22c55e;
}

@media (max-width: 768px) {
  #${widgetId} .kwq8-cb-form {
    width: calc(100vw - 40px);
    max-width: 280px;
  }
  #${widgetId} .kwq8-cb-bubble {
    width: ${Math.max(size.width, 56)}px;
    height: ${Math.max(size.height, 56)}px;
  }
}

${getAnimationStyles(style.animation, widgetId, 'kwq8-cb-bubble')}
`.trim()

  const html = `
<!-- KWq8 Callback Request Widget -->
<div id="${widgetId}">
  <div class="kwq8-cb-bubble" onclick="this.parentElement.classList.toggle('kwq8-open')">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="${WIDGET_ICONS.callback_request}"/>
    </svg>
  </div>
  <div class="kwq8-cb-form">
    <h3>${buttonText}</h3>
    <input type="text" id="${widgetId}-name" placeholder="الاسم" required />
    <input type="tel" id="${widgetId}-phone" placeholder="رقم الهاتف" required />
    <button onclick="kwq8RequestCallback('${widgetId}', '${formEndpoint}')">
      إرسال الطلب
    </button>
    <div class="kwq8-cb-success" id="${widgetId}-success">
      ✓ تم استلام طلبك! سنتصل بك قريباً.
    </div>
  </div>
</div>
`.trim()

  const js = `
(function() {
  window.kwq8RequestCallback = function(widgetId, endpoint) {
    var name = document.getElementById(widgetId + '-name').value.trim();
    var phone = document.getElementById(widgetId + '-phone').value.trim();

    if (!name || !phone) {
      alert('الرجاء تعبئة جميع الحقول');
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        document.getElementById(widgetId + '-success').style.display = 'block';
        document.getElementById(widgetId + '-name').value = '';
        document.getElementById(widgetId + '-phone').value = '';
      }
    })
    .catch(function(err) {
      console.error('Callback request error:', err);
      alert('حدث خطأ. حاول مرة أخرى.');
    });
  };
})();
`.trim()

  const snippet = `
<!-- KWq8 Callback Request Widget - Start -->
<style>${css}</style>
${html}
<script>${js}</script>
<!-- KWq8 Callback Request Widget - End -->
`.trim()

  return {
    html,
    css,
    js,
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Multi-Widget Generator
// ============================================

/**
 * Generate multiple widgets as a combined snippet
 */
export function generateMultipleWidgets(
  widgets: Array<{
    type: WidgetType
    config: Partial<AnyWidgetConfig> & { pageId?: string }
  }>
): GeneratedWidget {
  const results = widgets.map((w, index) => {
    // Offset each widget vertically
    const offsetConfig = {
      ...w.config,
      style: {
        ...w.config.style,
        bottomOffset: (w.config.style?.bottomOffset ?? 20) + index * 80,
      },
    }
    return generateWidget(w.type, offsetConfig)
  })

  const combinedCSS = results.map((r) => r.css).join('\n\n')
  const combinedHTML = results.map((r) => r.html).join('\n\n')
  const combinedJS = results
    .map((r) => r.js)
    .filter(Boolean)
    .join('\n\n')

  const snippet = `
<!-- KWq8 Multi-Widget Suite - Start -->
<style>${combinedCSS}</style>
${combinedHTML}
${combinedJS ? `<script>${combinedJS}</script>` : ''}
<!-- KWq8 Multi-Widget Suite - End -->
`.trim()

  return {
    html: combinedHTML,
    css: combinedCSS,
    js: combinedJS,
    snippet,
    minified: minifySnippet(snippet),
  }
}

// ============================================
// Helper Functions
// ============================================

function getPositionStyles(style: WidgetStyleConfig): string {
  const bottom = style.bottomOffset ?? 20
  const side = style.sideOffset ?? 20

  switch (style.position) {
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

function getAnimationStyles(animation?: string, widgetId?: string, bubbleClass = 'kwq8-widget-bubble'): string {
  if (!animation || animation === 'none') return ''

  switch (animation) {
    case 'bounce':
      return `
@keyframes kwq8-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
#${widgetId} .${bubbleClass} { animation: kwq8-bounce 2s infinite; }
`
    case 'pulse':
      return `
@keyframes kwq8-pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
#${widgetId} .${bubbleClass} { animation: kwq8-pulse 2s infinite; }
`
    case 'shake':
      return `
@keyframes kwq8-shake {
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-5deg); }
  20%, 40%, 60%, 80% { transform: rotate(5deg); }
}
#${widgetId} .${bubbleClass} { animation: kwq8-shake 2s ease-in-out infinite; animation-delay: 3s; }
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

interface WidgetCSSOptions {
  widgetId: string
  positionStyles: string
  style: WidgetStyleConfig
  size: { width: number; height: number; iconSize: number }
  hoverColor: string
  additionalCSS?: string
  skipBackgroundColor?: boolean
}

function generateWidgetCSS(options: WidgetCSSOptions): string {
  const { widgetId, positionStyles, style, size, hoverColor, additionalCSS, skipBackgroundColor } = options

  return `
/* KWq8 Widget */
#${widgetId} {
  position: fixed;
  ${positionStyles}
  z-index: ${style.zIndex};
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

#${widgetId} .kwq8-widget-bubble {
  width: ${size.width}px;
  height: ${size.height}px;
  ${!skipBackgroundColor ? `background-color: ${style.primaryColor};` : ''}
  border-radius: ${style.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  ${getShadowStyle(style.shadow)}
}

#${widgetId} .kwq8-widget-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px ${hoverColor};
}

#${widgetId} .kwq8-widget-bubble svg {
  width: ${size.iconSize}px;
  height: ${size.iconSize}px;
  fill: ${style.textColor};
}

#${widgetId} .kwq8-widget-tooltip {
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

#${widgetId} .kwq8-widget-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  ${(style.position ?? 'bottom-right').includes('right') ? 'right' : 'left'}: -8px;
  transform: translateY(-50%);
  border: 8px solid transparent;
  border-${(style.position ?? 'bottom-right').includes('right') ? 'left' : 'right'}-color: white;
}

#${widgetId}:hover .kwq8-widget-tooltip {
  opacity: 1;
  visibility: visible;
}

${getAnimationStyles(style.animation, widgetId, 'kwq8-widget-bubble')}

@media (max-width: 768px) {
  #${widgetId} .kwq8-widget-tooltip {
    display: none;
  }
  #${widgetId} .kwq8-widget-bubble {
    width: ${Math.max(size.width, 56)}px;
    height: ${Math.max(size.height, 56)}px;
  }
}

${additionalCSS || ''}
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

// Re-export whatsapp utilities
export { validatePhoneNumber, generateWhatsAppLink, generateWhatsAppWidget }
