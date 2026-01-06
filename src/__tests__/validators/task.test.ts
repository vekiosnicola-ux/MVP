import { describe, it, expect } from 'vitest';
import { validateTask } from '@/core/validators/task';
import { createTestTask } from '../utils/test-fixtures';

describe('Task Validator', () => {
  it('should validate a valid task', () => {
    const task = createTestTask();
    const result = validateTask(task);
    expect(result).toEqual(task);
  });

  it('should reject task with invalid ID format', () => {
    const task = createTestTask({ id: 'invalid-id' });
    expect(() => validateTask(task)).toThrow();
  });

  it('should reject task with invalid version format', () => {
    const task = createTestTask({ version: 'invalid' });
    expect(() => validateTask(task)).toThrow();
  });

  it('should reject task with description too short', () => {
    const task = createTestTask({ description: 'short' });
    expect(() => validateTask(task)).toThrow();
  });

  it('should reject task with description too long', () => {
    const task = createTestTask({ description: 'a'.repeat(2001) });
    expect(() => validateTask(task)).toThrow();
  });

  it('should reject task with invalid repository format', () => {
    const task = createTestTask({
      context: {
        repository: 'invalid repo format',
        branch: 'main',
        files: [],
        dependencies: [],
      },
    });
    expect(() => validateTask(task)).toThrow();
  });

  it('should accept valid branch format (slashes allowed)', () => {
    // The regex allows slashes in branch names (e.g., feature/branch-name)
    const task = createTestTask({
      context: {
        repository: 'owner/repo',
        branch: 'feature/valid-branch', // This is actually valid per regex
        files: [],
        dependencies: [],
      },
    });
    // Should not throw - slashes are allowed in branch names
    const result = validateTask(task);
    expect(result.context.branch).toBe('feature/valid-branch');
  });

  it('should reject task with maxDuration too low', () => {
    const task = createTestTask({
      constraints: {
        maxDuration: 30, // Below minimum of 60
        requiresApproval: true,
        breakingChangesAllowed: false,
        testCoverageMin: 80,
      },
    });
    expect(() => validateTask(task)).toThrow();
  });

  it('should reject task with maxDuration too high', () => {
    const task = createTestTask({
      constraints: {
        maxDuration: 5000, // Above maximum of 3600
        requiresApproval: true,
        breakingChangesAllowed: false,
        testCoverageMin: 80,
      },
    });
    expect(() => validateTask(task)).toThrow();
  });

  it('should accept task with optional metadata', () => {
    const task = createTestTask({
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: 'test-user',
        priority: 'high' as const,
        labels: ['test', 'feature'],
      },
    });
    const result = validateTask(task);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.priority).toBe('high');
  });

  it('should accept task with optional intentStatement', () => {
    const task = createTestTask({
      intentStatement: 'I want to add a new feature that does X',
    });
    const result = validateTask(task);
    expect(result.intentStatement).toBeDefined();
  });
});

