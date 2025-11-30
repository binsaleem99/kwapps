/**
 * Conversation Context Manager
 *
 * Manages conversation history to provide contextual AI responses
 * Loads last N messages from database and builds prompts with context
 */

import { createClient } from '@/lib/supabase/server'

export interface Message {
  id: string
  project_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number
  created_at: string
}

export interface ConversationContext {
  messages: Message[]
  contextPrompt: string
  totalTokens: number
}

const MAX_CONTEXT_MESSAGES = 10 // Last 10 messages for context

export class ConversationManager {
  /**
   * Load conversation history for a project
   *
   * @param projectId - Project ID to load messages for
   * @param limit - Maximum number of messages to load (default: 10)
   * @returns Array of messages ordered by creation time
   */
  static async loadHistory(
    projectId: string,
    limit: number = MAX_CONTEXT_MESSAGES
  ): Promise<Message[]> {
    try {
      const supabase = await createClient()

      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, project_id, role, content, tokens_used, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading conversation history:', error)
        return []
      }

      // Reverse to chronological order (oldest first)
      return (messages || []).reverse()
    } catch (error) {
      console.error('Failed to load conversation history:', error)
      return []
    }
  }

  /**
   * Build contextual prompt with conversation history
   *
   * @param projectId - Project ID for context
   * @param currentPrompt - Current user prompt
   * @returns Contextual prompt string and metadata
   */
  static async buildContextualPrompt(
    projectId: string,
    currentPrompt: string
  ): Promise<ConversationContext> {
    const messages = await this.loadHistory(projectId)

    if (messages.length === 0) {
      // No history, return current prompt
      return {
        messages: [],
        contextPrompt: currentPrompt,
        totalTokens: 0,
      }
    }

    // Calculate total tokens used in history
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0)

    // Build context summary
    const contextSummary = this.summarizeHistory(messages)

    // Combine context with current prompt
    const contextPrompt = `Previous conversation context:
${contextSummary}

Current request: ${currentPrompt}

Please consider the previous conversation when responding. If the user refers to "the previous app" or "the last component", they mean the most recent code you generated.`

    return {
      messages,
      contextPrompt,
      totalTokens,
    }
  }

  /**
   * Summarize conversation history for context
   *
   * @param messages - Array of messages to summarize
   * @returns Formatted context summary
   */
  private static summarizeHistory(messages: Message[]): string {
    const summary: string[] = []

    // Group messages by conversation turns (user + assistant pairs)
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]

      if (msg.role === 'user') {
        summary.push(`User: ${this.truncateContent(msg.content, 100)}`)
      } else if (msg.role === 'assistant') {
        summary.push(`Assistant: ${this.truncateContent(msg.content, 100)}`)
      }
    }

    return summary.join('\n')
  }

  /**
   * Truncate content to specified length
   *
   * @param content - Content to truncate
   * @param maxLength - Maximum length
   * @returns Truncated content
   */
  private static truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + '...'
  }

  /**
   * Save a new message to the database
   *
   * @param projectId - Project ID
   * @param role - Message role
   * @param content - Message content
   * @param tokensUsed - Tokens consumed
   * @returns Created message or null on error
   */
  static async saveMessage(
    projectId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokensUsed: number = 0
  ): Promise<Message | null> {
    try {
      const supabase = await createClient()

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          project_id: projectId,
          role,
          content,
          tokens_used: tokensUsed,
        })
        .select('id, project_id, role, content, tokens_used, created_at')
        .single()

      if (error) {
        console.error('Error saving message:', error)
        return null
      }

      return message
    } catch (error) {
      console.error('Failed to save message:', error)
      return null
    }
  }

  /**
   * Get conversation statistics
   *
   * @param projectId - Project ID
   * @returns Conversation stats
   */
  static async getStats(projectId: string): Promise<{
    totalMessages: number
    totalTokens: number
    userMessages: number
    assistantMessages: number
  }> {
    try {
      const supabase = await createClient()

      const { data: messages, error } = await supabase
        .from('messages')
        .select('role, tokens_used')
        .eq('project_id', projectId)

      if (error) {
        console.error('Error loading stats:', error)
        return {
          totalMessages: 0,
          totalTokens: 0,
          userMessages: 0,
          assistantMessages: 0,
        }
      }

      const stats = (messages || []).reduce(
        (acc, msg) => {
          acc.totalMessages++
          acc.totalTokens += msg.tokens_used || 0
          if (msg.role === 'user') acc.userMessages++
          if (msg.role === 'assistant') acc.assistantMessages++
          return acc
        },
        {
          totalMessages: 0,
          totalTokens: 0,
          userMessages: 0,
          assistantMessages: 0,
        }
      )

      return stats
    } catch (error) {
      console.error('Failed to load stats:', error)
      return {
        totalMessages: 0,
        totalTokens: 0,
        userMessages: 0,
        assistantMessages: 0,
      }
    }
  }

  /**
   * Clear conversation history for a project
   *
   * @param projectId - Project ID
   * @returns Success status
   */
  static async clearHistory(projectId: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('project_id', projectId)

      if (error) {
        console.error('Error clearing history:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to clear history:', error)
      return false
    }
  }
}
