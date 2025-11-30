/**
 * KW APPS Multi-Agent System - Type Definitions
 *
 * Comprehensive TypeScript types for the agent orchestration system
 */

// =====================================================
// AGENT TYPES
// =====================================================

export type AgentType = 'chief' | 'design' | 'dev' | 'ops' | 'guard'

export type SessionType = 'feature' | 'deployment' | 'qa' | 'refactor' | 'debug'

export type SessionStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled'

export type MessageType =
  | 'TASK_DELEGATION'
  | 'REQUEST_APPROVAL'
  | 'BROADCAST_UPDATE'
  | 'DIRECT_MESSAGE'
  | 'STATUS_UPDATE'
  | 'ERROR_REPORT'
  | 'USER_MESSAGE'

export type MessageSender =
  | AgentType
  | 'user'
  | 'system'

export type SnapshotType = 'checkpoint' | 'rollback' | 'debug' | 'milestone'

// =====================================================
// DATABASE ENTITY TYPES
// =====================================================

export interface AgentSession {
  id: string
  user_id: string
  project_id?: string
  session_type: SessionType
  status: SessionStatus
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AgentTask {
  id: string
  session_id: string
  agent_type: AgentType
  task_type: string
  description: string
  status: TaskStatus
  priority: number
  assigned_by?: string // Task ID
  depends_on: string[] // Array of task IDs
  input_data: Record<string, any>
  output_data: Record<string, any>
  error_details?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface AgentMessage {
  id: string
  session_id: string
  from_agent: MessageSender
  to_agent?: MessageSender // NULL for broadcasts
  message_type: MessageType
  content: string
  metadata: Record<string, any>
  priority: number
  read_at?: string
  created_at: string
}

export interface AgentDecision {
  id: string
  session_id: string
  task_id?: string
  decision_type: string
  made_by: AgentType
  decision: string
  reasoning: string
  alternatives_considered: string[]
  approved_by?: 'chief' | 'user'
  approved_at?: string
  created_at: string
}

export interface AgentStateSnapshot {
  id: string
  session_id: string
  state_data: Record<string, any>
  snapshot_type: SnapshotType
  description?: string
  created_at: string
}

export interface AgentMetric {
  id: string
  session_id?: string
  agent_type: AgentType | 'system'
  metric_type: string
  value: number
  metadata: Record<string, any>
  recorded_at: string
}

export interface AgentPromptCache {
  id: string
  cache_key: string
  prompt_content: string
  expires_at: string
  created_at: string
}

// =====================================================
// REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateSessionRequest {
  project_id?: string
  session_type: SessionType
  initial_request: string
}

export interface CreateSessionResponse {
  session_id: string
  status: SessionStatus
  created_at: string
}

export interface InteractWithSessionRequest {
  message: string
  type: 'user_request' | 'clarification' | 'approval'
}

export interface InteractWithSessionResponse {
  acknowledged: boolean
  message_id: string
}

export interface SessionStatusResponse {
  session: {
    id: string
    status: SessionStatus
    progress: number
    current_task?: string
  }
  tasks: AgentTask[]
  messages: AgentMessage[]
  decisions: AgentDecision[]
}

export interface SessionProgressResponse {
  total_tasks: number
  completed_tasks: number
  failed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  progress_percentage: number
}

// =====================================================
// AGENT CONFIGURATION TYPES
// =====================================================

export interface AgentConfig {
  agentType: AgentType
  model: 'deepseek-chat' | 'deepseek-coder'
  maxTokens: number
  temperature: number
  systemPrompt: string
  capabilities: string[]
  permissions: AgentPermissions
}

export interface AgentPermissions {
  canCreateProjects: boolean
  canModifyCode: boolean
  canDeploy: boolean
  canAccessDatabase: boolean
  requiresApproval: boolean
}

// =====================================================
// TASK PLANNING TYPES
// =====================================================

export interface TaskPlan {
  summary: string
  reasoning: string
  alternativesConsidered: string[]
  tasks: PlannedTask[]
  estimatedDuration?: number
}

export interface PlannedTask {
  agent: AgentType
  type: string
  description: string
  priority: number
  dependsOn?: string[]
  input?: Record<string, any>
}

// =====================================================
// DECISION TYPES
// =====================================================

export interface DecisionRequest {
  decision: string
  reasoning: string
  agent: AgentType
  sessionId: string
}

export interface DecisionApproval {
  approved: boolean
  feedback?: string
  reasoning: string
}

// =====================================================
// CONFLICT RESOLUTION TYPES
// =====================================================

export interface ConflictResolutionRequest {
  conflictType: string
  agents: AgentType[]
  details: Record<string, any>
  sessionId: string
}

export interface ConflictResolution {
  decision: string
  reasoning: string
  affectedAgents: AgentType[]
  actionItems: string[]
}

// =====================================================
// MESSAGE CONTENT TYPES
// =====================================================

export interface TaskDelegationContent {
  task_id: string
  description: string
  priority: number
  input_data?: Record<string, any>
}

export interface ApprovalRequestContent {
  decision: string
  reasoning: string
  alternatives?: string[]
}

export interface ApprovalResponseContent {
  approved: boolean
  feedback?: string
}

export interface StatusUpdateContent {
  status: TaskStatus
  progress?: number
  message?: string
}

export interface ErrorReportContent {
  error: string
  task_id?: string
  details?: Record<string, any>
}

// =====================================================
// WORKFLOW TYPES
// =====================================================

export interface WorkflowDefinition {
  name: string
  description: string
  steps: WorkflowStep[]
  parallelization: boolean
}

export interface WorkflowStep {
  stepNumber: number
  agent: AgentType
  taskType: string
  description: string
  dependsOn?: number[]
  canRunInParallel: boolean
}

export interface WorkflowExecution {
  workflow: WorkflowDefinition
  session_id: string
  currentStep: number
  completedSteps: number[]
  failedSteps: number[]
  status: 'running' | 'completed' | 'failed'
}

// =====================================================
// MONITORING TYPES
// =====================================================

export interface SystemHealthMetrics {
  activeSessions: number
  totalTasksToday: number
  averageCompletionTime: number
  errorRate: number
  agentUtilization: Record<AgentType, number>
  queueDepth: number
}

export interface AgentPerformanceMetrics {
  agentType: AgentType
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageCompletionTime: number
  tokensUsed: number
  errorRate: number
}

export interface SessionMetrics {
  session_id: string
  duration: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  tokensUsed: number
  cost: number
  agentBreakdown: Record<AgentType, {
    tasks: number
    tokensUsed: number
  }>
}

// =====================================================
// PROMPT MANAGEMENT TYPES
// =====================================================

export interface PromptContext {
  sessionId: string
  agentType: AgentType
  conversationHistory: AgentMessage[]
  currentTask?: AgentTask
  projectContext?: Record<string, any>
  userPreferences?: Record<string, any>
}

export interface GeneratedPrompt {
  systemPrompt: string
  contextPrompt: string
  taskPrompt: string
  fullPrompt: string
  tokenCount: number
}

// =====================================================
// EVENT TYPES
// =====================================================

export interface AgentEvent {
  type: 'task_started' | 'task_completed' | 'task_failed' | 'message_sent' | 'decision_made' | 'session_created' | 'session_completed'
  timestamp: string
  sessionId: string
  agentType?: AgentType
  data: Record<string, any>
}

export interface EventSubscription {
  eventType: string
  handler: (event: AgentEvent) => void
  filter?: (event: AgentEvent) => boolean
}

// =====================================================
// ERROR TYPES
// =====================================================

export class AgentError extends Error {
  constructor(
    message: string,
    public agentType: AgentType,
    public taskId?: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export class TaskExecutionError extends AgentError {
  constructor(
    message: string,
    agentType: AgentType,
    taskId: string,
    public originalError?: Error
  ) {
    super(message, agentType, taskId, true)
    this.name = 'TaskExecutionError'
  }
}

export class MessageDeliveryError extends AgentError {
  constructor(
    message: string,
    agentType: AgentType,
    public messageId?: string
  ) {
    super(message, agentType, undefined, true)
    this.name = 'MessageDeliveryError'
  }
}

export class ApprovalTimeoutError extends AgentError {
  constructor(
    agentType: AgentType,
    public decisionId: string
  ) {
    super('Approval request timed out', agentType, undefined, false)
    this.name = 'ApprovalTimeoutError'
  }
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Awaitable<T> = T | Promise<T>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

// =====================================================
// TYPE GUARDS
// =====================================================

export function isAgentType(value: string): value is AgentType {
  return ['chief', 'design', 'dev', 'ops', 'guard'].includes(value)
}

export function isSessionType(value: string): value is SessionType {
  return ['feature', 'deployment', 'qa', 'refactor', 'debug'].includes(value)
}

export function isMessageType(value: string): value is MessageType {
  return [
    'TASK_DELEGATION',
    'REQUEST_APPROVAL',
    'BROADCAST_UPDATE',
    'DIRECT_MESSAGE',
    'STATUS_UPDATE',
    'ERROR_REPORT',
    'USER_MESSAGE',
  ].includes(value)
}

export function isTaskStatus(value: string): value is TaskStatus {
  return [
    'pending',
    'in_progress',
    'completed',
    'failed',
    'blocked',
    'cancelled',
  ].includes(value)
}

// =====================================================
// CONSTANTS
// =====================================================

export const AGENT_CONFIGS: Record<AgentType, Partial<AgentConfig>> = {
  chief: {
    agentType: 'chief',
    model: 'deepseek-chat',
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
    agentType: 'design',
    model: 'deepseek-chat',
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
    agentType: 'dev',
    model: 'deepseek-coder',
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
    agentType: 'ops',
    model: 'deepseek-chat',
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
    agentType: 'guard',
    model: 'deepseek-chat',
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

export const MESSAGE_PRIORITY = {
  ERROR_REPORT: 10,
  REQUEST_APPROVAL: 8,
  TASK_DELEGATION: 5,
  STATUS_UPDATE: 3,
  DIRECT_MESSAGE: 2,
  BROADCAST_UPDATE: 1,
  USER_MESSAGE: 7,
} as const

export const TASK_PRIORITY = {
  CRITICAL: 10,
  HIGH: 7,
  MEDIUM: 5,
  LOW: 3,
  BACKGROUND: 1,
} as const

export const METRIC_TYPES = {
  TOKENS_USED: 'tokens_used',
  TASK_DURATION: 'task_duration',
  ERROR_RATE: 'error_rate',
  APPROVAL_TIME: 'approval_time',
  QUEUE_DEPTH: 'queue_depth',
} as const
