import { HumanOverride } from '@/interfaces/workflow';

import { getSupabaseClient } from './client';

export interface CreateOverrideInput {
  taskId?: string;
  aiSuggestion: string;
  humanDecision: string;
  category: string;
  rationale: string;
  projectId?: string;
}

export async function createOverride(input: CreateOverrideInput): Promise<HumanOverride> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('human_overrides')
    .insert({
      task_id: input.taskId || null,
      ai_suggestion: input.aiSuggestion,
      human_decision: input.humanDecision,
      category: input.category,
      rationale: input.rationale,
      project_id: input.projectId || null,
      applied_count: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create override: ${error.message}`);
  return data as HumanOverride;
}

export async function getOverride(id: string): Promise<HumanOverride> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('human_overrides')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to get override: ${error.message}`);
  return data as HumanOverride;
}

export async function listOverrides(filters?: { category?: string; projectId?: string }): Promise<HumanOverride[]> {
  const supabase = getSupabaseClient();

  let query = supabase.from('human_overrides').select('*').order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list overrides: ${error.message}`);
  return data as HumanOverride[];
}

export async function incrementOverrideCount(id: string): Promise<HumanOverride> {
  const supabase = getSupabaseClient();

  const override = await getOverride(id);

  const { data, error } = await supabase
    .from('human_overrides')
    .update({ applied_count: override.applied_count + 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to increment override count: ${error.message}`);
  return data as HumanOverride;
}

export async function deleteOverride(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('human_overrides')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete override: ${error.message}`);
}
