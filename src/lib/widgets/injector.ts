/**
 * Widget Injection System
 *
 * Injects widget code into generated projects
 * Supports: WhatsApp, Analytics, Custom scripts
 */

import { createClient } from '@supabase/supabase-js'
import { WhatsAppWidgetConfig } from '@/components/domains/WhatsAppWidgetConfig'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class WidgetInjector {
  /**
   * Generate WhatsApp widget code
   */
  generateWhatsAppWidget(config: WhatsAppWidgetConfig): string {
    const whatsappLink = `https://wa.me/${config.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(config.welcomeMessage)}`

    const positionStyles = {
      'bottom-left': 'bottom: 20px; right: 20px;', // RTL: right is start
      'bottom-right': 'bottom: 20px; left: 20px;',
      'top-left': 'top: 20px; right: 20px;',
      'top-right': 'top: 20px; left: 20px;',
    }

    return `
<!-- WhatsApp Widget -->
<div id="whatsapp-widget" style="position: fixed; ${positionStyles[config.position]} z-index: 9999;">
  <a
    href="${whatsappLink}"
    target="_blank"
    rel="noopener noreferrer"
    style="
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: ${config.primaryColor};
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    "
    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)';"
    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span>${config.buttonText}</span>
  </a>
</div>

${config.workingHours?.enabled ? `
<script>
  (function() {
    const widget = document.getElementById('whatsapp-widget');
    const workingHours = {
      start: '${config.workingHours.start}',
      end: '${config.workingHours.end}',
      timezone: '${config.workingHours.timezone}'
    };

    function isWorkingHours() {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour * 60 + minute;

      const [startHour, startMin] = workingHours.start.split(':').map(Number);
      const [endHour, endMin] = workingHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      return currentTime >= startTime && currentTime <= endTime;
    }

    if (!isWorkingHours() && widget) {
      widget.style.display = 'none';
    }
  })();
</script>
` : ''}
`.trim()
  }

  /**
   * Inject widget code into project
   */
  async injectWidget(
    projectId: string,
    widgetCode: string,
    widgetType: 'whatsapp' | 'analytics' | 'custom'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Get project's generated code
      const { data: project } = await supabase
        .from('projects')
        .select('generated_code, status')
        .eq('id', projectId)
        .single()

      if (!project || !project.generated_code) {
        throw new Error('Project code not found')
      }

      // 2. Find </body> tag
      const bodyCloseIndex = project.generated_code.lastIndexOf('</body>')

      if (bodyCloseIndex === -1) {
        throw new Error('</body> tag not found in code')
      }

      // 3. Insert widget code before </body>
      const updatedCode =
        project.generated_code.slice(0, bodyCloseIndex) +
        '\n' +
        widgetCode +
        '\n' +
        project.generated_code.slice(bodyCloseIndex)

      // 4. Save updated code
      await supabase
        .from('projects')
        .update({
          generated_code: updatedCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      // 5. Save widget configuration
      await supabase.from('project_widgets').upsert({
        project_id: projectId,
        widget_type: widgetType,
        widget_code: widgetCode,
        is_enabled: true,
      })

      // 6. Redeploy if project is published
      if (project.status === 'deployed') {
        await this.triggerRedeployment(projectId)
      }

      console.log(`✅ ${widgetType} widget injected into project ${projectId}`)

      return { success: true }
    } catch (error: any) {
      console.error('Widget injection error:', error)
      return {
        success: false,
        error: error.message || 'Injection failed',
      }
    }
  }

  /**
   * Remove widget from project
   */
  async removeWidget(
    projectId: string,
    widgetType: string
  ): Promise<{ success: boolean }> {
    try {
      // Disable widget
      await supabase
        .from('project_widgets')
        .update({ is_enabled: false })
        .eq('project_id', projectId)
        .eq('widget_type', widgetType)

      // Note: Code removal would require regenerating or manual edit
      // For simplicity, just disable in database

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  /**
   * Trigger redeployment to apply widget changes
   */
  private async triggerRedeployment(projectId: string): Promise<void> {
    // Queue redeployment task
    await supabase.from('deployment_queue').insert({
      project_id: projectId,
      reason: 'widget_update',
      scheduled_for: new Date().toISOString(),
    })
  }
}

// Singleton
export const widgetInjector = new WidgetInjector()
