import { describe, it, expect } from 'vitest';
import { createTestTask } from '../utils/test-fixtures';

/**
 * Integration tests for /api/tasks endpoints
 * 
 * Note: These tests require a running Next.js server and test database.
 * They are skipped in CI environments where no server is available.
 * Run locally with: npm run dev (in one terminal) && npm run test (in another)
 */

const shouldSkip = process.env.CI === 'true' || !process.env.TEST_API_URL;

describe.skipIf(shouldSkip)('Tasks API', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('POST /api/tasks', () => {
    it('should create a valid task', async () => {
      const task = createTestTask();
      
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      expect(response.status).toBe(201);
      const created = await response.json();
      expect(created.id).toBe(task.id);
      expect(created.description).toBe(task.description);
    });

    it('should reject invalid task data', async () => {
      const invalidTask = { id: 'invalid', description: 'short' };

      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTask),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBeDefined();
    });

    it('should auto-generate ID if missing', async () => {
      const taskWithoutId = createTestTask();
      delete (taskWithoutId as any).id;

      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithoutId),
      });

      expect(response.status).toBe(201);
      const created = await response.json();
      expect(created.id).toMatch(/^task-[a-z0-9-]+$/);
    });

    it('should auto-generate version if missing', async () => {
      const taskWithoutVersion = createTestTask();
      delete (taskWithoutVersion as any).version;

      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithoutVersion),
      });

      expect(response.status).toBe(201);
      const created = await response.json();
      expect(created.version).toBe('1.0.0');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return list of tasks', async () => {
      const response = await fetch(`${baseUrl}/api/tasks`);
      
      expect(response.status).toBe(200);
      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await fetch(`${baseUrl}/api/tasks?status=pending`);
      
      expect(response.status).toBe(200);
      const tasks = await response.json();
      if (tasks.length > 0) {
        tasks.forEach((task: any) => {
          expect(task.status).toBe('pending');
        });
      }
    });

    it('should return empty array when no tasks', async () => {
      // This test assumes test database is empty or filtered
      const response = await fetch(`${baseUrl}/api/tasks?status=nonexistent`);
      
      expect(response.status).toBe(200);
      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('GET /api/tasks/[id]', () => {
    it('should return task by ID', async () => {
      // First create a task
      const task = createTestTask();
      const createResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const created = await createResponse.json();

      // Then fetch it
      const response = await fetch(`${baseUrl}/api/tasks/${created.id}`);
      expect(response.status).toBe(200);
      const fetched = await response.json();
      expect(fetched.id).toBe(created.id);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = 'task-00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${baseUrl}/api/tasks/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });
});

