# 🖼️ KWQ8 IMAGE AI & WHATSAPP INTEGRATION
## Banana.dev Image Enhancement + WhatsApp Business Integration
### Version 1.0 | December 2025

---

# PART 1: BANANA.DEV IMAGE AI INTEGRATION

## OVERVIEW

Banana.dev provides AI image enhancement for **Premium (59 KWD)** and **Enterprise (75 KWD)** tiers only. This includes:
- Image upscaling (up to 4x)
- Quality enhancement
- Aspect ratio adjustment for website placement
- Background removal
- Style transfer for consistency

**Upsell Strategy:** Basic and Pro users see image quality warnings with upgrade prompts.

---

## 1.1 API Configuration

```typescript
// lib/banana/config.ts
interface BananaConfig {
  apiKey: string;
  modelId: string;
  baseUrl: string;
}

const BANANA_CONFIG: BananaConfig = {
  apiKey: process.env.BANANA_API_KEY!,
  modelId: process.env.BANANA_MODEL_ID || 'real-esrgan-4x',
  baseUrl: 'https://api.banana.dev',
};

// Available models
const BANANA_MODELS = {
  upscale: 'real-esrgan-4x',           // 4x upscaling
  enhance: 'gfpgan',                    // Face/general enhancement
  removeBackground: 'rembg',            // Background removal
  styleTransfer: 'stable-diffusion',    // Style consistency
};
```

## 1.2 Image Quality Checker

```typescript
// lib/image/quality-checker.ts
interface ImageQuality {
  width: number;
  height: number;
  aspectRatio: number;
  resolution: 'low' | 'medium' | 'high';
  suitableFor: PlacementType[];
  needsEnhancement: boolean;
  recommendations: ImageRecommendation[];
}

interface ImageRecommendation {
  type: 'upscale' | 'crop' | 'enhance' | 'remove-bg';
  reason: string;
  priority: 'required' | 'recommended' | 'optional';
  estimatedImprovement: string;
}

type PlacementType = 
  | 'hero'
  | 'product-main'
  | 'product-thumbnail'
  | 'gallery'
  | 'blog-featured'
  | 'profile'
  | 'icon';

const PLACEMENT_REQUIREMENTS: Record<PlacementType, {
  minWidth: number;
  minHeight: number;
  preferredRatio: number;
  tolerance: number;
}> = {
  hero: { minWidth: 1920, minHeight: 800, preferredRatio: 2.4, tolerance: 0.3 },
  'product-main': { minWidth: 800, minHeight: 800, preferredRatio: 1, tolerance: 0.2 },
  'product-thumbnail': { minWidth: 300, minHeight: 300, preferredRatio: 1, tolerance: 0.1 },
  gallery: { minWidth: 600, minHeight: 400, preferredRatio: 1.5, tolerance: 0.5 },
  'blog-featured': { minWidth: 1200, minHeight: 630, preferredRatio: 1.9, tolerance: 0.2 },
  profile: { minWidth: 200, minHeight: 200, preferredRatio: 1, tolerance: 0 },
  icon: { minWidth: 64, minHeight: 64, preferredRatio: 1, tolerance: 0 },
};

async function analyzeImageQuality(
  imageUrl: string,
  targetPlacement?: PlacementType
): Promise<ImageQuality> {
  // Get image dimensions
  const dimensions = await getImageDimensions(imageUrl);
  const aspectRatio = dimensions.width / dimensions.height;
  
  // Determine resolution category
  const totalPixels = dimensions.width * dimensions.height;
  let resolution: 'low' | 'medium' | 'high';
  if (totalPixels < 500000) resolution = 'low';
  else if (totalPixels < 2000000) resolution = 'medium';
  else resolution = 'high';
  
  // Find suitable placements
  const suitableFor: PlacementType[] = [];
  const recommendations: ImageRecommendation[] = [];
  
  for (const [placement, reqs] of Object.entries(PLACEMENT_REQUIREMENTS)) {
    const isSuitable = dimensions.width >= reqs.minWidth &&
                       dimensions.height >= reqs.minHeight;
    
    if (isSuitable) {
      suitableFor.push(placement as PlacementType);
    } else if (placement === targetPlacement) {
      // Needs upscaling for target placement
      const scaleFactor = Math.max(
        reqs.minWidth / dimensions.width,
        reqs.minHeight / dimensions.height
      );
      
      if (scaleFactor <= 4) {
        recommendations.push({
          type: 'upscale',
          reason: `الصورة صغيرة جداً لـ ${getPlacementNameArabic(placement as PlacementType)}`,
          priority: 'required',
          estimatedImprovement: `تكبير ${scaleFactor.toFixed(1)}x`,
        });
      }
    }
    
    // Check aspect ratio for target
    if (placement === targetPlacement) {
      const ratioDiff = Math.abs(aspectRatio - reqs.preferredRatio);
      if (ratioDiff > reqs.tolerance) {
        recommendations.push({
          type: 'crop',
          reason: 'نسبة الأبعاد غير مناسبة',
          priority: 'recommended',
          estimatedImprovement: `اقتصاص لنسبة ${reqs.preferredRatio}:1`,
        });
      }
    }
  }
  
  // Check if enhancement needed
  if (resolution === 'low') {
    recommendations.push({
      type: 'enhance',
      reason: 'جودة الصورة منخفضة',
      priority: 'recommended',
      estimatedImprovement: 'تحسين الوضوح والتفاصيل',
    });
  }
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio,
    resolution,
    suitableFor,
    needsEnhancement: recommendations.length > 0,
    recommendations,
  };
}

function getPlacementNameArabic(placement: PlacementType): string {
  const names: Record<PlacementType, string> = {
    hero: 'البانر الرئيسي',
    'product-main': 'صورة المنتج الرئيسية',
    'product-thumbnail': 'صورة المنتج المصغرة',
    gallery: 'معرض الصور',
    'blog-featured': 'صورة المقال',
    profile: 'الصورة الشخصية',
    icon: 'الأيقونة',
  };
  return names[placement];
}
```

