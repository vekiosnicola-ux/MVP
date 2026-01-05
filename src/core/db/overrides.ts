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

/**
 * Get overrides relevant to a task for planning context
 * Matches by category (task type) and optionally project_id (repository)
 * Returns most recent and most applied overrides first
 */
export async function getRelevantOverrides(
  category: string,
  projectId?: string,
  limit = 10
): Promise<HumanOverride[]> {
  const supabase = getSupabaseClient();

  // First try to find project-specific overrides
  if (projectId) {
    const { data: projectOverrides } = await supabase
      .from('human_overrides')
      .select('*')
      .eq('category', category)
      .eq('project_id', projectId)
      .order('applied_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectOverrides && projectOverrides.length > 0) {
      return projectOverrides as HumanOverride[];
    }
  }

  // Fall back to category-wide overrides (no project_id or any project)
  const { data, error } = await supabase
    .from('human_overrides')
    .select('*')
    .eq('category', category)
    .order('applied_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getRelevantOverrides] Error: ${error.message}`);
    return [];
  }

  return (data || []) as HumanOverride[];
}

// ============================================================================
// Keyword Similarity Matching
// ============================================================================

/**
 * Extract keywords from text (simple tokenization)
 */
function extractKeywords(text: string): Set<string> {
  // Common stop words to ignore
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only',
    'same', 'so', 'than', 'too', 'very'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  );
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Override with calculated relevance score
 */
export interface ScoredOverride extends HumanOverride {
  relevanceScore: number;
}

/**
 * Get overrides relevant to a task with keyword-based similarity scoring
 *
 * @param category - Task type (exact match)
 * @param description - Task description for similarity matching
 * @param projectId - Repository/project ID (optional)
 * @param minSimilarity - Minimum similarity score (0-1) to include
 * @param limit - Maximum overrides to return
 */
export async function getRelevantOverridesWithSimilarity(
  category: string,
  description: string,
  projectId?: string,
  minSimilarity = 0.1,
  limit = 10
): Promise<ScoredOverride[]> {
  const supabase = getSupabaseClient();

  // Fetch all overrides for this category
  let query = supabase
    .from('human_overrides')
    .select('*')
    .eq('category', category);

  if (projectId) {
    // Prefer project-specific but include all
    query = query.or(`project_id.eq.${projectId},project_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`[getRelevantOverridesWithSimilarity] Error: ${error.message}`);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Extract keywords from task description
  const taskKeywords = extractKeywords(description);

  // Score each override by similarity
  const scoredOverrides: ScoredOverride[] = (data as HumanOverride[])
    .map(override => {
      // Combine AI suggestion and human decision for keyword extraction
      const overrideText = `${override.ai_suggestion} ${override.human_decision} ${override.rationale}`;
      const overrideKeywords = extractKeywords(overrideText);

      // Calculate similarity
      const similarity = jaccardSimilarity(taskKeywords, overrideKeywords);

      // Boost score for project match and applied_count
      let score = similarity;
      if (projectId && override.project_id === projectId) {
        score += 0.2; // Project match bonus
      }
      score += Math.min(override.applied_count * 0.05, 0.3); // Applied count bonus (max 0.3)

      return {
        ...override,
        relevanceScore: Math.min(score, 1.0), // Cap at 1.0
      };
    })
    .filter(o => o.relevanceScore >= minSimilarity)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return scoredOverrides;
}
