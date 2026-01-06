
import { NextRequest, NextResponse } from 'next/server';
import { metaAgent } from '@/core/agents/meta-agent';
import { createTask } from '@/core/db/tasks';
import { TaskType } from '@/interfaces/task';

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Interpret user intent
        const taskDraft = await metaAgent.processRequest(message);

        // 2. Create the task in the database
        // Ensure defaults for required fields
        const taskType = (taskDraft.type as TaskType) || 'feature';

        // Generate ID and Version manually
        const taskId = `task-${crypto.randomUUID()}`;

        const newTask = await createTask({
            id: taskId,
            version: '1.0.0',
            description: taskDraft.description || 'New Task via Chat',
            type: taskType,
            context: taskDraft.context || {
                repository: 'local',
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
        });

        return NextResponse.json({
            success: true,
            task: newTask,
            message: 'I have created a new task based on your request. You can now process it.'
        });

    } catch (error) {
        console.error('Error in agent interact:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
