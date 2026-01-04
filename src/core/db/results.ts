import { ResultRow, ResultStatus } from '@/interfaces/result';

import { validateResult, Result } from '../validators/result';

import { getSupabaseClient } from './client';

export async function createResult(result: Result): Promise<ResultRow> {
  const supabase = getSupabaseClient();

  validateResult(result);

  const summary = `Executed ${result.steps.length} steps in ${result.duration}s - ${result.status}`;
  const agent = result.metadata?.executedBy || 'unknown';

  const { data, error } = await supabase
    .from('results')
    .insert({
      result_id: result.id,
      task_id: result.taskId,
      plan_id: result.planId,
      version: result.version,
      status: result.status,
      summary,
      outputs: result.artifacts,
      quality_gates: result.qualityGates,
      test_results: result.artifacts.testResults || null,
      duration: result.duration,
      agent,
      errors: result.steps
        .filter(s => s.error)
        .map(s => s.error) || null,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create result: ${error.message}`);
  return data as ResultRow;
}

export async function getResult(resultId: string): Promise<ResultRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('result_id', resultId)
    .single();

  if (error) throw new Error(`Failed to get result: ${error.message}`);
  return data as ResultRow;
}

export async function getResultsByTask(taskId: string): Promise<ResultRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('task_id', taskId)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(`Failed to get results for task: ${error.message}`);
  return data as ResultRow[];
}

export async function getResultsByPlan(planId: string): Promise<ResultRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('plan_id', planId)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(`Failed to get results for plan: ${error.message}`);
  return data as ResultRow[];
}

export async function listResults(filters?: { status?: ResultStatus; taskId?: string }): Promise<ResultRow[]> {
  const supabase = getSupabaseClient();

  let query = supabase.from('results').select('*').order('completed_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list results: ${error.message}`);
  return data as ResultRow[];
}

export async function deleteResult(resultId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('results')
    .delete()
    .eq('result_id', resultId);

  if (error) throw new Error(`Failed to delete result: ${error.message}`);
}
