/**
 * Prompt Constructor for DeepSeek
 *
 * Constructs structured, detailed prompts for DeepSeek based on
 * detected parameters from Gemini analysis.
 *
 * Takes the output from parameter-detector and formats it into
 * an optimal prompt for high-quality code generation.
 */

import type { DetectedParameters } from './parameter-detector'
import type { GeminiPlan } from './types'

/**
 * Construct enhanced prompt for DeepSeek from detected parameters
 */
export interface ConstructedPrompt {
  /** Enhanced English prompt for DeepSeek */
  englishPrompt: string

  /** Original + enhanced Arabic prompt */
  arabicPrompt: string

  /** Structured sections for reference */
  sections: {
    businessContext: string
    functionalRequirements: string
    designGuidelines: string
    technicalRequirements: string
    validationCriteria: string
  }

  /** Estimated complexity (affects token allocation) */
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced'

  /** Cost estimate in USD */
  estimatedCost: number
}

/**
 * Construct a prompt from detected parameters
 */
export function constructPrompt(
  originalPrompt: string,
  parameters: DetectedParameters,
  plan?: GeminiPlan
): ConstructedPrompt {
  // Build business context section
  const businessContext = buildBusinessContext(parameters)

  // Build functional requirements
  const functionalRequirements = buildFunctionalRequirements(parameters, plan)

  // Build design guidelines
  const designGuidelines = buildDesignGuidelines(parameters, plan)

  // Build technical requirements
  const technicalRequirements = buildTechnicalRequirements(parameters)

  // Build validation criteria
  const validationCriteria = buildValidationCriteria(parameters)

  // Determine complexity
  const complexity = determineComplexity(parameters, plan)

  // Construct final English prompt
  const englishPrompt = `
# Website Generation Request

## Original Request
${originalPrompt}

${businessContext}

${functionalRequirements}

${designGuidelines}

${technicalRequirements}

${validationCriteria}

Please generate a complete, production-ready React component following all the requirements above.
`.trim()

  // Construct enhanced Arabic prompt
  const arabicPrompt = `
# طلب إنشاء موقع ويب

## الطلب الأصلي
${originalPrompt}

${businessContext}

${functionalRequirements}

${designGuidelines}

${technicalRequirements}

${validationCriteria}

يرجى إنشاء مكون React كامل وجاهز للإنتاج مع اتباع جميع المتطلبات أعلاه.
`.trim()

  // Calculate cost estimate
  const estimatedCost = calculateCostEstimate(complexity, parameters)

  return {
    englishPrompt,
    arabicPrompt,
    sections: {
      businessContext,
      functionalRequirements,
      designGuidelines,
      technicalRequirements,
      validationCriteria,
    },
    complexity,
    estimatedCost,
  }
}

/**
 * Build business context section
 */
function buildBusinessContext(params: DetectedParameters): string {
  if (!params.businessType) return ''

  let context = `## Business Context / السياق التجاري

**Business Type**: ${params.businessType.label_ar} (${params.businessType.type})
`

  if (params.services?.items.length) {
    context += `**Services Offered**: ${params.services.items.join(', ')}\n`
  }

  if (params.context?.targetAudience) {
    context += `**Target Audience**: ${params.context.targetAudience}\n`
  }

  if (params.context?.brandName) {
    context += `**Brand Name**: ${params.context.brandName}\n`
  }

  return context
}

/**
 * Build functional requirements section
 */
function buildFunctionalRequirements(
  params: DetectedParameters,
  plan?: GeminiPlan
): string {
  let requirements = `## Functional Requirements / المتطلبات الوظيفية\n`

  // Features from parameters
  if (params.functionality?.features.length) {
    requirements += `\n**Core Features**:\n`
    params.functionality.features.forEach((feature) => {
      requirements += `- ${feature}\n`
    })
  }

  // Integrations
  if (params.functionality?.integrations?.length) {
    requirements += `\n**Integrations Required**:\n`
    params.functionality.integrations.forEach((integration) => {
      requirements += `- ${integration}\n`
    })
  }

  // Sections from plan
  if (plan?.sections.length) {
    requirements += `\n**Page Sections** (in order):\n`
    plan.sections
      .sort((a, b) => a.order - b.order)
      .forEach((section) => {
        const essential = section.essential ? ' **[ESSENTIAL]**' : ''
        requirements += `${section.order}. **${section.name}** (${section.type})${essential}\n`
        requirements += `   ${section.description}\n`
      })
  }

  return requirements
}

/**
 * Build design guidelines section
 */
