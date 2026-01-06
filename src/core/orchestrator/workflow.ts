import { createDecision } from '../db/decisions';
import { recordApprovalPattern } from '../db/patterns';
import { createPlan, updatePlanStatus } from '../db/plans';
import { createResult } from '../db/results';
import { createTask, updateTaskStatus } from '../db/tasks';
// import { constitutionEnforcer } from '../governance/constitution-enforcer';
import { Decision } from '../validators/decision';
import { Plan } from '../validators/plan';
import { Result } from '../validators/result';
import { Task } from '../validators/task';

import { validatePlan, formatValidationResult } from './pre-validation';
import { qualityGateExecutor } from './quality-gates';
import {
  stateMachine,
  taskStatusToWorkflowState,
  workflowStateToTaskStatus,
  type TransitionContext,
  type TransitionResult,
} from './state-machine';
import { WorkflowState } from './types';

export class WorkflowEngine {
  /**
   * Create a new task and transition to planning state
   */
  async createTaskWorkflow(task: Task): Promise<{ taskId: string; transition: TransitionResult }> {
    // Create task in DB
    await createTask(task);

    // Initial state transition
    // Initial state transition: null -> task_created
    // Note: State machine handles the null check for CREATE
    const createResult = await this.executeTransition(null, 'CREATE', { taskId: task.id });
    if (!createResult.success) {
      console.error('[WorkflowEngine] Failed initial transition:', createResult.error);
      return { taskId: task.id, transition: createResult };
    }

    // Transition: task_created -> awaiting_proposals (Planning)
    const planningResult = await this.executeTransition('task_created', 'START_PLANNING', { taskId: task.id });

    if (planningResult.success) {
      await updateTaskStatus(task.id, 'planning');
    } else {
      console.error('[WorkflowEngine] Failed to start planning:', planningResult.error);
    }

    return { taskId: task.id, transition: planningResult };
  }

  /**
   * Process a task (generate proposals via AI or Manual)
   * Formerly proposePlans
   */
  async processTask(taskId: string): Promise<TransitionResult> {
    const { getTask } = await import('@/core/db/tasks'); // Dynamic import to avoid cycles

    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    let currentState = taskStatusToWorkflowState(taskRow.status);

    // Auto-recover task state if needed
    if (currentState === 'task_created') {
      console.log(`[WorkflowEngine] Auto-recovering task ${taskId} from pending to planning`);
      // Pending -> Planning
      const transition = await this.executeTransition(currentState, 'START_PLANNING', { taskId });
      if (transition.success) {
        await updateTaskStatus(taskId, 'planning');
        currentState = 'awaiting_proposals';
      } else {
        throw new Error(`Failed to transition task to planning: ${transition.error}`);
      }
    } else if (currentState === 'plan_rejected' || currentState === 'failed') {
      // Rejected/Failed -> Planning (Retry)
      const transition = await this.executeTransition(currentState, 'RETRY', { taskId });
      if (transition.success) {
        await updateTaskStatus(taskId, 'planning');
        currentState = 'awaiting_proposals';
      } else {
        throw new Error(`Failed to retry task: ${transition.error}`);
      }
    }

    const { planningAgent } = await import('@/core/agents/planning-agent');

    // Enable mock fallback if no AI is configured (for development/testing)
    const { groqClient } = await import('@/core/agents/groq-client');
    const { claudeClient } = await import('@/core/agents/claude-client');
    if (!groqClient.isConfigured() && !claudeClient.isConfigured()) {
      planningAgent.setMockFallback(true);
      console.log('[WorkflowEngine] No AI configured, enabling mock fallback for planning');
    }

    // Transform TaskRow to Task interface
    const task: Task = {
      id: taskRow.task_id,
      version: taskRow.version,
      type: taskRow.type,
      description: taskRow.description,
      context: taskRow.context,
      constraints: taskRow.constraints,
      metadata: taskRow.metadata || undefined
    };

    // Generate plans
    const plans = await planningAgent.generatePlans(task);

    // Save plans to DB
    const { createPlan } = await import('../db/plans');
    for (const plan of plans) {
      try {
        await createPlan(plan);
      } catch (error) {
        // Check if error is due to plan ALREADY existing (idempotency key violation)
        // If so, we might skip. But createPlan usually inserts.
        // Assuming createPlan throws if duplicate ID.
        // For MVP, we'll log and rethrow.
        const saveErr = error as Error;
        // eslint-disable-next-line no-console
        console.error(`[WorkflowEngine] Failed to save plan ${plan.id}:`, saveErr.message);
        throw saveErr;
      }
    }

    // Transition to awaiting_human_decision
    const result = await this.executeTransition(currentState, 'PROPOSALS_READY', { taskId });
    if (result.success) {
      await updateTaskStatus(taskId, 'awaiting_human_decision');

      // ----------------------------------------------------------------------
      // AUTOPILOT CHECK
      // ----------------------------------------------------------------------
      // Check if the primary plan (index 0) qualifies for Autopilot
      /* 
      if (plans.length > 0 && plans[0]) {
        const primaryPlan = plans[0];
        const eligibility = await constitutionEnforcer.checkAutopilotEligibility(task, primaryPlan);

        if (eligibility.eligible) {
          // ... Autopilot logic ...
        }
      }
      */
    }

    return result;
  }

