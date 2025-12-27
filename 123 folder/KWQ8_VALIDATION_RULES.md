# ✅ KWQ8 VALIDATION RULES & ERROR HANDLING
## AI Code Validation System
### Version 1.0 | December 2025

---

## OVERVIEW

Every code generation from DeepSeek must pass through Gemini's validation layer. This document defines all validation rules, error patterns, and auto-fix strategies.

---

# SECTION 1: VALIDATION CATEGORIES

## 1.1 Design System Validation

### Rule DS-001: Semantic Tokens Only
```
❌ FAIL PATTERNS:
- bg-blue-500, bg-red-600, bg-green-400
- text-gray-700, text-white, text-black
- border-purple-300, border-gray-200
- Any explicit Tailwind color class

✅ REQUIRED PATTERNS:
- bg-primary, bg-secondary, bg-accent
- text-foreground, text-muted-foreground
- border, border-accent
```

**Detection Regex:**
```javascript
const explicitColorPattern = /\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-\d{2,3}/g;
```

**Auto-fix Mapping:**
```json
{
  "bg-blue-500": "bg-primary",
  "bg-blue-600": "bg-primary",
  "bg-gray-100": "bg-muted",
  "bg-gray-50": "bg-background",
  "bg-white": "bg-background",
  "text-gray-900": "text-foreground",
  "text-gray-600": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-white": "text-primary-foreground",
  "border-gray-200": "border",
  "border-gray-300": "border"
}
```

### Rule DS-002: Color Count Maximum
```
RULE: Maximum 5 primary colors in CSS variables

❌ FAIL: More than 5 distinct hue values
✅ PASS: 5 or fewer color families
```

**Detection Logic:**
```javascript
function countDistinctColors(cssContent) {
  const hslPattern = /--[\w-]+:\s*(\d+)\s+/g;
  const hues = new Set();
  let match;
  while ((match = hslPattern.exec(cssContent))) {
    hues.add(Math.floor(parseInt(match[1]) / 30)); // Group by 30° hue segments
  }
  return hues.size;
}
```

### Rule DS-003: Font Family Maximum
```
RULE: Maximum 2 font families

❌ FAIL: 3+ different font-family declarations
✅ PASS: Only heading + body fonts
```

### Rule DS-004: HSL Color Format Only
```
RULE: All color values must use HSL format

❌ FAIL PATTERNS:
- #3B82F6 (hex)
- rgb(59, 130, 246) (rgb)
- rgba(59, 130, 246, 0.5) (rgba)
- blue, red, green (named colors)

✅ REQUIRED PATTERN:
- hsl(221, 83%, 53%)
- hsl(var(--primary))
- 221 83% 53% (in CSS variables)
```

---

## 1.2 RTL Validation

### Rule RTL-001: Root Direction
```
RULE: Root element must have dir="rtl" for Arabic content

❌ FAIL:
<html lang="ar">
<div className="min-h-screen">

✅ PASS:
<html lang="ar" dir="rtl">
<div className="min-h-screen" dir="rtl">
```

### Rule RTL-002: Logical Properties Only
```
RULE: Use logical properties instead of directional

❌ FAIL PATTERNS:
ml-*, mr-*, pl-*, pr-*
text-left, text-right
left-*, right-*
border-l-*, border-r-*
rounded-l-*, rounded-r-*

✅ REQUIRED PATTERNS:
ms-*, me-*, ps-*, pe-*
text-start, text-end
start-*, end-*
border-s-*, border-e-*
rounded-s-*, rounded-e-*
```

**Auto-fix Mapping:**
```json
{
  "ml-": "ms-",
  "mr-": "me-",
  "pl-": "ps-",
  "pr-": "pe-",
  "text-left": "text-start",
  "text-right": "text-end",
  "left-": "start-",
  "right-": "end-",
  "border-l-": "border-s-",
  "border-r-": "border-e-",
  "rounded-l-": "rounded-s-",
  "rounded-r-": "rounded-e-"
}
```

### Rule RTL-003: Arabic Font Requirement
```
RULE: Arabic content must use Arabic-optimized fonts

✅ APPROVED FONTS:
- Tajawal
- Cairo
- Amiri
- IBM Plex Sans Arabic
- Noto Naskh Arabic

❌ FAIL: Default sans-serif, Arial, Helvetica for Arabic text
```

### Rule RTL-004: Phone Input Exception
```
RULE: Phone number inputs should be LTR

✅ CORRECT:
<input type="tel" dir="ltr" className="text-start" />
```

---

## 1.3 Supabase Validation

### Rule SUP-001: RLS Must Be Enabled
```
RULE: All tables must have Row Level Security enabled

❌ FAIL:
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
-- Missing RLS

✅ PASS:
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON products ...
```

### Rule SUP-002: IF NOT EXISTS Required
```
RULE: All CREATE statements must use IF NOT EXISTS

❌ FAIL:
CREATE TABLE products (...);

✅ PASS:
CREATE TABLE IF NOT EXISTS products (...);
```

