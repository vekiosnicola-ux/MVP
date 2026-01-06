import { describe, it, expect } from 'vitest';
import { createTestPlan, createTestTask } from '../utils/test-fixtures';

/**
 * Integration tests for /api/plans endpoints
 * 
 * Note: These tests require a running Next.js server and test database.
 * They are skipped in CI environments where no server is available.
 */

const shouldSkip = process.env.CI === 'true' || !process.env.TEST_API_URL;

describe.skipIf(shouldSkip)('Plans API', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('POST /api/plans', () => {
    it('should create a valid plan', async () => {
      // First create task
      const task = createTestTask();
      const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const createdTask = await taskResponse.json();

      // Create plan
      const plan = createTestPlan(createdTask.id);
      const response = await fetch(`${baseUrl}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      expect(response.status).toBe(201);
      const created = await response.json();
      expect(created.taskId).toBe(createdTask.id);
      expect(created.approach).toBe(plan.approach);
    });

    it('should reject invalid plan data', async () => {
      const invalidPlan = { id: 'invalid' };

      const response = await fetch(`${baseUrl}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPlan),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBeDefined();
    });
  });

  describe('GET /api/plans', () => {
    it('should return list of plans', async () => {
      const response = await fetch(`${baseUrl}/api/plans`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter plans by taskId', async () => {
      const task = createTestTask();
      const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const createdTask = await taskResponse.json();

      const response = await fetch(`${baseUrl}/api/plans?taskId=${createdTask.id}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter plans by status', async () => {
      const response = await fetch(`${baseUrl}/api/plans?status=pending`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});

