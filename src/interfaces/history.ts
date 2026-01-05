/**
 * History Event Interface
 *
 * Represents a timeline event in the workflow history.
 * Events are aggregated from tasks, decisions, and results.
 */

export type HistoryEventType =
  | 'task_created'
  | 'task_approved'
  | 'task_rejected'
  | 'task_completed'
  | 'task_failed'
  | 'decision_made'
  | 'execution_started'
  | 'execution_completed';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  type: HistoryEventType;
  title: string;
  description?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}
