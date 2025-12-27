# 🛍️ KWQ8 AUTO-PAGE GENERATION SYSTEM
## Products, Services & Media Embedding
### Version 1.0 | December 2025

---

# PART 1: AUTO-PAGE GENERATION FOR PRODUCTS/SERVICES

## OVERVIEW

When users have store or service-based websites, they can add new products or services through a simple interface. The system automatically generates new pages matching the existing design without requiring AI credits (when done through the dashboard).

---

## 1.1 Auto-Page Generation Engine

```typescript
// lib/pages/auto-generator.ts
interface PageTemplate {
  type: 'product' | 'service' | 'blog' | 'gallery-item';
  layout: LayoutConfig;
  sections: SectionConfig[];
  styles: StyleConfig;
}

interface GenerationResult {
  pageId: string;
  url: string;
  status: 'generated' | 'pending-review';
  code: string;
}

async function generateProductPage(
  projectId: string,
  product: ProductData,
  options?: GenerationOptions
): Promise<GenerationResult> {
  // 1. Get project's existing design system
  const project = await getProjectWithDesign(projectId);
  const designSystem = project.designSystem;
  
  // 2. Find existing product page template
  const existingProductPage = await findExistingProductPage(projectId);
  
  // 3. Extract template structure
  const template = extractPageTemplate(existingProductPage);
  
  // 4. Generate new page with product data
  const pageCode = await renderProductPage(template, product, designSystem);
  
  // 5. Create page record
  const page = await createProjectPage({
    projectId,
    type: 'product',
    slug: generateSlug(product.name),
    title: product.name,
    titleEn: product.nameEn,
    code: pageCode,
    metadata: {
      productId: product.id,
      generatedAt: new Date().toISOString(),
    },
  });

  return {
    pageId: page.id,
    url: `/${page.slug}`,
    status: 'generated',
    code: pageCode,
  };
}

async function generateServicePage(
  projectId: string,
  service: ServiceData,
  options?: GenerationOptions
): Promise<GenerationResult> {
  const project = await getProjectWithDesign(projectId);
  const designSystem = project.designSystem;
  
  const existingServicePage = await findExistingServicePage(projectId);
  const template = extractPageTemplate(existingServicePage);
  
  const pageCode = await renderServicePage(template, service, designSystem);
  
  const page = await createProjectPage({
    projectId,
    type: 'service',
    slug: generateSlug(service.name),
    title: service.name,
    titleEn: service.nameEn,
    code: pageCode,
    metadata: {
      serviceId: service.id,
      generatedAt: new Date().toISOString(),
    },
  });

  return {
    pageId: page.id,
    url: `/${page.slug}`,
    status: 'generated',
    code: pageCode,
  };
}
```

## 1.2 Template Extraction Engine

```typescript
// lib/pages/template-extractor.ts
interface ExtractedTemplate {
  layout: {
    header: boolean;
    footer: boolean;
    sidebar: boolean;
    breadcrumbs: boolean;
  };
  sections: {
    id: string;
    type: SectionType;
    position: number;
    config: any;
  }[];
  styling: {
    primaryColor: string;
    fontFamily: string;
    spacing: string;
    borderRadius: string;
  };
  dataMapping: DataFieldMapping[];
}

type SectionType = 
  | 'product-gallery'
  | 'product-info'
  | 'product-price'
  | 'product-description'
  | 'product-specifications'
  | 'add-to-cart'
  | 'related-products'
  | 'reviews'
  | 'service-header'
  | 'service-details'
  | 'booking-form'
  | 'testimonials';

interface DataFieldMapping {
  sectionId: string;
  field: string;
  sourceKey: string;
  transform?: 'currency' | 'date' | 'image' | 'richtext';
}

async function extractPageTemplate(pageCode: string): Promise<ExtractedTemplate> {
  // Parse the page code
  const ast = parseReactComponent(pageCode);
  
  // Identify layout structure
  const layout = identifyLayout(ast);
  
  // Extract sections
  const sections = extractSections(ast);
  
  // Get styling from design tokens
  const styling = extractStyling(ast);
  
  // Map data fields
  const dataMapping = mapDataFields(sections);
  
  return {
    layout,
    sections,
    styling,
    dataMapping,
  };
}

function extractSections(ast: AST): ExtractedTemplate['sections'] {
  const sections: ExtractedTemplate['sections'][] = [];
  
  // Walk the AST looking for known section patterns
  walkAST(ast, (node, path) => {
    // Product gallery detection
    if (isGalleryComponent(node)) {
      sections.push({
        id: generateId(),
        type: 'product-gallery',
        position: path.length,
        config: extractGalleryConfig(node),
      });
    }
    
    // Price display detection
    if (isPriceComponent(node)) {
      sections.push({
        id: generateId(),
        type: 'product-price',
        position: path.length,
        config: extractPriceConfig(node),
      });
    }
    
    // Add to cart detection
    if (isAddToCartComponent(node)) {
      sections.push({
        id: generateId(),
        type: 'add-to-cart',
        position: path.length,
        config: extractCartConfig(node),
      });
    }
    
    // Continue for other section types...
  });
  
  return sections.sort((a, b) => a.position - b.position);
}
```

