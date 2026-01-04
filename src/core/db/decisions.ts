import { DecisionRow } from '@/interfaces/decision';

import { validateDecision, Decision } from '../validators/decision';

import { getSupabaseClient } from './client';

export async function createDecision(decision: Decision, decidedBy?: string): Promise<DecisionRow> {
  const supabase = getSupabaseClient();

  validateDecision(decision);

  const { data, error } = await supabase
    .from('decisions')
    .insert({
      decision_id: decision.id,
      task_id: decision.taskId,
      plan_id: decision.planId || null,
      category: decision.category,
      proposals: decision.proposals,
      selected_option: decision.selectedOption,
      rationale: decision.rationale,
      overrides: decision.overrides || null,
      decided_by: decidedBy || 'system',
      decided_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create decision: ${error.message}`);
  return data as DecisionRow;
}

export async function getDecision(decisionId: string): Promise<DecisionRow> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('decision_id', decisionId)
    .single();

  if (error) throw new Error(`Failed to get decision: ${error.message}`);
  return data as DecisionRow;
}

export async function getDecisionsByTask(taskId: string): Promise<DecisionRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('task_id', taskId)
    .order('decided_at', { ascending: false });

  if (error) throw new Error(`Failed to get decisions for task: ${error.message}`);
  return data as DecisionRow[];
}

export async function listDecisions(filters?: { category?: string; taskId?: string }): Promise<DecisionRow[]> {
  const supabase = getSupabaseClient();

  let query = supabase.from('decisions').select('*').order('decided_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list decisions: ${error.message}`);
  return data as DecisionRow[];
}

export async function deleteDecision(decisionId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('decisions')
    .delete()
    .eq('decision_id', decisionId);

  if (error) throw new Error(`Failed to delete decision: ${error.message}`);
}
