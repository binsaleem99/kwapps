/**
 * Orchestration Session Manager
 *
 * Manages orchestration sessions in Supabase instead of in-memory Map.
 * Prevents session loss on Vercel deployments.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  OrchestrationState,
  OrchestrationStage,
  DetectedParameters,
  ClarifyingQuestion,
  ClarifyingAnswers,
  DeepSeekPrompt,
  ValidationResult,
} from './types'

// ==============================================
// Types
// ==============================================

export interface OrchestrationSession {
  id: string
  user_id: string
  project_id: string | null
  stage: OrchestrationStage
  detected_params: DetectedParameters | null
  clarifying_questions: ClarifyingQuestion[]
  answers: ClarifyingAnswers
  deepseek_prompt: DeepSeekPrompt | null
  validation_result: ValidationResult | null
  error: { code: string; message: string; messageAr: string } | null
  original_prompt: string | null
  messages: SessionMessage[]
  context: SessionContext
  created_at: string
  updated_at: string
  last_activity_at: string
  expires_at: string
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface SessionContext {
  confidence?: number
  tokensUsed?: number
  lastPrompt?: string
  [key: string]: unknown
}

export interface CreateSessionParams {
  userId: string
  projectId?: string
  originalPrompt?: string
}

export interface UpdateSessionParams {
  stage?: OrchestrationStage
  detectedParams?: DetectedParameters | null
  clarifyingQuestions?: ClarifyingQuestion[]
  answers?: ClarifyingAnswers
  deepseekPrompt?: DeepSeekPrompt | null
  validationResult?: ValidationResult | null
  error?: { code: string; message: string; messageAr: string } | null
  messages?: SessionMessage[]
  context?: SessionContext
}

// ==============================================
// Database row type (for internal use)
// ==============================================

interface DbOrchestrationSession {
  id: string
  user_id: string
  project_id: string | null
  stage: string
  detected_params: Record<string, unknown> | null
  clarifying_questions: Record<string, unknown>[]
  answers: Record<string, unknown>
  deepseek_prompt: Record<string, unknown> | null
  validation_result: Record<string, unknown> | null
  error: Record<string, unknown> | null
  original_prompt: string | null
  messages: Record<string, unknown>[]
  context: Record<string, unknown>
  created_at: string
  updated_at: string
  last_activity_at: string
  expires_at: string
}

// ==============================================
// Session Manager Class
// ==============================================

export class SessionManager {
  private supabase: SupabaseClient

  constructor() {
    // Use service role for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<OrchestrationSession | null> {
    const { data, error } = await this.supabase
      .from('orchestration_sessions')
      .select('*')
      .eq('id', sessionId)
      .gt('expires_at', new Date().toISOString())
      .single() as { data: DbOrchestrationSession | null; error: Error | null }

    if (error || !data) {
      console.log('[SessionManager] Session not found:', sessionId)
      return null
    }

    return this.mapDbToSession(data)
  }

  /**
   * Get active session for user/project combination
   */
  async getActiveSession(
    userId: string,
    projectId?: string
  ): Promise<OrchestrationSession | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (this.supabase.from('orchestration_sessions') as any)
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .not('stage', 'in', '("completed","failed")')
      .order('last_activity_at', { ascending: false })
      .limit(1)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.single() as { data: DbOrchestrationSession | null; error: Error | null }

    if (error || !data) {
      return null
    }

    return this.mapDbToSession(data)
  }

  /**
   * Create new session
   */
  async createSession(params: CreateSessionParams): Promise<OrchestrationSession> {
    const { userId, projectId, originalPrompt } = params

    const sessionData = {
      user_id: userId,
      project_id: projectId || null,
      stage: 'detection' as OrchestrationStage,
      detected_params: null,
      clarifying_questions: [],
      answers: {},
      deepseek_prompt: null,
      validation_result: null,
      error: null,
      original_prompt: originalPrompt || null,
      messages: [],
      context: {},
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('[SessionManager] Failed to create session:', error)
      throw new Error(`Failed to create session: ${error.message}`)
    }

    console.log('[SessionManager] Created new session:', data.id)
    return this.mapDbToSession(data)
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    updates: UpdateSessionParams
  ): Promise<OrchestrationSession | null> {
    const updateData: Record<string, unknown> = {}

    if (updates.stage !== undefined) updateData.stage = updates.stage
    if (updates.detectedParams !== undefined) updateData.detected_params = updates.detectedParams
    if (updates.clarifyingQuestions !== undefined) updateData.clarifying_questions = updates.clarifyingQuestions
    if (updates.answers !== undefined) updateData.answers = updates.answers
    if (updates.deepseekPrompt !== undefined) updateData.deepseek_prompt = updates.deepseekPrompt
    if (updates.validationResult !== undefined) updateData.validation_result = updates.validationResult
    if (updates.error !== undefined) updateData.error = updates.error
    if (updates.messages !== undefined) updateData.messages = updates.messages
    if (updates.context !== undefined) updateData.context = updates.context

    // Auto-extend expiry on update
    updateData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single() as { data: DbOrchestrationSession | null; error: Error | null }

    if (error) {
      console.error('[SessionManager] Failed to update session:', error)
      return null
    }

    return this.mapDbToSession(data!)
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    message: Omit<SessionMessage, 'timestamp'>
  ): Promise<boolean> {
    const session = await this.getSession(sessionId)
    if (!session) return false

    const newMessage: SessionMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    }

    const messages = [...session.messages, newMessage]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .update({ messages })
      .eq('id', sessionId)

    return !error
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('[SessionManager] Failed to delete session:', error)
      return false
    }

    return true
  }

  /**
   * Mark session as completed
   */
  async completeSession(sessionId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .update({ stage: 'completed' })
      .eq('id', sessionId)

    return !error
  }

  /**
   * Mark session as failed
   */
  async failSession(
    sessionId: string,
    error: { code: string; message: string; messageAr: string }
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (this.supabase
      .from('orchestration_sessions') as any)
      .update({ stage: 'failed', error })
      .eq('id', sessionId)

    return !dbError
  }

  /**
   * Extend session expiry
   */
  async extendSession(sessionId: string, hours: number = 24): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .update({
        expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', sessionId)

    return !error
  }

  /**
   * Get user's recent sessions
   */
  async getUserSessions(
    userId: string,
    limit: number = 10
  ): Promise<OrchestrationSession[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase
      .from('orchestration_sessions') as any)
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false })
      .limit(limit) as { data: DbOrchestrationSession[] | null; error: Error | null }

    if (error || !data) {
      return []
    }

    return data.map(this.mapDbToSession)
  }

  /**
   * Cleanup expired sessions (called by edge function)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_orchestration_sessions')

    if (error) {
      console.error('[SessionManager] Cleanup failed:', error)
      return 0
    }

    return data || 0
  }

  /**
   * Convert database row to OrchestrationSession
   */
  private mapDbToSession(data: DbOrchestrationSession): OrchestrationSession {
    return {
      id: data.id,
      user_id: data.user_id,
      project_id: data.project_id,
      stage: data.stage as OrchestrationStage,
      detected_params: data.detected_params as DetectedParameters | null,
      clarifying_questions: (data.clarifying_questions || []) as unknown as ClarifyingQuestion[],
      answers: (data.answers || {}) as unknown as ClarifyingAnswers,
      deepseek_prompt: data.deepseek_prompt as unknown as DeepSeekPrompt | null,
      validation_result: data.validation_result as unknown as ValidationResult | null,
      error: data.error as unknown as { code: string; message: string; messageAr: string } | null,
      original_prompt: data.original_prompt,
      messages: (data.messages || []) as unknown as SessionMessage[],
      context: (data.context || {}) as unknown as SessionContext,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_activity_at: data.last_activity_at,
      expires_at: data.expires_at,
    }
  }

  /**
   * Convert OrchestrationState to UpdateSessionParams
   */
  stateToUpdateParams(state: OrchestrationState): UpdateSessionParams {
    return {
      stage: state.stage,
      detectedParams: state.detectedParams,
      clarifyingQuestions: state.clarifyingQuestions,
      answers: state.answers,
      deepseekPrompt: state.deepseekPrompt,
      validationResult: state.validationResult,
      error: state.error,
    }
  }

  /**
   * Convert session to OrchestrationState
   */
  sessionToState(session: OrchestrationSession): OrchestrationState {
    return {
      stage: session.stage,
      detectedParams: session.detected_params,
      clarifyingQuestions: session.clarifying_questions,
      answers: session.answers,
      deepseekPrompt: session.deepseek_prompt,
      validationResult: session.validation_result,
      error: session.error || undefined,
    }
  }
}

// ==============================================
// Singleton Instance
// ==============================================

let sessionManagerInstance: SessionManager | null = null

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager()
  }
  return sessionManagerInstance
}

// ==============================================
// Helper Functions
// ==============================================

/**
 * Get or create session for user
 */
export async function getOrCreateSession(
  userId: string,
  projectId?: string,
  originalPrompt?: string
): Promise<OrchestrationSession> {
  const manager = getSessionManager()

  // Check for existing active session
  const existingSession = await manager.getActiveSession(userId, projectId)
  if (existingSession) {
    console.log('[SessionManager] Found existing session:', existingSession.id)
    return existingSession
  }

  // Create new session
  return manager.createSession({ userId, projectId, originalPrompt })
}

/**
 * Check if user has resumable session
 */
export async function hasResumableSession(
  userId: string,
  projectId?: string
): Promise<{ hasSession: boolean; session?: OrchestrationSession }> {
  const manager = getSessionManager()
  const session = await manager.getActiveSession(userId, projectId)

  if (session && session.stage !== 'detection') {
    return { hasSession: true, session }
  }

  return { hasSession: false }
}
