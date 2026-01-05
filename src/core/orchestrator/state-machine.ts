/**
 * Workflow State Machine
 *
 * Manages task state transitions with guards and event emission.
 * This is the core of the human-in-the-loop orchestration system.
 */

import type { TaskStatus } from '@/interfaces/task';

import type { WorkflowState, WorkflowEvent } from './types';

// ============================================================================
// Types
// ============================================================================

export type TransitionAction =
  | 'CREATE'
  | 'START_PLANNING'
  | 'PROPOSALS_READY'
  | 'APPROVE'
  | 'REJECT'
  | 'START_EXECUTION'
  | 'EXECUTION_COMPLETE'
  | 'VERIFY_SUCCESS'
  | 'VERIFY_FAILURE'
  | 'FAIL'
  | 'RETRY'
  | 'REPLAN';

export interface TransitionContext {
  taskId: string;
  planId?: string;
  resultId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionResult {
  success: boolean;
  previousState: WorkflowState;
  newState: WorkflowState;
  action: TransitionAction;
  error?: string;
}

type TransitionGuard = (context: TransitionContext) => boolean | Promise<boolean>;
type TransitionCallback = (event: WorkflowEvent) => void | Promise<void>;

interface TransitionDefinition {
  from: WorkflowState[];
  to: WorkflowState;
  guard?: TransitionGuard;
}

// ============================================================================
// State Machine Configuration
// ============================================================================

/**
 * Valid state transitions
 *
 * Flow:
 * task_created → awaiting_proposals → awaiting_human_decision
 *                                    ↓
 *                          plan_approved → executing → awaiting_verification → completed
 *                                    ↓                                       ↓
 *                          plan_rejected                                   failed
 *                                    ↓
 *                          (can retry → awaiting_proposals)
 */
const TRANSITIONS: Record<TransitionAction, TransitionDefinition> = {
  CREATE: {
    from: [],  // Initial state, no previous state
    to: 'task_created',
  },
  START_PLANNING: {
    from: ['task_created'],
    to: 'awaiting_proposals',
  },
  PROPOSALS_READY: {
    from: ['awaiting_proposals'],
    to: 'awaiting_human_decision',
  },
  APPROVE: {
    from: ['awaiting_human_decision'],
    to: 'plan_approved',
    guard: (ctx) => !!ctx.planId,  // Must have a plan selected
  },
  REJECT: {
    from: ['awaiting_human_decision'],
    to: 'plan_rejected',
    guard: (ctx) => !!ctx.reason,  // Must provide rejection reason
  },
  START_EXECUTION: {
    from: ['plan_approved'],
    to: 'executing',
    guard: (ctx) => !!ctx.planId,
  },
  EXECUTION_COMPLETE: {
    from: ['executing'],
    to: 'awaiting_verification',
    guard: (ctx) => !!ctx.resultId,
  },
  VERIFY_SUCCESS: {
    from: ['awaiting_verification'],
    to: 'completed',
  },
  VERIFY_FAILURE: {
    from: ['awaiting_verification'],
    to: 'failed',
  },
  FAIL: {
    from: ['awaiting_proposals', 'executing', 'awaiting_verification'],
    to: 'failed',
  },
  RETRY: {
    from: ['plan_rejected', 'failed'],
    to: 'awaiting_proposals',
  },
  REPLAN: {
    from: ['plan_rejected', 'awaiting_human_decision'],
    to: 'awaiting_proposals',
  },
};

// ============================================================================
// State Machine Class
// ============================================================================

export class WorkflowStateMachine {
  private listeners: TransitionCallback[] = [];
  private eventHistory: WorkflowEvent[] = [];

  /**
   * Check if a transition is valid from current state
   */
  canTransition(currentState: WorkflowState | null, action: TransitionAction): boolean {
    const transition = TRANSITIONS[action];
    if (!transition) return false;

    // CREATE is special - it has no previous state
    if (action === 'CREATE') {
      return currentState === null;
    }

    return transition.from.includes(currentState as WorkflowState);
  }

  /**
   * Get all valid actions from current state
   */
  getValidActions(currentState: WorkflowState | null): TransitionAction[] {
    return (Object.keys(TRANSITIONS) as TransitionAction[]).filter(
      action => this.canTransition(currentState, action)
    );
  }