### Rule SUP-003: Error Handling Required
```
RULE: All Supabase queries must have error handling

❌ FAIL:
const { data } = await supabase.from('products').select('*');

✅ PASS:
const { data, error } = await supabase.from('products').select('*');
if (error) {
  console.error('Error:', error);
  return [];
}
return data;
```

---

## 1.4 GCC Compliance Validation

### Rule GCC-001: Currency Decimals
```
RULE: Currency formatting must use correct decimal places

| Country | Currency | Decimals |
|---------|----------|----------|
| KW | KWD | 3 |
| SA | SAR | 2 |
| AE | AED | 2 |
| QA | QAR | 2 |
| BH | BHD | 3 |
| OM | OMR | 3 |
```

### Rule GCC-002: VAT Calculation
```
RULE: VAT must be calculated per country

| Country | VAT Rate |
|---------|----------|
| KW | 0% |
| SA | 15% |
| AE | 5% |
| QA | 0% |
| BH | 10% |
| OM | 5% |
```

### Rule GCC-003: Phone Format
```
RULE: Phone validation per country

| Country | Format |
|---------|--------|
| KW | +965 XXXX XXXX (8 digits) |
| SA | +966 5X XXX XXXX (9 digits) |
| AE | +971 5X XXX XXXX (9 digits) |
| QA | +974 XXXX XXXX (8 digits) |
| BH | +973 XXXX XXXX (8 digits) |
| OM | +968 XXXX XXXX (8 digits) |
```

---

# SECTION 2: VALIDATION PIPELINE

## 2.1 Validation Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    VALIDATION PIPELINE                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  DeepSeek Output                                             │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────┐                                             │
│  │ Parse Files │                                             │
│  └─────────────┘                                             │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              VALIDATION CHECKS                       │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ 1. Design System (DS-001 to DS-004)                 │     │
│  │ 2. RTL Rules (RTL-001 to RTL-004)                   │     │
│  │ 3. Supabase Rules (SUP-001 to SUP-003)              │     │
│  │ 4. GCC Rules (GCC-001 to GCC-003)                   │     │
│  └─────────────────────────────────────────────────────┘     │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────┐                                             │
│  │ All Pass?   │──── YES ───▶ Send to Preview               │
│  └─────────────┘                                             │
│        │                                                     │
│       NO                                                     │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────────┐                                         │
│  │ Auto-fixable?   │──── YES ───▶ Apply Auto-fix            │
│  └─────────────────┘              │                          │
│        │                          ▼                          │
│       NO                    Re-validate                      │
│        │                          │                          │
│        ▼                          │                          │
│  ┌─────────────────┐              │                          │
│  │ Retry Count < 3 │──── YES ◀───┘                          │
│  └─────────────────┘                                         │
│        │                                                     │
│       NO                                                     │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────────┐                                         │
│  │ Escalate to     │                                         │
│  │ User            │                                         │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 2.2 Validation Response Format

```typescript
interface ValidationResult {
  status: 'PASS' | 'FAIL' | 'AUTO_FIXED';
  checks: {
    design_system: {
      semantic_tokens: boolean;
      color_count: boolean;
      font_count: boolean;
      hsl_format: boolean;
    };
    rtl: {
      root_direction: boolean;
      logical_properties: boolean;
      arabic_fonts: boolean;
    };
    supabase: {
      rls_enabled: boolean;
      if_not_exists: boolean;
      error_handling: boolean;
    };
    gcc: {
      currency_decimals: boolean;
      vat_calculation: boolean;
      phone_format: boolean;
    };
  };
  errors: ValidationError[];
  auto_fixes_applied: AutoFix[];
  retry_count: number;
}

interface ValidationError {
  rule: string;
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
  auto_fixable: boolean;
}

interface AutoFix {
  rule: string;
  file: string;
  original: string;
  replacement: string;
}
```

## 2.3 Error Messages (Arabic + English)

```typescript
const errorMessages = {
  'DS-001': {
    ar: 'استخدم ألوان التصميم بدلاً من الألوان المباشرة',
    en: 'Use design tokens instead of explicit colors',
    example: 'bg-blue-500 → bg-primary'
  },
  'DS-002': {
    ar: 'عدد الألوان يتجاوز الحد الأقصى (5 ألوان)',
    en: 'Color count exceeds maximum (5 colors)',
    example: 'Reduce to primary, secondary, accent, muted, destructive'
  },
  'RTL-001': {
    ar: 'يجب إضافة dir="rtl" للعنصر الجذري',
    en: 'Root element must have dir="rtl"',
    example: '<html lang="ar" dir="rtl">'
  },
  'RTL-002': {
    ar: 'استخدم الخصائص المنطقية بدلاً من الاتجاهية',
    en: 'Use logical properties instead of directional',
    example: 'ml-4 → ms-4'
  },
  'SUP-001': {
    ar: 'يجب تفعيل أمان مستوى الصف (RLS)',
    en: 'Row Level Security must be enabled',
    example: 'ALTER TABLE x ENABLE ROW LEVEL SECURITY;'
  },
  'GCC-001': {
    ar: 'تنسيق العملة غير صحيح',
    en: 'Incorrect currency decimals',
    example: 'KWD uses 3 decimals: 1.500'
  }
};
```

