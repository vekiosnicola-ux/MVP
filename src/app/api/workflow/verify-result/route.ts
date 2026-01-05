import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateResult } from '@/core/validators/result';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateResult(body);

    // Record result and transition to awaiting_verification
    const { resultId, transition } = await workflowEngine.recordResult(result);

    if (!transition.success) {
      return NextResponse.json(
        { error: transition.error || 'Result recording failed' },
        { status: 400 }
      );
    }

    // Now verify the result (human would normally do this)
    // For now, auto-verify based on quality gates
    const qualityGates = result.qualityGates;
    const allGatesPassed = qualityGates?.passed ?? true;

    const verificationResult = await workflowEngine.verifyResult(
      result.taskId,
      allGatesPassed,
      allGatesPassed ? 'All quality gates passed' : 'Quality gates failed'
    );

    return NextResponse.json({
      resultId,
      status: verificationResult.newState,
      message: verificationResult.newState === 'completed'
        ? 'Result verified and task completed'
        : 'Result recorded but verification failed',
      qualityGates,
      transition: {
        record: transition,
        verification: verificationResult,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
