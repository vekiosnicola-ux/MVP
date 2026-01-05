import { z } from 'zod';

const TaskContextSchema = z.object({
  repository: z.string().regex(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/),
  branch: z.string().regex(/^[a-zA-Z0-9/_-]+$/),
  files: z.array(z.string().regex(/^[a-zA-Z0-9/_.-]+$/)),
  dependencies: z.array(z.string().regex(/^task-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/)).optional()
});

const TaskConstraintsSchema = z.object({
  maxDuration: z.number().int().min(60).max(3600),
  requiresApproval: z.boolean().default(true),
  breakingChangesAllowed: z.boolean().default(false),
  testCoverageMin: z.number().min(0).max(100).default(80)
});

const TaskMetadataSchema = z.object({
  createdAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium').optional(),
  labels: z.array(z.string()).optional()
}).optional();

// System 3 target system type
const TargetSystemSchema = z.enum(['external', 'self']).default('external');

export const TaskSchema = z.object({
  id: z.string().regex(/^task-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  type: z.enum(['feature', 'bugfix', 'refactor', 'docs', 'test', 'infra']),
  description: z.string().min(10).max(500),
  context: TaskContextSchema,
  constraints: TaskConstraintsSchema,
  metadata: TaskMetadataSchema,

  // System 3 extensions (all optional)
  intentStatement: z.string().min(10).max(1000).optional(),
  targetSystem: TargetSystemSchema.optional(),
  mustNotBreak: z.array(z.string()).optional(),
  chatSessionId: z.string().uuid().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export function validateTask(data: unknown): Task {
  return TaskSchema.parse(data);
}
