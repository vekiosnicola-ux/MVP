import type { Plan, PlanStep, Risk } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

/**
 * AI Proposal Generator Service
 * In a real production environment, this would call an LLM (Claude, GPT, Gemini).
 * For the MVP, it uses structured heuristics to generate plausible architecture plans.
 */
export class ProposalGenerator {
    /**
     * Generates multiple plans for a given task
     */
    async generateProposals(task: Task): Promise<Plan[]> {
        const proposals: Plan[] = [];

        // Proposal 1: Standard/Conservative approach
        proposals.push(this.createStandardPlan(task));

        // Proposal 2: Fast/Optimized approach
        proposals.push(this.createFastTrackPlan(task));

        return proposals;
    }

    private createStandardPlan(task: Task): Plan {
        const planId = `plan-std-${crypto.randomUUID()}`;
        const steps: PlanStep[] = [
            {
                id: 'step-1',
                agent: 'architect',
                action: 'Design implementation structure and review legacy impact',
                inputs: [task.id],
                outputs: ['architecture_spec'],
                validation: {
                    command: 'npm run validate-arch',
                    successCriteria: 'No architectural regressions detected'
                }
            },
            {
                id: 'step-2',
                agent: 'developer',
                action: `Implement: ${task.description}`,
                inputs: ['architecture_spec'],
                outputs: ['code_implementation'],
                validation: {
                    command: 'npm run test',
                    successCriteria: 'All unit tests pass'
                },
                dependencies: ['step-1']
            },
            {
                id: 'step-3',
                agent: 'reviewer',
                action: 'Perform security and performance audit',
                inputs: ['code_implementation'],
                outputs: ['audit_report'],
                validation: {
                    command: 'npm run audit',
                    successCriteria: 'Zero high-severity vulnerabilities'
                },
                dependencies: ['step-2']
            }
        ];

        const risks: Risk[] = [
            {
                description: 'Potential regression in legacy modules',
                severity: 'medium',
                mitigation: 'Implement comprehensive integration tests'
            }
        ];

        return {
            id: planId,
            taskId: task.id,
            version: '1.0.0',
            steps,
            estimatedDuration: 60,
            risks,
            metadata: {
                createdAt: new Date().toISOString()
            }
        };
    }

    private createFastTrackPlan(task: Task): Plan {
        const planId = `plan-fast-${crypto.randomUUID()}`;
        const steps: PlanStep[] = [
            {
                id: 'step-1',
                agent: 'developer',
                action: `Fast-track implementation of ${task.type}`,
                inputs: [task.id],
                outputs: ['fast_implementation'],
                validation: {
                    command: 'npm run validate',
                    successCriteria: 'Build succeeds and linter is clean'
                }
            },
            {
                id: 'step-2',
                agent: 'tester',
                action: 'Run automated smoke tests',
                inputs: ['fast_implementation'],
                outputs: ['test_results'],
                validation: {
                    command: 'npm run test:smoke',
                    successCriteria: 'Core functionality verified'
                },
                dependencies: ['step-1']
            }
        ];

        const risks: Risk[] = [
            {
                description: 'Reduced test coverage due to fast track',
                severity: 'high',
                mitigation: 'Scheduled technical debt review in 24 hours'
            }
        ];

        return {
            id: planId,
            taskId: task.id,
            version: '1.0.0',
            steps,
            estimatedDuration: 30,
            risks,
            metadata: {
                createdAt: new Date().toISOString()
            }
        };
    }
}

export const proposalGenerator = new ProposalGenerator();
