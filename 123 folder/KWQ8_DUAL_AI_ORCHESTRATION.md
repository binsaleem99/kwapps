# 🧠 KWQ8 DUAL-AI ORCHESTRATION SYSTEM
## Gemini 3 Pro + DeepSeek Code Generation
### Version 1.0 | December 2025

---

# EXECUTIVE SUMMARY

KWq8 uses a **Dual-AI Architecture** where:
- **Gemini 3 Pro** = Orchestration, understanding, validation
- **DeepSeek** = Code generation (cost-effective)

This separation optimizes for both quality and cost.

---

# PART 1: ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INPUT (Arabic/English)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GEMINI 3 PRO (Orchestrator)                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │   Language    │  │   Intent      │  │   Parameter   │                │
│  │   Detection   │  │   Analysis    │  │   Extraction  │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
│                                    │                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │   Clarifying  │  │   Structured  │  │   Design      │                │
│  │   Questions   │  │   Prompt      │  │   Guidelines  │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Structured Prompt
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEEPSEEK (Code Generator)                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │   React/Next  │  │   Tailwind    │  │   Supabase    │                │
│  │   Components  │  │   Styling     │  │   Integration │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Generated Code
┌─────────────────────────────────────────────────────────────────────────┐
│                      GEMINI 3 PRO (Validator)                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │   RTL Check   │  │   Style       │  │   Function    │                │
│  │               │  │   Compliance  │  │   Validation  │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER PREVIEW                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# PART 2: GEMINI ORCHESTRATOR

## 2.1 System Prompt (Arabic-First)

```typescript
// lib/ai/gemini/system-prompt.ts
export const GEMINI_ORCHESTRATOR_PROMPT = `
أنت مساعد ذكي متخصص في بناء المواقع والتطبيقات للمستخدمين العرب في دول الخليج.

## هويتك:
- اسمك: مساعد KWq8
- لغتك الأساسية: العربية
- تخصصك: بناء مواقع وتطبيقات ويب احترافية
- منطقتك: دول مجلس التعاون الخليجي

## قواعد التواصل:
1. رد بالعربية دائماً إلا إذا طلب المستخدم غير ذلك
2. استخدم لهجة مهنية ودودة
3. اسأل أسئلة توضيحية قبل البدء بأي مهمة كبيرة
4. لا تفترض - اسأل عما لا تعرفه

## عند تحليل طلب المستخدم، حدد:
1. نوع العمل (business_type): مطعم، صالون، متجر، شركة، محفظة، إلخ
2. الخدمات/المنتجات (services): ما يقدمه العمل
3. الوظائف المطلوبة (functionality): حجز، متجر، نموذج تواصل، إلخ
4. التصميم (styling): الألوان، الأسلوب، المزاج
5. اللغة (language): عربي فقط، إنجليزي فقط، أو ثنائي اللغة

## قواعد التصميم الإلزامية:
- الاتجاه: RTL (من اليمين لليسار) دائماً
- الخطوط: عربية أولاً (Tajawal, Cairo, Amiri)
- الألوان: 3-5 ألوان كحد أقصى
- التنسيق: متجاوب مع جميع الأجهزة
- معايير GCC: دعم العملات المحلية، أرقام الهواتف، ضريبة القيمة المضافة

## عند البناء:
1. لا تبدأ بالكود مباشرة - اجمع المتطلبات أولاً
2. اسأل عن: اسم العمل، الألوان المفضلة، الميزات المطلوبة
3. أكد الفهم قبل الإنشاء
4. بعد الإنشاء، اعرض ملخصاً لما تم بناؤه

## الصيغة المنظمة للإخراج:
عند جاهزيتك للبناء، أخرج JSON بالتنسيق التالي:
{
  "ready_to_build": true,
  "parameters": {
    "business_type": "string",
    "business_name": "string",
    "business_name_en": "string | null",
    "services": ["string"],
    "functionality": ["string"],
    "styling": {
      "colors": ["string"],
      "mood": "string",
      "hasHero": boolean
    },
    "language": "ar" | "en" | "bilingual",
    "pages": ["string"],
    "integrations": ["string"]
  }
}

