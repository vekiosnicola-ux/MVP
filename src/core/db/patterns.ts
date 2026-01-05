/**
 * Approval Pattern Tracking
 *
 * Tracks patterns in human approval/rejection decisions to:
 * - Identify which proposal approaches get approved more often
 * - Learn common rejection reasons
 * - Measure time-to-approval by task type
 */

import { getSupabaseClient } from './client';

// ============================================================================
// Types
// ============================================================================

export interface ApprovalPattern {
  id: string;
  category: string;           // Task type (feature, bugfix, refactor, etc.)
  approach_type: string;      // e.g., "Standard Implementation", "Fast-Track"
  approved_count: number;     // Times this approach was approved
  rejected_count: number;     // Times this approach was rejected
  avg_time_to_decision: number; // Average minutes from proposal to decision
  common_rejection_reasons: string[]; // Most common rejection reasons
  project_id: string | null;  // Optional project-specific pattern
  created_at: string;
  updated_at: string;
}

export interface PatternStats {
  category: string;
  totalDecisions: number;
  approvalRate: number;
  avgTimeToDecision: number;
  topApproaches: Array<{
    approach: string;
    approvalRate: number;
    count: number;
  }>;
  commonRejections: string[];
}

// ============================================================================
// Pattern Tracking Functions
// ============================================================================

/**
 * Record an approval pattern
 */
export async function recordApprovalPattern(
  category: string,
  approachType: string,
  approved: boolean,
  timeToDecision: number, // minutes
  rejectionReason?: string,
  projectId?: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // Try to find existing pattern
  const { data: existing } = await supabase
    .from('approval_patterns')
    .select('*')
    .eq('category', category)
    .eq('approach_type', approachType)
    .eq('project_id', projectId || null)
    .single();

  if (existing) {
    // Update existing pattern
    const pattern = existing as ApprovalPattern;
    const totalDecisions = pattern.approved_count + pattern.rejected_count + 1;

    const updates: Partial<ApprovalPattern> = {
      approved_count: approved ? pattern.approved_count + 1 : pattern.approved_count,
      rejected_count: approved ? pattern.rejected_count : pattern.rejected_count + 1,
      avg_time_to_decision: Math.round(
        ((pattern.avg_time_to_decision * (totalDecisions - 1)) + timeToDecision) / totalDecisions
      ),
      updated_at: new Date().toISOString(),
    };

    // Add rejection reason if provided
    if (!approved && rejectionReason) {
      const reasons = pattern.common_rejection_reasons || [];
      if (!reasons.includes(rejectionReason)) {
        updates.common_rejection_reasons = [...reasons, rejectionReason].slice(-10); // Keep last 10
      }
    }

    await supabase
      .from('approval_patterns')
      .update(updates)
      .eq('id', pattern.id);
  } else {
    // Create new pattern
    await supabase
      .from('approval_patterns')
      .insert({
        category,
        approach_type: approachType,
        approved_count: approved ? 1 : 0,
        rejected_count: approved ? 0 : 1,
        avg_time_to_decision: timeToDecision,
        common_rejection_reasons: rejectionReason ? [rejectionReason] : [],
        project_id: projectId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  }
}

/**
 * Get approval statistics for a category
 */
export async function getPatternStats(
  category: string,
  projectId?: string
): Promise<PatternStats | null> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('approval_patterns')
    .select('*')
    .eq('category', category);

  if (projectId) {
    query = query.or(`project_id.eq.${projectId},project_id.is.null`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return null;
  }

  const patterns = data as ApprovalPattern[];

  // Calculate aggregate stats
  let totalApproved = 0;
  let totalRejected = 0;
  let totalTime = 0;
  let totalDecisions = 0;
  const allReasons: string[] = [];

  const approachStats = patterns.map(p => {
    const total = p.approved_count + p.rejected_count;
    totalApproved += p.approved_count;
    totalRejected += p.rejected_count;
    totalTime += p.avg_time_to_decision * total;
    totalDecisions += total;
    allReasons.push(...(p.common_rejection_reasons || []));

    return {
      approach: p.approach_type,
      approvalRate: total > 0 ? p.approved_count / total : 0,
      count: total,
    };
  });

  // Count rejection reason frequency
  const reasonCounts = new Map<string, number>();
  for (const reason of allReasons) {
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
  }

  const commonRejections = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason]) => reason);

  return {
    category,
    totalDecisions,
    approvalRate: totalDecisions > 0 ? totalApproved / totalDecisions : 0,
    avgTimeToDecision: totalDecisions > 0 ? Math.round(totalTime / totalDecisions) : 0,
    topApproaches: approachStats.sort((a, b) => b.approvalRate - a.approvalRate).slice(0, 5),
    commonRejections,
  };
}

/**
 * Get the most successful approach type for a category
 */
export async function getMostSuccessfulApproach(
  category: string,
  projectId?: string,
  minDecisions = 3
): Promise<string | null> {
  const stats = await getPatternStats(category, projectId);

  if (!stats || stats.topApproaches.length === 0) {
    return null;
  }

  // Find approach with best approval rate and sufficient data
  const best = stats.topApproaches.find(a => a.count >= minDecisions);
  return best?.approach || null;
}

/**
 * Check if an approach has historically been rejected
 */
export async function isApproachRisky(
  category: string,
  approachType: string,
  projectId?: string,
  threshold = 0.3 // Reject rate > 30% = risky
): Promise<{ risky: boolean; rejectionRate: number; reasons: string[] }> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from('approval_patterns')
    .select('*')
    .eq('category', category)
    .eq('approach_type', approachType)
    .eq('project_id', projectId || null)
    .single();

  if (!data) {
    return { risky: false, rejectionRate: 0, reasons: [] };
  }

  const pattern = data as ApprovalPattern;
  const total = pattern.approved_count + pattern.rejected_count;
  const rejectionRate = total > 0 ? pattern.rejected_count / total : 0;

  return {
    risky: rejectionRate > threshold,
    rejectionRate,
    reasons: pattern.common_rejection_reasons || [],
  };
}

/**
 * Get all patterns for export/analysis
 */
export async function getAllPatterns(): Promise<ApprovalPattern[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('approval_patterns')
    .select('*')
    .order('category')
    .order('approach_type');

  if (error) {
    console.warn(`[getAllPatterns] Error: ${error.message}`);
    return [];
  }

  return (data || []) as ApprovalPattern[];
}
