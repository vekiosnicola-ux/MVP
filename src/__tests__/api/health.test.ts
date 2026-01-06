import { describe, it, expect } from 'vitest';

/**
 * Health check API tests
 * These are simple and should always pass if server is running
 * 
 * Note: These are integration tests that require a running Next.js server.
 * They are skipped in CI environments where no server is available.
 */

const shouldSkip = process.env.CI === 'true' || !process.env.TEST_API_URL;

describe.skipIf(shouldSkip)('Health API', () => {
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
    });

    it('should respond quickly', async () => {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/health`);
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond in < 1s
    });
  });

  describe('GET /api/db-health', () => {
    it('should return database status', async () => {
      const response = await fetch(`${baseUrl}/api/db-health`);
      
      // May be 200 (connected) or 500 (error) depending on DB setup
      expect([200, 500]).toContain(response.status);
      
      const data = await response.json();
      expect(data.status).toBeDefined();
    });
  });
});

