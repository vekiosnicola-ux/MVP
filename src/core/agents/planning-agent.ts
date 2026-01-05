/**
 * Planning Agent
 *
 * Uses Claude AI to generate implementation plans for development tasks.
 * Produces structured proposals with steps, risks, and estimated durations.
 */

import type { Plan, PlanStep, Risk, AgentType, RiskSeverity } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

import { claudeClient } from './claude-client';

// ============================================================================
// Types
// ============================================================================

interface ProposalResponse {
  approach: string;
  reasoning: string;
  steps: Array<{
    agent: string;
    action: string;
    inputs: string[];
    outputs: string[];
    validationCommand: string;
    successCriteria: string;
  }>;
  estimatedDuration: number;
  risks: Array<{
    description: string;
    severity: string;
    mitigation: string;
  }>;
}

interface GeneratedProposals {
  proposals: ProposalResponse[];
}

// ============================================================================
// Prompt Templates
// ============================================================================

const SYSTEM_PROMPT = `You are an expert software architect and development lead.
Your job is to analyze development tasks and create detailed implementation plans.

You work with a team of specialized agents:
- orchestrator: Coordinates the overall workflow
- architect: Designs system structure and patterns
- developer: Writes code implementation
- database: Handles schema and data changes
- reviewer: Reviews code for quality and security
- tester: Creates and runs tests
- devops: Handles deployment and infrastructure
- documenter: Creates documentation

Create practical, actionable plans that can be executed step-by-step.
Each step should have clear validation criteria.`;

function createPlanningPrompt(task: Task): string {
  return `Generate 2 implementation proposals for this task:

TASK DETAILS:
- Type: ${task.type}
- Description: ${task.description}
- Repository: ${task.context.repository}
- Branch: ${task.context.branch}
- Files involved: ${task.context.files.join(', ') || 'Not specified'}
- Dependencies: ${task.context.dependencies?.join(', ') || 'None'}

CONSTRAINTS:
- Max duration: ${task.constraints.maxDuration} minutes
- Requires approval: ${task.constraints.requiresApproval}
- Breaking changes allowed: ${task.constraints.breakingChangesAllowed}
- Min test coverage: ${task.constraints.testCoverageMin}%

Generate exactly 2 proposals:
1. A STANDARD approach - thorough, safe, follows best practices
2. A FAST-TRACK approach - minimal viable implementation, faster delivery

For each proposal, provide:
- approach: A short name for the approach (e.g., "Standard Implementation", "Fast-Track MVP")
- reasoning: Why this approach is suitable (2-3 sentences)
- steps: Array of implementation steps with:
  - agent: Which agent handles this (orchestrator|architect|developer|database|reviewer|tester|devops|documenter)
  - action: What specifically to do
  - inputs: What this step needs
  - outputs: What this step produces
  - validationCommand: Shell command to validate (e.g., "npm run test")
  - successCriteria: How to know it succeeded
- estimatedDuration: Total minutes for this approach
- risks: Array of risks with description, severity (low|medium|high|critical), and mitigation

Respond with JSON in this exact format:
{
  "proposals": [
    {
      "approach": "string",
      "reasoning": "string",
      "steps": [...],
      "estimatedDuration": number,
      "risks": [...]
    },
    {
      "approach": "string",
      "reasoning": "string",
      "steps": [...],
      "estimatedDuration": number,
      "risks": [...]
    }
  ]
}`;
}

// ============================================================================
// Planning Agent
// ============================================================================

export class PlanningAgent {
  private useMockFallback = false;

  /**
   * Generate implementation plans for a task
   */
  async generatePlans(task: Task): Promise<Plan[]> {
    // Check if Claude is configured
    if (!claudeClient.isConfigured()) {
      console.warn('[PlanningAgent] Claude API not configured, using mock plans');
      return this.generateMockPlans(task);
    }

    try {
      const prompt = createPlanningPrompt(task);

      const response = await claudeClient.generateJSON<GeneratedProposals>(prompt, {
        system: SYSTEM_PROMPT,
        maxTokens: 4096,
        temperature: 0.7,
      });

      return response.proposals.map((proposal) =>
        this.convertToPlans(proposal, task)
      );
    } catch (error) {
      console.error('[PlanningAgent] Error generating plans:', error);

      // Fall back to mock plans if Claude fails
      if (this.useMockFallback) {
        console.warn('[PlanningAgent] Falling back to mock plans');
        return this.generateMockPlans(task);
      }

      throw error;
    }
  }

