# 🎨 KWQ8 VISUAL EDITOR SYSTEM
## Chat-Based Editing with DOM Analysis | December 2025

---

# EXECUTIVE SUMMARY

The Visual Editor is a core differentiator for KWQ8 - it allows users to customize their generated websites through natural language conversation in Arabic. Unlike traditional drag-and-drop builders, users simply chat with AI to make changes, and the system intelligently analyzes the DOM to apply modifications precisely.

---

# PART 1: ARCHITECTURE OVERVIEW

## 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VISUAL EDITOR ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   CHAT PANEL    │     │  PREVIEW PANEL  │     │  GEMINI ENGINE  │       │
│  │                 │     │                 │     │                 │       │
│  │ - User input    │────▶│ - Live preview  │◀───▶│ - DOM Analysis  │       │
│  │ - AI responses  │     │ - Element hover │     │ - Change mapping│       │
│  │ - History       │     │ - Selection     │     │ - Validation    │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│           │                       │                       │                 │
│           └───────────────────────┴───────────────────────┘                 │
│                                   │                                         │
│                    ┌──────────────┴──────────────┐                          │
│                    │      DOM BRIDGE SERVICE      │                          │
│                    │                              │                          │
│                    │ - Element identification    │                          │
│                    │ - Path resolution           │                          │
│                    │ - Change application        │                          │
│                    │ - Undo/Redo stack           │                          │
│                    └──────────────────────────────┘                          │
│                                   │                                         │
│                    ┌──────────────┴──────────────┐                          │
│                    │     CODE MODIFICATION       │                          │
│                    │                              │                          │
│                    │ - DeepSeek code generation  │                          │
│                    │ - AST manipulation          │                          │
│                    │ - Style injection           │                          │
│                    │ - Component updates         │                          │
│                    └──────────────────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Editor Modes

| Mode | Description | Interaction Type |
|------|-------------|------------------|
| **Chat Mode** | Primary mode - user types changes in Arabic | Text conversation |
| **Selection Mode** | Click element in preview to reference it | Click + Chat |
| **Image Mode** | Upload and place images | Upload + AI placement |
| **Code Mode** | Advanced users can view/edit code | Code editor |

---

# PART 2: CHAT PANEL SPECIFICATION

## 2.1 Interface Design

```typescript
// Chat Panel Component Structure
interface ChatPanelProps {
  projectId: string;
  sessionId: string;
  direction: 'rtl'; // Always RTL for Arabic
  onPreviewUpdate: (changes: DOMChange[]) => void;
}

// Message Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    elementPath?: string;        // DOM path referenced
    changeType?: ChangeType;      // What was changed
    creditsUsed?: number;         // Credits consumed
    previewUrl?: string;          // Before/after preview
  };
}

type ChangeType = 
  | 'text_edit'
  | 'style_change'
  | 'layout_change'
  | 'image_placement'
  | 'element_add'
  | 'element_remove'
  | 'component_swap';
```

## 2.2 Chat Commands (Arabic)

| Arabic Command | English Translation | Action |
|----------------|---------------------|--------|
| `غيّر لون الخلفية إلى أزرق` | Change background to blue | Style modification |
| `أضف زر اتصل بنا` | Add contact us button | Element addition |
| `حذف الصورة الثانية` | Delete the second image | Element removal |
| `اجعل العنوان أكبر` | Make the title bigger | Style modification |
| `انقل القسم للأعلى` | Move section up | Layout change |
| `بدّل هذه الصورة` | Replace this image | Image swap |
| `أضف قسم جديد للخدمات` | Add new services section | Section addition |
| `غيّر الخط إلى Tajawal` | Change font to Tajawal | Typography change |

## 2.3 Suggested Actions

After each user message, AI suggests related actions:

```typescript
interface SuggestedAction {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  creditsRequired: number;
  action: () => void;
}

// Example suggestions after changing header color
const suggestions: SuggestedAction[] = [
  {
    id: 'match_buttons',
    labelAr: 'مطابقة لون الأزرار',
    labelEn: 'Match button colors',
    icon: 'palette',
    creditsRequired: 5,
    action: () => applyMatchingColors('buttons')
  },
  {
    id: 'adjust_footer',
    labelAr: 'تعديل لون الفوتر',
    labelEn: 'Adjust footer color',
    icon: 'footer',
    creditsRequired: 5,
    action: () => applyMatchingColors('footer')
  }
];
```

## 2.4 Credit Display

