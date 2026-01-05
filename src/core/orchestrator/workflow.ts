import { createDecision } from '../db/decisions';
import { createPlan, updatePlanStatus } from '../db/plans';
import { createResult } from '../db/results';
import { createTask, updateTaskStatus } from '../db/tasks';
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

    // Transition: null → task_created → awaiting_proposals
    const createResult = await this.executeTransition(null, 'CREATE', { taskId: task.id });
    if (!createResult.success) {
      throw new Error(`Failed to create task: ${createResult.error}`);
    }

    const planningResult = await this.executeTransition('task_created', 'START_PLANNING', { taskId: task.id });
    if (!planningResult.success) {
      throw new Error(`Failed to start planning: ${planningResult.error}`);
    }

    // Update DB status
    await updateTaskStatus(task.id, 'planning');

    return { taskId: task.id, transition: planningResult };
  }

  /**
   * Process a task: generate proposals and transition to awaiting_human_decision
   */
  async processTask(taskId: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const { proposalGenerator } = await import('../agents/proposal-generator');

    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

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

    // Generate proposals (AI work)
    const plans = await proposalGenerator.generateProposals(task);

    // Save plans to DB
    for (const plan of plans) {
      await createPlan(plan);
    }

    // Transition to awaiting_human_decision
    const result = await this.executeTransition(currentState, 'PROPOSALS_READY', { taskId });
    if (result.success) {
      await updateTaskStatus(taskId, 'awaiting_human_decision');
    }

    return result;
  }

  /**
   * Record human decision (approve or reject)
   */
  async recordDecision(decision: Decision, decidedBy?: string): Promise<TransitionResult> {
    const { getTask } = await import('../db/tasks');
    const taskRow = await getTask(decision.taskId);
    if (!taskRow) throw new Error('Task not found');

    const currentState = taskStatusToWorkflowState(taskRow.status);

    // Save decision to DB
    await createDecision(decision, decidedBy);

    // Determine if approved or rejected based on decision
    const isApproval = decision.selectedOption >= 0 && decision.planId;

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
        await updateTaskStatus(decision.taskId, 'approved');
        if (decision.planId) {
          await updatePlanStatus(decision.planId, 'approved');
        }
      }
    } else {
      result = await this.executeTransition(currentState, 'REJECT', context);
      if (result.success) {
        await updateTaskStatus(decision.taskId, 'rejected');
        if (decision.planId) {
          await updatePlanStatus(decision.planId, 'rejected');
        }
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

    // Execute the plan
    const executionResult = await executionAgent.execute(plan, taskId);

    // Record the result
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
