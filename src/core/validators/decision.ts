import { z } from 'zod';

const ProposalSchema = z.object({
  approach: z.string(),
  reasoning: z.string(),
  tradeoffs: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    risks: z.array(z.string())
  })
});

export const DecisionSchema = z.object({
  id: z.string().regex(/^decision-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  taskId: z.string().regex(/^task-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  planId: z.string().regex(/^plan-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/).nullable().optional(),
  category: z.enum(['architecture', 'ux', 'performance', 'security', 'integration']),
  proposals: z.array(ProposalSchema).min(1),
  selectedOption: z.number().int().min(0),
  rationale: z.string().min(10),
  overrides: z.array(z.string()).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  timestamp: z.string().datetime().optional()
});

export type Decision = z.infer<typeof DecisionSchema>;

export function validateDecision(data: unknown): Decision {
  return DecisionSchema.parse(data);
}
