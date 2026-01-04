export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'infra';
export type TaskStatus = 'pending' | 'planning' | 'approved' | 'executing' | 'completed' | 'failed';
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

export interface Task {
  id: string;
  version: string;
  type: TaskType;
  description: string;
  context: TaskContext;
  constraints: TaskConstraints;
  metadata?: TaskMetadata;
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
}
