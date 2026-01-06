/**
 * Execution Agent Unit Tests
 * 
 * Tests execution behavior, circuit breaker, and safety mechanisms.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionAgent } from '@/core/agents/execution-agent';
import type { Plan } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

describe('ExecutionAgent', () => {
  let executionAgent: ExecutionAgent;
  let samplePlan: Plan;
  let sampleTask: Task;

  beforeEach(() => {
    executionAgent = new ExecutionAgent({ mode: 'mock' });
    
    sampleTask = {
      id: 'task-test-001',
      version: '1.0.0',
      type: 'feature',
      description: 'Test task',
      context: {
        repository: 'test-repo',
        branch: 'main',
        files: [],
      },
      constraints: {
        maxDuration: 60,
        requiresApproval: true,
        breakingChangesAllowed: false,
        testCoverageMin: 80,
      },
    };

    samplePlan = {
      id: 'plan-test-001',
      version: '1.0.0',
      taskId: sampleTask.id,
      approach: 'Test Approach',
      reasoning: 'Test reasoning',
      steps: [
        {
          id: 'step-001',
          agent: 'developer',
          action: 'Create test file',
          inputs: ['task-id'],
          outputs: ['test-file.ts'],
          validation: {
            command: 'echo "test"',
            successCriteria: 'Command succeeds',
          },
        },
        {
          id: 'step-002',
          agent: 'tester',
          action: 'Run tests',
          inputs: ['test-file.ts'],
          outputs: ['test-results'],
          validation: {
            command: 'echo "tests pass"',
            successCriteria: 'All tests pass',
          },
          dependencies: ['step-001'],
        },
      ],
      estimatedDuration: 30,
      risks: [],
    };
  });

  it('executes plan in mock mode', async () => {
    const result = await executionAgent.execute(samplePlan, sampleTask.id);
    
    expect(result).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.steps.length).toBe(samplePlan.steps.length);
    expect(result.taskId).toBe(sampleTask.id);
    expect(result.planId).toBe(samplePlan.id);
  });

  it('circuit breaker stops after max failures', async () => {
    const agent = new ExecutionAgent({
      mode: 'mock',
      failureRate: 1.0, // Always fail
      circuitBreaker: {
        maxConsecutiveFailures: 2,
        stepTimeout: 5000,
        maxRetries: 0,
      },
    });

    const result = await agent.execute(samplePlan, sampleTask.id);
    
    // Should stop early due to circuit breaker
    expect(result.status).toBe('failure');
    expect(result.steps.length).toBeLessThanOrEqual(2); // Circuit breaker should trigger
  });

  it('tracks progress via callbacks', async () => {
    const progressUpdates: Array<{ currentStep: number; totalSteps: number; stepId: string; status: string }> = [];
    
    executionAgent.onProgress((progress) => {
      progressUpdates.push(progress);
    });

    await executionAgent.execute(samplePlan, sampleTask.id);
    
    // Should have received progress updates
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[0]?.currentStep).toBe(1);
    expect(progressUpdates[0]?.totalSteps).toBe(samplePlan.steps.length);
  });

  it('handles step dependencies', async () => {
    const result = await executionAgent.execute(samplePlan, sampleTask.id);
    
    // Both steps should be executed
    expect(result.steps.length).toBe(2);
    expect(result.steps[0]?.id).toBe('step-001');
    expect(result.steps[1]?.id).toBe('step-002');
  });

  it('generates quality gates', async () => {
    const result = await executionAgent.execute(samplePlan, sampleTask.id);
    
    expect(result.qualityGates).toBeDefined();
    expect(result.qualityGates.checks).toBeDefined();
    expect(Array.isArray(result.qualityGates.checks)).toBe(true);
  });

  it('records execution metadata', async () => {
    const result = await executionAgent.execute(samplePlan, sampleTask.id);
    
    expect(result.metadata).toBeDefined();
    if (result.metadata) {
      expect(result.metadata.executionMode).toBe('mock');
      expect(result.metadata.startedAt).toBeDefined();
      expect(result.metadata.completedAt).toBeDefined();
    }
  });
});