function buildDesignGuidelines(
  params: DetectedParameters,
  plan?: GeminiPlan
): string {
  let guidelines = `## Design Guidelines / إرشادات التصميم\n`

  // RTL requirement (ALWAYS for Arabic)
  guidelines += `\n**Layout Direction**: RTL (Right-to-Left) - MANDATORY\n`
  guidelines += `- All text must align right\n`
  guidelines += `- Use \`dir="rtl"\` on root element\n`
  guidelines += `- Use Tailwind RTL utilities (mr, pr, flex-row-reverse)\n`

  // Typography
  guidelines += `\n**Typography**:\n`
  guidelines += `- Primary font: **Cairo** (already loaded globally)\n`
  guidelines += `- Use \`font-cairo\` class for all Arabic text\n`
  if (params.styling?.fonts?.length) {
    guidelines += `- Additional fonts: ${params.styling.fonts.join(', ')}\n`
  }

  // Color scheme
  if (params.styling?.colors || plan?.colorScheme) {
    guidelines += `\n**Color Scheme**:\n`
    const colors = params.styling?.colors || plan?.colorScheme
    if (colors?.primary) {
      guidelines += `- Primary: ${colors.primary}\n`
    }
    if (colors?.secondary) {
      guidelines += `- Secondary: ${colors.secondary}\n`
    }
    if ((colors as any)?.accent) {
      guidelines += `- Accent: ${(colors as any).accent}\n`
    }
    if ((colors as any)?.theme) {
      guidelines += `- Theme: ${(colors as any).theme}\n`
    }
  }

  // Aesthetic
  if (params.styling?.aesthetic) {
    guidelines += `\n**Aesthetic**: ${params.styling.aesthetic}\n`
    guidelines += `- Design should feel ${params.styling.aesthetic}\n`
    guidelines += `- Avoid generic AI slop aesthetics\n`
    guidelines += `- Create unique, intentional visual identity\n`
  }

  // Copy hints from plan
  if (plan?.copyHints) {
    guidelines += `\n**Suggested Copy**:\n`
    if (plan.copyHints.headline) {
      guidelines += `- Headline: "${plan.copyHints.headline}"\n`
    }
    if (plan.copyHints.subheadline) {
      guidelines += `- Subheadline: "${plan.copyHints.subheadline}"\n`
    }
    if (plan.copyHints.ctaText) {
      guidelines += `- CTA Button: "${plan.copyHints.ctaText}"\n`
    }
  }

  return guidelines
}

/**
 * Build technical requirements section
 */
function buildTechnicalRequirements(params: DetectedParameters): string {
  let requirements = `## Technical Requirements / المتطلبات التقنية

**Framework**: React with TypeScript

**Styling**: Tailwind CSS ONLY (no CSS modules, no styled-components)

**State Management**:
- Use \`React.useState\`, \`React.useEffect\`, etc. (NOT separate imports)
- Example: \`const [state, setState] = React.useState(0)\`

**Icons**: Lucide React (\`lucide-react\`)

**Components**:
- Single default export
- Functional components with hooks
- TypeScript types for all props
- Responsive design (mobile-first: sm:, md:, lg:)

**Accessibility**:
- Proper ARIA labels (in Arabic)
- Keyboard navigation support
- Focus states on interactive elements
- Semantic HTML elements

**Performance**:
- Lazy load images
- Optimize animations (Framer Motion if needed)
- Minimize re-renders
`

  if (params.language?.primary === 'both') {
    requirements += `\n**Bilingual Support**:\n`
    requirements += `- Provide both Arabic and English versions of text\n`
    requirements += `- Use language toggle if needed\n`
  }

  return requirements
}

/**
 * Build validation criteria section
 */
function buildValidationCriteria(params: DetectedParameters): string {
  return `## Validation Criteria / معايير التحقق

Before completing, ensure:

✅ **RTL Compliance**:
- \`dir="rtl"\` is set on root element
- All text uses \`text-right\` or appropriate RTL classes
- Margins/padding use RTL-compatible classes (mr, pr, not ml, pl)
- Flex/grid layouts work correctly in RTL

✅ **Arabic Rendering**:
- All Arabic text uses Cairo font (\`font-cairo\`)
- Arabic text is clear and readable
- No broken Arabic characters
- Proper line height for Arabic text

✅ **Functionality**:
- All required features are implemented
- Interactive elements work correctly
- Forms validate properly (if applicable)
- Buttons have proper click handlers

✅ **Responsive Design**:
- Mobile-first approach (min-width: 375px)
- Touch targets ≥44px for mobile
- Responsive breakpoints (sm, md, lg, xl)
- No horizontal scroll on mobile

✅ **No Console Errors**:
- No TypeScript errors
- No React warnings
- No runtime errors
- Clean console output

✅ **Aesthetic Quality**:
- Unique visual identity (not generic AI slop)
- Intentional color choices
- Proper spacing and hierarchy
- High-quality, polished appearance
`
}

