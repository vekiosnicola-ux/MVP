export interface HistoryEvent {
  id: string;
  timestamp: string;
  type: 'task_created' | 'task_approved' | 'task_rejected' | 'task_completed' | 'decision_made';
  title: string;
  description?: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}