## 1.3 Page Renderer

```typescript
// lib/pages/renderer.ts
async function renderProductPage(
  template: ExtractedTemplate,
  product: ProductData,
  designSystem: DesignSystem
): Promise<string> {
  const imports = generateImports(template);
  const componentBody = generateComponentBody(template, product);
  
  return `
'use client';

${imports}

interface ProductPageProps {
  product: {
    id: string;
    name: string;
    nameEn?: string;
    price: number;
    comparePrice?: number;
    images: string[];
    description?: string;
    specifications?: { key: string; value: string }[];
    category?: { name: string; slug: string };
    stock: number;
  };
}

export default function ProductPage({ product }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      ${template.layout.breadcrumbs ? generateBreadcrumbs(product) : ''}
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${renderSectionsByType(template.sections, product, 'left')}
          ${renderSectionsByType(template.sections, product, 'right')}
        </div>
        
        ${template.sections.some(s => s.type === 'related-products') 
          ? renderRelatedProducts(product) 
          : ''}
        
        ${template.sections.some(s => s.type === 'reviews')
          ? renderReviews(product)
          : ''}
      </div>
    </div>
  );
}
`;
}

function renderSectionsByType(
  sections: ExtractedTemplate['sections'],
  product: ProductData,
  position: 'left' | 'right'
): string {
  const leftSections = ['product-gallery'];
  const rightSections = ['product-info', 'product-price', 'product-description', 'add-to-cart', 'product-specifications'];
  
  const targetTypes = position === 'left' ? leftSections : rightSections;
  const filteredSections = sections.filter(s => targetTypes.includes(s.type));
  
  return filteredSections.map(section => {
    switch (section.type) {
      case 'product-gallery':
        return `
          {/* معرض الصور */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={\`aspect-square rounded-lg overflow-hidden border-2 transition-colors \${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }\`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        `;
        
      case 'product-price':
        return `
          {/* السعر */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.price, 'KWD')}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.comparePrice, 'KWD')}
              </span>
            )}
          </div>
        `;
        
      case 'add-to-cart':
        return `
          {/* إضافة للسلة */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">الكمية:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-muted"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.stock} متوفر)
              </span>
            </div>
            <button
              onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock === 0}
              className="w-full btn-primary py-3 text-lg"
            >
              {product.stock > 0 ? 'إضافة للسلة' : 'نفذت الكمية'}
            </button>
          </div>
        `;
        
      // Add more section types...
      default:
        return '';
    }
  }).join('\n');
}
```

## 1.4 Style Consistency Engine

```typescript
// lib/pages/style-consistency.ts
interface StyleConsistencyCheck {
  passed: boolean;
  issues: StyleIssue[];
  suggestions: StyleSuggestion[];
}

interface StyleIssue {
  severity: 'error' | 'warning';
  message: string;
  location: string;
}

async function ensureStyleConsistency(
  generatedCode: string,
  projectDesignSystem: DesignSystem
): Promise<string> {
  // Parse the generated code
  let code = generatedCode;
  
  // 1. Ensure RTL direction
  code = ensureRTL(code);
  
  // 2. Replace color values with design tokens
  code = replaceWithDesignTokens(code, projectDesignSystem);
  
  // 3. Ensure Arabic typography
  code = ensureArabicTypography(code, projectDesignSystem);
  
  // 4. Fix spacing to match project
  code = normalizeSpacing(code, projectDesignSystem);
  
  // 5. Ensure responsive classes
  code = ensureResponsive(code);
  
  return code;
}

function replaceWithDesignTokens(
  code: string,
  designSystem: DesignSystem
): string {
  // Replace explicit colors with CSS variables
  const colorReplacements: Record<string, string> = {
    // Map common color patterns to tokens
    'bg-blue-500': 'bg-primary',
    'text-blue-500': 'text-primary',
    'border-blue-500': 'border-primary',
    'bg-gray-100': 'bg-muted',
    'text-gray-500': 'text-muted-foreground',
    'bg-white': 'bg-card',
    'text-black': 'text-foreground',
  };
  
  let result = code;
  for (const [explicit, token] of Object.entries(colorReplacements)) {
    result = result.replace(new RegExp(explicit, 'g'), token);
  }
  
  return result;
}

