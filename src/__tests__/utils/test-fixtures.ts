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
      repository: 'owner/repo', // Must match format: owner/repo
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
      repository: 'unknown/repo', // Must match format: owner/repo
      branch: 'main',
      files: [],
      dependencies: [],
    },
  });
}

/**
 * Create a test Supabase client for testing
 * Uses test environment variables if available, falls back to existing database
 */
export function getTestSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js');
  
  // Prefer test database, but use existing if test DB not configured
  const testUrl = process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const testKey = process.env.TEST_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!testUrl || !testKey) {
    throw new Error(
      'Supabase credentials not configured. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, ' +
      'or TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY for separate test database.'
    );
  }
  
  return createClient(testUrl, testKey);
}

/**
 * Clean up test data from database
 * 
 * Removes all records with IDs starting with test prefix.
 * Safe to use with existing database - only removes test data.
 */
export async function cleanupTestData(supabase: any, table: string, testIdPrefix: string = 'test-') {
  try {
    // Delete records where ID starts with test prefix
    const { error } = await supabase
      .from(table)
      .delete()
      .like('id', `${testIdPrefix}%`);
    
    if (error) {
      console.warn(`Failed to cleanup ${table}:`, error);
      // Don't throw - allow tests to continue even if cleanup fails
    }
  } catch (error) {
    console.warn(`Error during cleanup of ${table}:`, error);
    // Don't throw - cleanup failures shouldn't break tests
  }
}

/**
 * Clean up all test data from all tables
 * Useful for afterEach hooks
 */
export async function cleanupAllTestData(supabase: any) {
  const tables = ['tasks', 'plans', 'decisions', 'results', 'human_overrides'];
  
  for (const table of tables) {
    await cleanupTestData(supabase, table, 'test-');
  }
}

/**
 * Wait for async operation with timeout
 */
export function waitFor(condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = async () => {
      if (await condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

/**
 * Mock fetch for API testing
 */
export function createMockFetch(responses: Record<string, any>) {
  return async (url: string, options?: RequestInit) => {
    const key = `${options?.method || 'GET'} ${url}`;
    const response = responses[key] || responses[url] || { status: 404, body: { error: 'Not found' } };
    
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status || 200,
      json: async () => response.body || {},
      text: async () => JSON.stringify(response.body || {}),
    } as Response;
  };
}

