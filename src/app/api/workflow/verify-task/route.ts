import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';

/**
 * Human verification endpoint
 * POST /api/workflow/verify-task
 *
 * Allows a human to approve or reject execution results.
 */
export async function POST(request: Request) {
  try {
    const { taskId, verified, feedback } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'verified must be a boolean' }, { status: 400 });
    }

    const reason = feedback || (verified ? 'Manually approved' : 'Manually rejected');
    const result = await workflowEngine.verifyResult(taskId, verified, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      status: result.newState,
      message: verified ? 'Task completed successfully' : 'Task marked as failed',
      taskId,
      transition: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
