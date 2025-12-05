# Gemini Pro Orchestration Layer

**Quick Reference for Developers**

## What is this?

The orchestration layer intelligently processes Arabic prompts to generate websites. It:
1. Detects parameters from vague prompts
2. Asks clarifying questions in Arabic
3. Constructs structured prompts for DeepSeek
4. Validates generated code

## Usage

### Basic Flow

```typescript
import { createOrchestrator } from '@/lib/orchestration'

// Create instance
const orchestrator = createOrchestrator()

// 1. Analyze Arabic prompt
const result = await orchestrator.analyzePrompt('أبي موقع لصالون تجميل')

// 2. If needs clarification, show questions
if (result.needsClarification) {
  // Display result.questions to user
  // Get user answers
  orchestrator.submitAnswers(userAnswers)
}

// 3. Construct DeepSeek prompt
const { prompt } = orchestrator.constructPrompt(originalPrompt)

// 4. Generate code with DeepSeek (your implementation)
const code = await generateWithDeepSeek(prompt)

// 5. Validate
const validation = await orchestrator.validateCode(code)
console.log(`Score: ${validation.validationResult.score}%`)
```

### API Routes

```bash
# Analyze prompt
POST /api/orchestrate
Body: { "prompt": "أبي موقع لصالون تجميل" }

# Submit answers
POST /api/orchestrate/answers
Body: { "sessionId": "...", "answers": {...} }

# Validate code
POST /api/orchestrate/validate
Body: { "sessionId": "...", "code": "..." }
```

## Key Exports

```typescript
// Main orchestrator
import { createOrchestrator, GeminiOrchestrator } from '@/lib/orchestration'

// Individual functions (for custom flows)
import {
  detectParameters,
  generateClarifyingQuestions,
  constructDeepSeekPrompt,
  validateGeneratedCode,
} from '@/lib/orchestration'

// Types
import type {
  DetectedParameters,
  ClarifyingQuestion,
  DeepSeekPrompt,
  ValidationResult,
} from '@/lib/orchestration'

// Constants
import { BUSINESS_TYPES, THEME_CATALOG, WIDGET_CATALOG } from '@/lib/orchestration'
```

## Catalogs

### Business Types
```typescript
BUSINESS_TYPES = {
  beauty_salon: { ar: 'صالون تجميل', keywords: [...], defaultServices: [...] },
  restaurant: { ar: 'مطعم', ... },
  ecommerce: { ar: 'متجر إلكتروني', ... },
  clinic: { ar: 'عيادة طبية', ... },
  portfolio: { ar: 'معرض أعمال', ... },
  real_estate: { ar: 'عقارات', ... },
}
```

### Themes
```typescript
THEME_CATALOG = {
  feminine_modern: { ar: 'أنثوي وعصري', colors: { primary: '#E91E63', ... } },
  classic_luxury: { ar: 'كلاسيكي وفخم', colors: { primary: '#1A1A1A', ... } },
  minimal_clean: { ar: 'بسيط ونظيف', ... },
  bold_modern: { ar: 'جريء وعصري', ... },
  professional_corporate: { ar: 'احترافي ومؤسسي', ... },
}
```

### Widgets
```typescript
WIDGET_CATALOG = {
  booking_calendar: { ar: 'نظام حجز مواعيد', complexity: 'high' },
  gallery: { ar: 'معرض صور', complexity: 'medium' },
  whatsapp_bubble: { ar: 'زر واتساب', complexity: 'low' },
  // ... 20+ widgets
}
```

## Validation Checks

| Check | What it validates | Auto-fixable |
|-------|------------------|--------------|
| RTL Layout | dir="rtl", text-right | ✅ |
| Arabic Rendering | Cairo font, Arabic text | ✅ |
| Widget Functionality | All requested widgets present | ❌ |
| Mobile Responsive | Responsive classes, viewport | ❌ |
| Console Errors | No error patterns | ❌ |
| Color Scheme | Colors applied | ❌ |
| Security | No dangerous code | ❌ |

## Cost Tracking

```typescript
import { calculateOrchestrationCost } from '@/lib/orchestration'

const cost = calculateOrchestrationCost(
  1500, // Gemini Pro tokens
  3000, // DeepSeek tokens
  500   // Gemini Flash tokens (optional)
)

console.log(cost)
// {
//   totalTokens: 5000,
//   estimatedCostUSD: 0.031,
//   estimatedCostKWD: 0.0095
// }
```

**Target:** ~$0.031 per generation ✅

## Environment Variables

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_ID=gemini-2.0-flash-exp  # Optional, defaults to this

# DeepSeek (separate)
DEEPSEEK_API_KEY=your_deepseek_key
```

## Error Handling

All functions return `{ success: boolean, error?: { code, message, messageAr } }`

```typescript
const result = await detectParameters(prompt)

if (!result.success) {
  console.error(result.error?.messageAr) // Arabic error message
  // Fallback to keyword detection
}
```

## Common Patterns

### Custom Flow (skip questions)

```typescript
// Manually construct parameters
const params: DetectedParameters = {
  businessType: { type: 'restaurant', arabicName: 'مطعم', confidence: 1.0, keywords: [] },
  services: { services: ['dine_in', 'delivery'], arabicServices: [...], confidence: 1.0 },
  functionality: { widgets: ['menu', 'online_ordering'], pages: [...], confidence: 1.0 },
  styling: { theme: 'minimal_clean', colors: {...}, arabicTheme: '...', confidence: 1.0 },
  language: { primary: 'ar', direction: 'rtl', font: 'Cairo', detected: true }
}

const prompt = constructDeepSeekPrompt(params)
// Use prompt directly
```

### Validation Only

```typescript
import { validateGeneratedCode } from '@/lib/orchestration'

const deepseekPrompt: DeepSeekPrompt = { /* ... */ }
const code = '<!-- generated code -->'

const validation = await validateGeneratedCode(code, deepseekPrompt)

if (!validation.passed) {
  console.error('Validation failed:', validation.errors)

  // Try auto-fix
  const { autoFixCode } = await import('@/lib/orchestration')
  const fixedCode = autoFixCode(code, validation)
}
```

## Testing

```typescript
import { detectParameters } from '@/lib/orchestration'

test('detects beauty salon', async () => {
  const result = await detectParameters('صالون تجميل')
  expect(result.parameters?.businessType?.type).toBe('beauty_salon')
})
```

## Performance

- Parameter detection: ~1-2 seconds (Gemini Pro)
- Clarifying questions generation: <100ms (local)
- Prompt construction: <50ms (local)
- Validation: <200ms (local)
- Total overhead: ~2 seconds

## Troubleshooting

**Issue:** "Gemini API key not configured"
**Fix:** Add `GEMINI_API_KEY` to `.env.local`

**Issue:** Low confidence scores
**Fix:** Prompt is too vague - show all clarifying questions

**Issue:** Session expired
**Fix:** Use Redis for session persistence in production

## Full Documentation

See `ORCHESTRATION_IMPLEMENTATION.md` for complete guide with examples, API specs, and architecture details.

---

**Built for KWq8.com**
Cost-optimized AI pipeline for Arabic website generation
