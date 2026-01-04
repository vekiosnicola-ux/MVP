export type DecisionCategory = 'architecture' | 'ux' | 'performance' | 'security' | 'integration';

export interface Proposal {
  approach: string;
  reasoning: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
    risks: string[];
  };
}

export interface Decision {
  id: string;
  taskId: string;
  planId?: string | null;
  category: DecisionCategory;
  proposals: Proposal[];
  selectedOption: number;
  rationale: string;
  overrides?: string[];
}

export interface DecisionRow {
  id: string;
  decision_id: string;
  task_id: string;
  plan_id: string | null;
  category: DecisionCategory;
  proposals: Proposal[];
  selected_option: number;
  rationale: string;
  overrides: string[] | null;
  decided_by: string | null;
  decided_at: string;
}