function ensureArabicTypography(
  code: string,
  designSystem: DesignSystem
): string {
  // Ensure font-heading for titles
  code = code.replace(
    /className="([^"]*)(text-2xl|text-3xl|text-4xl)([^"]*)"/g,
    'className="$1$2$3 font-heading"'
  );
  
  // Ensure font-body for body text
  code = code.replace(
    /className="([^"]*)(text-sm|text-base|text-lg)([^"]*)"/g,
    'className="$1$2$3 font-body"'
  );
  
  return code;
}
```

---

# PART 2: UI COMPONENTS FOR ADDING PRODUCTS/SERVICES

## 2.1 Add Product Button

```tsx
// components/builder/AddProductButton.tsx
interface AddProductButtonProps {
  onAdd: () => void;
  variant?: 'inline' | 'floating';
}

export function AddProductButton({ onAdd, variant = 'inline' }: AddProductButtonProps) {
  if (variant === 'floating') {
    return (
      <button
        onClick={onAdd}
        className={cn(
          "fixed bottom-6 left-6 z-50",
          "bg-primary text-primary-foreground",
          "rounded-full shadow-lg p-4",
          "hover:bg-primary/90 transition-all",
          "group"
        )}
      >
        <Plus className="w-6 h-6" />
        <span className={cn(
          "absolute right-full mr-2 whitespace-nowrap",
          "bg-popover text-popover-foreground px-3 py-1 rounded-lg shadow",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}>
          إضافة منتج جديد
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onAdd}
      className={cn(
        "w-full border-2 border-dashed border-muted-foreground/30",
        "rounded-lg p-8 text-center",
        "hover:border-primary hover:bg-primary/5 transition-colors",
        "group cursor-pointer"
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full bg-muted",
          "flex items-center justify-center",
          "group-hover:bg-primary/10 transition-colors"
        )}>
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
        </div>
        <div>
          <p className="font-medium">إضافة منتج جديد</p>
          <p className="text-sm text-muted-foreground">
            أضف منتجاً جديداً بنفس تصميم المنتجات الحالية
          </p>
        </div>
      </div>
    </button>
  );
}
```

## 2.2 Quick Add Product Modal

```tsx
// components/builder/QuickAddProductModal.tsx
interface QuickAddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: ProductData) => void;
}

