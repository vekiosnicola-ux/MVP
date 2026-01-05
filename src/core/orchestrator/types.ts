export type WorkflowState =
  | 'task_created'
  | 'awaiting_proposals'
  | 'awaiting_human_decision'
  | 'plan_approved'
  | 'plan_rejected'
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

export interface QualityGateResult {
  name: string;
  passed: boolean;
  details?: string;
}
