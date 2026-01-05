/**
 * Proposal Generator Service
 *
 * Facade for plan generation that delegates to the PlanningAgent.
 * Provides backward compatibility with existing workflow integration.
 */

import type { Plan } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

import { planningAgent } from './planning-agent';

/**
 * ProposalGenerator class for backward compatibility
 */
export class ProposalGenerator {
  /**
   * Generates multiple plans for a given task using AI
   */
  async generateProposals(task: Task, feedback?: string): Promise<Plan[]> {
    return planningAgent.generatePlans(task, feedback);
  }

  /**
   * Enable mock fallback when Claude API is unavailable
   */
  enableMockFallback(): void {
    planningAgent.setMockFallback(true);
  }

  /**
   * Disable mock fallback (will throw if Claude fails)
   */
  disableMockFallback(): void {
    planningAgent.setMockFallback(false);
  }
}

export const proposalGenerator = new ProposalGenerator();