إذا كانت المعلومات ناقصة، أخرج:
{
  "ready_to_build": false,
  "questions": ["string"]
}
`;
```

## 2.2 Prompt Analysis Engine

```typescript
// lib/ai/gemini/prompt-analyzer.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

interface PromptAnalysis {
  language: 'ar' | 'en' | 'mixed';
  direction: 'rtl' | 'ltr';
  intent: PromptIntent;
  extractedParams: ExtractedParameters;
  missingParams: string[];
  clarifyingQuestions: string[];
  readyToBuild: boolean;
}

type PromptIntent = 
  | 'create_website'
  | 'create_webapp'
  | 'edit_existing'
  | 'add_feature'
  | 'fix_issue'
  | 'style_change'
  | 'question'
  | 'unclear';

interface ExtractedParameters {
  businessType?: string;
  businessName?: string;
  businessNameEn?: string;
  services?: string[];
  functionality?: string[];
  styling?: {
    colors?: string[];
    mood?: string;
    hasHero?: boolean;
  };
  language?: 'ar' | 'en' | 'bilingual';
  pages?: string[];
  integrations?: string[];
  gccMarket?: string; // KW, SA, AE, etc.
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeUserPrompt(
  userMessage: string,
  conversationHistory: Message[]
): Promise<PromptAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const analysisPrompt = `
حلل الرسالة التالية من المستخدم واستخرج المعلومات المطلوبة.

الرسالة: "${userMessage}"

