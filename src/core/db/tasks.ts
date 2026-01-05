import { TaskRow, TaskStatus } from '@/interfaces/task';

import { validateTask, Task } from '../validators/task';

import { getSupabaseClient } from './client';

export async function createTask(task: Task): Promise<TaskRow> {
  const supabase = getSupabaseClient();

  validateTask(task);

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      task_id: task.id,
      version: task.version,
      type: task.type,
      description: task.description,
      context: task.context,
      constraints: task.constraints,
      metadata: task.metadata || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return data as TaskRow;
}

export async function getTask(taskId: string): Promise<TaskRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('task_id', taskId)
    .single();

  if (error) throw new Error(`Failed to get task: ${error.message}`);
  return data as TaskRow;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update task: ${error.message}`);
  return data as TaskRow;
}

export async function listTasks(filters?: { status?: TaskStatus; type?: string; limit?: number }): Promise<TaskRow[]> {
  const supabase = getSupabaseClient();

  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list tasks: ${error.message}`);
  return data as TaskRow[];
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('task_id', taskId);

  if (error) throw new Error(`Failed to delete task: ${error.message}`);
}
