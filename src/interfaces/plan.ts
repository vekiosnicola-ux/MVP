export type PlanStatus = 'proposed' | 'approved' | 'rejected' | 'executing';
export type AgentType = 'orchestrator' | 'architect' | 'developer' | 'database' | 'reviewer' | 'tester' | 'devops' | 'documenter';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PlanStep {
  id: string;
  agent: AgentType;
  action: string;
  inputs: string[];
  outputs: string[];
  validation: {
    command: string;
    successCriteria: string;
  };
  dependencies?: string[];
}

export interface Risk {
  description: string;
  severity: RiskSeverity;
  mitigation: string;
}

export interface Plan {
  id: string;
  version: string;
  taskId: string;
  approach: string;
  reasoning: string;
  steps: PlanStep[];
  estimatedDuration: number;
  risks: Risk[];
  contractChanges?: Array<{
    file: string;
    type: 'schema' | 'interface' | 'api' | 'config';
    breaking: boolean;
    description?: string;
  }>;
  metadata?: {
    createdAt?: string;
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: string;
  };
}

export interface PlanRow {
  id: string;
  plan_id: string;
  task_id: string;
  version: string;
  approach: string;
  reasoning: string;
  steps: PlanStep[];
  agent: string;
  estimated_duration: number;
  dependencies: string[] | null;
  risks: Risk[] | null;
  status: PlanStatus;
  created_at: string;
}
