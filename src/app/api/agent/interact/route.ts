
import { NextRequest, NextResponse } from 'next/server';
import { metaAgent } from '@/core/agents/meta-agent';
import { workflowEngine } from '@/core/orchestrator/workflow';
import { TaskType } from '@/interfaces/task';

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Process user message (may be conversation or task request)
        const result = await metaAgent.processRequest(message);

        // 2. Handle based on result type
        if (result.type === 'conversation') {
            // Return conversational response
            return NextResponse.json({
                success: true,
                conversation: result.message
            });
        }

        // It's a task - create it through the workflow engine
        const taskDraft = result.task;
        const taskType = (taskDraft.type as TaskType) || 'feature';
        const taskId = `task-${crypto.randomUUID()}`;

        const task = {
            id: taskId,
            version: '1.0.0',
            description: taskDraft.description || 'New Task via Chat',
            type: taskType,
            context: taskDraft.context || {
                repository: 'dieta-positiva/app',
                branch: 'main',
                files: [],
                dependencies: []
            },
            constraints: taskDraft.constraints || {
                maxDuration: 60,
                requiresApproval: true,
                breakingChangesAllowed: false,
                testCoverageMin: 80
            },
            metadata: {
                createdBy: 'meta-agent',
            },
            intentStatement: message
        };

        // Create task through workflow engine (handles state transitions)
        const { taskId: createdTaskId } = await workflowEngine.createTaskWorkflow(task);

        // Process the task to generate proposals (moves to awaiting_human_decision)
        try {
            await workflowEngine.processTask(createdTaskId);
        } catch (processError) {
            console.error('[API] Failed to process task after creation:', processError);
            // Task was created, but processing failed - still return success
        }

        // Fetch the latest task state
        const { getTask } = await import('@/core/db/tasks');
        const newTask = await getTask(createdTaskId);

        return NextResponse.json({
            success: true,
            task: newTask
        });

    } catch (error) {
        console.error('Error in agent interact:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
