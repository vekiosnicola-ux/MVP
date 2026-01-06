
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

        // It's a task - create it in the database
        const taskDraft = result.task;
        const taskType = (taskDraft.type as TaskType) || 'feature';
        const taskId = `task-${crypto.randomUUID()}`;

        const newTask = await createTask({
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
        });

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
