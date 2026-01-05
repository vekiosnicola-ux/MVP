import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';
import { validateTask } from '@/core/validators/task';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { autoGenerateProposals = true, ...taskData } = body;
    const task = validateTask(taskData);

    // Create task and transition to planning state
    const { taskId, transition } = await workflowEngine.createTaskWorkflow(task);

    // Optionally auto-generate proposals
    if (autoGenerateProposals) {
      try {
        const proposalResult = await workflowEngine.processTask(taskId);

        return NextResponse.json({
          taskId,
          status: proposalResult.newState,
          message: 'Task created and AI proposals generated',
          transition: {
            create: transition,
            proposals: proposalResult,
          }
        }, { status: 201 });
      } catch (proposalError) {
        // Task created but proposals failed - return partial success
        console.error('Proposal generation failed:', proposalError);
        return NextResponse.json({
          taskId,
          status: transition.newState,
          message: 'Task created but proposal generation failed',
          warning: proposalError instanceof Error ? proposalError.message : 'Proposal generation failed',
          transition: {
            create: transition,
          }
        }, { status: 201 });
      }
    }

    return NextResponse.json({
      taskId,
      status: transition.newState,
      message: 'Task created, awaiting AI proposals',
      transition: {
        create: transition,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow failed' },
      { status: 400 }
    );
  }
}