---

# SECTION 3: AUTO-FIX ENGINE

## 3.1 Fix Priority

```
Priority 1 (Always Auto-fix):
- Explicit colors → Semantic tokens
- Directional classes → Logical properties
- Missing dir="rtl" → Add dir="rtl"

Priority 2 (Auto-fix if simple):
- Missing IF NOT EXISTS
- Simple import fixes

Priority 3 (Manual fix required):
- Complex logic errors
- Missing RLS policies
- Structural issues
```

## 3.2 Auto-fix Functions

```typescript
// Fix explicit colors
function fixExplicitColors(code: string): string {
  const colorMap = {
    'bg-blue-500': 'bg-primary',
    'bg-blue-600': 'bg-primary',
    'bg-gray-100': 'bg-muted',
    // ... full mapping
  };
  
  let fixed = code;
  for (const [explicit, semantic] of Object.entries(colorMap)) {
    fixed = fixed.replaceAll(explicit, semantic);
  }
  return fixed;
}

// Fix directional properties
function fixDirectionalProps(code: string): string {
  const propMap = {
    'ml-': 'ms-',
    'mr-': 'me-',
    'pl-': 'ps-',
    'pr-': 'pe-',
    'text-left': 'text-start',
    'text-right': 'text-end',
  };
  
  let fixed = code;
  for (const [dir, logical] of Object.entries(propMap)) {
    const regex = new RegExp(`\\b${dir.replace('-', '-')}(\\d+|auto|full)`, 'g');
    fixed = fixed.replace(regex, `${logical}$1`);
  }
  return fixed;
}

// Add RTL direction
function addRtlDirection(code: string): string {
  // Add to HTML tag if missing
  if (code.includes('<html') && !code.includes('dir="rtl"')) {
    code = code.replace('<html', '<html dir="rtl"');
  }
  
  // Add to root div if missing
  if (code.includes('className="min-h-screen"') && !code.includes('dir="rtl"')) {
    code = code.replace(
      'className="min-h-screen"',
      'className="min-h-screen" dir="rtl"'
    );
  }
  
  return code;
}
```

## 3.3 Fix Logging

```typescript
interface FixLog {
  timestamp: Date;
  project_id: string;
  file: string;
  rule: string;
  original_snippet: string;
  fixed_snippet: string;
  auto_fixed: boolean;
  retry_number: number;
}

// Log all fixes for analysis and improvement
async function logFix(fix: FixLog): Promise<void> {
  await supabase.from('validation_logs').insert(fix);
}
```

---

# SECTION 4: ESCALATION PROTOCOL

## 4.1 When to Escalate

```
ESCALATE TO USER WHEN:
1. 3 auto-fix attempts failed
2. Error requires structural changes
3. Missing user-specific information
4. Complex business logic issue

ESCALATE MESSAGE FORMAT (Arabic):
"⚠️ وجدنا مشكلة تحتاج تدخلك:
[وصف المشكلة]

الحل المقترح:
[اقتراح الحل]

هل تريد تطبيق الحل المقترح؟"
```

## 4.2 Escalation Response Handling

```typescript
interface EscalationResponse {
  user_decision: 'apply_suggestion' | 'modify' | 'skip';
  user_input?: string;
}

async function handleEscalation(
  error: ValidationError,
  response: EscalationResponse
): Promise<string> {
  switch (response.user_decision) {
    case 'apply_suggestion':
      return applyAutoFix(error);
    case 'modify':
      return regenerateWithUserInput(error, response.user_input);
    case 'skip':
      return markAsAccepted(error); // User accepts the issue
  }
}
```

---

# SECTION 5: METRICS & MONITORING

## 5.1 Validation Metrics

```
TRACK:
- Total validations per day
- Pass rate (target: >90%)
- Auto-fix success rate (target: >95%)
- Average retries per generation
- Most common errors (for prompt improvement)
- Escalation rate (target: <5%)
```

## 5.2 Dashboard Queries

```sql
-- Daily validation stats
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_validations,
  SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) as passed,
  SUM(CASE WHEN status = 'AUTO_FIXED' THEN 1 ELSE 0 END) as auto_fixed,
  SUM(CASE WHEN status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated
FROM validation_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Most common errors
SELECT 
  rule,
  COUNT(*) as occurrences,
  AVG(retry_count) as avg_retries
FROM validation_errors
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY rule
ORDER BY occurrences DESC
LIMIT 10;
```

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