  /**
   * Enable/disable mock fallback when Claude fails
   */
  setMockFallback(enabled: boolean): void {
    this.useMockFallback = enabled;
  }

  /**
   * Convert Claude response to Plan format
   */
  private convertToPlans(proposal: ProposalResponse, task: Task): Plan {
    const planId = `plan-${crypto.randomUUID()}`;

    const steps: PlanStep[] = proposal.steps.map((step, stepIndex) => ({
      id: `step-${stepIndex + 1}`,
      agent: this.validateAgentType(step.agent),
      action: step.action,
      inputs: step.inputs,
      outputs: step.outputs,
      validation: {
        command: step.validationCommand,
        successCriteria: step.successCriteria,
      },
      dependencies: stepIndex > 0 ? [`step-${stepIndex}`] : undefined,
    }));

    const risks: Risk[] = proposal.risks.map((risk) => ({
      description: risk.description,
      severity: this.validateSeverity(risk.severity),
      mitigation: risk.mitigation,
    }));

    return {
      id: planId,
      taskId: task.id,
      version: '1.0.0',
      steps,
      estimatedDuration: proposal.estimatedDuration,
      risks,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate and normalize agent type
   */
  private validateAgentType(agent: string): AgentType {
    const validAgents: AgentType[] = [
      'orchestrator',
      'architect',
      'developer',
      'database',
      'reviewer',
      'tester',
      'devops',
      'documenter',
    ];

    const normalized = agent.toLowerCase() as AgentType;
    return validAgents.includes(normalized) ? normalized : 'developer';
  }

  /**
   * Validate and normalize risk severity
   */
  private validateSeverity(severity: string): RiskSeverity {
    const validSeverities: RiskSeverity[] = ['low', 'medium', 'high', 'critical'];
    const normalized = severity.toLowerCase() as RiskSeverity;
    return validSeverities.includes(normalized) ? normalized : 'medium';
  }

  /**
   * Generate mock plans when Claude is unavailable
   */
  private generateMockPlans(task: Task): Plan[] {
    return [
      this.createMockStandardPlan(task),
      this.createMockFastTrackPlan(task),
    ];
  }

  private createMockStandardPlan(task: Task): Plan {
    return {
      id: `plan-std-${crypto.randomUUID()}`,
      taskId: task.id,
      version: '1.0.0',
      steps: [
        {
          id: 'step-1',
          agent: 'architect',
          action: 'Design implementation structure and review impact',
          inputs: [task.id],
          outputs: ['architecture_spec'],
          validation: {
            command: 'npm run type-check',
            successCriteria: 'No type errors',
          },
        },
        {
          id: 'step-2',
          agent: 'developer',
          action: `Implement: ${task.description}`,
          inputs: ['architecture_spec'],
          outputs: ['code_implementation'],
          validation: {
            command: 'npm run test',
            successCriteria: 'All tests pass',
          },
          dependencies: ['step-1'],
        },
        {
          id: 'step-3',
          agent: 'reviewer',
          action: 'Code review and security audit',
          inputs: ['code_implementation'],
          outputs: ['review_report'],
          validation: {
            command: 'npm run lint',
            successCriteria: 'No linting errors',
          },
          dependencies: ['step-2'],
        },
      ],
      estimatedDuration: 60,
      risks: [
        {
          description: 'Potential regression in existing functionality',
          severity: 'medium',
          mitigation: 'Run full test suite before deployment',
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };
  }

  private createMockFastTrackPlan(task: Task): Plan {
    return {
      id: `plan-fast-${crypto.randomUUID()}`,
      taskId: task.id,
      version: '1.0.0',
      steps: [
        {
          id: 'step-1',
          agent: 'developer',
          action: `Fast-track implementation of ${task.type}`,
          inputs: [task.id],
          outputs: ['implementation'],
          validation: {
            command: 'npm run build',
            successCriteria: 'Build succeeds',
          },
        },
        {
          id: 'step-2',
          agent: 'tester',
          action: 'Run smoke tests',
          inputs: ['implementation'],
          outputs: ['test_results'],
          validation: {
            command: 'npm run test',
            successCriteria: 'Core tests pass',
          },
          dependencies: ['step-1'],
        },
      ],
      estimatedDuration: 30,
      risks: [
        {
          description: 'Reduced test coverage',
          severity: 'high',
          mitigation: 'Schedule follow-up for comprehensive testing',
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const planningAgent = new PlanningAgent();
