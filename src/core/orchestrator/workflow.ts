import { createDecision } from '../db/decisions';
import { createPlan, updatePlanStatus } from '../db/plans';
import { createResult } from '../db/results';
import { createTask, updateTaskStatus } from '../db/tasks';
import { Decision } from '../validators/decision';
import { Plan } from '../validators/plan';
import { Result } from '../validators/result';
import { Task } from '../validators/task';

import { qualityGateExecutor } from './quality-gates';
import { WorkflowState } from './types';

export class WorkflowEngine {
  async createTaskWorkflow(task: Task): Promise<string> {
    await createTask(task);

    await updateTaskStatus(task.id, 'planning');

    return task.id;
  }

  async processTask(taskId: string): Promise<void> {
    const { getTask } = await import('../db/tasks');
    const { proposalGenerator } = await import('../agents/proposal-generator');

    const taskRow = await getTask(taskId);
    if (!taskRow) throw new Error('Task not found');

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

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate proposals
    const plans = await proposalGenerator.generateProposals(task);

    // Save plans to DB
    for (const plan of plans) {
      await createPlan(plan);
    }

    // Transition task to awaiting approval
    await updateTaskStatus(taskId, 'awaiting_human_decision');
  }

  async submitProposal(taskId: string, plan: Plan): Promise<string> {
    await createPlan(plan);

    await updateTaskStatus(taskId, 'approved');

    return plan.id;
  }

  async recordDecision(decision: Decision, decidedBy?: string): Promise<void> {
    await createDecision(decision, decidedBy);

    await updateTaskStatus(decision.taskId, 'approved');

    if (decision.planId) {
      await updatePlanStatus(decision.planId, 'approved');
    }
  }

  async executeApprovedPlan(planId: string, taskId: string): Promise<void> {
    await updatePlanStatus(planId, 'executing');
    await updateTaskStatus(taskId, 'executing');
  }

  async recordResult(result: Result): Promise<string> {
    const gates = await qualityGateExecutor.executeGates(result);
    const allGatesPassed = gates.every(g => g.passed);

    const resultWithGates: Result = {
      ...result,
      qualityGates: {
        passed: allGatesPassed,
        checks: gates
      }
    };

    await createResult(resultWithGates);

    const finalStatus = allGatesPassed && result.status === 'success' ? 'completed' : 'failed';
    await updateTaskStatus(result.taskId, finalStatus);

    return result.id;
  }

  async getWorkflowState(taskId: string): Promise<WorkflowState> {
    const { getTask } = await import('../db/tasks');
    const task = await getTask(taskId);

    const statusMap: Record<string, WorkflowState> = {
      'pending': 'task_created',
      'planning': 'awaiting_proposals',
      'awaiting_human_decision': 'awaiting_human_decision',
      'approved': 'plan_approved',
      'executing': 'executing',
      'awaiting_verification': 'awaiting_verification',
      'completed': 'completed',
      'failed': 'failed'
    };

    return statusMap[task.status] || 'task_created';
  }
}

export const workflowEngine = new WorkflowEngine();