  /**
   * Record human decision (approve or reject)
   * Also records approval pattern for learning loop
   */
  async recordDecision(decision: Decision, decidedBy?: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const { getPlan } = await import('../db/plans');

    const taskRow = await getTask(decision.taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

    // Save decision to DB
    await createDecision(decision, decidedBy);

    // Determine if approved or rejected based on decision
    const isApproval = decision.selectedOption >= 0 && Boolean(decision.planId);

    const context: TransitionContext = {
      taskId: decision.taskId,
      planId: decision.planId ?? undefined,
      reason: decision.rationale,
      metadata: { decidedBy },
    };

    let result: TransitionResult;

    if (isApproval) {
      result = await this.executeTransition(currentState, 'APPROVE', context);
      if (result.success) {
        // Use workflowStateToTaskStatus to ensure correct mapping
        const newStatus = workflowStateToTaskStatus(result.newState);
        await updateTaskStatus(decision.taskId, newStatus);
        if (decision.planId) {
          await updatePlanStatus(decision.planId, 'approved');
        }
      }
    } else {
      result = await this.executeTransition(currentState, 'REJECT', context);
      if (result.success) {
        // Use workflowStateToTaskStatus to ensure correct mapping
        const newStatus = workflowStateToTaskStatus(result.newState);
        await updateTaskStatus(decision.taskId, newStatus);
        if (decision.planId) {
          await updatePlanStatus(decision.planId, 'rejected');
        }
      }
    }

    // Record approval pattern for learning loop (fire and forget)
    if (decision.planId) {
      try {
        const planRow = await getPlan(decision.planId);
        if (planRow) {
          // Calculate time to decision (minutes from plan creation)
          const createdAt = new Date(planRow.created_at);
          const now = new Date();
          const timeToDecision = Math.round((now.getTime() - createdAt.getTime()) / 60000);

          await recordApprovalPattern(
            taskRow.type,                    // category (task type)
            planRow.approach || 'Unknown',   // approach_type
            isApproval,                      // approved
            timeToDecision,                  // time to decision in minutes
            isApproval ? undefined : decision.rationale, // rejection reason
            taskRow.context.repository       // project_id
          );
        }
      } catch (patternError) {
        // Don't fail the decision if pattern recording fails
        console.warn('[WorkflowEngine] Failed to record approval pattern:', patternError);
      }
    }

    return result;
  }

  /**
   * Submit a proposal (legacy method - use recordDecision instead)
   */
  async submitProposal(taskId: string, plan: Plan): Promise<string> {
    await createPlan(plan);
    await updateTaskStatus(taskId, 'approved');
    return plan.id;
  }

  /**
   * Start executing an approved plan (state transition only)
   */
  async executeApprovedPlan(planId: string, taskId: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

    const result = await this.executeTransition(currentState, 'START_EXECUTION', {
      taskId,
      planId,
    });

    if (result.success) {
      await updatePlanStatus(planId, 'executing');
      await updateTaskStatus(taskId, 'executing');
    }

    return result;
  }

  /**
   * Run the execution agent on an approved plan
   * This actually executes the plan and records results
   */
  async runExecution(planId: string, taskId: string): Promise<{ resultId: string; transition: TransitionResult }> {
    const { getPlan } = await import('../db/plans');
    const { getTask } = await import('../db/tasks');
    const { executionAgent } = await import('../agents/execution-agent');

    // Get the plan
    const planRow = await getPlan(planId);
    if (!planRow) throw new Error('Plan not found');

    // Get the task for validation
    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    // Convert PlanRow to Plan interface
    const plan: Plan = {
      id: planRow.plan_id,
      taskId: planRow.task_id,
      version: planRow.version,
      approach: planRow.approach || 'Standard', // Fallback for old records
      reasoning: planRow.reasoning || 'Legacy plan',
      steps: planRow.steps,
      estimatedDuration: planRow.estimated_duration,
      risks: planRow.risks || [],
      metadata: {
        createdAt: planRow.created_at,
      },
    };

    // Convert TaskRow to Task interface for validation
    const task: Task = {
      id: taskRow.task_id,
      version: taskRow.version,
      type: taskRow.type,
      description: taskRow.description,
      context: taskRow.context,
      constraints: taskRow.constraints,
      metadata: taskRow.metadata || undefined
    };

    // Pre-execution validation
    const validation = validatePlan(plan, task);
    if (!validation.valid) {
      console.error('[WorkflowEngine] Plan validation failed:');
      console.error(formatValidationResult(validation));
      throw new Error(`Plan validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('[WorkflowEngine] Plan validation warnings:');
      console.warn(formatValidationResult(validation));
    }

    // Execute the plan (ensure mock mode for development)
    // Execution agent defaults to 'mock' mode, which is safe for development
    const executionResult = await executionAgent.execute(plan, taskId);

    // Record the result (automatically transitions to awaiting_verification)
    return this.recordResult(executionResult);
  }

  /**
   * Record execution result and run quality gates
   */
  async recordResult(result: Result): Promise<{ resultId: string; transition: TransitionResult }> {
    const { getTask } = await import('../db/tasks');
    const taskRow = await getTask(result.taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

    // Run quality gates
    const gates = await qualityGateExecutor.executeGates(result);
    const allGatesPassed = gates.every(g => g.passed);

    const resultWithGates: Result = {
      ...result,
      qualityGates: {
        passed: allGatesPassed,
        checks: gates
      }
    };

    // Save result to DB
    await createResult(resultWithGates);

    // Transition to awaiting_verification
    const transitionResult = await this.executeTransition(currentState, 'EXECUTION_COMPLETE', {
      taskId: result.taskId,
      resultId: result.id,
      metadata: { qualityGates: gates },
    });

    if (transitionResult.success) {
      await updateTaskStatus(result.taskId, 'awaiting_verification');
    }

    return { resultId: result.id, transition: transitionResult };
  }

  /**
   * Verify result and complete or fail the task
   */
  async verifyResult(taskId: string, verified: boolean, reason?: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);
    const action = verified ? 'VERIFY_SUCCESS' : 'VERIFY_FAILURE';

    const result = await this.executeTransition(currentState, action, {
      taskId,
      reason,
    });

    if (result.success) {
      const newStatus = workflowStateToTaskStatus(result.newState);
      await updateTaskStatus(taskId, newStatus);
    }

    return result;
  }

  /**
   * Retry a failed or rejected task
   */
  async retryTask(taskId: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

    const result = await this.executeTransition(currentState, 'RETRY', { taskId });

    if (result.success) {
      await updateTaskStatus(taskId, 'planning');
    }

    return result;
  }

  /**
   * Get current workflow state for a task
   */
  async getWorkflowState(taskId: string): Promise<WorkflowState> {
    const { getTask } = await import('../db/tasks');
    const task = await getTask(taskId);
    return taskStatusToWorkflowState(task.status);
  }

  /**
   * Get valid actions for current task state
   */
  async getValidActions(taskId: string): Promise<string[]> {
    const currentState = await this.getWorkflowState(taskId);
    return stateMachine.getValidActions(currentState);
  }

  /**
   * Get transition history for a task
   */
  getTransitionHistory(taskId: string) {
    return stateMachine.getHistory(taskId);
  }

  /**
   * Execute a state transition with validation
   */
  private async executeTransition(
    currentState: WorkflowState | null,
    action: 'CREATE' | 'START_PLANNING' | 'PROPOSALS_READY' | 'APPROVE' | 'REJECT' | 'START_EXECUTION' | 'EXECUTION_COMPLETE' | 'VERIFY_SUCCESS' | 'VERIFY_FAILURE' | 'FAIL' | 'RETRY',
    context: TransitionContext
  ): Promise<TransitionResult> {
    return stateMachine.transition(currentState, action, context);
  }
}

export const workflowEngine = new WorkflowEngine();
