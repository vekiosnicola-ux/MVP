import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateResult } from '@/core/validators/result';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateResult(body);

    const resultId = await workflowEngine.recordResult(result);

    const state = await workflowEngine.getWorkflowState(result.taskId);

    return NextResponse.json({
      resultId,
      status: state,
      message: state === 'completed'
        ? 'Result verified and task completed'
        : 'Result recorded but quality gates failed',
      qualityGates: result.qualityGates
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
