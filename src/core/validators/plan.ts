import { z } from 'zod';

const PlanStepSchema = z.object({
  id: z.string().regex(/^step-[0-9]{3}$/),
  agent: z.enum(['orchestrator', 'architect', 'developer', 'database', 'reviewer', 'tester', 'devops', 'documenter']),
  action: z.string().min(10).max(200),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  validation: z.object({
    command: z.string(),
    successCriteria: z.string()
  }),
  dependencies: z.array(z.string().regex(/^step-[0-9]{3}$/)).optional()
});

const RiskSchema = z.object({
  description: z.string().min(10),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  mitigation: z.string().min(10)
});

const ContractChangeSchema = z.object({
  file: z.string(),
  type: z.enum(['schema', 'interface', 'api', 'config']),
  breaking: z.boolean(),
  description: z.string().optional()
});

const PlanMetadataSchema = z.object({
  createdAt: z.string().datetime().optional(),
  approved: z.boolean().default(false).optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional()
}).optional();

export const PlanSchema = z.object({
  id: z.string().regex(/^plan-[a-z0-9-]{36}|plan-[a-z0-9]+$/), // allow uuid or simple id
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  approach: z.string(),
  reasoning: z.string(),
  taskId: z.string().regex(/^task-[a-z0-9-]{36}|task-[a-z0-9]+$/),
  steps: z.array(PlanStepSchema).min(1),
  estimatedDuration: z.number().int().min(30),
  risks: z.array(RiskSchema),
  contractChanges: z.array(ContractChangeSchema).optional(),
  metadata: PlanMetadataSchema
});

export type Plan = z.infer<typeof PlanSchema>;

export function validatePlan(data: unknown): Plan {
  return PlanSchema.parse(data);
}
