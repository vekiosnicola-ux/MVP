/**
 * Constitution Enforcer
 *
 * Runtime enforcement of Constitution rules.
 * Checks actions against inviolable rules before execution.
 */

// ============================================================================
// Types
// ============================================================================

export type ViolationType = 'BLOCK' | 'GATE' | 'WARN' | 'ALLOW';

export interface ConstitutionCheck {
  allowed: boolean;
  violation: ViolationType;
  rule?: string;
  reason?: string;
  requiresApproval?: boolean;
}

export interface ActionContext {
  command?: string;
  file?: string;
  files?: string[];
  targetSystem?: 'external' | 'self';
  actionType?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Sacred Files (from Constitution)
// ============================================================================

const SACRED_FILES: Record<string, 'READONLY' | 'REVIEW_REQUIRED'> = {
  'docs/CONSTITUTION.md': 'REVIEW_REQUIRED',
  'src/core/orchestrator/state-machine.ts': 'REVIEW_REQUIRED',
  'src/core/orchestrator/workflow.ts': 'REVIEW_REQUIRED',
  '.env': 'READONLY',
  '.env.local': 'READONLY',
  '.env.production': 'READONLY',
  'package.json': 'REVIEW_REQUIRED',
  'package-lock.json': 'REVIEW_REQUIRED',
};

const SACRED_PATTERNS = [
  { pattern: /^supabase\/migrations\//, protection: 'REVIEW_REQUIRED' as const },
  { pattern: /^\.env/, protection: 'READONLY' as const },
];

// ============================================================================
// Dangerous Commands (from Constitution)
// ============================================================================

const BLOCKED_COMMANDS = [
  /git\s+push\s+.*--force/i,
  /git\s+push\s+-f/i,
  /git\s+reset\s+--hard/i,
  /rm\s+-rf\s+\//,
  /rm\s+-rf\s+\*/,
  /DROP\s+DATABASE/i,
  /DROP\s+TABLE/i,
  /TRUNCATE\s+TABLE/i,
];

const GATED_COMMANDS = [
  { pattern: /git\s+branch\s+-[dD]/, reason: 'Branch deletion requires approval' },
  { pattern: /npm\s+install\s+\S/, reason: 'New dependency requires review' },
  { pattern: /npx\s+supabase\s+migration/, reason: 'Database migration requires approval' },
];

// ============================================================================
// Self-Modification Limits (from Constitution)
// ============================================================================

const SELF_MOD_LIMITS: Record<string, { allowed: boolean; requiresApproval: boolean; maxPerDay: number }> = {
  'prompts': { allowed: true, requiresApproval: false, maxPerDay: Infinity },
  'agents': { allowed: true, requiresApproval: true, maxPerDay: 5 },
  'workflow': { allowed: true, requiresApproval: true, maxPerDay: 2 },
  'database': { allowed: true, requiresApproval: true, maxPerDay: 1 },
  'orchestrator': { allowed: false, requiresApproval: true, maxPerDay: 0 },
  'constitution': { allowed: true, requiresApproval: true, maxPerDay: 1 },
  'api': { allowed: true, requiresApproval: true, maxPerDay: 3 },
};

// ============================================================================
// Constitution Enforcer
// ============================================================================

export class ConstitutionEnforcer {
  private selfModCounts: Map<string, number> = new Map();
  private lastResetDate: string = new Date().toDateString();

  /**
   * Check if an action is allowed by the Constitution
   */
  check(context: ActionContext): ConstitutionCheck {
    // Reset daily counts if new day
    this.resetDailyCountsIfNeeded();

    // Check command if provided
    if (context.command) {
      const commandCheck = this.checkCommand(context.command);
      if (!commandCheck.allowed) {
        return commandCheck;
      }
    }

    // Check file if provided
    if (context.file) {
      const fileCheck = this.checkFile(context.file, context.targetSystem);
      if (!fileCheck.allowed || fileCheck.requiresApproval) {
        return fileCheck;
      }
    }

    // Check multiple files if provided
    if (context.files) {
      for (const file of context.files) {
        const fileCheck = this.checkFile(file, context.targetSystem);
        if (!fileCheck.allowed) {
          return fileCheck;
        }
        if (fileCheck.requiresApproval) {
          return fileCheck;
        }
      }
    }

    // Check self-modification limits
    if (context.targetSystem === 'self' && context.actionType) {
      const selfModCheck = this.checkSelfModification(context.actionType);
      if (!selfModCheck.allowed) {
        return selfModCheck;
      }
    }

    return { allowed: true, violation: 'ALLOW' };
  }

  /**
   * Check if a command is allowed
   */
  private checkCommand(command: string): ConstitutionCheck {
    // Check blocked commands
    for (const pattern of BLOCKED_COMMANDS) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          violation: 'BLOCK',
          rule: 'No Destructive Operations',
          reason: `Command matches blocked pattern: ${pattern.toString()}`,
        };
      }
    }

    // Check gated commands
    for (const { pattern, reason } of GATED_COMMANDS) {
      if (pattern.test(command)) {
        return {
          allowed: true,
          violation: 'GATE',
          rule: 'Human Gate Required',
          reason,
          requiresApproval: true,
        };
      }
    }