```
┌─────────────────────────────────────┐
│  💎 الرصيد: 450 نقطة                 │
│  ─────────────────────────────────  │
│  آخر عملية: تغيير لون الخلفية        │
│  النقاط المستخدمة: 5                 │
│  ─────────────────────────────────  │
│  [📊 عرض سجل النقاط]                 │
└─────────────────────────────────────┘
```

---

# PART 3: PREVIEW PANEL SPECIFICATION

## 3.1 Live Preview Engine

```typescript
interface PreviewConfig {
  projectId: string;
  mode: 'desktop' | 'tablet' | 'mobile';
  highlightEnabled: boolean;
  selectionEnabled: boolean;
  zoomLevel: number;
}

interface PreviewState {
  currentCode: string;
  pendingChanges: DOMChange[];
  history: CodeSnapshot[];
  selectedElement: ElementPath | null;
}
```

## 3.2 Device Viewport Switching

| Device | Width | Height | Scale |
|--------|-------|--------|-------|
| Desktop | 1440px | 900px | 1.0 |
| Tablet | 768px | 1024px | 0.8 |
| Mobile | 375px | 812px | 0.6 |
| Custom | User-defined | User-defined | Auto |

## 3.3 Element Selection System

```typescript
// When user hovers/clicks in preview
interface ElementSelection {
  path: string;               // e.g., "main > section:nth-child(2) > div.hero > h1"
  componentName?: string;     // e.g., "HeroSection"
  displayName: string;        // e.g., "العنوان الرئيسي" (Main Title)
  currentStyles: CSSProperties;
  currentContent?: string;
  allowedActions: ActionType[];
}

// Highlight overlay when element is hovered
const HighlightOverlay = {
  border: '2px dashed #3B82F6',
  background: 'rgba(59, 130, 246, 0.1)',
  label: {
    position: 'top-right',
    text: elementDisplayName,
    background: '#3B82F6',
    color: 'white'
  }
};
```

## 3.4 Visual Feedback States

| State | Visual Indicator |
|-------|------------------|
| Hovering | Blue dashed border with label |
| Selected | Blue solid border + resize handles |
| Editing | Yellow pulsing border |
| Changed | Green checkmark badge |
| Error | Red border with error tooltip |
| Pending | Loading spinner overlay |

---

# PART 4: DOM ANALYSIS ENGINE

## 4.1 Gemini DOM Analyzer

Gemini analyzes the website structure to understand where changes should be applied:

```typescript
// DOM Analysis Request to Gemini
interface DOMAnalysisRequest {
  projectCode: string;         // Current React/HTML code
  userRequest: string;         // Arabic user input
  selectedElement?: string;    // If user selected an element
  context: {
    projectType: ProjectType;
    currentPage: string;
    previousChanges: Change[];
  };
}

// DOM Analysis Response from Gemini
interface DOMAnalysisResponse {
  understood: boolean;
  interpretation: string;      // How Gemini understood the request (Arabic)
  targetElements: ElementTarget[];
  suggestedChanges: ProposedChange[];
  clarificationNeeded?: string;  // If unclear, ask for clarification
  creditsCost: number;
}

interface ElementTarget {
  path: string;                // CSS selector path
  componentFile: string;       // Which file to modify
  line?: number;               // Approximate line number
  confidence: number;          // 0-1 confidence score
}

interface ProposedChange {
  type: ChangeType;
  target: ElementTarget;
  oldValue: string;
  newValue: string;
  description: string;         // Arabic description of change
}
```

## 4.2 Element Recognition Patterns

Gemini uses these patterns to identify elements from natural language:

| Arabic Term | Element Type | CSS Selector Pattern |
|-------------|--------------|---------------------|
| العنوان الرئيسي | Main heading | `h1, .hero-title, .main-heading` |
| زر | Button | `button, .btn, [role="button"]` |
| الصورة | Image | `img, .image, picture` |
| القائمة | Navigation | `nav, .navbar, .menu` |
| الفوتر | Footer | `footer, .footer` |
| الهيدر | Header | `header, .header` |
| قسم | Section | `section, .section` |
| النص | Text/Paragraph | `p, .text, .content` |
| الخلفية | Background | `:root, body, main container` |
| الكارد | Card | `.card, article, .item` |

## 4.3 Ambiguity Resolution

When the request is ambiguous:

