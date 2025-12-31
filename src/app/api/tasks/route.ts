import { NextResponse } from 'next/server';

import { createTask, listTasks } from '@/core/db/tasks';
import { validateTask } from '@/core/validators/task';
import { TaskStatus } from '@/interfaces/task';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = validateTask(body);

    const created = await createTask(task);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | undefined;
    const type = searchParams.get('type') || undefined;

    const tasks = await listTasks({ status, type });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