export function QuickAddProductModal({
  open,
  onClose,
  onSuccess,
}: QuickAddProductModalProps) {
  const [step, setStep] = useState<'info' | 'images' | 'pricing' | 'review'>('info');
  const [form, setForm] = useState<Partial<ProductData>>({
    name: '',
    price: 0,
    images: [],
    stock: 0,
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Generate product page
      const result = await generateProductPage(projectId, form as ProductData);
      
      // Create product in database
      const product = await createProduct({
        ...form,
        pageId: result.pageId,
        pageUrl: result.url,
      });

      toast.success('تم إضافة المنتج وإنشاء صفحته');
      onSuccess(product);
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            إضافة منتج جديد
          </DialogTitle>
          <DialogDescription>
            أضف منتجاً جديداً وسيتم إنشاء صفحة له تلقائياً
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {['info', 'images', 'pricing', 'review'].map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex items-center",
                i < 3 && "flex-1"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step === s && "bg-primary text-primary-foreground",
                ['info', 'images', 'pricing', 'review'].indexOf(step) > i && "bg-primary/20 text-primary",
                ['info', 'images', 'pricing', 'review'].indexOf(step) < i && "bg-muted text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {i < 3 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  ['info', 'images', 'pricing', 'review'].indexOf(step) > i
                    ? "bg-primary"
                    : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  اسم المنتج <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="مثال: عطر فاخر 100مل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  الوصف
                </label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="وصف مختصر للمنتج..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  التصنيف
                </label>
                <CategorySelect
                  value={form.categoryId}
                  onChange={(id) => setForm({ ...form, categoryId: id })}
                />
              </div>
            </div>
          )}

          {step === 'images' && (
            <div className="space-y-4">
              <MultiImageUploader
                images={form.images || []}
                onChange={(images) => setForm({ ...form, images })}
                maxImages={5}
              />
              <p className="text-sm text-muted-foreground">
                الصورة الأولى ستكون الصورة الرئيسية للمنتج
              </p>
            </div>
          )}

          {step === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    السعر (د.ك) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                    className="input"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    السعر قبل الخصم
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.comparePrice || ''}
                    onChange={(e) => setForm({ 
                      ...form, 
                      comparePrice: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  الكمية المتوفرة
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                  className="input w-32"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium">مراجعة المنتج</h3>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex gap-4">
                  {form.images?.[0] && (
                    <img
                      src={form.images[0]}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-lg">{form.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.description}
                    </p>
                    <p className="text-primary font-bold mt-2">
                      {formatCurrency(form.price || 0, 'KWD')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 text-blue-700 rounded-lg p-4 text-sm">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">سيتم إنشاء صفحة للمنتج تلقائياً</p>
                    <p>الصفحة ستتبع نفس تصميم المنتجات الموجودة في موقعك</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => {
              const steps = ['info', 'images', 'pricing', 'review'];
              const currentIndex = steps.indexOf(step);
              if (currentIndex > 0) {
                setStep(steps[currentIndex - 1] as any);
              }
            }}
            disabled={step === 'info'}
            className="btn-outline"
          >
            السابق
          </button>
          
          {step === 'review' ? (
            <button
              onClick={handleGenerate}
              disabled={generating || !form.name || !form.price}
              className="btn-primary"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إضافة المنتج وإنشاء الصفحة'
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                const steps = ['info', 'images', 'pricing', 'review'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex < steps.length - 1) {
                  setStep(steps[currentIndex + 1] as any);
                }
              }}
              className="btn-primary"
            >
              التالي
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 2.3 Style Confirmation Dialog

```tsx
// components/builder/StyleConfirmationDialog.tsx
interface StyleConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (keepStyle: boolean) => void;
  existingPagePreview: string; // URL or base64 of screenshot
  newPagePreview: string;
}

export function StyleConfirmationDialog({
  open,
  onClose,
  onConfirm,
  existingPagePreview,
  newPagePreview,
}: StyleConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>تأكيد تصميم الصفحة</DialogTitle>
          <DialogDescription>
            هل تريد الاحتفاظ بنفس تصميم المنتجات الحالية أم تغييره؟
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Keep Style Option */}
          <button
            onClick={() => onConfirm(true)}
            className={cn(
              "p-4 rounded-lg border-2 text-right transition-all",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
              <img
                src={existingPagePreview}
                alt="التصميم الحالي"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium mb-1">الاحتفاظ بالتصميم</h3>
            <p className="text-sm text-muted-foreground">
              استخدام نفس تصميم المنتجات الموجودة
            </p>
            <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              مجاني
            </span>
          </button>

          {/* Change Style Option */}
          <button
            onClick={() => onConfirm(false)}
            className={cn(
              "p-4 rounded-lg border-2 text-right transition-all",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 mb-3 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary/50" />
            </div>
            <h3 className="font-medium mb-1">تغيير التصميم</h3>
            <p className="text-sm text-muted-foreground">
              استخدام الذكاء الاصطناعي لتصميم صفحة مخصصة
            </p>
            <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              15 نقطة
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

# PART 3: MEDIA EMBEDDING SYSTEM

## 3.1 YouTube Embed Component

```typescript
// lib/media/youtube.ts
interface YouTubeEmbedConfig {
  videoId: string;
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  loop?: boolean;
  startTime?: number;
  endTime?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function generateYouTubeEmbedCode(config: YouTubeEmbedConfig): string {
  const params = new URLSearchParams();
  
  if (config.autoplay) params.set('autoplay', '1');
  if (config.mute) params.set('mute', '1');
  if (!config.controls) params.set('controls', '0');
  if (config.loop) {
    params.set('loop', '1');
    params.set('playlist', config.videoId);
  }
  if (config.startTime) params.set('start', config.startTime.toString());
  if (config.endTime) params.set('end', config.endTime.toString());
  
  // Add RTL-friendly settings
  params.set('hl', 'ar');
  params.set('rel', '0'); // Don't show related videos
  
  const aspectRatios: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };
  
  const aspectClass = aspectRatios[config.aspectRatio || '16:9'];
  
  return `
<div className="${aspectClass} w-full rounded-lg overflow-hidden bg-muted">
  <iframe
    src="https://www.youtube.com/embed/${config.videoId}?${params.toString()}"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full"
  />
</div>
`;
}
```

## 3.2 Media Embed UI

```tsx
// components/builder/MediaEmbed.tsx
type MediaType = 'youtube' | 'vimeo' | 'image' | 'video';

interface MediaEmbedProps {
  onEmbed: (code: string, type: MediaType) => void;
}

export function MediaEmbed({ onEmbed }: MediaEmbedProps) {
  const [tab, setTab] = useState<MediaType>('youtube');
  const [url, setUrl] = useState('');
  const [config, setConfig] = useState<Partial<YouTubeEmbedConfig>>({
    controls: true,
    aspectRatio: '16:9',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);

    if (tab === 'youtube') {
      const videoId = extractYouTubeVideoId(value);
      if (videoId) {
        setConfig({ ...config, videoId });
        setPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      } else if (value) {
        setError('رابط يوتيوب غير صحيح');
        setPreview(null);
      }
    }
  };

  const handleEmbed = () => {
    if (tab === 'youtube' && config.videoId) {
      const code = generateYouTubeEmbedCode(config as YouTubeEmbedConfig);
      onEmbed(code, 'youtube');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'youtube', label: 'يوتيوب', icon: Youtube },
          { id: 'vimeo', label: 'فيميو', icon: Video },
          { id: 'image', label: 'صورة', icon: Image },
          { id: 'video', label: 'فيديو', icon: Film },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as MediaType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* YouTube Tab */}
      {tab === 'youtube' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رابط الفيديو</label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input"
              dir="ltr"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          {preview && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نسبة العرض</label>
              <select
                value={config.aspectRatio}
                onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as any })}
                className="input"
              >
                <option value="16:9">16:9 (واسع)</option>
                <option value="4:3">4:3 (تقليدي)</option>
                <option value="1:1">1:1 (مربع)</option>
              </select>
            </div>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.controls}
                  onChange={(e) => setConfig({ ...config, controls: e.target.checked })}
                />
                <span className="text-sm">إظهار أزرار التحكم</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoplay}
                  onChange={(e) => setConfig({ ...config, autoplay: e.target.checked })}
                />
                <span className="text-sm">تشغيل تلقائي</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.loop}
                  onChange={(e) => setConfig({ ...config, loop: e.target.checked })}
                />
                <span className="text-sm">تكرار</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleEmbed}
            disabled={!config.videoId}
            className="btn-primary w-full"
          >
            إضافة الفيديو
          </button>
        </div>
      )}

      {/* Image Tab */}
      {tab === 'image' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رابط الصورة</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input"
              dir="ltr"
            />
          </div>
          
          <div className="text-center">
            <span className="text-muted-foreground">أو</span>
          </div>

          <ImageUploader
            onUpload={(imageUrl) => {
              const code = `<img src="${imageUrl}" alt="" className="w-full rounded-lg" />`;
              onEmbed(code, 'image');
            }}
          />
        </div>
      )}
    </div>
  );
}
```

---

# PART 4: DATABASE SCHEMA

```sql
-- Auto-generated pages tracking
CREATE TABLE IF NOT EXISTS auto_generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  type TEXT NOT NULL, -- 'product', 'service', 'blog'
  source_id UUID, -- product_id or service_id
  template_page_id UUID REFERENCES project_pages(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, draft, archived
  generated_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB,
  UNIQUE(project_id, slug)
);

