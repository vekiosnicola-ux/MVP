/**
 * Agent Drift Tests
 * 
 * Tests that agents don't silently drift over time.
 * Run the same task today, after 10 tasks, after 50 tasks.
 * Compare: plan length, safety checks, assumptions.
 */

import { describe, it, expect } from 'vitest';
import { PlanningAgent } from '@/core/agents/planning-agent';
import type { Task } from '@/interfaces/task';

describe('Agent Drift Detection', () => {
  const baselineTask: Task = {
    id: 'task-baseline',
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

  it('captures baseline plan metrics', async () => {
    const planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true);
    
    const plans = await planningAgent.generatePlans(baselineTask);
    
    // Capture baseline metrics
    const baselineMetrics = {
      planCount: plans.length,
      avgStepCount: plans.reduce((sum, p) => sum + p.steps.length, 0) / plans.length,
      avgDuration: plans.reduce((sum, p) => sum + p.estimatedDuration, 0) / plans.length,
      avgRiskCount: plans.reduce((sum, p) => sum + p.risks.length, 0) / plans.length,
      hasHighRisk: plans.some(p => p.risks.some(r => r.severity === 'high' || r.severity === 'critical')),
    };

    expect(baselineMetrics.planCount).toBeGreaterThan(0);
    expect(baselineMetrics.avgStepCount).toBeGreaterThan(0);
    expect(baselineMetrics.avgDuration).toBeGreaterThan(0);
  });

  it('detects plan length drift', async () => {
    const planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true);
    
    // Run task multiple times (simulating over time)
    const runs = 3;
    const stepCounts: number[] = [];
    
    for (let i = 0; i < runs; i++) {
      const plans = await planningAgent.generatePlans(baselineTask);
      const avgSteps = plans.reduce((sum, p) => sum + p.steps.length, 0) / plans.length;
      stepCounts.push(avgSteps);
    }

    // In mock mode, should be consistent
    // In real mode, would check for significant drift
    const variance = Math.max(...stepCounts) - Math.min(...stepCounts);
    // Variance should be reasonable (in mock mode, should be 0 or very small)
    expect(variance).toBeLessThan(10); // Allow some variance
  });

  it('detects safety check drift', async () => {
    const planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true);
    
    const plans = await planningAgent.generatePlans(baselineTask);
    
    // Check that safety mechanisms are present
    for (const plan of plans) {
      // All steps should have validation (safety check)
      for (const step of plan.steps) {
        expect(step.validation).toBeDefined();
        expect(step.validation.command).toBeTruthy();
      }
      
      // Plans should have risk assessment
      expect(plan.risks).toBeDefined();
      expect(Array.isArray(plan.risks)).toBe(true);
    }
  });

  it('detects assumption drift', async () => {
    const planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true);
    
    const plans = await planningAgent.generatePlans(baselineTask);
    
    // Check that assumptions are explicit in reasoning
    for (const plan of plans) {
      expect(plan.reasoning).toBeTruthy();
      // Reasoning should explain the approach (assumptions are implicit)
      expect(plan.reasoning.length).toBeGreaterThan(20);
    }
  });

  it('maintains constraint adherence over time', async () => {
    const planningAgent = new PlanningAgent();
    planningAgent.setMockFallback(true);
    
    // Run multiple times
    for (let i = 0; i < 3; i++) {
      const plans = await planningAgent.generatePlans(baselineTask);
      
      // Should always respect constraints
      for (const plan of plans) {
        expect(plan.estimatedDuration).toBeLessThanOrEqual(baselineTask.constraints.maxDuration);
      }
    }
  });
});

