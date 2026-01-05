import { describe, it, expect, beforeEach } from 'vitest';

import { PlanningAgent } from '@/core/agents/planning-agent';
import type { Task } from '@/interfaces/task';

describe('PlanningAgent', () => {
  let agent: PlanningAgent;

  const mockTask: Task = {
    id: 'task-test-1234-5678-9012-345678901234',
    version: '1.0.0',
    type: 'feature',
    description: 'Add user authentication to the dashboard',
    context: {
      repository: 'test-repo',
      branch: 'main',
      files: ['src/auth/login.ts', 'src/components/dashboard.tsx'],
      dependencies: ['next-auth'],
    },
    constraints: {
      maxDuration: 120,
      requiresApproval: true,
      breakingChangesAllowed: false,
      testCoverageMin: 80,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'test-user',
      priority: 'high',
    },
  };

  beforeEach(() => {
    agent = new PlanningAgent();
    // Enable mock fallback for tests (since we don't have Claude API in tests)
    agent.setMockFallback(true);
  });

  describe('generatePlans', () => {
    it('generates 2 plans for a task', async () => {
      const plans = await agent.generatePlans(mockTask);

      expect(plans).toHaveLength(2);
    });

    it('generates plans with valid structure', async () => {
      const plans = await agent.generatePlans(mockTask);

      for (const plan of plans) {
        // Check required fields
        expect(plan.id).toBeDefined();
        expect(plan.id).toMatch(/^plan-/);
        expect(plan.taskId).toBe(mockTask.id);
        expect(plan.version).toBe('1.0.0');
        expect(plan.steps).toBeDefined();
        expect(plan.steps.length).toBeGreaterThan(0);
        expect(plan.estimatedDuration).toBeGreaterThan(0);
        expect(plan.risks).toBeDefined();
        expect(plan.metadata?.createdAt).toBeDefined();
      }
    });

    it('generates steps with valid agent types', async () => {
      const plans = await agent.generatePlans(mockTask);
      const validAgents = [
        'orchestrator',
        'architect',
        'developer',
        'database',
        'reviewer',
        'tester',
        'devops',
        'documenter',
      ];

      for (const plan of plans) {
        for (const step of plan.steps) {
          expect(validAgents).toContain(step.agent);
          expect(step.action).toBeDefined();
          expect(step.validation).toBeDefined();
          expect(step.validation.command).toBeDefined();
          expect(step.validation.successCriteria).toBeDefined();
        }
      }
    });

    it('generates risks with valid severity levels', async () => {
      const plans = await agent.generatePlans(mockTask);
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      for (const plan of plans) {
        for (const risk of plan.risks) {
          expect(validSeverities).toContain(risk.severity);
          expect(risk.description).toBeDefined();
          expect(risk.mitigation).toBeDefined();
        }
      }
    });

    it('generates different duration estimates for each plan', async () => {
      const plans = await agent.generatePlans(mockTask);

      // Standard plan should take longer than fast-track
      const durations = plans.map((p) => p.estimatedDuration);
      expect(new Set(durations).size).toBeGreaterThan(1);
    });

    it('includes step dependencies correctly', async () => {
      const plans = await agent.generatePlans(mockTask);

      for (const plan of plans) {
        // First step should have no dependencies
        const firstStep = plan.steps[0];
        expect(firstStep?.dependencies).toBeUndefined();

        // Subsequent steps should depend on previous steps
        for (let i = 1; i < plan.steps.length; i++) {
          const step = plan.steps[i];
          expect(step?.dependencies).toBeDefined();
        }
      }
    });

    it('accepts feedback and generates plans', async () => {
      const feedback = 'I need more focus on database security.';
      const plans = await agent.generatePlans(mockTask, feedback);

      expect(plans).toHaveLength(2);
      expect(plans[0]?.taskId).toBe(mockTask.id);
    });
  });

  describe('mock fallback', () => {
    it('uses mock plans when fallback is enabled', async () => {
      agent.setMockFallback(true);
      const plans = await agent.generatePlans(mockTask);

      expect(plans).toHaveLength(2);
      // Mock plans should have standard structure
      expect(plans[0]?.steps[0]?.agent).toBeDefined();
    });
  });
});