## 1.3 Banana.dev API Integration

```typescript
// lib/banana/client.ts
interface BananaResponse {
  id: string;
  message: string;
  created: number;
  modelOutputs: any[];
}

interface UpscaleOptions {
  scale: 2 | 4;
  faceEnhance?: boolean;
}

interface EnhanceOptions {
  denoise?: boolean;
  sharpen?: boolean;
  colorCorrect?: boolean;
}

class BananaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BANANA_API_KEY!;
    this.baseUrl = 'https://api.banana.dev';
  }

  async upscaleImage(
    imageBase64: string,
    options: UpscaleOptions = { scale: 4 }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/start/v4/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        modelKey: BANANA_MODELS.upscale,
        modelInputs: {
          image: imageBase64,
          scale: options.scale,
          face_enhance: options.faceEnhance || false,
        },
      }),
    });

    const result: BananaResponse = await response.json();
    
    if (!result.modelOutputs?.[0]?.image) {
      throw new Error('Image upscaling failed');
    }

    return result.modelOutputs[0].image; // Base64 result
  }

  async removeBackground(imageBase64: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/start/v4/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        modelKey: BANANA_MODELS.removeBackground,
        modelInputs: {
          image: imageBase64,
        },
      }),
    });

    const result: BananaResponse = await response.json();
    return result.modelOutputs[0].image;
  }

  async enhanceImage(
    imageBase64: string,
    options: EnhanceOptions = {}
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/start/v4/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        modelKey: BANANA_MODELS.enhance,
        modelInputs: {
          image: imageBase64,
          ...options,
        },
      }),
    });

    const result: BananaResponse = await response.json();
    return result.modelOutputs[0].image;
  }

  async adjustForPlacement(
    imageBase64: string,
    placement: PlacementType
  ): Promise<string> {
    const requirements = PLACEMENT_REQUIREMENTS[placement];
    
    // First, get current dimensions
    const dimensions = await getImageDimensionsFromBase64(imageBase64);
    
    // Calculate if upscaling needed
    const scaleX = requirements.minWidth / dimensions.width;
    const scaleY = requirements.minHeight / dimensions.height;
    const scaleNeeded = Math.max(scaleX, scaleY);
    
    let processedImage = imageBase64;
    
    // Upscale if needed (max 4x)
    if (scaleNeeded > 1 && scaleNeeded <= 4) {
      const scale = scaleNeeded <= 2 ? 2 : 4;
      processedImage = await this.upscaleImage(processedImage, { scale });
    }
    
    // Crop to aspect ratio
    const targetRatio = requirements.preferredRatio;
    processedImage = await this.cropToRatio(processedImage, targetRatio);
    
    return processedImage;
  }

  private async cropToRatio(
    imageBase64: string,
    targetRatio: number
  ): Promise<string> {
    // This would use a crop API or local processing
    // For now, return as-is
    return imageBase64;
  }
}

export const bananaClient = new BananaClient();
```