```typescript
// Scenario: User says "غيّر اللون" (change the color)
const clarificationFlow = {
  trigger: 'ambiguous_target',
  response: {
    messageAr: 'أي عنصر تريد تغيير لونه؟ اختر من القائمة أو انقر على العنصر في المعاينة:',
    options: [
      { labelAr: 'لون الخلفية', target: 'background' },
      { labelAr: 'لون العناوين', target: 'headings' },
      { labelAr: 'لون الأزرار', target: 'buttons' },
      { labelAr: 'لون النصوص', target: 'text' }
    ],
    allowSelection: true  // User can click in preview instead
  }
};
```

---

# PART 5: CODE MODIFICATION SYSTEM

## 5.1 Change Application Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │     │   Gemini     │     │   DeepSeek   │     │   Preview    │
│   Request    │────▶│   Analysis   │────▶│   Code Gen   │────▶│   Update     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   Gemini     │
                                          │   Validation │
                                          └──────────────┘
```

## 5.2 Code Modification Types

### Style Changes
```typescript
// Original
<h1 className="text-4xl font-bold text-gray-900">مرحباً</h1>

// User: "اجعل العنوان باللون الأزرق"
// Modified
<h1 className="text-4xl font-bold text-blue-600">مرحباً</h1>
```

### Content Changes
```typescript
// Original
<p className="text-lg">نحن شركة رائدة في مجال التقنية</p>

// User: "غيّر النص إلى: نحن الأفضل في الخليج"
// Modified  
<p className="text-lg">نحن الأفضل في الخليج</p>
```

### Structural Changes
```typescript
// User: "أضف زر اتصل بنا بجانب العنوان"
// DeepSeek generates:
<div className="flex items-center gap-4">
  <h1 className="text-4xl font-bold">شركة الخليج</h1>
  <Button variant="primary" href="/contact">
    اتصل بنا
  </Button>
</div>
```

## 5.3 Safe Modification Rules

| Rule | Description |
|------|-------------|
| **No Breaking Changes** | Never modify core component structure that breaks functionality |
| **Style Isolation** | Style changes are scoped - don't affect unrelated elements |
| **RTL Preservation** | All changes maintain RTL layout integrity |
| **Responsive Safe** | Changes must work on all viewport sizes |
| **Accessibility** | Changes must not break a11y (WCAG 2.1) |

## 5.4 Undo/Redo System

```typescript
interface ChangeStack {
  projectId: string;
  sessionId: string;
  undoStack: CodeSnapshot[];
  redoStack: CodeSnapshot[];
  maxStackSize: 50; // Keep last 50 changes
}

interface CodeSnapshot {
  id: string;
  timestamp: Date;
  description: string;       // What changed (Arabic)
  files: FileChange[];
  creditsUsed: number;
}

// User can undo by saying:
// "تراجع" (Undo)
// "تراجع عن آخر تغيير" (Undo last change)
// "تراجع عن تغيير اللون" (Undo the color change)
```

---

# PART 6: IMAGE PLACEMENT SYSTEM

## 6.1 Smart Image Placement

When user uploads an image, Gemini analyzes the website to find optimal placement:

```typescript
interface ImageUploadRequest {
  imageFile: File;
  projectId: string;
  userInstruction?: string;  // e.g., "ضع الصورة في قسم المنتجات"
}

interface ImagePlacementAnalysis {
  suggestedLocations: ImageLocation[];
  qualityAssessment: QualityCheck;
  recommendedSize: ImageSize;
}

