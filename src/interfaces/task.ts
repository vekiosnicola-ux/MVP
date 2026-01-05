export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'infra';
export type TaskStatus = 'pending' | 'planning' | 'awaiting_human_decision' | 'approved' | 'rejected' | 'executing' | 'awaiting_verification' | 'completed' | 'failed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskContext {
  repository: string;
  branch: string;
  files: string[];
  dependencies?: string[];
}

export interface TaskConstraints {
  maxDuration: number;
  requiresApproval: boolean;
  breakingChangesAllowed: boolean;
  testCoverageMin: number;
}

export interface TaskMetadata {
  createdAt?: string;
  createdBy?: string;
  priority?: Priority;
  labels?: string[];
}

// System 3 target system type
export type TargetSystem = 'external' | 'self';

export interface Task {
  id: string;
  version: string;
  type: TaskType;
  description: string;
  context: TaskContext;
  constraints: TaskConstraints;
  metadata?: TaskMetadata;

  // System 3 extensions (optional)
  intentStatement?: string;      // Natural language intent (from chat)
  targetSystem?: TargetSystem;   // 'external' = target code, 'self' = modify Aura
  mustNotBreak?: string[];       // Explicit constraints from human
  chatSessionId?: string;        // Link to Meta-Prompter conversation
}

export interface TaskRow {
  id: string;
  task_id: string;
  version: string;
  type: TaskType;
  description: string;
  context: TaskContext;
  constraints: TaskConstraints;
  metadata: TaskMetadata | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;

  // System 3 extensions
  intent_statement?: string | null;
  target_system?: TargetSystem | null;
  must_not_break?: string[] | null;
  chat_session_id?: string | null;
}
