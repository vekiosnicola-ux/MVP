/**
 * Pre-Execution Validation
 *
 * Validates plans before execution to catch issues early:
 * - Shell commands are syntactically valid
 * - Step dependencies are satisfiable
 * - Estimated duration is within constraints
 * - No circular dependencies
 */

import type { Plan, PlanStep } from '@/interfaces/plan';
import type { Task } from '@/interfaces/task';

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  stepId?: string;
  field?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  stepId?: string;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a plan before execution
 */
export function validatePlan(plan: Plan, task: Task): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Basic structure validation
  if (!plan.steps || plan.steps.length === 0) {
    errors.push({
      code: 'EMPTY_PLAN',
      message: 'Plan has no steps',
    });
    return { valid: false, errors, warnings };
  }

  // Validate each step
  for (const step of plan.steps) {
    validateStep(step, plan, errors, warnings);
  }

  // Validate dependencies
  validateDependencies(plan, errors);

  // Validate duration constraints
  validateDuration(plan, task, errors, warnings);

  // Validate step count is reasonable
  if (plan.steps.length > 20) {
    warnings.push({
      code: 'MANY_STEPS',
      message: `Plan has ${plan.steps.length} steps. Consider breaking into smaller tasks.`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single step
 */
function validateStep(
  step: PlanStep,
  plan: Plan,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate step ID
  if (!step.id || step.id.trim() === '') {
    errors.push({
      code: 'MISSING_STEP_ID',
      message: 'Step is missing an ID',
    });
    return;
  }

  // Validate agent type
  const validAgents = [
    'orchestrator', 'architect', 'developer', 'database',
    'reviewer', 'tester', 'devops', 'documenter'
  ];
  if (!validAgents.includes(step.agent)) {
    errors.push({
      code: 'INVALID_AGENT',
      message: `Invalid agent type: ${step.agent}`,
      stepId: step.id,
      field: 'agent',
    });
  }

  // Validate action is not empty
  if (!step.action || step.action.trim() === '') {
    errors.push({
      code: 'EMPTY_ACTION',
      message: 'Step action is empty',
      stepId: step.id,
      field: 'action',
    });
  }

  // Validate validation command
  if (step.validation) {
    if (step.validation.command) {
      const cmdIssues = validateShellCommand(step.validation.command);
      for (const issue of cmdIssues) {
        warnings.push({
          code: 'SUSPICIOUS_COMMAND',
          message: issue,
          stepId: step.id,
        });
      }
    }

    if (!step.validation.successCriteria || step.validation.successCriteria.trim() === '') {
      warnings.push({
        code: 'MISSING_SUCCESS_CRITERIA',
        message: 'Step has no success criteria defined',
        stepId: step.id,
      });
    }
  }

  // Validate dependencies reference existing steps
  if (step.dependencies) {
    const stepIds = new Set(plan.steps.map(s => s.id));
    for (const dep of step.dependencies) {
      if (!stepIds.has(dep)) {
        errors.push({
          code: 'INVALID_DEPENDENCY',
          message: `Step depends on non-existent step: ${dep}`,
          stepId: step.id,
          field: 'dependencies',
        });
      }
    }
  }
}

/**
 * Validate shell command for obvious issues
 */
function validateShellCommand(command: string): string[] {
  const issues: string[] = [];

  // Check for dangerous commands
  const dangerousPatterns = [
    { pattern: /rm\s+-rf\s+\/[^a-zA-Z]/, message: 'Dangerous rm -rf on root path' },
    { pattern: /rm\s+-rf\s+\*/, message: 'Dangerous rm -rf with wildcard' },
    { pattern: /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;/, message: 'Fork bomb detected' },
    { pattern: />\s*\/dev\/sd[a-z]/, message: 'Writing directly to block device' },
    { pattern: /mkfs\./, message: 'Filesystem format command detected' },
    { pattern: /dd\s+if=.*of=\/dev\//, message: 'dd to block device detected' },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(command)) {
      issues.push(message);
    }
  }

  // Check for unbalanced quotes
  const singleQuotes = (command.match(/'/g) || []).length;
  const doubleQuotes = (command.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    issues.push('Unbalanced single quotes');
  }
  if (doubleQuotes % 2 !== 0) {
    issues.push('Unbalanced double quotes');
  }

  return issues;
}

/**
 * Validate step dependencies for cycles
 */
function validateDependencies(plan: Plan, errors: ValidationError[]): void {
  // Build dependency graph
  const graph = new Map<string, string[]>();
  for (const step of plan.steps) {
    graph.set(step.id, step.dependencies || []);
  }

  // Check for cycles using DFS
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function hasCycle(stepId: string): boolean {
    if (inStack.has(stepId)) return true;
    if (visited.has(stepId)) return false;

    visited.add(stepId);
    inStack.add(stepId);

    const deps = graph.get(stepId) || [];
    for (const dep of deps) {
      if (hasCycle(dep)) return true;
    }

    inStack.delete(stepId);
    return false;
  }

  for (const step of plan.steps) {
    if (hasCycle(step.id)) {
      errors.push({
        code: 'CIRCULAR_DEPENDENCY',
        message: `Circular dependency detected involving step: ${step.id}`,
        stepId: step.id,
      });
      break; // Only report first cycle found
    }
  }
}

/**
 * Validate duration against task constraints
 */
function validateDuration(
  plan: Plan,
  task: Task,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (plan.estimatedDuration > task.constraints.maxDuration) {
    errors.push({
      code: 'DURATION_EXCEEDED',
      message: `Plan duration (${plan.estimatedDuration}m) exceeds task constraint (${task.constraints.maxDuration}m)`,
    });
  } else if (plan.estimatedDuration > task.constraints.maxDuration * 0.8) {
    warnings.push({
      code: 'DURATION_CLOSE_TO_LIMIT',
      message: `Plan duration (${plan.estimatedDuration}m) is close to constraint (${task.constraints.maxDuration}m)`,
    });
  }
}

/**
 * Quick check if plan is valid (no details)
 */
export function isPlanValid(plan: Plan, task: Task): boolean {
  return validatePlan(plan, task).valid;
}

/**
 * Format validation result as human-readable string
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✓ Plan validation passed');
  } else {
    lines.push('✗ Plan validation failed');
  }

  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    for (const error of result.errors) {
      const location = error.stepId ? ` (step: ${error.stepId})` : '';
      lines.push(`  - [${error.code}]${location}: ${error.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    for (const warning of result.warnings) {
      const location = warning.stepId ? ` (step: ${warning.stepId})` : '';
      lines.push(`  - [${warning.code}]${location}: ${warning.message}`);
    }
  }

  return lines.join('\n');
}
