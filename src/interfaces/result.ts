export type ResultStatus = 'success' | 'partial_success' | 'failure' | 'cancelled';
export type StepStatus = 'success' | 'failure' | 'skipped';

export interface StepResult {
  id: string;
  status: StepStatus;
  duration: number;
  validation: {
    passed: boolean;
    command?: string;
    output: string;
    exitCode?: number;
  };
  artifacts?: string[];
  error?: {
    message: string;
    stackTrace?: string;
    recoverable?: boolean;
  };
}

export interface Artifacts {
  filesCreated: string[];
  filesModified: string[];
  filesDeleted: string[];
  testResults?: {
    passed: number;
    failed: number;
    coverage?: number;
  };
}

export interface QualityGate {
  name: string;
  passed: boolean;
  details?: string;
}

export interface QualityGates {
  passed: boolean;
  checks: QualityGate[];
}

export interface Result {
  id: string;
  version: string;
  planId: string;
  taskId: string;
  status: ResultStatus;
  steps: StepResult[];
  duration: number;
  artifacts: Artifacts;
  qualityGates: QualityGates;
  metadata?: {
    startedAt?: string;
    completedAt?: string;
    executedBy?: string;
    environment?: 'local' | 'ci' | 'production';
    commitHash?: string;
    logs?: string;
  };
}

export interface ResultRow {
  id: string;
  result_id: string;
  task_id: string;
  plan_id: string;
  version: string;
  status: ResultStatus;
  summary: string;
  outputs: Record<string, unknown>;
  quality_gates: QualityGates;
  test_results: Record<string, unknown> | null;
  duration: number;
  agent: string;
  errors: Array<Record<string, unknown>> | null;
  completed_at: string;
}