سياق المحادثة السابقة:
${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

أخرج JSON فقط بالتنسيق التالي:
{
  "language": "ar" | "en" | "mixed",
  "intent": "create_website" | "create_webapp" | "edit_existing" | "add_feature" | "fix_issue" | "style_change" | "question" | "unclear",
  "extracted_params": {
    "business_type": "string | null",
    "business_name": "string | null",
    "services": ["string"] | null,
    "functionality": ["string"] | null,
    "styling": {
      "colors": ["string"] | null,
      "mood": "string | null",
      "has_hero": boolean | null
    } | null,
    "language": "ar" | "en" | "bilingual" | null,
    "gcc_market": "KW" | "SA" | "AE" | "QA" | "BH" | "OM" | null
  },
  "missing_params": ["string"],
  "clarifying_questions": ["string"],
  "ready_to_build": boolean
}
`;

  const result = await model.generateContent(analysisPrompt);
  const responseText = result.response.text();
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    language: parsed.language,
    direction: parsed.language === 'en' ? 'ltr' : 'rtl',
    intent: parsed.intent,
    extractedParams: camelCaseKeys(parsed.extracted_params),
    missingParams: parsed.missing_params,
    clarifyingQuestions: parsed.clarifying_questions,
    readyToBuild: parsed.ready_to_build,
  };
}
```

## 2.3 Clarifying Questions Generator

```typescript
// lib/ai/gemini/clarifying-questions.ts
interface ClarifyingQuestionsResult {
  questions: Question[];
  priority: 'blocking' | 'recommended' | 'optional';
}

interface Question {
  id: string;
  text: string;
  textEn?: string;
  type: 'text' | 'select' | 'multiselect' | 'color' | 'boolean';
  options?: { value: string; label: string; labelEn?: string }[];
  required: boolean;
  paramKey: string;
}

const QUESTION_TEMPLATES: Record<string, Question> = {
  business_name: {
    id: 'business_name',
    text: 'ما اسم عملك أو مشروعك؟',
    textEn: 'What is your business name?',
    type: 'text',
    required: true,
    paramKey: 'businessName',
  },
  business_type: {
    id: 'business_type',
    text: 'ما نوع عملك؟',
    textEn: 'What type of business is this?',
    type: 'select',
    options: [
      { value: 'restaurant', label: 'مطعم أو مقهى', labelEn: 'Restaurant/Cafe' },
      { value: 'salon', label: 'صالون تجميل', labelEn: 'Beauty Salon' },
      { value: 'store', label: 'متجر إلكتروني', labelEn: 'E-commerce Store' },
      { value: 'corporate', label: 'شركة أو مؤسسة', labelEn: 'Corporate/Business' },
      { value: 'portfolio', label: 'معرض أعمال شخصي', labelEn: 'Portfolio' },
      { value: 'clinic', label: 'عيادة أو مركز صحي', labelEn: 'Clinic/Healthcare' },
      { value: 'realestate', label: 'عقارات', labelEn: 'Real Estate' },
      { value: 'other', label: 'أخرى', labelEn: 'Other' },
    ],
    required: true,
    paramKey: 'businessType',
  },
  color_preference: {
    id: 'color_preference',
    text: 'ما الألوان التي تفضلها لموقعك؟',
    textEn: 'What colors would you prefer?',
    type: 'color',
    required: false,
    paramKey: 'styling.colors',
  },
  functionality: {
    id: 'functionality',
    text: 'ما الميزات التي تحتاجها؟',
    textEn: 'What features do you need?',
    type: 'multiselect',
    options: [
      { value: 'booking', label: 'نظام حجز مواعيد', labelEn: 'Appointment Booking' },
      { value: 'ecommerce', label: 'بيع منتجات', labelEn: 'E-commerce' },
      { value: 'contact', label: 'نموذج تواصل', labelEn: 'Contact Form' },
      { value: 'gallery', label: 'معرض صور', labelEn: 'Photo Gallery' },
      { value: 'blog', label: 'مدونة', labelEn: 'Blog' },
      { value: 'whatsapp', label: 'زر واتساب', labelEn: 'WhatsApp Button' },
      { value: 'reviews', label: 'تقييمات العملاء', labelEn: 'Customer Reviews' },
    ],
    required: false,
    paramKey: 'functionality',
  },
  language: {
    id: 'language',
    text: 'ما لغة الموقع؟',
    textEn: 'What language should the website be in?',
    type: 'select',
    options: [
      { value: 'ar', label: 'عربي فقط', labelEn: 'Arabic Only' },
      { value: 'en', label: 'إنجليزي فقط', labelEn: 'English Only' },
      { value: 'bilingual', label: 'عربي وإنجليزي', labelEn: 'Bilingual' },
    ],
    required: true,
    paramKey: 'language',
  },
};

export function generateClarifyingQuestions(
  missingParams: string[],
  extractedParams: ExtractedParameters
): ClarifyingQuestionsResult {
  const questions: Question[] = [];
  
  // Priority order for questions
  const priorityOrder = ['business_name', 'business_type', 'functionality', 'color_preference', 'language'];
  
  for (const param of priorityOrder) {
    if (missingParams.includes(param) && QUESTION_TEMPLATES[param]) {
      questions.push(QUESTION_TEMPLATES[param]);
    }
  }
  
  // Determine priority
  let priority: 'blocking' | 'recommended' | 'optional';
  if (missingParams.includes('business_type') || missingParams.includes('business_name')) {
    priority = 'blocking';
  } else if (questions.length > 0) {
    priority = 'recommended';
  } else {
    priority = 'optional';
  }
  
  return { questions, priority };
}
```

## 2.4 Structured Prompt Builder

```typescript
// lib/ai/gemini/structured-prompt-builder.ts
interface StructuredPrompt {
  systemContext: string;
  designSystem: DesignSystemContext;
  requirements: RequirementsContext;
  constraints: string[];
  outputFormat: string;
}

interface DesignSystemContext {
  direction: 'rtl' | 'ltr';
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  borderRadius: string;
  spacing: string;
}

interface RequirementsContext {
  pages: PageRequirement[];
  components: string[];
  integrations: string[];
  database: DatabaseRequirement[];
}

export function buildStructuredPrompt(
  params: ExtractedParameters,
  projectDesignSystem?: DesignSystemContext
): StructuredPrompt {
  // Default GCC-optimized design system
  const designSystem: DesignSystemContext = projectDesignSystem || {
    direction: 'rtl',
    fonts: {
      heading: 'Tajawal',
      body: 'Cairo',
    },
    colors: {
      primary: getDefaultPrimaryColor(params.businessType),
      secondary: 'hsl(220 14% 96%)',
      accent: 'hsl(142 76% 36%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222 47% 11%)',
    },
    borderRadius: '0.5rem',
    spacing: '1rem',
  };

  // Build page requirements
  const pages = buildPageRequirements(params);
  
  // Build component list
  const components = buildComponentList(params);
  
  // Build database requirements
  const database = buildDatabaseRequirements(params);

  // Build constraints
  const constraints = [
    'استخدم React مع Next.js 14+ App Router',
    'استخدم Tailwind CSS للتصميم',
    'جميع الألوان باستخدام CSS variables من globals.css',
    'لا تستخدم ألواناً صريحة مثل bg-blue-500',
    'استخدم الخطوط العربية المحددة فقط',
    'تأكد من التوافق مع جميع الأجهزة',
    'أضف dir="rtl" لجميع العناصر',
    'استخدم Supabase للقاعدة بيانات',
    'طبق Row Level Security على كل الجداول',
  ];

  return {
    systemContext: `
أنت مولد كود متخصص في بناء مواقع ويب للسوق العربي والخليجي.
ستنشئ كود React/Next.js كامل وجاهز للتشغيل.

معلومات المشروع:
- نوع العمل: ${params.businessType}
- اسم العمل: ${params.businessName}
- اللغة: ${params.language === 'bilingual' ? 'عربي وإنجليزي' : params.language === 'ar' ? 'عربي' : 'إنجليزي'}
- السوق: ${params.gccMarket || 'KW'}
`,
    designSystem,
    requirements: {
      pages,
      components,
      integrations: params.integrations || [],
      database,
    },
    constraints,
    outputFormat: `
أخرج الكود بالتنسيق التالي:
\`\`\`tsx
// filepath: path/to/file.tsx
// الكود هنا
\`\`\`

أنشئ كل ملف مطلوب بشكل منفصل.
`,
  };
}