-- Media embeds tracking
CREATE TABLE IF NOT EXISTS project_media_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  page_id UUID REFERENCES project_pages(id),
  type TEXT NOT NULL, -- 'youtube', 'vimeo', 'image', 'video'
  source_url TEXT NOT NULL,
  config JSONB,
  position JSONB, -- {sectionId, index}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_auto_pages_project ON auto_generated_pages(project_id);
CREATE INDEX idx_auto_pages_type ON auto_generated_pages(type);
CREATE INDEX idx_auto_pages_source ON auto_generated_pages(source_id);
CREATE INDEX idx_media_embeds_project ON project_media_embeds(project_id);

-- RLS
ALTER TABLE auto_generated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media_embeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their auto pages"
  ON auto_generated_pages FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users manage their media embeds"
  ON project_media_embeds FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
```

---

# PART 5: CREDIT COSTS

| Action | Credits | Notes |
|--------|---------|-------|
| Auto-generate page (same style) | **0** | FREE through dashboard |
| Auto-generate page (AI style) | **15** | Custom design |
| Add product through dashboard | **0** | FREE |
| Add product through AI chat | **20** | AI-assisted |
| Embed YouTube video | **0** | FREE |
| Embed with AI placement | **5** | AI finds best location |
| Bulk import products | **0** | FREE |
| AI product description | **10** | Generate descriptions |

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
