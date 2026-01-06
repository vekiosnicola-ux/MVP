import { NextResponse } from 'next/server';

import { listTasks } from '@/core/db/tasks';
import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateTask } from '@/core/validators/task';
import { TaskStatus } from '@/interfaces/task';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Auto-generate required fields if missing
    const taskData = {
      ...body,
      id: body.id || `task-${crypto.randomUUID()}`,
      version: body.version || '1.0.0',
    };

    // console.log('[API] Validating task...');
    const task = validateTask(taskData);
    // console.log('[API] Task validated:', task.id);

    // Create task through workflow engine (handles state transitions)
    const { taskId } = await workflowEngine.createTaskWorkflow(task);
    // console.log('[API] Task workflow created:', taskId);

    // Kick off planning process (asynchronously in background for immediate response, 
    // or awaited if we want to return the updated state. For MVP, awaiting is safer to ensure it runs)
    // In Vercel serverless, we must await or use waitUntil. 
    // We'll await for simplicity and assurance of "mock" speed.
    try {
      // console.log('[API] Processing task...');
      await workflowEngine.processTask(taskId);
      // console.log('[API] Task processed');
    } catch (processError) {
      console.error('Failed to process task:', processError);
      // We still return 201 because task was created, but status might be 'planning' instead of 'awaiting_decision'
    }

    // Fetch the latest state to return
    const { getTask } = await import('@/core/db/tasks');
    const updated = await getTask(taskId);

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error('[API] Error in POST /tasks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | undefined;
    const type = searchParams.get('type') || undefined;

    const tasks = await listTasks({ status, type });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
