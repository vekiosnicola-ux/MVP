import { NextResponse } from 'next/server';

import { workflowEngine } from '@/core/orchestrator/workflow';

export async function POST(request: Request) {
    try {
        const { taskId } = await request.json();

        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
        }

        // Trigger the workflow engine to process the task and generate proposals
        await workflowEngine.processTask(taskId);

        return NextResponse.json({
            status: 'proposals_generated',
            message: 'AI proposals generated successfully',
            taskId
        });
    } catch (error) {
        console.error('Error generating proposals:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Proposal generation failed' },
            { status: 500 }
        );
    }
}
