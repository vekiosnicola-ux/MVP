export type WorkflowState =
  | 'task_created'
  | 'awaiting_proposals'
  | 'awaiting_human_decision'
  | 'plan_approved'
  | 'executing'
  | 'awaiting_verification'
  | 'completed'
  | 'failed';

export interface WorkflowEvent {
  taskId: string;
  state: WorkflowState;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HumanOverride {
  id: string;
  task_id: string | null;
  ai_suggestion: string;
  human_decision: string;
  category: string;
  rationale: string;
  project_id: string | null;
  applied_count: number;
  created_at: string;
}