## 1.4 Tier-Based Access Control

```typescript
// lib/image/access-control.ts
interface ImageProcessingResult {
  allowed: boolean;
  processedImage?: string;
  upsellPrompt?: UpsellPrompt;
  creditsUsed?: number;
}

interface UpsellPrompt {
  title: string;
  message: string;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  features: string[];
  ctaText: string;
  ctaUrl: string;
}

async function processImageWithTierCheck(
  userId: string,
  imageBase64: string,
  action: 'upscale' | 'enhance' | 'remove-bg' | 'auto-adjust',
  placement?: PlacementType
): Promise<ImageProcessingResult> {
  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tier = subscription?.tier || 'basic';
  
  // Check if tier allows Banana.dev
  const hasBananaAccess = tier === 'premium' || tier === 'enterprise';
  
  if (!hasBananaAccess) {
    // Return upsell prompt
    return {
      allowed: false,
      upsellPrompt: {
        title: 'ترقية لتحسين الصور بالذكاء الاصطناعي',
        message: 'اشترك في الباقة المميزة للحصول على تحسين الصور التلقائي',
        currentTier: tier,
        requiredTier: 'premium',
        features: [
          'تكبير الصور حتى 4 أضعاف',
          'تحسين جودة الصور تلقائياً',
          'إزالة الخلفية',
          'ضبط الأبعاد للموقع',
        ],
        ctaText: 'ترقية الآن - 59 د.ك/شهر',
        ctaUrl: '/pricing?upgrade=premium',
      },
    };
  }
  
  // Process image
  try {
    let processedImage: string;
    let creditsUsed: number;

    switch (action) {
      case 'upscale':
        processedImage = await bananaClient.upscaleImage(imageBase64, { scale: 4 });
        creditsUsed = 5;
        break;
      case 'enhance':
        processedImage = await bananaClient.enhanceImage(imageBase64);
        creditsUsed = 3;
        break;
      case 'remove-bg':
        processedImage = await bananaClient.removeBackground(imageBase64);
        creditsUsed = 4;
        break;
      case 'auto-adjust':
        if (!placement) throw new Error('Placement required for auto-adjust');
        processedImage = await bananaClient.adjustForPlacement(imageBase64, placement);
        creditsUsed = 6;
        break;
      default:
        throw new Error('Unknown action');
    }

    // Deduct credits
    await deductCredits(userId, creditsUsed, `image_${action}`);

    return {
      allowed: true,
      processedImage,
      creditsUsed,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}
```

## 1.5 Image Upload UI Component