interface ImageLocation {
  path: string;               // DOM path
  displayName: string;        // "صورة المنتج الأول" 
  confidence: number;
  currentImage?: string;      // If replacing existing
  fitScore: number;           // How well image fits the space
}
```

## 6.2 Image Quality Check Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    IMAGE QUALITY CHECK FLOW                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────┐    │
│  │   User      │     │        QUALITY CHECK                │    │
│  │   Uploads   │────▶│                                     │    │
│  │   Image     │     │  ✓ Resolution: 1200x800 px (Good)   │    │
│  └─────────────┘     │  ✓ Format: JPEG (Supported)         │    │
│                      │  ✗ Size: 4.2MB (Too large)          │    │
│                      │  ⚠ Aspect: 3:2 (May need crop)      │    │
│                      └─────────────────────────────────────┘    │
│                                    │                             │
│                         ┌──────────┴──────────┐                  │
│                         ▼                     ▼                  │
│              ┌─────────────────┐   ┌─────────────────────┐      │
│              │   QUALITY OK    │   │   NEEDS UPGRADE     │      │
│              │                 │   │                     │      │
│              │  Proceed with   │   │  "للحصول على جودة   │      │
│              │  placement      │   │   أفضل، ترقّى إلى   │      │
│              │                 │   │   الباقة المميزة"   │      │
│              └─────────────────┘   └─────────────────────┘      │
│                                              │                   │
│                                    ┌─────────┴─────────┐         │
│                                    │  BANANA.DEV AI   │         │
│                                    │  Enhancement     │         │
│                                    │  (Premium+)      │         │
│                                    └───────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 6.3 Placement Confirmation UI

```
┌─────────────────────────────────────────────────┐
│  📸 تم تحليل الصورة                              │
│  ─────────────────────────────────────────────  │
│                                                 │
│  المواقع المقترحة:                              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 1️⃣ صورة البانر الرئيسية                   │  │
│  │    الحجم: 1920×600 بكسل                    │  │
│  │    [معاينة] [اختيار ✓]                    │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 2️⃣ صورة القسم التعريفي                    │  │
│  │    الحجم: 600×400 بكسل                     │  │
│  │    [معاينة] [اختيار]                      │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  💎 النقاط المطلوبة: 5                          │
│                                                 │
│  [إلغاء]              [تأكيد الموقع الأول ✓]   │
└─────────────────────────────────────────────────┘
```

---

# PART 7: CREDIT COSTS FOR VISUAL EDITING

## 7.1 Action Credit Matrix

| Action Type | Credits | Arabic Description |
|-------------|---------|-------------------|
| **Text Edit** | 3 | تعديل نص |
| **Color Change** | 5 | تغيير لون |
| **Font Change** | 5 | تغيير خط |
| **Size/Spacing** | 5 | تغيير حجم/مسافات |
| **Add Simple Element** | 10 | إضافة عنصر بسيط |
| **Remove Element** | 5 | حذف عنصر |
| **Image Placement** | 5 | وضع صورة |
| **Image Swap** | 3 | تبديل صورة |
| **Layout Reorder** | 15 | إعادة ترتيب التخطيط |
| **Add Section** | 20 | إضافة قسم جديد |
| **Component Swap** | 15 | تبديل مكوّن |
| **Full Page Regenerate** | 50 | إعادة توليد صفحة كاملة |

## 7.2 Bulk Action Discounts

| Bulk Action | Regular Credits | Discounted |
|-------------|-----------------|------------|
| 5 text edits in one message | 15 | 12 (20% off) |
| Color scheme change (all) | 25 | 18 (28% off) |
| Font family change (all) | 25 | 18 (28% off) |
| Section with 5 elements | 50 | 35 (30% off) |

## 7.3 Free Actions (No Credits)

| Action | Description |
|--------|-------------|
| Preview changes | معاينة التغييرات |
| Undo/Redo | تراجع/إعادة |
| Viewport switching | تبديل حجم الشاشة |
| Element selection | اختيار عنصر |
| Export code | تصدير الكود |
| View history | عرض السجل |

---

# PART 8: CONVERSATION FLOW EXAMPLES

## 8.1 Simple Color Change

```
┌─────────────────────────────────────────────────────────────────┐
│ USER                                                            │
├─────────────────────────────────────────────────────────────────┤
│ غيّر لون الخلفية إلى أزرق فاتح                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ASSISTANT                                                       │
├─────────────────────────────────────────────────────────────────┤
│ ✓ تم تغيير لون خلفية الصفحة إلى الأزرق الفاتح.                  │
│                                                                 │
│ 💎 النقاط المستخدمة: 5                                          │
│                                                                 │
│ 💡 اقتراحات:                                                    │
│ • مطابقة لون الأزرار مع الخلفية الجديدة (5 نقاط)                │
│ • تعديل لون النصوص للتباين الأفضل (5 نقاط)                      │
└─────────────────────────────────────────────────────────────────┘
```

## 8.2 Image Placement with Context

```
┌─────────────────────────────────────────────────────────────────┐
│ USER                                                            │
├─────────────────────────────────────────────────────────────────┤
│ [📷 Uploaded: logo-company.png]                                 │
│ ضع هذا الشعار في الهيدر                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ASSISTANT                                                       │
├─────────────────────────────────────────────────────────────────┤
│ تم تحليل الصورة:                                                │
│ • النوع: شعار PNG شفاف ✓                                        │
│ • الأبعاد: 400×120 بكسل ✓                                       │
│ • الحجم: 45KB ✓                                                 │
│                                                                 │
│ الموقع المقترح: يمين الهيدر (التصميم RTL)                       │
│                                                                 │
│ [معاينة التغيير]  [تأكيد ✓]  [اختيار موقع آخر]                  │
│                                                                 │
│ 💎 النقاط المطلوبة: 5                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 8.3 Complex Section Addition

