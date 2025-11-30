/**
 * KW APPS Multi-Agent System - Base Agent Class
 *
 * Abstract base class that all specialized agents extend.
 * Provides core functionality for communication, state management,
 * decision recording, and metrics tracking.
 */

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AgentType,
  AgentTask,
  AgentMessage,
  MessageType,
  MessageSender,
  TaskStatus,
  AgentConfig,
  AGENT_CONFIGS,
} from './types'

export abstract class BaseAgent {
  protected agentType: AgentType
  protected config: Partial<AgentConfig>

  constructor(agentType: AgentType) {
    this.agentType = agentType
    this.config = this.getConfig()
  }

  /**
   * Main entry point for task execution
   * Must be implemented by each specialized agent
   */
  abstract executeTask(task: AgentTask): Promise<any>

  /**
   * Get agent configuration
   */
  protected getConfig(): Partial<AgentConfig> {
    // Import AGENT_CONFIGS dynamically to avoid circular dependencies
    const configs = {
      chief: {
        agentType: 'chief' as AgentType,
        model: 'deepseek-chat' as const,
        maxTokens: 4000,
        temperature: 0.7,
        capabilities: ['planning', 'delegation', 'approval', 'conflict_resolution'],
        permissions: {
          canCreateProjects: false,
          canModifyCode: false,
          canDeploy: false,
          canAccessDatabase: true,
          requiresApproval: false,
        },
      },
      design: {
        agentType: 'design' as AgentType,
        model: 'deepseek-chat' as const,
        maxTokens: 3000,
        temperature: 0.8,
        capabilities: ['ui_spec', 'arabic_content', 'brand_validation'],
        permissions: {
          canCreateProjects: false,
          canModifyCode: false,
          canDeploy: false,
          canAccessDatabase: false,
          requiresApproval: true,
        },
      },
      dev: {
        agentType: 'dev' as AgentType,
        model: 'deepseek-coder' as const,
        maxTokens: 8000,
        temperature: 0.3,
        capabilities: ['code_generation', 'testing', 'refactoring'],
        permissions: {
          canCreateProjects: true,
          canModifyCode: true,
          canDeploy: false,
          canAccessDatabase: true,
          requiresApproval: true,
        },
      },
      ops: {
        agentType: 'ops' as AgentType,
        model: 'deepseek-chat' as const,
        maxTokens: 2000,
        temperature: 0.5,
        capabilities: ['deployment', 'monitoring', 'integration'],
        permissions: {
          canCreateProjects: false,
          canModifyCode: false,
          canDeploy: true,
          canAccessDatabase: false,
          requiresApproval: true,
        },
      },
      guard: {
        agentType: 'guard' as AgentType,
        model: 'deepseek-chat' as const,
        maxTokens: 3000,
        temperature: 0.2,
        capabilities: ['security_scan', 'rtl_validation', 'quality_check'],
        permissions: {
          canCreateProjects: false,
          canModifyCode: false,
          canDeploy: false,
          canAccessDatabase: false,
          requiresApproval: false,
        },
      },
    }
    return configs[this.agentType]
  }

  /**
   * Get Supabase client
   */
  protected async getSupabase(): Promise<SupabaseClient> {
    return await createClient()
  }

  // =====================================================
  // MESSAGING METHODS
  // =====================================================