```tsx
// components/builder/ImageUploader.tsx
interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void;
  placement?: PlacementType;
  showQualityCheck?: boolean;
}

export function ImageUploader({
  onUpload,
  placement,
  showQualityCheck = true,
}: ImageUploaderProps) {
  const { subscription } = useSubscription();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQuality | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const hasBananaAccess = subscription?.tier === 'premium' || 
                          subscription?.tier === 'enterprise';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Analyze quality
    if (showQualityCheck) {
      const qualityResult = await analyzeImageQuality(objectUrl, placement);
      setQuality(qualityResult);
    }
  };

  const handleUpload = async (enhance: boolean = false) => {
    if (!file) return;

    setProcessing(true);
    try {
      // Convert to base64
      const base64 = await fileToBase64(file);

      if (enhance && quality?.needsEnhancement) {
        if (!hasBananaAccess) {
          setShowUpsell(true);
          setProcessing(false);
          return;
        }

        // Process with Banana.dev
        const result = await processImageWithTierCheck(
          userId,
          base64,
          'auto-adjust',
          placement
        );

        if (!result.allowed) {
          setShowUpsell(true);
          setProcessing(false);
          return;
        }

        // Upload processed image
        const url = await uploadToStorage(result.processedImage!);
        onUpload(url);
      } else {
        // Upload original
        const url = await uploadToStorage(base64);
        onUpload(url);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center",
          "hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
        )}
        onClick={() => document.getElementById('image-input')?.click()}
      >
        <input
          id="image-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded-lg"
          />
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              اسحب الصورة هنا أو انقر للاختيار
            </p>
          </>
        )}
      </div>

      {/* Quality Analysis */}
      {quality && (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            {quality.needsEnhancement ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <span className="font-medium">
              {quality.needsEnhancement ? 'يمكن تحسين الصورة' : 'جودة الصورة ممتازة'}
            </span>
          </div>

          <div className="text-sm text-muted-foreground mb-3">
            الأبعاد: {quality.width} × {quality.height} بكسل
          </div>

          {quality.recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">التوصيات:</p>
              {quality.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-sm p-2 rounded",
                    rec.priority === 'required' && "bg-red-50 text-red-700",
                    rec.priority === 'recommended' && "bg-yellow-50 text-yellow-700",
                    rec.priority === 'optional' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <span>{rec.reason}</span>
                  <span className="text-xs">({rec.estimatedImprovement})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleUpload(false)}
          disabled={!file || processing}
          className="btn-outline flex-1"
        >
          رفع كما هي
        </button>
        
        {quality?.needsEnhancement && (
          <button
            onClick={() => handleUpload(true)}
            disabled={!file || processing}
            className="btn-primary flex-1"
          >
            {hasBananaAccess ? (
              <>
                <Sparkles className="w-4 h-4 ml-2" />
                تحسين ورفع
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 ml-2" />
                تحسين (مميز)
              </>
            )}
          </button>
        )}
      </div>

      {/* Upsell Modal */}
      <UpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="image-enhancement"
      />
    </div>
  );
}
```

## 1.6 Upsell Modal Component

```tsx
// components/billing/UpsellModal.tsx
interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  feature: 'image-enhancement' | 'extra-credits' | 'free-domain';
}

const UPSELL_CONTENT = {
  'image-enhancement': {
    title: 'ترقية لتحسين الصور بالذكاء الاصطناعي',
    description: 'احصل على صور احترافية لموقعك مع خدمة تحسين الصور',
    icon: '🖼️',
    features: [
      { text: 'تكبير الصور حتى 4 أضعاف دون فقدان الجودة', icon: 'zoom-in' },
      { text: 'تحسين الألوان والوضوح تلقائياً', icon: 'palette' },
      { text: 'إزالة الخلفية بنقرة واحدة', icon: 'scissors' },
      { text: 'ضبط الأبعاد للموقع تلقائياً', icon: 'crop' },
    ],
    tiers: [
      { name: 'مميز', price: 59, recommended: true },
      { name: 'شركات', price: 75, recommended: false },
    ],
  },
  'extra-credits': {
    title: 'هل نفدت نقاطك؟',
    description: 'أضف المزيد من النقاط لمواصلة البناء',
    icon: '⚡',
    features: [
      { text: '100 نقطة إضافية', icon: 'plus' },
      { text: 'لا تنتهي صلاحيتها', icon: 'infinity' },
      { text: 'استخدمها متى شئت', icon: 'clock' },
    ],
    packs: [
      { credits: 100, price: 5 },
      { credits: 500, price: 20 },
      { credits: 1000, price: 35 },
    ],
  },
  'free-domain': {
    title: 'احصل على دومين مجاني',
    description: 'ترقية الباقة تتضمن دومين مجاني لمدة سنة',
    icon: '🌐',
    features: [
      { text: 'دومين مجاني (حتى 15$)', icon: 'globe' },
      { text: 'شهادة SSL مجانية', icon: 'shield' },
      { text: 'ربط تلقائي بموقعك', icon: 'link' },
    ],
    tiers: [
      { name: 'احترافي', price: 38, domains: 1 },
      { name: 'مميز', price: 59, domains: 2 },
      { name: 'شركات', price: 75, domains: 5 },
    ],
  },
};

export function UpsellModal({ open, onClose, feature }: UpsellModalProps) {
  const content = UPSELL_CONTENT[feature];
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <div className="text-center mb-6">
          <span className="text-5xl mb-4 block">{content.icon}</span>
          <DialogTitle className="text-xl font-heading font-bold">
            {content.title}
          </DialogTitle>
          <p className="text-muted-foreground mt-2">{content.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          {content.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>{feat.text}</span>
            </div>
          ))}
        </div>

        {content.tiers && (
          <div className="space-y-3">
            {content.tiers.map((tier, i) => (
              <button
                key={i}
                onClick={() => router.push(`/pricing?plan=${tier.name.toLowerCase()}`)}
                className={cn(
                  "w-full p-4 rounded-lg border text-right transition-all",
                  tier.recommended
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{tier.name}</p>
                    {tier.recommended && (
                      <span className="text-xs text-primary">الأكثر شيوعاً</span>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-bold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground"> د.ك/شهر</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {content.packs && (
          <div className="grid grid-cols-3 gap-3">
            {content.packs.map((pack, i) => (
              <button
                key={i}
                onClick={() => purchaseCreditPack(pack.credits)}
                className="p-4 rounded-lg border hover:border-primary text-center"
              >
                <p className="text-2xl font-bold">{pack.credits}</p>
                <p className="text-sm text-muted-foreground">نقطة</p>
                <p className="text-primary font-bold mt-2">{pack.price} د.ك</p>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-center text-sm text-muted-foreground mt-4"
        >
          لاحقاً
        </button>
      </DialogContent>
    </Dialog>
  );
}
```

