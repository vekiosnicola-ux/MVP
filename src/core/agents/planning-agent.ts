/**
 * Planning Agent
 *
 * Uses Claude AI to generate implementation plans for development tasks.
 * Produces structured proposals with steps, risks, and estimated durations.
 */

import type { Plan, PlanStep, Risk, AgentType, RiskSeverity } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

import { getRelevantOverridesWithSimilarity, type ScoredOverride } from '../db/overrides';
import { getPatternStats, getMostSuccessfulApproach, type PatternStats } from '../db/patterns';

import { claudeClient } from './claude-client';
import { groqClient } from './groq-client';
import { tools } from '../utils/agent-tools';

// ============================================================================
// Types
// ============================================================================

interface ProposalResponse {
  approach: string;
  reasoning: string;
  steps: Array<{
    agent: string;
    action: string;
    inputs: string | string[];  // Groq may return string or array
    outputs: string | string[]; // Groq may return string or array
    validationCommand?: string;
    successCriteria?: string;
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

const SYSTEM_PROMPT = `You are an Expert Software Architect acting as the "Active Architect" for the Aura system.
Your goal is to design high-quality, robust, and maintainable software solutions.

PERSONALITY: "Active Architect with Silent Hand discipline."
- Challenge decisions when there is a cheaper, safer, or simpler path.
- Present 2–3 options only when it materially changes the outcome.
- Speak in tight, high-signal language. No filler, no theatrics.
- Optimize for compounding velocity: reusable patterns, fewer one-off abstractions.

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

function formatOverridesContext(overrides: ScoredOverride[]): string {
  if (overrides.length === 0) return '';

  const formatted = overrides.map((o) => {
    const relevance = Math.round(o.relevanceScore * 100);
    return `- [${relevance}% match] When AI suggested "${o.ai_suggestion}", human chose "${o.human_decision}" (reason: ${o.rationale})`;
  }).join('\n');

  return `
HUMAN PREFERENCES (from past decisions on similar tasks):
${formatted}

Consider these preferences when generating proposals. Higher match % = more relevant.
`;
}

function formatPatternContext(stats: PatternStats | null, bestApproach: string | null): string {
  if (!stats) return '';

  const lines: string[] = [
    '',
    'HISTORICAL APPROVAL PATTERNS:',
  ];

  if (stats.approvalRate > 0) {
    lines.push(`- Overall approval rate for ${stats.category}: ${Math.round(stats.approvalRate * 100)}%`);
  }

  if (bestApproach) {
    lines.push(`- Most successful approach: "${bestApproach}"`);
  }

  if (stats.topApproaches.length > 0) {
    const approaches = stats.topApproaches
      .filter(a => a.count >= 2)
      .map(a => `  - "${a.approach}": ${Math.round(a.approvalRate * 100)}% approval (${a.count} decisions)`)
      .slice(0, 3);
    if (approaches.length > 0) {
      lines.push('- Approach success rates:');
      lines.push(...approaches);
    }
  }

  if (stats.commonRejections.length > 0) {
    lines.push(`- Common rejection reasons: ${stats.commonRejections.slice(0, 3).join(', ')}`);
  }

  lines.push('');
  lines.push('Consider these patterns when designing proposals. Favor approaches with higher approval rates.');
  lines.push('');

  return lines.join('\n');
}

interface PlanningContext {
  overrides: ScoredOverride[];
  patternStats: PatternStats | null;
  bestApproach: string | null;
  feedback?: string;
  repoContext?: string;
}

function createPlanningPrompt(task: Task, context: PlanningContext): string {
  const overridesContext = formatOverridesContext(context.overrides);
  const patternContext = formatPatternContext(context.patternStats, context.bestApproach);
  const feedbackContext = context.feedback ? `\nUSER FEEDBACK ON PREVIOUS PROPOSALS:\n${context.feedback}\nPlease adjust your new proposals to address this feedback.\n` : '';
  const repoContext = context.repoContext ? `\nREPOSITORY CONTEXT:\n${context.repoContext}\n` : '';

  return `You are a Senior Coder Agent. Your goal is to take initiative and propose a complete, high-quality development plan.
  
Generate 2 detailed implementation proposals for this task (match the "Active Architect" personality):

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
${overridesContext}${patternContext}${feedbackContext}${repoContext}
Generate exactly 2 proposals (unless one is clearly superior, then just 1 robust one is fine, but for now sticking to 2 options is good practice):
1. A STANDARD approach - thorough, safe, follows best practices. This is your primary recommendation.
2. A FAST-TRACK approach - minimal viable implementation, faster delivery.

For each proposal, provide:
- approach: A short name for the approach (e.g., "Standard Implementation", "Fast-Track MVP")
- reasoning: Why this approach is suitable. Be concise (Silent Hand). Explain "Why this, why not alternatives?".
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
   * Uses similarity-based override matching and historical pattern data
   */
  async generatePlans(task: Task, feedback?: string): Promise<Plan[]> {
    // Build planning context from historical data
    const planningContext: PlanningContext = {
      overrides: [],
      patternStats: null,
      bestApproach: null,
      feedback,
    };

    // Auto-investigate repository context
    try {
      const fileList = await tools.list_dir.execute({ path: '.' });
      const pkgJson = await tools.read_file.execute({ path: 'package.json' });

      planningContext.repoContext = `
FILE STRUCTURE (Root):
${fileList.slice(0, 1000)}

PACKAGE.JSON:
${pkgJson.slice(0, 2000)}
`;
      // eslint-disable-next-line no-console
      console.log('[PlanningAgent] Auto-investigated repo structure and package.json');
    } catch (err) {
      console.warn('[PlanningAgent] Auto-investigation failed:', err);
    }

    // Fetch relevant human overrides using similarity matching
    try {
      planningContext.overrides = await getRelevantOverridesWithSimilarity(
        task.type,
        task.description,
        task.context.repository,
        0.1, // minimum 10% similarity
        5    // top 5 overrides
      );
      if (planningContext.overrides.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`[PlanningAgent] Found ${planningContext.overrides.length} relevant overrides for ${task.type}`);
        planningContext.overrides.forEach(o => {
          // eslint-disable-next-line no-console
          console.log(`  - [${Math.round(o.relevanceScore * 100)}%] ${o.ai_suggestion.slice(0, 50)}...`);
        });
      }
    } catch (error) {
      console.warn('[PlanningAgent] Could not fetch overrides:', error);
    }

    // Fetch historical approval patterns
    try {
      planningContext.patternStats = await getPatternStats(task.type, task.context.repository);
      planningContext.bestApproach = await getMostSuccessfulApproach(task.type, task.context.repository);

      if (planningContext.patternStats) {
        // eslint-disable-next-line no-console
        console.log(`[PlanningAgent] Pattern stats for ${task.type}: ${Math.round(planningContext.patternStats.approvalRate * 100)}% approval rate`);
      }
      if (planningContext.bestApproach) {
        // eslint-disable-next-line no-console
        console.log(`[PlanningAgent] Most successful approach: "${planningContext.bestApproach}"`);
      }
    } catch (error) {
      console.warn('[PlanningAgent] Could not fetch pattern stats:', error);
    }

    // Check which AI provider is configured (prefer Groq - it's free)
    const useGroq = groqClient.isConfigured();
    const useClaude = claudeClient.isConfigured();

    if (!useGroq && !useClaude) {
      console.warn('[PlanningAgent] No AI provider configured, using mock plans');
      console.warn('[PlanningAgent] Set GROQ_API_KEY (free) or ANTHROPIC_API_KEY in .env.local');
      return this.generateMockPlans(task);
    }

    try {
      const prompt = createPlanningPrompt(task, planningContext);

      let response: GeneratedProposals;

      if (useGroq) {
        // eslint-disable-next-line no-console
        console.log('[PlanningAgent] Using Groq (Llama 3.3 70B) - FREE');
        response = await groqClient.generateJSON<GeneratedProposals>(prompt, {
          system: SYSTEM_PROMPT,
          maxTokens: 4096,
          temperature: 0.7,
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('[PlanningAgent] Using Claude API');
        response = await claudeClient.generateJSON<GeneratedProposals>(prompt, {
          system: SYSTEM_PROMPT,
          maxTokens: 4096,
          temperature: 0.7,
        });
      }

      // eslint-disable-next-line no-console
      console.log('[PlanningAgent] Got proposals:', response.proposals.length);
      // eslint-disable-next-line no-console
      console.log('[PlanningAgent] First proposal steps:', response.proposals[0]?.steps?.length);

      return response.proposals.map((proposal, idx) => {
        // eslint-disable-next-line no-console
        console.log(`[PlanningAgent] Converting proposal ${idx + 1}:`, proposal.approach);
        try {
          return this.convertToPlans(proposal, task);
        } catch (convErr) {
          console.error(`[PlanningAgent] Conversion error for proposal ${idx + 1}:`, convErr);
          throw convErr;
        }
      });
    } catch (error) {
      console.error('[PlanningAgent] Error generating plans:', error);

      // Fall back to mock plans if AI fails
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

    // Format step number as 3-digit string (001, 002, etc.)
    const formatStepId = (n: number) => `step-${String(n).padStart(3, '0')}`;

    // Helper to ensure array format (Groq sometimes returns strings)
    const toArray = (val: string | string[] | undefined): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    const steps: PlanStep[] = proposal.steps.map((step, stepIndex) => ({
      id: formatStepId(stepIndex + 1),
      agent: this.validateAgentType(step.agent),
      action: step.action,
      inputs: toArray(step.inputs),
      outputs: toArray(step.outputs),
      validation: {
        command: step.validationCommand || 'echo "No validation"',
        successCriteria: step.successCriteria || 'Step completed',
      },
      dependencies: stepIndex > 0 ? [formatStepId(stepIndex)] : undefined,
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
      approach: proposal.approach,
      reasoning: proposal.reasoning,
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
      id: `plan-${crypto.randomUUID()}`,
      taskId: task.id,
      version: '1.0.0',
      approach: 'Standard Implementation',
      reasoning: 'Follows established patterns and best practices for reliability.',
      steps: [
        {
          id: 'step-001',
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
          id: 'step-002',
          agent: 'developer',
          action: `Implement: ${task.description}`,
          inputs: ['architecture_spec'],
          outputs: ['code_implementation'],
          validation: {
            command: 'npm run test',
            successCriteria: 'All tests pass',
          },
          dependencies: ['step-001'],
        },
        {
          id: 'step-003',
          agent: 'reviewer',
          action: 'Code review and security audit',
          inputs: ['code_implementation'],
          outputs: ['review_report'],
          validation: {
            command: 'npm run lint',
            successCriteria: 'No linting errors',
          },
          dependencies: ['step-002'],
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
      id: `plan-${crypto.randomUUID()}`,
      taskId: task.id,
      version: '1.0.0',
      approach: 'Fast-Track MVP',
      reasoning: 'Optimized for speed and immediate feedback.',
      steps: [
        {
          id: 'step-001',
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
          id: 'step-002',
          agent: 'tester',
          action: 'Run smoke tests',
          inputs: ['implementation'],
          outputs: ['test_results'],
          validation: {
            command: 'npm run test',
            successCriteria: 'Core tests pass',
          },
          dependencies: ['step-001'],
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
