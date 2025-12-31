import { PlanRow, PlanStatus } from '@/interfaces/plan';

import { validatePlan, Plan } from '../validators/plan';

import { getSupabaseClient } from './client';

export async function createPlan(plan: Plan): Promise<PlanRow> {
  const supabase = getSupabaseClient();

  validatePlan(plan);

  const approach = plan.steps.map(s => s.action).join(' → ');
  const reasoning = `Estimated ${plan.estimatedDuration}s with ${plan.risks.length} identified risks`;

  const { data, error } = await supabase
    .from('plans')
    .insert({
      plan_id: plan.id,
      task_id: plan.taskId,
      version: plan.version,
      approach,
      reasoning,
      steps: plan.steps,
      agent: plan.steps[0]?.agent || 'orchestrator',
      estimated_duration: plan.estimatedDuration,
      dependencies: plan.steps.flatMap(s => s.dependencies || []),
      risks: plan.risks,
      status: 'proposed'
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create plan: ${error.message}`);
  return data as PlanRow;
}

export async function getPlan(planId: string): Promise<PlanRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('plan_id', planId)
    .single();

  if (error) throw new Error(`Failed to get plan: ${error.message}`);
  return data as PlanRow;
}

export async function getPlansByTask(taskId: string): Promise<PlanRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get plans for task: ${error.message}`);
  return data as PlanRow[];
}

export async function updatePlanStatus(planId: string, status: PlanStatus): Promise<PlanRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('plans')
    .update({ status })
    .eq('plan_id', planId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update plan: ${error.message}`);
  return data as PlanRow;
}

export async function listPlans(filters?: { status?: PlanStatus; taskId?: string }): Promise<PlanRow[]> {
  const supabase = getSupabaseClient();

  let query = supabase.from('plans').select('*').order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list plans: ${error.message}`);
  return data as PlanRow[];
}

export async function deletePlan(planId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('plan_id', planId);

  if (error) throw new Error(`Failed to delete plan: ${error.message}`);
}
