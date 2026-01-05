import { describe, it, expect, beforeEach } from 'vitest';

import { ExecutionAgent } from '@/core/agents/execution-agent';
import type { Plan } from '@/interfaces/plan';

describe('ExecutionAgent', () => {
  let agent: ExecutionAgent;

  const mockPlan: Plan = {
    id: 'plan-test-1234',
    taskId: 'task-test-5678',
    version: '1.0.0',
    steps: [
      {
        id: 'step-1',
        agent: 'architect',
        action: 'Design implementation',
        inputs: ['task-test-5678'],
        outputs: ['architecture_spec'],
        validation: {
          command: 'npm run type-check',
          successCriteria: 'No type errors',
        },
      },
      {
        id: 'step-2',
        agent: 'developer',
        action: 'Implement feature',
        inputs: ['architecture_spec'],
        outputs: ['code_implementation'],
        validation: {
          command: 'npm run test',
          successCriteria: 'All tests pass',
        },
        dependencies: ['step-1'],
      },
    ],
    estimatedDuration: 60,
    risks: [],
    metadata: { createdAt: new Date().toISOString() },
  };

  beforeEach(() => {
    agent = new ExecutionAgent({ stepDelay: 10 }); // Fast execution for tests
  });

  describe('execute', () => {
    it('executes all steps in a plan', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      expect(result.steps).toHaveLength(2);
      expect(result.planId).toBe(mockPlan.id);
      expect(result.taskId).toBe('task-test-5678');
    });

    it('returns success when all steps pass', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      expect(result.status).toBe('success');
      expect(result.steps.every((s) => s.status === 'success')).toBe(true);
    });

    it('returns partial_success when some steps fail', async () => {
      const agentWithFailure = new ExecutionAgent({
        stepDelay: 10,
        forceFailStep: 'step-2',
      });

      const result = await agentWithFailure.execute(mockPlan, 'task-test-5678');

      expect(result.status).toBe('partial_success');
      expect(result.steps[0]?.status).toBe('success');
      expect(result.steps[1]?.status).toBe('failure');
    });

    it('generates valid result structure', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      expect(result.id).toMatch(/^result-/);
      expect(result.version).toBe('1.0.0');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.artifacts).toBeDefined();
      expect(result.qualityGates).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('includes validation details in step results', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      for (const step of result.steps) {
        expect(step.validation).toBeDefined();
        expect(step.validation.command).toBeDefined();
        expect(step.validation.output).toBeDefined();
        expect(typeof step.validation.exitCode).toBe('number');
      }
    });

    it('generates quality gate checks', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      expect(result.qualityGates.checks.length).toBeGreaterThan(0);
      expect(result.qualityGates.passed).toBe(true);

      for (const check of result.qualityGates.checks) {
        expect(check.name).toBeDefined();
        expect(typeof check.passed).toBe('boolean');
      }
    });

    it('generates artifacts', async () => {
      const result = await agent.execute(mockPlan, 'task-test-5678');

      expect(result.artifacts.filesCreated).toBeDefined();
      expect(result.artifacts.filesModified).toBeDefined();
      expect(result.artifacts.filesDeleted).toBeDefined();
      expect(result.artifacts.testResults).toBeDefined();
    });
  });

  describe('progress callbacks', () => {
    it('notifies progress for each step', async () => {
      const progressUpdates: Array<{ stepId: string; status: string }> = [];

      agent.onProgress((progress) => {
        progressUpdates.push({
          stepId: progress.stepId,
          status: progress.status,
        });
      });

      await agent.execute(mockPlan, 'task-test-5678');

      // Should have running + completed for each step
      expect(progressUpdates.length).toBe(4); // 2 steps × 2 updates each
      expect(progressUpdates.filter((p) => p.status === 'running').length).toBe(2);
      expect(progressUpdates.filter((p) => p.status === 'completed').length).toBe(2);
    });

    it('allows unsubscribing from progress', async () => {
      const progressUpdates: string[] = [];

      const unsubscribe = agent.onProgress((progress) => {
        progressUpdates.push(progress.stepId);
      });

      unsubscribe();

      await agent.execute(mockPlan, 'task-test-5678');

      expect(progressUpdates.length).toBe(0);
    });
  });

  describe('failure scenarios', () => {
    it('handles 100% failure rate', async () => {
      const failingAgent = new ExecutionAgent({
        stepDelay: 10,
        failureRate: 1,
      });

      const result = await failingAgent.execute(mockPlan, 'task-test-5678');

      expect(result.status).toBe('failure');
      expect(result.steps.every((s) => s.status === 'failure')).toBe(true);
    });

    it('includes error details on failure', async () => {
      const failingAgent = new ExecutionAgent({
        stepDelay: 10,
        forceFailStep: 'step-1',
      });

      const result = await failingAgent.execute(mockPlan, 'task-test-5678');

      const failedStep = result.steps.find((s) => s.status === 'failure');
      expect(failedStep?.error).toBeDefined();
      expect(failedStep?.error?.message).toBeDefined();
    });
  });
});