/**
 * Determine complexity level based on parameters
 */
function determineComplexity(
  params: DetectedParameters,
  plan?: GeminiPlan
): 'simple' | 'moderate' | 'complex' | 'advanced' {
  let score = 0

  // Business type complexity
  const complexBusinessTypes = ['ecommerce', 'saas', 'booking', 'dashboard']
  if (
    params.businessType &&
    complexBusinessTypes.includes(params.businessType.type)
  ) {
    score += 2
  }

  // Number of features
  if (params.functionality?.features) {
    score += Math.min(params.functionality.features.length * 0.5, 3)
  }

  // Integrations
  if (params.functionality?.integrations?.length) {
    score += params.functionality.integrations.length * 0.5
  }

  // Number of sections
  if (plan?.sections) {
    score += Math.min(plan.sections.length * 0.3, 2)
  }

  // Custom styling
  if (params.styling?.colors || params.styling?.aesthetic) {
    score += 1
  }

  // Bilingual
  if (params.language?.primary === 'both') {
    score += 1.5
  }

  // Map score to complexity
  if (score < 3) return 'simple'
  if (score < 6) return 'moderate'
  if (score < 10) return 'complex'
  return 'advanced'
}

/**
 * Calculate cost estimate in USD
 * Based on DeepSeek pricing: ~$0.14-$0.28 per 1M tokens
 */
function calculateCostEstimate(
  complexity: string,
  params: DetectedParameters
): number {
  // Token estimates by complexity
  const tokenEstimates = {
    simple: 5000, // ~$0.001
    moderate: 15000, // ~$0.003
    complex: 30000, // ~$0.006
    advanced: 50000, // ~$0.010
  }

  const baseTokens = tokenEstimates[complexity as keyof typeof tokenEstimates]

  // Adjust for pipeline stages
  // Translation (10%) + Generation (50%) + RTL Fix (20%) + Security (20%)
  const totalTokens = baseTokens * 1.0

  // DeepSeek average cost: $0.21 per 1M tokens
  const costPerToken = 0.21 / 1_000_000

  const estimatedCost = totalTokens * costPerToken

  // Target: ~$0.031 per generation
  // This estimate should be close to that target
  return Math.round(estimatedCost * 1000) / 1000 // Round to 3 decimals
}

/**
 * Calculate confidence score for prompt quality
 * Higher confidence = better parameter coverage
 */
export function calculatePromptConfidence(
  params: DetectedParameters
): {
  score: number // 0-1
  analysis: {
    businessContextScore: number
    functionalityScore: number
    designScore: number
    languageScore: number
  }
} {
  const weights = {
    businessContext: 0.3,
    functionality: 0.3,
    design: 0.25,
    language: 0.15,
  }

  // Business context score
  let businessContextScore = 0
  if (params.businessType) businessContextScore += 0.6
  if (params.services?.items.length) businessContextScore += 0.2
  if (params.context?.targetAudience) businessContextScore += 0.1
  if (params.context?.brandName) businessContextScore += 0.1

  // Functionality score
  let functionalityScore = 0
  if (params.functionality?.features.length) {
    functionalityScore += Math.min(
      0.6,
      params.functionality.features.length * 0.15
    )
  }
  if (params.functionality?.integrations?.length) {
    functionalityScore += Math.min(
      0.4,
      params.functionality.integrations.length * 0.2
    )
  }

  // Design score
  let designScore = 0
  if (params.styling?.colors) designScore += 0.4
  if (params.styling?.aesthetic) designScore += 0.3
  if (params.styling?.fonts?.length) designScore += 0.2
  if (params.styling && params.styling.confidence > 0.7) designScore += 0.1

  // Language score
  let languageScore = params.language?.confidence || 0.5

  // Calculate weighted score
  const score =
    businessContextScore * weights.businessContext +
    functionalityScore * weights.functionality +
    designScore * weights.design +
    languageScore * weights.language

  return {
    score,
    analysis: {
      businessContextScore,
      functionalityScore,
      designScore,
      languageScore,
    },
  }
}