    return { allowed: true, violation: 'ALLOW' };
  }

  /**
   * Check if a file can be modified
   */
  private checkFile(filePath: string, targetSystem?: 'external' | 'self'): ConstitutionCheck {
    // Normalize path
    const normalizedPath = filePath.replace(/^\/Users\/[^/]+\/MVP\//, '');

    // Check exact matches
    const protection = SACRED_FILES[normalizedPath];
    if (protection === 'READONLY') {
      return {
        allowed: false,
        violation: 'BLOCK',
        rule: 'Sacred File - Readonly',
        reason: `File ${normalizedPath} is marked as READONLY and cannot be modified`,
      };
    }
    if (protection === 'REVIEW_REQUIRED') {
      return {
        allowed: true,
        violation: 'GATE',
        rule: 'Sacred File - Review Required',
        reason: `File ${normalizedPath} requires human review before modification`,
        requiresApproval: true,
      };
    }

    // Check patterns
    for (const { pattern, protection: patternProtection } of SACRED_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        if (patternProtection === 'READONLY') {
          return {
            allowed: false,
            violation: 'BLOCK',
            rule: 'Sacred Pattern - Readonly',
            reason: `File ${normalizedPath} matches readonly pattern`,
          };
        }
        if (patternProtection === 'REVIEW_REQUIRED') {
          return {
            allowed: true,
            violation: 'GATE',
            rule: 'Sacred Pattern - Review Required',
            reason: `File ${normalizedPath} matches review-required pattern`,
            requiresApproval: true,
          };
        }
      }
    }

    // Self-modification checks
    if (targetSystem === 'self') {
      // Determine area from file path
      const area = this.getAreaFromPath(normalizedPath);
      if (area) {
        const limits = SELF_MOD_LIMITS[area];
        if (limits && !limits.allowed) {
          return {
            allowed: false,
            violation: 'BLOCK',
            rule: 'Self-Modification Blocked',
            reason: `Modifying ${area} is not allowed for self-modification`,
          };
        }
        if (limits?.requiresApproval) {
          return {
            allowed: true,
            violation: 'GATE',
            rule: 'Self-Modification Gate',
            reason: `Self-modifying ${area} requires approval`,
            requiresApproval: true,
          };
        }
      }
    }

    return { allowed: true, violation: 'ALLOW' };
  }

  /**
   * Check self-modification limits
   */
  private checkSelfModification(actionType: string): ConstitutionCheck {
    const limits = SELF_MOD_LIMITS[actionType];
    if (!limits) {
      return { allowed: true, violation: 'ALLOW' };
    }

    if (!limits.allowed) {
      return {
        allowed: false,
        violation: 'BLOCK',
        rule: 'Self-Modification Not Allowed',
        reason: `Self-modification of ${actionType} is not permitted`,
      };
    }

    // Check daily limit
    const currentCount = this.selfModCounts.get(actionType) || 0;
    if (currentCount >= limits.maxPerDay) {
      return {
        allowed: false,
        violation: 'BLOCK',
        rule: 'Daily Limit Exceeded',
        reason: `Self-modification of ${actionType} has reached daily limit (${limits.maxPerDay})`,
      };
    }

    if (limits.requiresApproval) {
      return {
        allowed: true,
        violation: 'GATE',
        rule: 'Self-Modification Requires Approval',
        reason: `Self-modifying ${actionType} requires human approval`,
        requiresApproval: true,
      };
    }

    return { allowed: true, violation: 'ALLOW' };
  }

  /**
   * Record a self-modification action
   */
  recordSelfModification(actionType: string): void {
    const currentCount = this.selfModCounts.get(actionType) || 0;
    this.selfModCounts.set(actionType, currentCount + 1);
  }

  /**
   * Get area from file path for self-modification limits
   */
  private getAreaFromPath(path: string): string | null {
    if (path.includes('orchestrator')) return 'orchestrator';
    if (path.includes('agents')) return 'agents';
    if (path.includes('workflow')) return 'workflow';
    if (path.includes('constitution')) return 'constitution';
    if (path.includes('migrations') || path.includes('/db/')) return 'database';
    if (path.includes('/api/')) return 'api';
    if (path.includes('prompts')) return 'prompts';
    return null;
  }

  /**
   * Reset daily counts if it's a new day
   */
  private resetDailyCountsIfNeeded(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.selfModCounts.clear();
      this.lastResetDate = today;
    }
  }

  /**
   * Get remaining self-modification allowance for today
   */
  getRemainingAllowance(actionType: string): number {
    this.resetDailyCountsIfNeeded();
    const limits = SELF_MOD_LIMITS[actionType];
    if (!limits || !limits.allowed) return 0;
    const currentCount = this.selfModCounts.get(actionType) || 0;
    return Math.max(0, limits.maxPerDay - currentCount);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const constitutionEnforcer = new ConstitutionEnforcer();

// ============================================================================
// Custom Error
// ============================================================================

export class ConstitutionViolation extends Error {
  constructor(
    public rule: string,
    public reason: string
  ) {
    super(`Constitution Violation [${rule}]: ${reason}`);
    this.name = 'ConstitutionViolation';
  }
}
