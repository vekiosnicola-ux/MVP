import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateTask } from '@/core/validators/task';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = validateTask(body);

    const { taskId, transition } = await workflowEngine.createTaskWorkflow(task);

    return NextResponse.json({
      taskId,
      status: transition.newState,
      message: 'Task created, awaiting AI proposals',
      transition: {
        previousState: transition.previousState,
        newState: transition.newState,
        action: transition.action,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow failed' },
      { status: 400 }
    );
  }
}
