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

export const TaskSchema = z.object({
  id: z.string().regex(/^task-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  type: z.enum(['feature', 'bugfix', 'refactor', 'docs', 'test', 'infra']),
  description: z.string().min(10).max(500),
  context: TaskContextSchema,
  constraints: TaskConstraintsSchema,
  metadata: TaskMetadataSchema
});

export type Task = z.infer<typeof TaskSchema>;

export function validateTask(data: unknown): Task {
  return TaskSchema.parse(data);
}