function getDefaultPrimaryColor(businessType?: string): string {
  const colorMap: Record<string, string> = {
    restaurant: 'hsl(25 95% 53%)',      // Orange
    salon: 'hsl(330 81% 60%)',          // Pink
    store: 'hsl(221 83% 53%)',          // Blue
    corporate: 'hsl(221 83% 53%)',      // Blue
    portfolio: 'hsl(262 83% 58%)',      // Purple
    clinic: 'hsl(173 80% 40%)',         // Teal
    realestate: 'hsl(142 76% 36%)',     // Green
  };
  return colorMap[businessType || 'corporate'] || 'hsl(221 83% 53%)';
}

function buildPageRequirements(params: ExtractedParameters): PageRequirement[] {
  const pages: PageRequirement[] = [
    { name: 'home', path: '/', required: true },
  ];

  if (params.functionality?.includes('ecommerce')) {
    pages.push(
      { name: 'products', path: '/products', required: true },
      { name: 'product-detail', path: '/products/[id]', required: true },
      { name: 'cart', path: '/cart', required: true },
      { name: 'checkout', path: '/checkout', required: true },
    );
  }

  if (params.functionality?.includes('booking')) {
    pages.push(
      { name: 'booking', path: '/booking', required: true },
    );
  }

  if (params.functionality?.includes('blog')) {
    pages.push(
      { name: 'blog', path: '/blog', required: true },
      { name: 'blog-post', path: '/blog/[slug]', required: true },
    );
  }

  if (params.functionality?.includes('contact')) {
    pages.push(
      { name: 'contact', path: '/contact', required: true },
    );
  }

  // About page for most business types
  if (!['portfolio'].includes(params.businessType || '')) {
    pages.push({ name: 'about', path: '/about', required: false });
  }

  return pages;
}

