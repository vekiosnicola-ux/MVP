import { describe, it, expect } from 'vitest';
import { createTestDecision, createTestTask, createTestPlan } from '../utils/test-fixtures';

/**
 * Integration tests for /api/decisions endpoints
 */

describe('Decisions API', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('POST /api/decisions', () => {
    it('should create a valid decision', async () => {
      // First create task and plan
      const task = createTestTask();
      const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const createdTask = await taskResponse.json();

      const plan = createTestPlan(createdTask.id);
      const planResponse = await fetch(`${baseUrl}/api/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const createdPlan = await planResponse.json();

      // Now create decision
      const decision = createTestDecision(createdTask.id, createdPlan.id);
      const response = await fetch(`${baseUrl}/api/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      });

      expect(response.status).toBe(201);
      const created = await response.json();
      expect(created.taskId).toBe(createdTask.id);
      expect(created.planId).toBe(createdPlan.id);
    });

    it('should reject invalid decision data', async () => {
      const invalidDecision = { id: 'invalid' };

      const response = await fetch(`${baseUrl}/api/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDecision),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBeDefined();
    });
  });

  describe('GET /api/decisions', () => {
    it('should return list of decisions', async () => {
      const response = await fetch(`${baseUrl}/api/decisions`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter decisions by taskId', async () => {
      const task = createTestTask();
      const taskResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const createdTask = await taskResponse.json();

      const response = await fetch(`${baseUrl}/api/decisions?taskId=${createdTask.id}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter decisions by category', async () => {
      const response = await fetch(`${baseUrl}/api/decisions?category=architecture`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});