  /**
   * Send message to another agent or broadcast
   */
  protected async sendMessage(params: {
    sessionId: string
    toAgent?: MessageSender
    messageType: MessageType
    content: string
    priority?: number
    metadata?: Record<string, any>
  }): Promise<string> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .insert({
        session_id: params.sessionId,
        from_agent: this.agentType,
        to_agent: params.toAgent || null,
        message_type: params.messageType,
        content: params.content,
        priority: params.priority ?? this.getDefaultPriority(params.messageType),
        metadata: params.metadata || {},
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get default priority for message type
   */
  private getDefaultPriority(messageType: MessageType): number {
    const priorities: Record<MessageType, number> = {
      ERROR_REPORT: 10,
      REQUEST_APPROVAL: 8,
      USER_MESSAGE: 7,
      TASK_DELEGATION: 5,
      STATUS_UPDATE: 3,
      DIRECT_MESSAGE: 2,
      BROADCAST_UPDATE: 1,
    }
    return priorities[messageType] || 0
  }

  /**
   * Get unread messages for this agent
   */
  protected async getUnreadMessages(sessionId: string): Promise<AgentMessage[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)
      .or(`to_agent.eq.${this.agentType},to_agent.is.null`)
      .is('read_at', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    return data || []
  }

  /**
   * Mark message as read
   */
  protected async markMessageAsRead(messageId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('agent_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)

    if (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`)
    }
  }

  // =====================================================
  // TASK MANAGEMENT METHODS
  // =====================================================

  /**
   * Update task status
   */
  protected async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    outputData?: Record<string, any>,
    errorDetails?: string
  ): Promise<void> {
    const supabase = await this.getSupabase()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'in_progress' && !outputData) {
      updateData.started_at = new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      if (outputData) {
        updateData.output_data = outputData
      }
    }

    if (status === 'failed' && errorDetails) {
      updateData.error_details = errorDetails
    }

    const { error } = await supabase
      .from('agent_tasks')
      .update(updateData)
      .eq('id', taskId)

    if (error) {
      throw new Error(`Failed to update task status: ${error.message}`)
    }
  }

  /**
   * Create a new sub-task
   */
  protected async createSubTask(params: {
    sessionId: string
    agentType: AgentType
    taskType: string
    description: string
    priority?: number
    assignedBy?: string
    dependsOn?: string[]
    inputData?: Record<string, any>
  }): Promise<string> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_tasks')
      .insert({
        session_id: params.sessionId,
        agent_type: params.agentType,
        task_type: params.taskType,
        description: params.description,
        status: 'pending',
        priority: params.priority ?? 0,
        assigned_by: params.assignedBy,
        depends_on: params.dependsOn || [],
        input_data: params.inputData || {},
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create sub-task: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get task by ID
   */
  protected async getTask(taskId: string): Promise<AgentTask | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch task: ${error.message}`)
    }

    return data
  }

  // =====================================================
  // DECISION RECORDING METHODS
  // =====================================================

  /**
   * Record a decision made by this agent
   */
  protected async recordDecision(params: {
    sessionId: string
    taskId?: string
    decisionType: string
    decision: string
    reasoning: string
    alternatives?: string[]
  }): Promise<string> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_decisions')
      .insert({
        session_id: params.sessionId,
        task_id: params.taskId,
        decision_type: params.decisionType,
        made_by: this.agentType,
        decision: params.decision,
        reasoning: params.reasoning,
        alternatives_considered: params.alternatives || [],
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to record decision: ${error.message}`)
    }

    return data.id
  }

  /**
   * Request approval from CHIEF
   */
  protected async requestApproval(params: {
    sessionId: string
    decision: string
    reasoning: string
    alternatives?: string[]
  }): Promise<boolean> {
    // Only request approval if this agent requires it
    if (!this.config.permissions?.requiresApproval) {
      return true // Auto-approve if no approval required
    }

    // Send approval request message
    await this.sendMessage({
      sessionId: params.sessionId,
      toAgent: 'chief',
      messageType: 'REQUEST_APPROVAL',
      content: JSON.stringify({
        decision: params.decision,
        reasoning: params.reasoning,
        alternatives: params.alternatives || [],
        agent: this.agentType,
      }),
      priority: 8,
    })

    // Wait for approval response
    return await this.waitForApproval(params.sessionId)
  }

  /**
   * Wait for approval response from CHIEF
   */
  private async waitForApproval(
    sessionId: string,
    timeoutMs: number = 60000
  ): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      const messages = await this.getUnreadMessages(sessionId)

      for (const message of messages) {
        if (
          message.from_agent === 'chief' &&
          message.message_type === 'DIRECT_MESSAGE'
        ) {
          await this.markMessageAsRead(message.id)

          try {
            const response = JSON.parse(message.content)
            return response.approved === true
          } catch {
            // Invalid response format
            continue
          }
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Timeout - default to rejection
    return false
  }

  // =====================================================
  // METRICS RECORDING METHODS
  // =====================================================

  /**
   * Record a metric
   */
  protected async recordMetric(params: {
    sessionId: string
    metricType: string
    value: number
    metadata?: Record<string, any>
  }): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase.from('agent_metrics').insert({
      session_id: params.sessionId,
      agent_type: this.agentType,
      metric_type: params.metricType,
      value: params.value,
      metadata: params.metadata || {},
    })

    if (error) {
      // Don't throw - metrics are non-critical
      console.error(`Failed to record metric: ${error.message}`)
    }
  }

  // =====================================================
  // STATE MANAGEMENT METHODS
  // =====================================================

  /**
   * Create a state snapshot
   */
  protected async createSnapshot(params: {
    sessionId: string
    snapshotType: 'checkpoint' | 'rollback' | 'debug' | 'milestone'
    stateData: Record<string, any>
    description?: string
  }): Promise<string> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_state_snapshots')
      .insert({
        session_id: params.sessionId,
        state_data: params.stateData,
        snapshot_type: params.snapshotType,
        description: params.description,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create snapshot: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get session context
   */
  protected async getSessionContext(sessionId: string): Promise<{
    session: any
    tasks: AgentTask[]
    messages: AgentMessage[]
    decisions: any[]
  }> {
    const supabase = await this.getSupabase()

    const [session, tasks, messages, decisions] = await Promise.all([
      supabase.from('agent_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('agent_tasks').select('*').eq('session_id', sessionId),
      supabase
        .from('agent_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at'),
      supabase
        .from('agent_decisions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at'),
    ])

    return {
      session: session.data,
      tasks: tasks.data || [],
      messages: messages.data || [],
      decisions: decisions.data || [],
    }
  }

  // =====================================================
  // ERROR HANDLING METHODS
  // =====================================================

  /**
   * Handle task error
   */
  protected async handleTaskError(
    taskId: string,
    sessionId: string,
    error: Error
  ): Promise<void> {
    // Update task status
    await this.updateTaskStatus(taskId, 'failed', undefined, error.message)

    // Send error report
    await this.sendMessage({
      sessionId,
      toAgent: 'chief',
      messageType: 'ERROR_REPORT',
      content: JSON.stringify({
        error: error.message,
        task_id: taskId,
        agent: this.agentType,
        stack: error.stack,
      }),
      priority: 10,
    })

    // Record metric
    await this.recordMetric({
      sessionId,
      metricType: 'error_count',
      value: 1,
      metadata: {
        task_id: taskId,
        error_message: error.message,
      },
    })
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Log agent activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${this.agentType.toUpperCase()}] [${level.toUpperCase()}] ${message}`

    if (level === 'error') {
      console.error(logMessage, data || '')
    } else if (level === 'warn') {
      console.warn(logMessage, data || '')
    } else {
      console.log(logMessage, data || '')
    }
  }

  /**
   * Validate permissions
   */
  protected validatePermission(permission: keyof typeof this.config.permissions): boolean {
    return this.config.permissions?.[permission] ?? false
  }

  /**
   * Get agent name (for display)
   */
  public getAgentName(): string {
    const names: Record<AgentType, string> = {
      chief: 'KWAPPS-CHIEF',
      design: 'KWAPPS-DESIGN',
      dev: 'KWAPPS-DEV',
      ops: 'KWAPPS-OPS',
      guard: 'KWAPPS-GUARD',
    }
    return names[this.agentType]
  }
}