function buildDatabaseRequirements(params: ExtractedParameters): DatabaseRequirement[] {
  const tables: DatabaseRequirement[] = [];

  if (params.functionality?.includes('ecommerce')) {
    tables.push(
      { name: 'products', fields: ['id', 'name', 'name_en', 'price', 'images', 'category_id', 'stock'] },
      { name: 'categories', fields: ['id', 'name', 'name_en', 'slug'] },
      { name: 'orders', fields: ['id', 'user_id', 'items', 'total', 'status', 'created_at'] },
      { name: 'cart_items', fields: ['id', 'user_id', 'product_id', 'quantity'] },
    );
  }

  if (params.functionality?.includes('booking')) {
    tables.push(
      { name: 'services', fields: ['id', 'name', 'name_en', 'price', 'duration', 'description'] },
      { name: 'bookings', fields: ['id', 'user_id', 'service_id', 'date', 'time', 'status'] },
      { name: 'availability', fields: ['id', 'day_of_week', 'start_time', 'end_time'] },
    );
  }

  if (params.functionality?.includes('blog')) {
    tables.push(
      { name: 'posts', fields: ['id', 'title', 'title_en', 'slug', 'content', 'featured_image', 'published_at'] },
    );
  }

  if (params.functionality?.includes('reviews')) {
    tables.push(
      { name: 'reviews', fields: ['id', 'user_id', 'rating', 'content', 'created_at', 'approved'] },
    );
  }

  if (params.functionality?.includes('contact')) {
    tables.push(
      { name: 'contact_messages', fields: ['id', 'name', 'email', 'phone', 'message', 'created_at'] },
    );
  }

  return tables;
}
```

---

# PART 3: DEEPSEEK CODE GENERATOR

## 3.1 DeepSeek Client

```typescript
// lib/ai/deepseek/client.ts
interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface GenerationResult {
  files: GeneratedFile[];
  totalTokens: number;
  cost: number;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'api' | 'config' | 'style' | 'schema';
}

const DEEPSEEK_CONFIG: DeepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-coder',
};

export class DeepSeekClient {
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig = DEEPSEEK_CONFIG) {
    this.config = config;
  }

  async generateCode(structuredPrompt: StructuredPrompt): Promise<GenerationResult> {
    const systemMessage = this.buildSystemMessage(structuredPrompt);
    const userMessage = this.buildUserMessage(structuredPrompt);

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3, // Lower for more consistent code
        max_tokens: 8000,
        stream: false,
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('DeepSeek generation failed');
    }

    const generatedContent = data.choices[0].message.content;
    const files = this.parseGeneratedFiles(generatedContent);

    return {
      files,
      totalTokens: data.usage?.total_tokens || 0,
      cost: this.calculateCost(data.usage?.total_tokens || 0),
    };
  }

  private buildSystemMessage(prompt: StructuredPrompt): string {
    return `
أنت DeepSeek Coder، مولد كود متخصص في بناء تطبيقات Next.js للسوق العربي.

## القواعد الإلزامية:
${prompt.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## نظام التصميم:
\`\`\`json
${JSON.stringify(prompt.designSystem, null, 2)}
\`\`\`

## تنسيق الإخراج:
لكل ملف، استخدم التنسيق التالي:
\`\`\`tsx
// filepath: path/to/file.tsx
الكود هنا
\`\`\`

## قواعد الكود:
1. استخدم TypeScript دائماً
2. لا تستخدم any - حدد الأنواع بدقة
3. استخدم 'use client' فقط للمكونات التفاعلية
4. أضف تعليقات بالعربية للوظائف المهمة
5. تأكد من التوافق مع RTL
6. استخدم semantic HTML
7. أضف aria-labels بالعربية
`;
  }

  private buildUserMessage(prompt: StructuredPrompt): string {
    return `
${prompt.systemContext}

## الصفحات المطلوبة:
${prompt.requirements.pages.map(p => `- ${p.name}: ${p.path}`).join('\n')}

## المكونات المطلوبة:
${prompt.requirements.components.join('\n')}

## قاعدة البيانات (Supabase):
${prompt.requirements.database.map(t => `- ${t.name}: ${t.fields.join(', ')}`).join('\n')}

## التكاملات:
${prompt.requirements.integrations.join('\n')}

${prompt.outputFormat}

ابدأ بإنشاء الكود الآن.
`;
  }

  private parseGeneratedFiles(content: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Match code blocks with filepath comments
    const regex = /```(?:tsx?|jsx?|css|json|sql)\n\/\/ filepath: ([^\n]+)\n([\s\S]*?)```/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      const path = match[1].trim();
      const code = match[2].trim();
      
      // Determine file type
      let type: GeneratedFile['type'] = 'component';
      if (path.includes('/pages/') || path.includes('/app/')) type = 'page';
      if (path.includes('/api/')) type = 'api';
      if (path.includes('.css') || path.includes('globals')) type = 'style';
      if (path.includes('.sql') || path.includes('schema')) type = 'schema';
      if (path.includes('config') || path.includes('.json')) type = 'config';
      
      files.push({ path, content: code, type });
    }
    
    return files;
  }

  private calculateCost(tokens: number): number {
    // DeepSeek pricing (approximate)
    const costPer1000Tokens = 0.0001; // $0.0001 per 1K tokens
    return (tokens / 1000) * costPer1000Tokens;
  }
}