---

# PART 2: WHATSAPP BUSINESS INTEGRATION

## OVERVIEW

WhatsApp integration allows users to add a floating chat bubble to their websites. Users provide their WhatsApp number, and the AI generates the integration code.

---

## 2.1 WhatsApp Configuration

```typescript
// lib/whatsapp/config.ts
interface WhatsAppConfig {
  phoneNumber: string;       // International format: +965XXXXXXXX
  defaultMessage?: string;   // Pre-filled message
  position: 'bottom-left' | 'bottom-right';
  showOnMobile: boolean;
  showOnDesktop: boolean;
  delaySeconds?: number;     // Show after X seconds
  hideOnPages?: string[];    // Pages to hide the bubble
}

// Phone number validation for GCC
const GCC_PHONE_PATTERNS: Record<string, RegExp> = {
  KW: /^\+965[0-9]{8}$/,
  SA: /^\+9665[0-9]{8}$/,
  AE: /^\+9715[0-9]{8}$/,
  QA: /^\+974[0-9]{8}$/,
  BH: /^\+973[0-9]{8}$/,
  OM: /^\+968[0-9]{8}$/,
};

function validateGCCPhoneNumber(phone: string): {
  valid: boolean;
  country?: string;
  formatted?: string;
  error?: string;
} {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Add + if missing
  const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  
  // Check against patterns
  for (const [country, pattern] of Object.entries(GCC_PHONE_PATTERNS)) {
    if (pattern.test(withPlus)) {
      return {
        valid: true,
        country,
        formatted: withPlus,
      };
    }
  }
  
  return {
    valid: false,
    error: 'رقم الهاتف غير صحيح. يرجى إدخال رقم دولي صحيح.',
  };
}
```

## 2.2 WhatsApp Link Generator

```typescript
// lib/whatsapp/link-generator.ts
interface WhatsAppLinkOptions {
  phoneNumber: string;
  message?: string;
}

function generateWhatsAppLink(options: WhatsAppLinkOptions): string {
  const { phoneNumber, message } = options;
  
  // Remove + from phone number for URL
  const cleanNumber = phoneNumber.replace('+', '');
  
  let url = `https://wa.me/${cleanNumber}`;
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  
  return url;
}

