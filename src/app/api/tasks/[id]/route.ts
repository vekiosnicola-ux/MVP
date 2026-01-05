import { NextResponse } from 'next/server';

import { getTask, updateTaskStatus, deleteTask } from '@/core/db/tasks';
import { TaskStatus } from '@/interfaces/task';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await getTask(params.id);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error(`[API] Error getting task ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = await updateTaskStatus(params.id, status as TaskStatus);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(`[API] Error updating task ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTask(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 400 }
    );
  }
}
