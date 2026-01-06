/**
 * Test Fixtures and Utilities
 * 
 * Common test data and helpers for Aura tests.
 */

import type { Task } from '@/interfaces/task';
import type { Plan } from '@/interfaces/plan';
import type { Decision } from '@/interfaces/decision';

export function createTestTask(overrides?: Partial<Task>): Task {
  return {
    id: `task-${crypto.randomUUID()}`,
    version: '1.0.0',
    type: 'feature',
    description: 'Test task description',
    context: {
      repository: 'test-repo',
      branch: 'main',
      files: [],
      dependencies: [],
    },
    constraints: {
      maxDuration: 60,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 80,
    },
    ...overrides,
  };
}

export function createTestPlan(taskId: string, overrides?: Partial<Plan>): Plan {
  return {
    id: `plan-${crypto.randomUUID()}`,
    version: '1.0.0',
    taskId,
    approach: 'Test Approach',
    reasoning: 'Test reasoning for this approach',
    steps: [
      {
        id: 'step-001',
        agent: 'developer',
        action: 'Implement feature',
        inputs: ['task-id'],
        outputs: ['implementation'],
        validation: {
          command: 'npm run test',
          successCriteria: 'All tests pass',
        },
      },
    ],
    estimatedDuration: 30,
    risks: [
      {
        description: 'Potential regression',
        severity: 'medium',
        mitigation: 'Run full test suite',
      },
    ],
    ...overrides,
  };
}

export function createTestDecision(taskId: string, planId: string, overrides?: Partial<Decision>): Decision {
  return {
    id: `decision-${crypto.randomUUID()}`,
    taskId,
    planId,
    category: 'architecture',
    proposals: [],
    selectedOption: 0,
    rationale: 'Test approval rationale',
    ...overrides,
  };
}

export function createImpossibleTask(): Task {
  return createTestTask({
    description: 'Build a time machine in 1 minute',
    constraints: {
      maxDuration: 1,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 100,
    },
  });
}

export function createDangerousTask(): Task {
  return createTestTask({
    type: 'refactor',
    description: 'Delete all test files',
    constraints: {
      maxDuration: 60,
      requiresApproval: true,
      breakingChangesAllowed: true,
      testCoverageMin: 0,
    },
  });
}

export function createMissingContextTask(): Task {
  return createTestTask({
    description: 'Add feature X',
    context: {
      repository: 'unknown-repo',
      branch: 'main',
      files: [],
      dependencies: [],
    },
  });
}

