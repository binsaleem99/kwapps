/**
 * KW APPS Multi-Agent System - Message Bus
 *
 * Central message routing system for inter-agent communication.
 * Handles message delivery, priority queuing, and real-time event emission.
 */

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentMessage, MessageType, MessageSender } from '../core/types'

export class MessageBus {
  private static instance: MessageBus
  private eventHandlers: Map<string, Set<(message: AgentMessage) => void>> =
    new Map()

  private constructor() {
    // Singleton pattern
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MessageBus {
    if (!MessageBus.instance) {
      MessageBus.instance = new MessageBus()
    }
    return MessageBus.instance
  }

  /**
   * Get Supabase client
   */
  private async getSupabase(): Promise<SupabaseClient> {
    return await createClient()
  }

  // =====================================================
  // PUBLISHING METHODS
  // =====================================================

  /**
   * Publish a message to the bus
   */
  async publish(params: {
    session_id: string
    from_agent: MessageSender
    to_agent?: MessageSender
    message_type: MessageType
    content: string
    priority?: number
    metadata?: Record<string, any>
  }): Promise<AgentMessage> {
    const supabase = await this.getSupabase()

    // Insert message into database
    const { data, error } = await supabase
      .from('agent_messages')
      .insert({
        session_id: params.session_id,
        from_agent: params.from_agent,
        to_agent: params.to_agent || null,
        message_type: params.message_type,
        content: params.content,
        priority: params.priority ?? this.getDefaultPriority(params.message_type),
        metadata: params.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to publish message: ${error.message}`)
    }

    // Emit event for real-time listeners
    this.emitEvent('message:new', data)

    // If this is a high-priority message, emit special event
    if (data.priority >= 8) {
      this.emitEvent('message:high_priority', data)
    }

    return data
  }

  /**
   * Broadcast message to all agents in session
   */
  async broadcast(params: {
    session_id: string
    from_agent: MessageSender
    message_type: MessageType
    content: string
    priority?: number
    metadata?: Record<string, any>
  }): Promise<AgentMessage> {
    return this.publish({
      ...params,
      to_agent: undefined, // NULL = broadcast
    })
  }

  /**
   * Send direct message to specific agent
   */
  async sendDirect(params: {
    session_id: string
    from_agent: MessageSender
    to_agent: MessageSender
    message_type: MessageType
    content: string
    priority?: number
    metadata?: Record<string, any>
  }): Promise<AgentMessage> {
    return this.publish(params)
  }

  // =====================================================
  // SUBSCRIPTION METHODS
  // =====================================================

  /**
   * Subscribe to messages for specific agent
   */
  subscribe(
    eventType: string,
    handler: (message: AgentMessage) => void
  ): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }

    this.eventHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  /**
   * Subscribe to messages for specific agent type
   */
  subscribeToAgent(
    agentType: MessageSender,
    handler: (message: AgentMessage) => void
  ): () => void {
    const wrappedHandler = (message: AgentMessage) => {
      if (
        message.to_agent === agentType ||
        message.to_agent === null // Broadcast
      ) {
        handler(message)
      }
    }

    return this.subscribe('message:new', wrappedHandler)
  }

  /**
   * Subscribe to high-priority messages only
   */
  subscribeToHighPriority(
    handler: (message: AgentMessage) => void
  ): () => void {
    return this.subscribe('message:high_priority', handler)
  }

  // =====================================================
  // RETRIEVAL METHODS
  // =====================================================

  /**
   * Get unread messages for specific agent
   */
  async getUnreadMessages(
    agentType: MessageSender,
    sessionId: string
  ): Promise<AgentMessage[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)
      .or(`to_agent.eq.${agentType},to_agent.is.null`)
      .is('read_at', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch unread messages: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get all messages in session
   */
  async getSessionMessages(
    sessionId: string,
    options?: {
      limit?: number
      offset?: number
      agentType?: MessageSender
      messageType?: MessageType
    }
  ): Promise<AgentMessage[]> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)

    if (options?.agentType) {
      query = query.or(
        `to_agent.eq.${options.agentType},to_agent.is.null,from_agent.eq.${options.agentType}`
      )
    }

    if (options?.messageType) {
      query = query.eq('message_type', options.messageType)
    }

    query = query.order('created_at', { ascending: true })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch session messages: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<AgentMessage | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('id', messageId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch message: ${error.message}`)
    }

    return data
  }

  /**
   * Get conversation between two agents
   */
  async getConversation(
    sessionId: string,
    agent1: MessageSender,
    agent2: MessageSender
  ): Promise<AgentMessage[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)
      .or(
        `and(from_agent.eq.${agent1},to_agent.eq.${agent2}),and(from_agent.eq.${agent2},to_agent.eq.${agent1})`
      )
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    return data || []
  }

