import { NextResponse } from 'next/server';

import { listDecisions } from '@/core/db/decisions';
import { listResults } from '@/core/db/results';
import { listTasks } from '@/core/db/tasks';
import type { HistoryEvent, HistoryEventType } from '@/interfaces/history';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 *
 * Returns aggregated history events from tasks, decisions, and results.
 * Supports filtering by type and taskId.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') as HistoryEventType | null;
    const taskIdFilter = searchParams.get('taskId');

    // Fetch data from all sources in parallel
    const [tasks, decisions, results] = await Promise.all([
      listTasks(),
      listDecisions(),
      listResults(),
    ]);

    const events: HistoryEvent[] = [];

    // Add task creation events
    for (const task of tasks) {
      events.push({
        id: `task-created-${task.task_id}`,
        timestamp: task.created_at,
        type: 'task_created',
        title: 'Task created',
        description: task.description,
        taskId: task.task_id,
        metadata: {
          taskType: task.type,
          status: task.status,
        },
      });

      // Add completion/failure events based on status
      if (task.status === 'completed') {
        events.push({
          id: `task-completed-${task.task_id}`,
          timestamp: task.updated_at || task.created_at,
          type: 'task_completed',
          title: 'Task completed',
          description: task.description,
          taskId: task.task_id,
        });
      } else if (task.status === 'failed') {
        events.push({
          id: `task-failed-${task.task_id}`,
          timestamp: task.updated_at || task.created_at,
          type: 'task_failed',
          title: 'Task failed',
          description: task.description,
          taskId: task.task_id,
        });
      }
    }

    // Add decision events
    for (const decision of decisions) {
      const isApproval = decision.selected_option >= 0;
      events.push({
        id: `decision-${decision.decision_id}`,
        timestamp: decision.decided_at,
        type: isApproval ? 'task_approved' : 'task_rejected',
        title: isApproval ? 'Plan approved' : 'Plan rejected',
        description: decision.rationale || undefined,
        taskId: decision.task_id,
        metadata: {
          decisionId: decision.decision_id,
          planId: decision.plan_id,
          category: decision.category,
          selectedOption: decision.selected_option,
          decidedBy: decision.decided_by,
        },
      });
    }

    // Add result events
    for (const result of results) {
      events.push({
        id: `result-${result.result_id}`,
        timestamp: result.completed_at,
        type: 'execution_completed',
        title: `Execution ${result.status}`,
        description: `Duration: ${result.duration}s`,
        taskId: result.task_id,
        metadata: {
          resultId: result.result_id,
          planId: result.plan_id,
          status: result.status,
          duration: result.duration,
          qualityGatesPassed: result.quality_gates?.passed,
        },
      });
    }

    // Sort by timestamp descending (most recent first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filters
    let filtered = events;

    if (typeFilter) {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }

    if (taskIdFilter) {
      filtered = filtered.filter((e) => e.taskId === taskIdFilter);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
