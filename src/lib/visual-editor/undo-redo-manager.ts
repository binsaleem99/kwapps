/**
 * Undo/Redo Manager
 *
 * Manages 50-step circular buffer of code snapshots
 * Supports undo/redo operations (FREE - no credits)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CodeSnapshot {
  id: string
  index: number
  code: string
  descriptionAr: string
  creditsUsed: number
  createdAt: string
}

export class UndoRedoManager {
  private sessionId: string
  private currentIndex: number = -1
  private maxSnapshots: number = 50
  private snapshots: CodeSnapshot[] = []

  constructor(sessionId: string) {
    this.sessionId = sessionId
    this.loadSnapshots()
  }

  /**
   * Load existing snapshots from database
   */
  private async loadSnapshots(): Promise<void> {
    const { data } = await supabase
      .from('code_snapshots')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: false })
      .limit(this.maxSnapshots)

    if (data) {
      this.snapshots = data.map((s) => ({
        id: s.id,
        index: s.snapshot_index,
        code: s.code,
        descriptionAr: s.description_ar,
        creditsUsed: s.credits_used,
        createdAt: s.created_at,
      }))

      this.currentIndex = this.snapshots.length > 0 ? this.snapshots[0].index : -1
    }
  }

  /**
   * Save new snapshot (auto-increments in circular buffer)
   */
  async saveSnapshot(
    code: string,
    descriptionAr: string,
    creditsUsed: number
  ): Promise<void> {
    // Increment index (circular: 0-49)
    this.currentIndex = (this.currentIndex + 1) % this.maxSnapshots

    // Save to database
    const { data } = await supabase
      .from('code_snapshots')
      .upsert({
        session_id: this.sessionId,
        project_id: await this.getProjectId(),
        snapshot_index: this.currentIndex,
        code,
        description_ar: descriptionAr,
        change_type: 'edit',
        credits_used: creditsUsed,
      })
      .select()
      .single()

    if (data) {
      // Update local cache
      this.snapshots.unshift({
        id: data.id,
        index: this.currentIndex,
        code,
        descriptionAr,
        creditsUsed,
        createdAt: data.created_at,
      })

      // Keep only 50 most recent
      this.snapshots = this.snapshots.slice(0, this.maxSnapshots)
    }
  }

  /**
   * Undo last change (FREE - 0 credits)
   */
  async undo(): Promise<CodeSnapshot | null> {
    if (this.snapshots.length <= 1) {
      return null // Can't undo initial state
    }

    // Get previous snapshot
    const previousSnapshot = this.snapshots[1]

    if (!previousSnapshot) {
      return null
    }

    this.currentIndex = previousSnapshot.index

    return previousSnapshot
  }

  /**
   * Redo change (FREE - 0 credits)
   */
  async redo(): Promise<CodeSnapshot | null> {
    // Check if there's a newer snapshot
    const newerSnapshot = this.snapshots.find(
      (s) => s.index === (this.currentIndex + 1) % this.maxSnapshots
    )

    if (!newerSnapshot) {
      return null
    }

    this.currentIndex = newerSnapshot.index
    return newerSnapshot
  }

  /**
   * Get snapshot history (for UI display)
   */
  getHistory(): CodeSnapshot[] {
    return [...this.snapshots]
  }

  /**
   * Get current snapshot
   */
  getCurrent(): CodeSnapshot | null {
    return this.snapshots.find((s) => s.index === this.currentIndex) || null
  }

  /**
   * Clear all snapshots
   */
  async clear(): Promise<void> {
    await supabase
      .from('code_snapshots')
      .delete()
      .eq('session_id', this.sessionId)

    this.snapshots = []
    this.currentIndex = -1
  }

  /**
   * Helper: Get project ID from session
   */
  private async getProjectId(): Promise<string> {
    const { data } = await supabase
      .from('visual_editor_sessions')
      .select('project_id')
      .eq('id', this.sessionId)
      .single()

    return data?.project_id || ''
  }
}