```
┌─────────────────────────────────────────────────────────────────┐
│ USER                                                            │
├─────────────────────────────────────────────────────────────────┤
│ أضف قسم للشهادات مع 3 بطاقات لآراء العملاء                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ASSISTANT                                                       │
├─────────────────────────────────────────────────────────────────┤
│ سأضيف قسم شهادات العملاء مع التصميم التالي:                     │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │  📝 ماذا يقول عملاؤنا                                      │  │
│ │  ───────────────────────────────────────────────────────   │  │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │  │
│ │  │ ⭐⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐⭐  │                  │  │
│ │  │ "نص..."  │  │ "نص..."  │  │ "نص..."  │                  │  │
│ │  │ - اسم    │  │ - اسم    │  │ - اسم    │                  │  │
│ │  └──────────┘  └──────────┘  └──────────┘                  │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│ أين تريد إضافة هذا القسم؟                                       │
│ [قبل الفوتر]  [بعد الخدمات]  [اختيار يدوي]                      │
│                                                                 │
│ 💎 النقاط المطلوبة: 25                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 8.4 Selection Mode Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM                                                          │
├─────────────────────────────────────────────────────────────────┤
│ [User clicked on hero section title in preview]                 │
│ العنصر المحدد: العنوان الرئيسي (h1)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ USER                                                            │
├─────────────────────────────────────────────────────────────────┤
│ اجعله أكبر وغيّر اللون إلى ذهبي                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ASSISTANT                                                       │
├─────────────────────────────────────────────────────────────────┤
│ ✓ تم تعديل العنوان الرئيسي:                                     │
│ • الحجم: من 4xl إلى 5xl                                         │
│ • اللون: من رمادي إلى ذهبي (#D4AF37)                            │
│                                                                 │
│ [معاينة]  [تأكيد ✓]  [تراجع]                                    │
│                                                                 │
│ 💎 النقاط المستخدمة: 8 (حجم: 5, لون: 3)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 9: ERROR HANDLING

## 9.1 Error Types and Responses

| Error Type | Arabic Message | Recovery Action |
|------------|----------------|-----------------|
| **Ambiguous Request** | "لم أفهم تماماً. هل تقصد...؟" | Show clarification options |
| **Element Not Found** | "لم أجد هذا العنصر. هل تقصد...؟" | Show similar elements |
| **Conflicting Change** | "هذا التغيير قد يؤثر على... هل أتابع؟" | Confirm with warning |
| **Style Conflict** | "اللون المختار قد لا يتناسب مع... هل تريد اقتراحاً؟" | Suggest alternatives |
| **Processing Error** | "حدث خطأ. جاري إعادة المحاولة..." | Auto-retry up to 3 times |
| **Credit Insufficient** | "رصيدك غير كافٍ. تحتاج {X} نقطة إضافية" | Show upgrade options |

## 9.2 Fallback Mechanisms

```typescript
const fallbackStrategy = {
  // If Gemini fails to identify element
  elementNotFound: {
    step1: 'Show list of similar elements',
    step2: 'Allow manual selection in preview',
    step3: 'Ask for more specific description',
  },
  
  // If code change causes error
  codeError: {
    step1: 'Auto-rollback to last working state',
    step2: 'Notify user of rollback',
    step3: 'Suggest alternative approach',
  },
  
  // If preview fails to load
  previewError: {
    step1: 'Reload preview with last known good state',
    step2: 'Offer code view as alternative',
    step3: 'Contact support option',
  }
};
```

---

# PART 10: DATABASE SCHEMA

## 10.1 Visual Editor Tables

```sql
-- Visual editing sessions
CREATE TABLE visual_editor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_credits_used INTEGER DEFAULT 0,
  changes_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Editor messages (conversation history)
CREATE TABLE editor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code snapshots for undo/redo
CREATE TABLE code_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id),
  snapshot_data JSONB NOT NULL,  -- { files: [...], timestamp, description }
  change_type VARCHAR(50) NOT NULL,
  description_ar TEXT,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Element selections (for analytics and improvement)
CREATE TABLE element_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,
  element_path TEXT NOT NULL,
  element_type VARCHAR(50),
  action_taken VARCHAR(50),
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_editor_sessions_project ON visual_editor_sessions(project_id);
CREATE INDEX idx_editor_sessions_user ON visual_editor_sessions(user_id);
CREATE INDEX idx_editor_messages_session ON editor_messages(session_id);
CREATE INDEX idx_code_snapshots_session ON code_snapshots(session_id);
CREATE INDEX idx_code_snapshots_project ON code_snapshots(project_id);

