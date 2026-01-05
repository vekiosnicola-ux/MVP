import { NextResponse } from 'next/server';

import { listTasks } from '@/core/db/tasks';
import { listDecisions } from '@/core/db/decisions';
import type { HistoryEvent } from '@/interfaces/history';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') || undefined;

    const [tasks, decisions] = await Promise.all([
      listTasks(),
      listDecisions(),
    ]);

    const events: HistoryEvent[] = [];

    tasks.forEach((task) => {
      events.push({
        id: `task-created-${task.id}`,
        timestamp: task.created_at,
        type: 'task_created',
        title: 'Created new task',
        description: task.description,
        taskId: task.task_id,
        metadata: {
          type: task.type,
          status: task.status,
        },
      });

      if (task.status === 'completed') {
        events.push({
          id: `task-completed-${task.id}`,
          timestamp: task.updated_at,
          type: 'task_completed',
          title: 'Completed task',
          description: task.description,
          taskId: task.task_id,
        });
      }

      if (task.status === 'approved') {
        events.push({
          id: `task-approved-${task.id}`,
          timestamp: task.updated_at,
          type: 'task_approved',
          title: 'Approved task execution',
          description: task.description,
          taskId: task.task_id,
        });
      }
    });

    decisions.forEach((decision) => {
      events.push({
        id: `decision-${decision.id}`,
        timestamp: decision.decided_at,
        type: 'decision_made',
        title: 'Made decision',
        description: `Selected option ${decision.selected_option + 1}: ${decision.rationale}`,
        taskId: decision.task_id,
        metadata: {
          category: decision.category,
          selectedOption: decision.selected_option,
          decidedBy: decision.decided_by,
        },
      });
    });

    const sortedEvents = events.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const filteredEvents = typeFilter
      ? sortedEvents.filter((event) => event.type === typeFilter)
      : sortedEvents;

    return NextResponse.json(filteredEvents);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
