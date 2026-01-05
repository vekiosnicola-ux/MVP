import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorkflowStateMachine,
  taskStatusToWorkflowState,
  workflowStateToTaskStatus,
  getStateDescription,
  isTerminalState,
  requiresHumanInput,
} from '@/core/orchestrator/state-machine';

describe('WorkflowStateMachine', () => {
  let sm: WorkflowStateMachine;

  beforeEach(() => {
    sm = new WorkflowStateMachine();
    sm.clearHistory();
  });

  describe('canTransition', () => {
    it('allows CREATE from null state', () => {
      expect(sm.canTransition(null, 'CREATE')).toBe(true);
    });

    it('allows START_PLANNING from task_created', () => {
      expect(sm.canTransition('task_created', 'START_PLANNING')).toBe(true);
    });

    it('allows PROPOSALS_READY from awaiting_proposals', () => {
      expect(sm.canTransition('awaiting_proposals', 'PROPOSALS_READY')).toBe(true);
    });

    it('allows APPROVE from awaiting_human_decision', () => {
      expect(sm.canTransition('awaiting_human_decision', 'APPROVE')).toBe(true);
    });

    it('allows REJECT from awaiting_human_decision', () => {
      expect(sm.canTransition('awaiting_human_decision', 'REJECT')).toBe(true);
    });

    it('allows RETRY from plan_rejected', () => {
      expect(sm.canTransition('plan_rejected', 'RETRY')).toBe(true);
    });

    it('allows RETRY from failed', () => {
      expect(sm.canTransition('failed', 'RETRY')).toBe(true);
    });

    it('disallows invalid transitions', () => {
      expect(sm.canTransition('task_created', 'APPROVE')).toBe(false);
      expect(sm.canTransition('completed', 'START_PLANNING')).toBe(false);
      expect(sm.canTransition('executing', 'APPROVE')).toBe(false);
    });
  });

  describe('getValidActions', () => {
    it('returns CREATE for null state', () => {
      expect(sm.getValidActions(null)).toContain('CREATE');
    });

    it('returns correct actions for awaiting_human_decision', () => {
      const actions = sm.getValidActions('awaiting_human_decision');
      expect(actions).toContain('APPROVE');
      expect(actions).toContain('REJECT');
      expect(actions).not.toContain('START_PLANNING');
    });
  });

  describe('transition', () => {
    it('successfully creates a task', async () => {
      const result = await sm.transition(null, 'CREATE', { taskId: 'test-task-1' });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('task_created');
    });

    it('fails on invalid transition', async () => {
      const result = await sm.transition('completed', 'START_PLANNING', { taskId: 'test-task-1' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
    });

    it('fails APPROVE without planId', async () => {
      const result = await sm.transition('awaiting_human_decision', 'APPROVE', { taskId: 'test-task-1' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Guard failed');
    });

    it('succeeds APPROVE with planId', async () => {
      const result = await sm.transition('awaiting_human_decision', 'APPROVE', {
        taskId: 'test-task-1',
        planId: 'test-plan-1',
      });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('plan_approved');
    });

    it('fails REJECT without reason', async () => {
      const result = await sm.transition('awaiting_human_decision', 'REJECT', { taskId: 'test-task-1' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Guard failed');
    });

    it('succeeds REJECT with reason', async () => {
      const result = await sm.transition('awaiting_human_decision', 'REJECT', {
        taskId: 'test-task-1',
        reason: 'Not the right approach',
      });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('plan_rejected');
    });
  });

  describe('full workflow', () => {
    it('completes happy path workflow', async () => {
      const taskId = 'test-task-complete';
      const planId = 'test-plan-1';
      const resultId = 'test-result-1';

      // Create task
      let result = await sm.transition(null, 'CREATE', { taskId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('task_created');

      // Start planning
      result = await sm.transition('task_created', 'START_PLANNING', { taskId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('awaiting_proposals');

      // Proposals ready
      result = await sm.transition('awaiting_proposals', 'PROPOSALS_READY', { taskId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('awaiting_human_decision');

      // Human approves
      result = await sm.transition('awaiting_human_decision', 'APPROVE', { taskId, planId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('plan_approved');

      // Start execution
      result = await sm.transition('plan_approved', 'START_EXECUTION', { taskId, planId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('executing');

      // Execution complete
      result = await sm.transition('executing', 'EXECUTION_COMPLETE', { taskId, resultId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('awaiting_verification');

      // Verify success
      result = await sm.transition('awaiting_verification', 'VERIFY_SUCCESS', { taskId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('completed');
    });

    it('handles rejection and retry', async () => {
      const taskId = 'test-task-retry';

      // Setup to awaiting_human_decision
      await sm.transition(null, 'CREATE', { taskId });
      await sm.transition('task_created', 'START_PLANNING', { taskId });
      await sm.transition('awaiting_proposals', 'PROPOSALS_READY', { taskId });

      // Human rejects
      let result = await sm.transition('awaiting_human_decision', 'REJECT', {
        taskId,
        reason: 'Try a different approach',
      });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('plan_rejected');

      // Retry
      result = await sm.transition('plan_rejected', 'RETRY', { taskId });
      expect(result.success).toBe(true);
      expect(result.newState).toBe('awaiting_proposals');
    });
  });

  describe('event history', () => {
    it('records transition events', async () => {
      const taskId = 'test-task-history';

      await sm.transition(null, 'CREATE', { taskId });
      await sm.transition('task_created', 'START_PLANNING', { taskId });

      const history = sm.getHistory(taskId);
      expect(history).toHaveLength(2);
      expect(history[0]?.state).toBe('task_created');
      expect(history[1]?.state).toBe('awaiting_proposals');
    });
  });
});

describe('Utility functions', () => {
  describe('taskStatusToWorkflowState', () => {
    it('maps all statuses correctly', () => {
      expect(taskStatusToWorkflowState('pending')).toBe('task_created');
      expect(taskStatusToWorkflowState('planning')).toBe('awaiting_proposals');
      expect(taskStatusToWorkflowState('awaiting_human_decision')).toBe('awaiting_human_decision');
      expect(taskStatusToWorkflowState('approved')).toBe('plan_approved');
      expect(taskStatusToWorkflowState('rejected')).toBe('plan_rejected');
      expect(taskStatusToWorkflowState('executing')).toBe('executing');
      expect(taskStatusToWorkflowState('awaiting_verification')).toBe('awaiting_verification');
      expect(taskStatusToWorkflowState('completed')).toBe('completed');
      expect(taskStatusToWorkflowState('failed')).toBe('failed');
    });
  });

  describe('workflowStateToTaskStatus', () => {
    it('maps all states correctly', () => {
      expect(workflowStateToTaskStatus('task_created')).toBe('pending');
      expect(workflowStateToTaskStatus('awaiting_proposals')).toBe('planning');
      expect(workflowStateToTaskStatus('plan_rejected')).toBe('rejected');
      expect(workflowStateToTaskStatus('completed')).toBe('completed');
    });
  });

  describe('getStateDescription', () => {
    it('returns human-readable descriptions', () => {
      expect(getStateDescription('awaiting_human_decision')).toBe('Waiting for human approval');
      expect(getStateDescription('completed')).toBe('Task completed successfully');
    });
  });

  describe('isTerminalState', () => {
    it('identifies terminal states', () => {
      expect(isTerminalState('completed')).toBe(true);
      expect(isTerminalState('failed')).toBe(true);
      expect(isTerminalState('plan_rejected')).toBe(true);
      expect(isTerminalState('executing')).toBe(false);
    });
  });

  describe('requiresHumanInput', () => {
    it('identifies human-input states', () => {
      expect(requiresHumanInput('awaiting_human_decision')).toBe(true);
      expect(requiresHumanInput('awaiting_verification')).toBe(true);
      expect(requiresHumanInput('executing')).toBe(false);
    });
  });
});