-- RLS Policies
ALTER TABLE visual_editor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own sessions"
  ON visual_editor_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can access messages in their sessions"
  ON editor_messages FOR ALL
  USING (session_id IN (
    SELECT id FROM visual_editor_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can access their code snapshots"
  ON code_snapshots FOR ALL
  USING (session_id IN (
    SELECT id FROM visual_editor_sessions WHERE user_id = auth.uid()
  ));
```

---

# PART 11: IMPLEMENTATION PHASES

## 11.1 Phase 1: Core Chat Editor (Week 1-2)

| Task | Days | Owner |
|------|------|-------|
| Chat panel UI component | 2 | Frontend |
| Preview panel with iframe | 2 | Frontend |
| Basic Gemini integration for text changes | 3 | Backend |
| DeepSeek code modification pipeline | 3 | Backend |
| Undo/redo stack implementation | 2 | Backend |
| Credit tracking integration | 1 | Backend |

## 11.2 Phase 2: DOM Analysis (Week 3)

| Task | Days | Owner |
|------|------|-------|
| DOM analyzer service | 3 | Backend |
| Element recognition patterns | 2 | Backend |
| Selection mode in preview | 2 | Frontend |
| Hover highlighting system | 1 | Frontend |

## 11.3 Phase 3: Image System (Week 4)

| Task | Days | Owner |
|------|------|-------|
| Image upload handler | 1 | Backend |
| Placement analyzer | 2 | Backend |
| Quality check integration | 1 | Backend |
| Placement UI confirmation flow | 2 | Frontend |

## 11.4 Phase 4: Polish & Testing (Week 5)

| Task | Days | Owner |
|------|------|-------|
| Error handling and fallbacks | 2 | Full Stack |
| Arabic conversation tuning | 2 | Product |
| Performance optimization | 2 | Backend |
| E2E testing | 2 | QA |
| User testing with test groups | 3 | Product |

---

# PART 12: API ENDPOINTS

## 12.1 Visual Editor APIs

```typescript
// Start editing session
POST /api/editor/sessions
Request: { projectId: string }
Response: { sessionId: string, projectCode: string, config: EditorConfig }

// Send chat message
POST /api/editor/sessions/:sessionId/messages
Request: { content: string, selectedElement?: string }
Response: { 
  messageId: string,
  response: string,
  changes: ProposedChange[],
  creditsUsed: number
}

// Apply changes
POST /api/editor/sessions/:sessionId/apply
Request: { changeIds: string[] }
Response: { 
  success: boolean,
  newCode: string,
  snapshotId: string
}

// Undo change
POST /api/editor/sessions/:sessionId/undo
Request: { snapshotId?: string }  // If not provided, undo last
Response: { success: boolean, restoredCode: string }

// Upload image
POST /api/editor/sessions/:sessionId/images
Request: FormData { image: File, instruction?: string }
Response: { 
  imageId: string,
  qualityCheck: QualityCheck,
  suggestedLocations: ImageLocation[]
}

// Place image
POST /api/editor/sessions/:sessionId/images/:imageId/place
Request: { locationPath: string }
Response: { success: boolean, newCode: string }

// Get session history
GET /api/editor/sessions/:sessionId/history
Response: { messages: ChatMessage[], snapshots: CodeSnapshot[] }

// End session
POST /api/editor/sessions/:sessionId/end
Response: { totalCreditsUsed: number, changesCount: number }
```

---

# APPENDIX A: QUICK REFERENCE

## Arabic Command Cheatsheet

| Command | Action | Credits |
|---------|--------|---------|
| غيّر اللون إلى... | Change color to... | 5 |
| اجعل الخط أكبر/أصغر | Make font bigger/smaller | 5 |
| أضف زر | Add button | 10 |
| احذف هذا | Delete this | 5 |
| انقل للأعلى/للأسفل | Move up/down | 15 |
| بدّل الصورة | Replace image | 3 |
| ضع الصورة هنا | Place image here | 5 |
| أضف قسم | Add section | 20 |
| تراجع | Undo | 0 |
| أعد | Redo | 0 |

---

**Document Version:** 1.0  
**Created:** December 2025  
**Owner:** Frontend + AI Team  
**Sprint:** 9-10
