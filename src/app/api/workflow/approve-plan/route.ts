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

    // Record the decision (approve or reject)
    const decisionResult = await workflowEngine.recordDecision(validatedDecision, decidedBy || 'Virgilio');

    if (!decisionResult.success) {
      return NextResponse.json(
        { error: decisionResult.error || 'Decision recording failed' },
        { status: 400 }
      );
    }

    // If approved, start execution
    if (decisionResult.newState === 'plan_approved' && validatedDecision.planId) {
      const executionResult = await workflowEngine.executeApprovedPlan(
        validatedDecision.planId,
        validatedDecision.taskId
      );

      return NextResponse.json({
        status: executionResult.newState,
        message: executionResult.success ? 'Plan approved and execution started' : 'Execution failed to start',
        taskId: validatedDecision.taskId,
        transition: {
          decision: decisionResult,
          execution: executionResult,
        }
      });
    }

    // Rejected case
    return NextResponse.json({
      status: decisionResult.newState,
      message: decisionResult.newState === 'plan_rejected' ? 'Plan rejected' : 'Decision recorded',
      taskId: validatedDecision.taskId,
      transition: decisionResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 400 }
    );
  }
}