// Generate complete bubble code
function generateWhatsAppBubbleCode(config: WhatsAppConfig): string {
  const link = generateWhatsAppLink({
    phoneNumber: config.phoneNumber,
    message: config.defaultMessage,
  });
  
  const positionStyles = config.position === 'bottom-right'
    ? 'left: 24px;'
    : 'right: 24px;';

  return `
<!-- WhatsApp Chat Button - KWq8.com -->
<style>
  .kwq8-wa-button {
    position: fixed;
    bottom: 24px;
    ${positionStyles}
    z-index: 9999;
    ${!config.showOnMobile ? '@media (max-width: 768px) { display: none; }' : ''}
    ${!config.showOnDesktop ? '@media (min-width: 769px) { display: none; }' : ''}
  }
  .kwq8-wa-button a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #25D366;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .kwq8-wa-button a:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
  }
  .kwq8-wa-button svg {
    width: 32px;
    height: 32px;
    fill: white;
  }
  ${config.delaySeconds ? `
  .kwq8-wa-button {
    opacity: 0;
    animation: kwq8-wa-fade-in 0.5s ease ${config.delaySeconds}s forwards;
  }
  @keyframes kwq8-wa-fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ` : ''}
</style>

<div class="kwq8-wa-button" id="kwq8-whatsapp-button">
  <a href="${link}" target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر واتساب">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>
</div>

${config.hideOnPages?.length ? `
<script>
  (function() {
    var hiddenPages = ${JSON.stringify(config.hideOnPages)};
    var currentPath = window.location.pathname;
    if (hiddenPages.some(function(page) { return currentPath.includes(page); })) {
      document.getElementById('kwq8-whatsapp-button').style.display = 'none';
    }
  })();
</script>
` : ''}
<!-- End WhatsApp Chat Button -->
`;
}
```

## 2.3 WhatsApp Configuration UI

```tsx
// components/builder/WhatsAppConfig.tsx
export function WhatsAppConfig() {
  const { projectId } = useProject();
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumber: '',
    defaultMessage: 'مرحباً، أريد الاستفسار عن...',
    position: 'bottom-left', // RTL default
    showOnMobile: true,
    showOnDesktop: true,
    delaySeconds: 3,
    hideOnPages: [],
  });
  const [validation, setValidation] = useState<{
    valid: boolean;
    error?: string;
    country?: string;
  }>({ valid: false });
  const [saved, setSaved] = useState(false);

  const handlePhoneChange = (value: string) => {
    setConfig({ ...config, phoneNumber: value });
    const result = validateGCCPhoneNumber(value);
    setValidation(result);
  };

  const handleSave = async () => {
    if (!validation.valid) {
      toast.error('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    try {
      // Generate the code
      const code = generateWhatsAppBubbleCode({
        ...config,
        phoneNumber: validation.formatted!,
      });

      // Save to project
      await supabase
        .from('project_integrations')
        .upsert({
          project_id: projectId,
          type: 'whatsapp',
          config,
          code,
          enabled: true,
        });

      // Trigger code injection into project
      await injectWhatsAppCode(projectId, code);

      setSaved(true);
      toast.success('تم إضافة زر واتساب بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg">زر واتساب</h2>
          <p className="text-sm text-muted-foreground">
            أضف زر تواصل واتساب لموقعك
          </p>
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium mb-2">
          رقم واتساب <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={config.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+965 XXXX XXXX"
            className={cn(
              "input pr-10 text-left",
              validation.valid && "border-green-500",
              !validation.valid && config.phoneNumber && "border-red-500"
            )}
            dir="ltr"
          />
        </div>
        {validation.error && (
          <p className="text-sm text-red-500 mt-1">{validation.error}</p>
        )}
        {validation.country && (
          <p className="text-sm text-green-600 mt-1">
            ✓ رقم {getCountryName(validation.country)} صحيح
          </p>
        )}
      </div>

      {/* Default Message */}
      <div>
        <label className="block text-sm font-medium mb-2">
          رسالة ترحيبية (اختياري)
        </label>
        <textarea
          value={config.defaultMessage}
          onChange={(e) => setConfig({ ...config, defaultMessage: e.target.value })}
          placeholder="الرسالة التي ستظهر عند فتح المحادثة"
          className="input"
          rows={2}
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium mb-2">موضع الزر</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={config.position === 'bottom-left'}
              onChange={() => setConfig({ ...config, position: 'bottom-left' })}
            />
            <span>أسفل اليسار</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={config.position === 'bottom-right'}
              onChange={() => setConfig({ ...config, position: 'bottom-right' })}
            />
            <span>أسفل اليمين</span>
          </label>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">خيارات العرض</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showOnMobile}
            onChange={(e) => setConfig({ ...config, showOnMobile: e.target.checked })}
          />
          <span>إظهار على الجوال</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showOnDesktop}
            onChange={(e) => setConfig({ ...config, showOnDesktop: e.target.checked })}
          />
          <span>إظهار على الكمبيوتر</span>
        </label>
      </div>

      {/* Delay */}
      <div>
        <label className="block text-sm font-medium mb-2">
          تأخير الظهور (ثواني)
        </label>
        <input
          type="number"
          min="0"
          max="30"
          value={config.delaySeconds || 0}
          onChange={(e) => setConfig({
            ...config,
            delaySeconds: parseInt(e.target.value) || 0
          })}
          className="input w-24"
        />
      </div>

      {/* Preview */}
      <div className="bg-muted rounded-lg p-6 relative h-48">
        <p className="text-sm text-muted-foreground mb-2">معاينة:</p>
        <div
          className={cn(
            "absolute bottom-4",
            config.position === 'bottom-left' ? 'left-4' : 'right-4'
          )}
        >
          <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!validation.valid}
        className="btn-primary w-full"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 ml-2" />
            تم الحفظ
          </>
        ) : (
          'حفظ وتفعيل'
        )}
      </button>
    </div>
  );
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    KW: 'الكويت',
    SA: 'السعودية',
    AE: 'الإمارات',
    QA: 'قطر',
    BH: 'البحرين',
    OM: 'عمان',
  };
  return names[code] || code;
}
```

---

# PART 3: DATABASE SCHEMA

```sql
-- Project integrations table
CREATE TABLE IF NOT EXISTS project_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  type TEXT NOT NULL, -- 'whatsapp', 'analytics', 'chat', etc.
  config JSONB NOT NULL,
  code TEXT, -- Generated code snippet
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, type)
);

