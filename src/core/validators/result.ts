import { z } from 'zod';

const StepResultSchema = z.object({
  id: z.string().regex(/^step-[0-9]{3}$/),
  status: z.enum(['success', 'failure', 'skipped']),
  duration: z.number().int().min(0),
  validation: z.object({
    passed: z.boolean(),
    command: z.string().optional(),
    output: z.string(),
    exitCode: z.number().int().optional()
  }),
  artifacts: z.array(z.string()).optional(),
  error: z.object({
    message: z.string(),
    stackTrace: z.string().optional(),
    recoverable: z.boolean().optional()
  }).optional()
});

const ArtifactsSchema = z.object({
  filesCreated: z.array(z.string()),
  filesModified: z.array(z.string()),
  filesDeleted: z.array(z.string()),
  testResults: z.object({
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    coverage: z.number().min(0).max(100).optional()
  }).optional()
});

const QualityGateSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  details: z.string().optional()
});

const QualityGatesSchema = z.object({
  passed: z.boolean(),
  checks: z.array(QualityGateSchema)
});

const ResultMetadataSchema = z.object({
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  executedBy: z.string().optional(),
  environment: z.enum(['local', 'ci', 'production']).optional(),
  commitHash: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  logs: z.string().optional()
}).optional();

export const ResultSchema = z.object({
  id: z.string().regex(/^result-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  planId: z.string().regex(/^plan-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  taskId: z.string().regex(/^task-[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/),
  status: z.enum(['success', 'partial_success', 'failure', 'cancelled']),
  steps: z.array(StepResultSchema).min(1),
  duration: z.number().int().min(0),
  artifacts: ArtifactsSchema,
  qualityGates: QualityGatesSchema,
  metadata: ResultMetadataSchema
});

export type Result = z.infer<typeof ResultSchema>;

export function validateResult(data: unknown): Result {
  return ResultSchema.parse(data);
}