export const deepseekClient = new DeepSeekClient();
```

## 3.2 Code Generation Templates

```typescript
// lib/ai/deepseek/templates.ts
export const CODE_TEMPLATES = {
  // Page Layout Template
  pageLayout: `
'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background font-body">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
`,

  // Product Card Template
  productCard: `
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        {product.category && (
          <span className="text-xs text-muted-foreground">{product.category}</span>
        )}
        <h3 className="font-heading font-bold text-lg mt-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-primary font-bold mt-2">
          {formatCurrency(product.price, 'KWD')}
        </p>
      </div>
    </div>
  );
}
`,

  // Hero Section Template
  heroSection: `
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? \`url(\${backgroundImage})\` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && ctaLink && (
          <a
            href={ctaLink}
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
`,
};
```

---

# PART 4: GEMINI VALIDATOR

## 4.1 Code Validation Engine

```typescript
// lib/ai/gemini/validator.ts
interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
  fixedCode?: GeneratedFile[];
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'rtl' | 'styling' | 'accessibility' | 'functionality' | 'security' | 'performance';
  message: string;
  file: string;
  line?: number;
  fix?: string;
}

export async function validateGeneratedCode(
  files: GeneratedFile[],
  designSystem: DesignSystemContext
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];
  
  for (const file of files) {
    // RTL Validation
    const rtlIssues = validateRTL(file);
    issues.push(...rtlIssues);
    
    // Style Validation
    const styleIssues = validateStyling(file, designSystem);
    issues.push(...styleIssues);
    
    // Accessibility Validation
    const a11yIssues = validateAccessibility(file);
    issues.push(...a11yIssues);
    
    // Arabic Content Validation
    const arabicIssues = validateArabicContent(file);
    issues.push(...arabicIssues);
    
    // Security Validation
    const securityIssues = validateSecurity(file);
    issues.push(...securityIssues);
  }
  
  // Calculate score
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 3));
  
  // Use Gemini to fix issues if score is too low
  let fixedCode: GeneratedFile[] | undefined;
  if (score < 70 && issues.some(i => i.severity === 'error')) {
    fixedCode = await autoFixIssues(files, issues);
  }
  
  return {
    passed: score >= 70,
    score,
    issues,
    suggestions: generateSuggestions(issues),
    fixedCode,
  };
}

function validateRTL(file: GeneratedFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const content = file.content;
  
  // Check for dir="rtl" on root elements
  if (file.type === 'page' && !content.includes('dir="rtl"') && !content.includes("dir='rtl'")) {
    issues.push({
      severity: 'error',
      category: 'rtl',
      message: 'الصفحة لا تحتوي على dir="rtl"',
      file: file.path,
      fix: 'أضف dir="rtl" للعنصر الجذري',
    });
  }
  
  // Check for left/right that should be start/end
  const leftRightPattern = /(text-left|text-right|ml-|mr-|pl-|pr-|left-|right-)/g;
  let match;
  while ((match = leftRightPattern.exec(content)) !== null) {
    // Ignore RTL-aware classes
    if (!content.includes('rtl:') && !content.includes('ltr:')) {
      issues.push({
        severity: 'warning',
        category: 'rtl',
        message: `استخدم start/end بدلاً من left/right: ${match[0]}`,
        file: file.path,
        fix: match[0].replace('left', 'start').replace('right', 'end')
                     .replace('ml-', 'ms-').replace('mr-', 'me-')
                     .replace('pl-', 'ps-').replace('pr-', 'pe-'),
      });
    }
  }
  
  return issues;
}