-- Image processing history (for credits tracking)
CREATE TABLE IF NOT EXISTS image_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  original_url TEXT NOT NULL,
  processed_url TEXT,
  action TEXT NOT NULL, -- 'upscale', 'enhance', 'remove-bg', 'auto-adjust'
  options JSONB,
  credits_used INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_project_integrations_project ON project_integrations(project_id);
CREATE INDEX idx_project_integrations_type ON project_integrations(type);
CREATE INDEX idx_image_processing_user ON image_processing_log(user_id);
CREATE INDEX idx_image_processing_created ON image_processing_log(created_at DESC);

-- RLS Policies
ALTER TABLE project_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_processing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project integrations"
  ON project_integrations FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their image processing history"
  ON image_processing_log FOR SELECT
  USING (user_id = auth.uid());
```

---

# PART 4: CREDIT COSTS

| Feature | Action | Credits |
|---------|--------|---------|
| **Image Upscale** | 2x | 3 |
| **Image Upscale** | 4x | 5 |
| **Image Enhance** | Quality improvement | 3 |
| **Remove Background** | Background removal | 4 |
| **Auto-Adjust** | Placement optimization | 6 |
| **WhatsApp Setup** | Initial configuration | 0 (FREE) |
| **WhatsApp Update** | Change settings | 0 (FREE) |

---

# PART 5: TIER ACCESS MATRIX

| Feature | Basic (23) | Pro (38) | Premium (59) | Enterprise (75) |
|---------|------------|----------|--------------|-----------------|
| Image Upload | ✅ | ✅ | ✅ | ✅ |
| Quality Warning | ✅ | ✅ | ✅ | ✅ |
| AI Upscale | ❌ | ❌ | ✅ | ✅ |
| AI Enhance | ❌ | ❌ | ✅ | ✅ |
| Remove Background | ❌ | ❌ | ✅ | ✅ |
| Auto-Adjust | ❌ | ❌ | ✅ | ✅ |
| WhatsApp Bubble | ✅ | ✅ | ✅ | ✅ |
| Multiple WhatsApp | ❌ | ❌ | ✅ | ✅ |

---

**Version:** 1.0  
**Last Updated:** December 27, 2025  
**Status:** Ready for Implementation