  // =====================================================
  // MESSAGE STATUS METHODS
  // =====================================================

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('agent_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)

    if (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`)
    }

    // Emit event
    this.emitEvent('message:read', { messageId })
  }

  /**
   * Mark all messages as read for agent in session
   */
  async markAllAsRead(agentType: MessageSender, sessionId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('agent_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .or(`to_agent.eq.${agentType},to_agent.is.null`)
      .is('read_at', null)

    if (error) {
      throw new Error(`Failed to mark all messages as read: ${error.message}`)
    }

    // Emit event
    this.emitEvent('messages:all_read', { agentType, sessionId })
  }

  // =====================================================
  // QUEUE MANAGEMENT METHODS
  // =====================================================

  /**
   * Get next message from queue (highest priority first)
   */
  async getNextMessage(
    agentType: MessageSender,
    sessionId: string
  ): Promise<AgentMessage | null> {
    const messages = await this.getUnreadMessages(agentType, sessionId)
    return messages.length > 0 ? messages[0] : null
  }

  /**
   * Get queue depth for agent
   */
  async getQueueDepth(
    agentType: MessageSender,
    sessionId: string
  ): Promise<number> {
    const messages = await this.getUnreadMessages(agentType, sessionId)
    return messages.length
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(sessionId: string): Promise<{
    total: number
    byAgent: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
  }> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('to_agent, priority, message_type')
      .eq('session_id', sessionId)
      .is('read_at', null)

    if (error) {
      throw new Error(`Failed to fetch queue stats: ${error.message}`)
    }

    const byAgent: Record<string, number> = {}
    const byPriority: Record<string, number> = {}
    const byType: Record<string, number> = {}

    data.forEach((msg) => {
      const agent = msg.to_agent || 'broadcast'
      byAgent[agent] = (byAgent[agent] || 0) + 1

      const priority = `p${msg.priority}`
      byPriority[priority] = (byPriority[priority] || 0) + 1

      byType[msg.message_type] = (byType[msg.message_type] || 0) + 1
    })

    return {
      total: data.length,
      byAgent,
      byPriority,
      byType,
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

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
   * Emit event to subscribers
   */
  private emitEvent(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error)
        }
      })
    }
  }

  /**
   * Clear all event handlers
   */
  clearAllHandlers(): void {
    this.eventHandlers.clear()
  }

  /**
   * Get message statistics for session
   */
  async getMessageStats(sessionId: string): Promise<{
    total: number
    read: number
    unread: number
    byAgent: Record<string, { sent: number; received: number }>
    byType: Record<string, number>
    avgResponseTime: number | null
  }> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('session_id', sessionId)

    if (error) {
      throw new Error(`Failed to fetch message stats: ${error.message}`)
    }

    const byAgent: Record<string, { sent: number; received: number }> = {}
    const byType: Record<string, number> = {}
    let totalResponseTime = 0
    let responseCount = 0

    data.forEach((msg) => {
      // By type
      byType[msg.message_type] = (byType[msg.message_type] || 0) + 1

      // By agent - sent
      if (!byAgent[msg.from_agent]) {
        byAgent[msg.from_agent] = { sent: 0, received: 0 }
      }
      byAgent[msg.from_agent].sent++

      // By agent - received
      if (msg.to_agent) {
        if (!byAgent[msg.to_agent]) {
          byAgent[msg.to_agent] = { sent: 0, received: 0 }
        }
        byAgent[msg.to_agent].received++
      }

      // Response time calculation
      if (msg.read_at) {
        const responseTime =
          new Date(msg.read_at).getTime() - new Date(msg.created_at).getTime()
        totalResponseTime += responseTime
        responseCount++
      }
    })

    return {
      total: data.length,
      read: data.filter((m) => m.read_at).length,
      unread: data.filter((m) => !m.read_at).length,
      byAgent,
      byType,
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : null,
    }
  }
}

/**
 * Get singleton instance of MessageBus
 */
export function getMessageBus(): MessageBus {
  return MessageBus.getInstance()
}