function validateStyling(file: GeneratedFile, designSystem: DesignSystemContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const content = file.content;
  
  // Check for explicit colors
  const explicitColorPattern = /(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g;
  let match;
  while ((match = explicitColorPattern.exec(content)) !== null) {
    issues.push({
      severity: 'warning',
      category: 'styling',
      message: `استخدم متغيرات CSS بدلاً من الألوان الصريحة: ${match[0]}`,
      file: file.path,
      fix: 'استخدم bg-primary أو text-muted-foreground إلخ',
    });
  }
  
  // Check for hardcoded fonts
  if (content.includes('font-sans') || content.includes('font-serif') || content.includes('font-mono')) {
    if (!content.includes('font-heading') && !content.includes('font-body')) {
      issues.push({
        severity: 'warning',
        category: 'styling',
        message: 'استخدم font-heading أو font-body للخطوط العربية',
        file: file.path,
      });
    }
  }
  
  return issues;
}

function validateAccessibility(file: GeneratedFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const content = file.content;
  
  // Check for images without alt
  const imgPattern = /<img[^>]*>/g;
  let match;
  while ((match = imgPattern.exec(content)) !== null) {
    if (!match[0].includes('alt=')) {
      issues.push({
        severity: 'error',
        category: 'accessibility',
        message: 'صورة بدون نص بديل (alt)',
        file: file.path,
        fix: 'أضف alt="" أو وصف مناسب',
      });
    }
  }
  
  // Check for buttons without accessible text
  const buttonPattern = /<button[^>]*>([^<]*)</g;
  while ((match = buttonPattern.exec(content)) !== null) {
    const buttonContent = match[1].trim();
    if (!buttonContent && !match[0].includes('aria-label')) {
      issues.push({
        severity: 'warning',
        category: 'accessibility',
        message: 'زر بدون نص أو aria-label',
        file: file.path,
      });
    }
  }
  
  return issues;
}

function validateArabicContent(file: GeneratedFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const content = file.content;
  
  // Check for English-only placeholder text
  const placeholderPattern = /placeholder=["']([^"']+)["']/g;
  let match;
  while ((match = placeholderPattern.exec(content)) !== null) {
    const text = match[1];
    // Simple Arabic detection
    if (!/[\u0600-\u06FF]/.test(text)) {
      issues.push({
        severity: 'info',
        category: 'rtl',
        message: `Placeholder باللغة الإنجليزية فقط: "${text}"`,
        file: file.path,
      });
    }
  }
  
  return issues;
}

function validateSecurity(file: GeneratedFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const content = file.content;
  
  // Check for dangerouslySetInnerHTML
  if (content.includes('dangerouslySetInnerHTML')) {
    issues.push({
      severity: 'warning',
      category: 'security',
      message: 'استخدام dangerouslySetInnerHTML - تأكد من تعقيم المحتوى',
      file: file.path,
    });
  }
  
  // Check for exposed API keys
  if (content.includes('NEXT_PUBLIC_') && content.includes('SECRET')) {
    issues.push({
      severity: 'error',
      category: 'security',
      message: 'لا تكشف عن المفاتيح السرية في الكود العام',
      file: file.path,
    });
  }
  
  return issues;
}

async function autoFixIssues(
  files: GeneratedFile[],
  issues: ValidationIssue[]
): Promise<GeneratedFile[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const fixPrompt = `
أصلح المشاكل التالية في الكود:

المشاكل:
${issues.filter(i => i.severity === 'error').map(i => `- ${i.message} في ${i.file}`).join('\n')}

الملفات:
${files.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n')}

أخرج الملفات المصححة بنفس التنسيق.
`;

  const result = await model.generateContent(fixPrompt);
  const responseText = result.response.text();
  
  // Parse fixed files (reuse parsing logic)
  return parseGeneratedFiles(responseText);
}
```

---

# PART 5: ORCHESTRATION FLOW

## 5.1 Main Orchestrator

```typescript
// lib/ai/orchestrator.ts
interface OrchestrationResult {
  success: boolean;
  files?: GeneratedFile[];
  questions?: Question[];
  message: string;
  creditsUsed: number;
  validationScore?: number;
}

export async function orchestrateGeneration(
  userId: string,
  projectId: string,
  userMessage: string,
  conversationHistory: Message[]
): Promise<OrchestrationResult> {
  // 1. Analyze prompt with Gemini
  const analysis = await analyzeUserPrompt(userMessage, conversationHistory);
  
  // 2. If not ready, return clarifying questions
  if (!analysis.readyToBuild) {
    const { questions } = generateClarifyingQuestions(
      analysis.missingParams,
      analysis.extractedParams
    );
    
    return {
      success: true,
      questions,
      message: questions.length > 0 
        ? 'أحتاج بعض المعلومات الإضافية قبل البدء:'
        : 'كيف يمكنني مساعدتك؟',
      creditsUsed: 2, // Small credit for analysis
    };
  }
  
  // 3. Build structured prompt
  const structuredPrompt = buildStructuredPrompt(analysis.extractedParams);
  
  // 4. Generate code with DeepSeek
  const generationResult = await deepseekClient.generateCode(structuredPrompt);
  
  // 5. Validate with Gemini
  const validation = await validateGeneratedCode(
    generationResult.files,
    structuredPrompt.designSystem
  );
  
  // 6. Use fixed code if available
  const finalFiles = validation.fixedCode || generationResult.files;
  
  // 7. Save to project
  await saveGeneratedFiles(projectId, finalFiles);
  
  // 8. Calculate total credits
  const creditsUsed = calculateCredits(
    analysis.intent,
    generationResult.totalTokens,
    validation.passed
  );
  
  // 9. Deduct credits
  await deductCredits(userId, creditsUsed, 'code_generation');
  
  return {
    success: true,
    files: finalFiles,
    message: generateSuccessMessage(analysis.extractedParams, finalFiles.length),
    creditsUsed,
    validationScore: validation.score,
  };
}

function calculateCredits(
  intent: PromptIntent,
  tokens: number,
  validationPassed: boolean
): number {
  const baseCredits: Record<PromptIntent, number> = {
    create_website: 50,
    create_webapp: 80,
    edit_existing: 15,
    add_feature: 25,
    fix_issue: 10,
    style_change: 15,
    question: 2,
    unclear: 1,
  };
  
  let credits = baseCredits[intent] || 20;
  
  // Add for token usage (1 credit per 1000 tokens)
  credits += Math.ceil(tokens / 1000);
  
  // Discount if validation failed (less value provided)
  if (!validationPassed) {
    credits = Math.floor(credits * 0.8);
  }
  
  return credits;
}

function generateSuccessMessage(params: ExtractedParameters, fileCount: number): string {
  const businessType = params.businessType || 'موقع';
  const pages = params.pages?.length || 0;
  
  return `
✅ تم إنشاء ${businessType} "${params.businessName}" بنجاح!

📄 الملفات المنشأة: ${fileCount}
📱 الصفحات: ${pages}
🎨 التصميم: RTL عربي

يمكنك الآن معاينة الموقع أو تعديله من خلال المحرر المرئي.
`;
}
```

---

# PART 6: API ROUTES

```typescript
// app/api/ai/generate/route.ts
import { orchestrateGeneration } from '@/lib/ai/orchestrator';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { projectId, message, conversationHistory } = body;
    
    // Check credits
    const { data: usage } = await supabase
      .from('usage_limits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();
    
    if (!usage || usage.credits_remaining < 10) {
      return Response.json({
        error: 'Insufficient credits',
        creditsRemaining: usage?.credits_remaining || 0,
      }, { status: 402 });
    }
    
    // Run orchestration
    const result = await orchestrateGeneration(
      user.id,
      projectId,
      message,
      conversationHistory || []
    );
    
    // Save message to conversation
    await supabase.from('messages').insert({
      project_id: projectId,
      role: 'user',
      content: message,
    });
    
    await supabase.from('messages').insert({
      project_id: projectId,
      role: 'assistant',
      content: result.message,
      metadata: {
        files: result.files?.map(f => f.path),
        creditsUsed: result.creditsUsed,
        validationScore: result.validationScore,
      },
    });
    
    return Response.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

---

# PART 7: CREDIT COSTS SUMMARY

| Action | Credits |
|--------|---------|
| **Prompt Analysis** | 2 |
| **Create Full Website** | 50-80 |
| **Create Web App** | 60-100 |
| **Add Single Feature** | 25 |
| **Edit Existing Page** | 15 |
| **Style Change** | 15 |
| **Fix Bug** | 10 |
| **Simple Question** | 2 |
| **Validation Retry** | 5 |

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
