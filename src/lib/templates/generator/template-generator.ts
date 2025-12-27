/**
 * Template Generation Pipeline
 *
 * Generates customized websites from templates using DeepSeek AI
 * Flow: Load Template → Apply Customizations → Generate Code → Validate
 */

import { createClient } from '@supabase/supabase-js'
import { Template, TemplateCustomization } from '../types'
import { getTemplateBySlug } from '../registry'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface GenerationResult {
  success: boolean
  projectId?: string
  generatedCode?: string
  previewUrl?: string
  adminUrl?: string
  creditsUsed: number
  error?: string
}

export class TemplateGenerator {
  /**
   * Generate website from template with user customizations
   */
  async generate(
    templateSlug: string,
    customization: TemplateCustomization,
    userId: string
  ): Promise<GenerationResult> {
    try {
      // 1. Load template definition
      const template = getTemplateBySlug(templateSlug)
      if (!template) {
        throw new Error(`Template not found: ${templateSlug}`)
      }

      // 2. Check user credits
      const hasCredits = await this.checkUserCredits(userId, template.creditsToCustomize)
      if (!hasCredits) {
        throw new Error('Insufficient credits')
      }

      // 3. Create project record
      const { data: project } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: customization.basicInfo.businessName,
          template_id: template.id,
          customizations: customization,
          from_template: true,
          status: 'generating',
        })
        .select()
        .single()

      if (!project) {
        throw new Error('Failed to create project')
      }

      // 4. Create template usage record
      const { data: usage } = await supabase
        .from('template_usage')
        .insert({
          template_id: template.id,
          user_id: userId,
          project_id: project.id,
          customizations: customization,
          credits_used: template.creditsToCustomize,
          status: 'generating',
        })
        .select()
        .single()

      // 5. Build structured prompt for DeepSeek
      const prompt = this.buildPrompt(template, customization)

      // 6. Generate code with DeepSeek
      const startTime = Date.now()

      const response = await fetch('/api/templates/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          customization,
          prompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Code generation failed')
      }

      const { code } = await response.json()
      const generationTime = Math.round((Date.now() - startTime) / 1000)

      // 7. Save generated code
      await supabase
        .from('projects')
        .update({
          generated_code: code,
          english_prompt: `Template: ${template.nameEn}`,
          arabic_prompt: `قالب: ${template.nameAr}`,
          status: 'preview',
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      // 8. Update usage record
      await supabase
        .from('template_usage')
        .update({
          status: 'completed',
          generation_time_seconds: generationTime,
          completed_at: new Date().toISOString(),
        })
        .eq('id', usage.id)

      // 9. Deduct credits
      await this.deductCredits(userId, template.creditsToCustomize, project.id)

      // 10. Generate admin dashboard
      const adminUrl = await this.generateAdminDashboard(project.id, template)

      return {
        success: true,
        projectId: project.id,
        generatedCode: code,
        previewUrl: `/builder/${project.id}/preview`,
        adminUrl,
        creditsUsed: template.creditsToCustomize,
      }
    } catch (error: any) {
      console.error('Template generation error:', error)
      return {
        success: false,
        creditsUsed: 0,
        error: error.message || 'Generation failed',
      }
    }
  }

  /**
   * Build DeepSeek prompt from template and customizations
   */
  private buildPrompt(
    template: Template,
    customization: TemplateCustomization
  ): string {
    const { basicInfo, content, colorScheme, enabledSections } = customization

    return `
# توليد موقع من قالب: ${template.nameAr}

## معلومات النشاط:
- الاسم: ${basicInfo.businessName}
- الهاتف: ${basicInfo.phone}
- البريد: ${basicInfo.email}
- الدولة: ${basicInfo.country}

## نظام الألوان:
${colorScheme.preset ? `- نظام الألوان: ${colorScheme.preset}` : ''}
${colorScheme.custom ? `- ألوان مخصصة: ${JSON.stringify(colorScheme.custom)}` : ''}

## المحتوى:
${Object.entries(content).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## الأقسام المفعلة:
${enabledSections.join(', ')}

## التعليمات:
1. استخدم قالب "${template.nameAr}" كأساس
2. طبّق التخصيصات المذكورة أعلاه
3. احتفظ بالبنية العامة للقالب
4. استخدم المكونات: ${template.componentsUsed.join(', ')}
5. اضمن RTL كامل والتوافق مع العربية
6. استخدم Tailwind CSS فقط للتنسيق

## المميزات المطلوبة:
${template.features.map((f) => `- ${f.nameAr}`).join('\n')}

أنشئ كود Next.js كامل وجاهز للنشر.
`
  }

  /**
   * Check if user has enough credits
   */
  private async checkUserCredits(userId: string, required: number): Promise<boolean> {
    const { data } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', userId)
      .single()

    if (!data) return false

    const available = (data.total_credits || 0) - (data.used_credits || 0)
    return available >= required
  }

  /**
   * Deduct credits from user account
   */
  private async deductCredits(userId: string, amount: number, projectId: string): Promise<void> {
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      transaction_type: 'debit',
      credits: -amount,
      description: `Template customization`,
      metadata: { project_id: projectId, source: 'template_generation' },
    })

    await supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
    })
  }

  /**
   * Generate admin dashboard for template-based project
   */
  private async generateAdminDashboard(
    projectId: string,
    template: Template
  ): Promise<string> {
    // Check if template has admin features
    const hasProducts = template.features.some((f) => f.id === 'products')
    const hasBooking = template.features.some((f) => f.id === 'booking' || f.id === 'reservations')
    const hasBlog = template.features.some((f) => f.id === 'blog' || f.id === 'news')

    if (!hasProducts && !hasBooking && !hasBlog) {
      // No admin dashboard needed for simple templates
      return ''
    }

    // Placeholder - will be implemented in Phase 4
    return `/admin/project/${projectId}`
  }
}

// Singleton instance
export const templateGenerator = new TemplateGenerator()
