import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateDecision } from '@/core/validators/decision';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { decision, decidedBy } = body;

    if (!decision) {
      return NextResponse.json(
        { error: 'Decision is required' },
        { status: 400 }
      );
    }

    const validatedDecision = validateDecision(decision);

    await workflowEngine.recordDecision(validatedDecision, decidedBy || 'Virgilio');

    if (validatedDecision.planId) {
      await workflowEngine.executeApprovedPlan(validatedDecision.planId, validatedDecision.taskId);
    }

    return NextResponse.json({
      status: 'plan_approved',
      message: 'Plan approved and execution started',
      taskId: validatedDecision.taskId
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 400 }
    );
  }
}