  /**
   * Execute a state transition
   */
  async transition(
    currentState: WorkflowState | null,
    action: TransitionAction,
    context: TransitionContext
  ): Promise<TransitionResult> {
    const transition = TRANSITIONS[action];

    // Check if transition exists
    if (!transition) {
      return {
        success: false,
        previousState: currentState || 'task_created',
        newState: currentState || 'task_created',
        action,
        error: `Unknown action: ${action}`,
      };
    }

    // Check if transition is valid from current state
    if (!this.canTransition(currentState, action)) {
      return {
        success: false,
        previousState: currentState || 'task_created',
        newState: currentState || 'task_created',
        action,
        error: `Invalid transition: cannot ${action} from ${currentState || 'null'}`,
      };
    }

    // Run guard if present
    if (transition.guard) {
      const guardResult = await transition.guard(context);
      if (!guardResult) {
        return {
          success: false,
          previousState: currentState || 'task_created',
          newState: currentState || 'task_created',
          action,
          error: `Guard failed for action: ${action}`,
        };
      }
    }

    // Execute transition
    const newState = transition.to;
    const event: WorkflowEvent = {
      taskId: context.taskId,
      state: newState,
      timestamp: new Date().toISOString(),
      metadata: {
        action,
        previousState: currentState,
        ...context.metadata,
      },
    };

    // Record event
    this.eventHistory.push(event);

    // Notify listeners
    await this.notifyListeners(event);

    return {
      success: true,
      previousState: currentState || 'task_created',
      newState,
      action,
    };
  }

  /**
   * Subscribe to state transitions
   */
  onTransition(callback: TransitionCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Get event history for a task
   */
  getHistory(taskId?: string): WorkflowEvent[] {
    if (taskId) {
      return this.eventHistory.filter(e => e.taskId === taskId);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history (useful for testing)
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  private async notifyListeners(event: WorkflowEvent): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error('Error in transition listener:', error);
      }
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert TaskStatus to WorkflowState
 */
export function taskStatusToWorkflowState(status: TaskStatus): WorkflowState {
  const mapping: Record<TaskStatus, WorkflowState> = {
    'pending': 'task_created',
    'planning': 'awaiting_proposals',
    'awaiting_human_decision': 'awaiting_human_decision',
    'approved': 'plan_approved',
    'rejected': 'plan_rejected',
    'executing': 'executing',
    'awaiting_verification': 'awaiting_verification',
    'completed': 'completed',
    'failed': 'failed',
  };
  return mapping[status];
}

/**
 * Convert WorkflowState to TaskStatus
 */
export function workflowStateToTaskStatus(state: WorkflowState): TaskStatus {
  const mapping: Record<WorkflowState, TaskStatus> = {
    'task_created': 'pending',
    'awaiting_proposals': 'planning',
    'awaiting_human_decision': 'awaiting_human_decision',
    'plan_approved': 'approved',
    'plan_rejected': 'rejected',
    'executing': 'executing',
    'awaiting_verification': 'awaiting_verification',
    'completed': 'completed',
    'failed': 'failed',
  };
  return mapping[state];
}

/**
 * Get human-readable state description
 */
export function getStateDescription(state: WorkflowState): string {
  const descriptions: Record<WorkflowState, string> = {
    'task_created': 'Task created, waiting to start',
    'awaiting_proposals': 'AI is generating proposals',
    'awaiting_human_decision': 'Waiting for human approval',
    'plan_approved': 'Plan approved, ready to execute',
    'plan_rejected': 'Plan rejected by human',
    'executing': 'Executing the approved plan',
    'awaiting_verification': 'Execution complete, awaiting verification',
    'completed': 'Task completed successfully',
    'failed': 'Task failed',
  };
  return descriptions[state];
}

/**
 * Check if state is terminal (no further transitions possible except retry)
 */
export function isTerminalState(state: WorkflowState): boolean {
  return state === 'completed' || state === 'failed' || state === 'plan_rejected';
}

/**
 * Check if state requires human input
 */
export function requiresHumanInput(state: WorkflowState): boolean {
  return state === 'awaiting_human_decision' || state === 'awaiting_verification';
}

// ============================================================================
// Singleton Export
// ============================================================================

export const stateMachine = new WorkflowStateMachine();
