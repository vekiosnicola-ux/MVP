/**
 * Planning Agent Unit Tests
 * 
 * Tests determinism, structure, constraints, and invariants.
 * Never tests "creativity" - only structure and constraints.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlanningAgent } from '@/core/agents/planning-agent';
import type { Task } from '@/interfaces/task';
import { PlanSchema } from '@/core/validators/plan';

describe('PlanningAgent', () => {
  let planningAgent: PlanningAgent;
  let sampleTask: Task;

  beforeEach(() => {
    planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true); // Use mock for deterministic testing
    
    sampleTask = {
      id: 'task-test001',
      version: '1.0.0',
      type: 'feature',
      description: 'Add user authentication with email and password',
      context: {
        repository: 'test-repo',
        branch: 'main',
        files: ['src/auth.ts'],
        dependencies: [],
      },
      constraints: {
        maxDuration: 120,
        requiresApproval: true,
        breakingChangesAllowed: false,
        testCoverageMin: 80,
      },
    };
  });

  it('produces stable structure', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    expect(plans).toBeDefined();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);
  });

  it('all plans match PlanSchema', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    for (const plan of plans) {
      // Should not throw - validates structure
      const validated = PlanSchema.parse(plan);
      expect(validated).toBeDefined();
    }
  });

  it('plans have required fields', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    for (const plan of plans) {
      expect(plan.id).toMatch(/^plan-/);
      expect(plan.taskId).toBe(sampleTask.id);
      expect(plan.approach).toBeTruthy();
      expect(plan.reasoning).toBeTruthy();
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.estimatedDuration).toBeGreaterThan(0);
    }
  });

  it('steps have valid agent types', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
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
      }
    }
  });

  it('steps have valid step IDs', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    for (const plan of plans) {
      for (const step of plan.steps) {
        expect(step.id).toMatch(/^step-\d{3}$/);
      }
    }
  });

  it('steps have validation commands', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    for (const plan of plans) {
      for (const step of plan.steps) {
        expect(step.validation.command).toBeTruthy();
        expect(step.validation.successCriteria).toBeTruthy();
      }
    }
  });

  it('risks have valid severity levels', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    
    for (const plan of plans) {
      for (const risk of plan.risks) {
        expect(validSeverities).toContain(risk.severity);
        expect(risk.description).toBeTruthy();
        expect(risk.mitigation).toBeTruthy();
      }
    }
  });

  it('respects task constraints', async () => {
    const plans = await planningAgent.generatePlans(sampleTask);
    
    for (const plan of plans) {
      // Estimated duration should not exceed max
      expect(plan.estimatedDuration).toBeLessThanOrEqual(sampleTask.constraints.maxDuration);
    }
  });

  it('handles feedback for iterative refinement', async () => {
    const feedback = 'The plan is too complex. Simplify to 2 steps maximum.';
    const plans = await planningAgent.generatePlans(sampleTask, feedback);
    
    // Plans should still be valid
    expect(plans.length).toBeGreaterThan(0);
    for (const plan of plans) {
      PlanSchema.parse(plan);
    }
  });
});

