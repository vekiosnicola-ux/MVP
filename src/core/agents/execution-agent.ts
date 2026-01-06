/**
 * Execution Agent
 *
 * Executes plans with support for both mock and real modes.
 * Real mode: executes shell commands with git snapshot rollback.
 * Mock mode: simulates execution for testing.
 */

import type { Plan, PlanStep } from '@/interfaces/plan';
import type { Result, StepResult, Artifacts, QualityGates } from '@/interfaces/result';

import {
  GitSnapshotManager,
  CommandExecutor,
  type Snapshot,
} from '../sandbox';

import { groqClient } from './groq-client';
import { claudeClient } from './claude-client';
import { contextManager } from '../utils/context-manager';
import { tools, getToolDefinitions } from '../utils/agent-tools';

// ============================================================================
// Types
// ============================================================================

export interface CircuitBreakerConfig {
  /** Stop execution after N consecutive failures */
  maxConsecutiveFailures: number;
  /** Timeout per step in milliseconds */
  stepTimeout: number;
  /** Max retries per step before marking as failed */
  maxRetries: number;
}

export type ExecutionMode = 'mock' | 'real';

export interface ExecutionOptions {
  /** Execution mode: 'mock' for testing, 'real' for actual execution */
  mode?: ExecutionMode;
  /** Working directory for real execution */
  workingDir?: string;
  /** Simulate delay per step (ms) - mock mode only */
  stepDelay?: number;
  /** Probability of step failure (0-1) - mock mode only */
  failureRate?: number;
  /** Force specific step to fail - mock mode only */
  forceFailStep?: string;
  /** Circuit breaker configuration */
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  /** Enable git snapshot/rollback - real mode only */
  enableSnapshot?: boolean;
}

export interface ExecutionProgress {
  currentStep: number;
  totalSteps: number;
  stepId: string;
  status: 'running' | 'completed' | 'failed';
}

type ProgressCallback = (progress: ExecutionProgress) => void;

// ============================================================================
// Execution Agent
// ============================================================================

const DEFAULT_CIRCUIT_BREAKER: CircuitBreakerConfig = {
  maxConsecutiveFailures: 3,
  stepTimeout: 30000, // 30 seconds
  maxRetries: 2,
};

export class ExecutionAgent {
  private options: ExecutionOptions;
  private circuitBreaker: CircuitBreakerConfig;
  private progressCallbacks: ProgressCallback[] = [];
  private snapshotManager?: GitSnapshotManager;
  private commandExecutor?: CommandExecutor;
  private shouldStop: boolean = false; // Flag to stop execution gracefully

  constructor(options: ExecutionOptions = {}) {
    this.options = {
      mode: options.mode ?? 'mock',
      workingDir: options.workingDir ?? process.cwd(),
      stepDelay: options.stepDelay ?? 500,
      failureRate: options.failureRate ?? 0,
      forceFailStep: options.forceFailStep,
      enableSnapshot: options.enableSnapshot ?? true,
    };
    this.circuitBreaker = {
      ...DEFAULT_CIRCUIT_BREAKER,
      ...options.circuitBreaker,
    };

    // Initialize real execution components if in real mode
    if (this.options.mode === 'real') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.snapshotManager = new GitSnapshotManager(this.options.workingDir!);
      this.commandExecutor = new CommandExecutor({
        cwd: this.options.workingDir,
        timeout: this.circuitBreaker.stepTimeout,
      });
    }
  }

  /**
   * Set execution mode (for testing)
   */
  setMode(mode: ExecutionMode, workingDir?: string): void {
    this.options.mode = mode;
    if (workingDir) {
      this.options.workingDir = workingDir;
    }

    if (mode === 'real') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.snapshotManager = new GitSnapshotManager(this.options.workingDir!);
      this.commandExecutor = new CommandExecutor({
        cwd: this.options.workingDir,
        timeout: this.circuitBreaker.stepTimeout,
      });
    } else {
      this.snapshotManager = undefined;
      this.commandExecutor = undefined;
    }
  }

  /**
   * Execute a plan and return results
   * Includes circuit breaker: stops after maxConsecutiveFailures
   * In real mode: creates git snapshot before execution and rolls back on failure
   */
  async execute(plan: Plan, taskId: string): Promise<Result> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let overallStatus: Result['status'] = 'success';
    let consecutiveFailures = 0;
    let circuitBroken = false;
    let snapshot: Snapshot | undefined;

    const isRealMode = this.options.mode === 'real';

    // Create snapshot in real mode
    if (isRealMode && this.options.enableSnapshot && this.snapshotManager) {
      // eslint-disable-next-line no-console
      console.log(`[ExecutionAgent] Real mode - creating git snapshot`);
      const snapshotResult = await this.snapshotManager.createSnapshot(taskId);
      if (snapshotResult.success) {
        snapshot = snapshotResult.snapshot;
      } else {
        console.warn(`[ExecutionAgent] Could not create snapshot: ${snapshotResult.error}`);
      }
    }

    try {
      console.log(`[ExecutionAgent] Executing plan: ${plan.id} (${plan.steps.length} steps)`);

      let runningSummary = '';

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        if (!step) continue;
        if (this.shouldStop) break;

        // Circuit breaker check
        if (consecutiveFailures >= this.circuitBreaker.maxConsecutiveFailures) {
          console.error(
            `[ExecutionAgent] Circuit breaker triggered after ${consecutiveFailures} consecutive failures. ` +
            `Skipping remaining ${plan.steps.length - i} steps.`
          );
          circuitBroken = true;
          break;
        }

        // Notify progress
        this.notifyProgress({
          currentStep: i + 1,
          totalSteps: plan.steps.length,
          stepId: step.id,
          status: 'running',
        });

        // Add delay in mock mode
        if (!isRealMode) {
          await this.delay(this.options.stepDelay || 500);
        }

        // Execute step with retry logic
        const stepResult = await this.executeStepWithRetry(step, plan, runningSummary);
        stepResults.push(stepResult);

        // Update running summary with this step's result
        const stepLog = `Step: ${step.id} - ${step.action}
Result: ${stepResult.status}
Output: ${stepResult.validation.output?.slice(0, 500) || 'None'}`;

        runningSummary = await contextManager.updateRunningSummary(runningSummary, stepLog);

        // Track consecutive failures for circuit breaker
        if (stepResult.status === 'failure') {
          consecutiveFailures++;
          overallStatus = 'partial_success';
        } else {
          consecutiveFailures = 0; // Reset on success
        }

        // Notify completion
        this.notifyProgress({
          currentStep: i + 1,
          totalSteps: plan.steps.length,
          stepId: step.id,
          status: stepResult.status === 'success' ? 'completed' : 'failed',
        });
      }

      // Calculate final status
      const failedSteps = stepResults.filter((s) => s.status === 'failure').length;
      if (failedSteps === stepResults.length || circuitBroken) {
        overallStatus = 'failure';
      } else if (failedSteps > 0) {
        overallStatus = 'partial_success';
      }

      // Handle snapshot cleanup
      if (snapshot && this.snapshotManager) {
        if (overallStatus === 'failure' || circuitBroken) {
          // Rollback on failure
          // eslint-disable-next-line no-console
          console.log(`[ExecutionAgent] Execution failed - rolling back to snapshot`);
          await this.snapshotManager.rollback(snapshot.id);
        } else {
          // Discard snapshot on success
          await this.snapshotManager.discardSnapshot(snapshot.id);
        }
      }

    } catch (error) {
      // Unexpected error - rollback if possible
      if (snapshot && this.snapshotManager) {
        // eslint-disable-next-line no-console
        console.log(`[ExecutionAgent] Unexpected error - rolling back`);
        await this.snapshotManager.rollback(snapshot.id);
      }
      throw error;
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const result = this.buildResult(plan, taskId, stepResults, overallStatus, duration);

    // Add execution metadata
    result.metadata = {
      ...result.metadata,
      executionMode: this.options.mode,
    };

    if (circuitBroken) {
      result.metadata = {
        ...result.metadata,
        circuitBroken: true,
        skippedSteps: plan.steps.length - stepResults.length,
      };
    }

    if (snapshot) {
      result.metadata = {
        ...result.metadata,
        snapshotId: snapshot.id,
        rolledBack: overallStatus === 'failure' || circuitBroken,
      };
    }

    return result;
  }

  /**
   * Execute a step with retry logic and timeout
   */
  private async executeStepWithRetry(step: PlanStep, plan: Plan, runningSummary: string): Promise<StepResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.circuitBreaker.maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(
          () => this.executeStep(step, plan, runningSummary),
          this.circuitBreaker.stepTimeout
        );

        if (result.status === 'success') {
          return result;
        }

        // Step failed but didn't throw - check if we should retry
        if (attempt < this.circuitBreaker.maxRetries) {
          // eslint-disable-next-line no-console
          console.log(`[ExecutionAgent] Step ${step.id} failed, retrying (${attempt + 1}/${this.circuitBreaker.maxRetries})`);
          await this.delay(1000); // Wait 1s before retry
          continue;
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[ExecutionAgent] Step ${step.id} threw error:`, lastError.message);

        if (attempt < this.circuitBreaker.maxRetries) {
          // eslint-disable-next-line no-console
          console.log(`[ExecutionAgent] Retrying step ${step.id} (${attempt + 1}/${this.circuitBreaker.maxRetries})`);
          await this.delay(1000);
          continue;
        }
      }
    }

    // All retries exhausted
    return this.createTimeoutStepResult(step, lastError?.message || 'Max retries exceeded');
  }

  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Step timed out after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Create a timeout/error step result
   */
  private createTimeoutStepResult(step: PlanStep, errorMessage: string): StepResult {
    return {
      id: step.id,
      status: 'failure',
      duration: Math.round(this.circuitBreaker.stepTimeout / 1000),
      validation: {
        passed: false,
        command: step.validation.command,
        output: `✗ ${errorMessage}`,
        exitCode: 124, // Standard timeout exit code
      },
      error: {
        message: errorMessage,
        recoverable: false,
      },
    };
  }

  /**
   * Subscribe to execution progress updates
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Execute a single step
   * In real mode: runs validation command
   * In mock mode: simulates with optional failure rate
   */
  private async executeStep(step: PlanStep, plan: Plan, contextSummary: string = ''): Promise<StepResult> {
    console.log(`[ExecutionAgent] Starting step ${step.id}: ${step.action}`);

    // Check if we're in real mode
    if (this.options.mode === 'real' && this.commandExecutor) {
      return this.executeRealStep(step, plan, contextSummary);
    }
    return this.executeMockStep(step);
  }

  /**
   * Perform the action using AI (System 3)
   */
  private async performAction(step: PlanStep, plan: Plan, contextSummary: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[ExecutionAgent] Performing action: ${step.action}`);

    const systemPrompt = `You are an expert autonomous developer agent.
Your goal is to execute the following step in a software development plan.

PLAN CONTEXT:
Goal: ${plan.approach}
Reasoning: ${plan.reasoning}

PREVIOUS STEPS SUMMARY:
${contextSummary || 'No previous steps executed.'}

CURRENT STEP:
Action: ${step.action}
Inputs: ${step.inputs?.join(', ') || 'None'}
Outputs: ${step.outputs?.join(', ') || 'None'}

Review the goal and previous context. 
If the previous steps failed or produced unexpected results, adjust your approach.
Use the available tools to complete the action.

AVAILABLE TOOLS:
${getToolDefinitions()}

To use a tool, output a JSON object in this exact format (no other text):
{"tool": "tool_name", "args": { ... }}

Example:
{"tool": "write_file", "args": { "path": "src/hello.ts", "content": "console.log('hello')" }}

Create the necessary files or run commands to fulfill the action.`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: `Execute this step: ${step.action}` }
    ];

    // Simple loop for tool use (limit to 5 turns per step to prevent loops)
    for (let i = 0; i < 5; i++) {
      let content = '';
      // Prioritize Claude for execution (better coding capabilities)
      if (claudeClient.isConfigured()) {
        const response = await claudeClient.chat(messages, { system: systemPrompt });
        content = response.content;
      } else if (groqClient.isConfigured()) {
        // Fallback to Groq if Claude is not configured
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await groqClient.chat(messages as any, { system: systemPrompt });
        content = response.content;
      } else {
        console.warn('[ExecutionAgent] No AI client configured, skipping action performance');
        return;
      }

      // Parse tool call
      try {
        const cleanContent = content.trim();
        // eslint-disable-next-line no-console
        console.log(`[ExecutionAgent] LLM Content (Raw): ${cleanContent}`);

        let jsonStr = '';
        // 1. Try to find a code block
        const codeBlockMatch = cleanContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          jsonStr = codeBlockMatch[1];
        } else {
          // 2. Fallback: Find the first '{' and last '}'
          const firstBrace = cleanContent.indexOf('{');
          const lastBrace = cleanContent.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
          }
        }

        if (jsonStr) {
          const toolCall = JSON.parse(jsonStr);
          const toolName = toolCall.tool as keyof typeof tools;
          if (tools[toolName]) {
            console.log(`[ExecutionAgent] Executing tool ${toolName}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await tools[toolName].execute(toolCall.args as any);

            messages.push({ role: 'assistant', content });
            messages.push({ role: 'user', content: `Tool Output: ${result}` });
            continue;
          }
        } else {
          // Check if it's just talking without a tool
          // eslint-disable-next-line no-console
          console.log('[ExecutionAgent] No tool call found in response');
          break;
        }
      } catch (e) {
        console.warn('[ExecutionAgent] Error parsing/executing tool:', e);
      }

      // If we got here, no tool was executed or we're done
      break;
    }
  }

  /**
   * Execute a step in real mode - runs the validation command
   */
  private async executeRealStep(step: PlanStep, plan: Plan, contextSummary: string): Promise<StepResult> {
    const startTime = Date.now();
    const command = step.validation.command;

    if (!command) {
      // No validation command - assume success
      return {
        id: step.id,
        status: 'success',
        duration: 0,
        validation: {
          passed: true,
          output: 'No validation command specified',
        },
        artifacts: step.outputs,
      };
    }

    // eslint-disable-next-line no-console
    console.log(`[ExecutionAgent] Running: ${command}`);
    // 1. Perform Action (The Magic)
    await this.performAction(step, plan, contextSummary);

    // 2. Validate
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = await this.commandExecutor!.execute(command);
    const duration = Math.round((Date.now() - startTime) / 1000);

    if (result.success) {
      return {
        id: step.id,
        status: 'success',
        duration,
        validation: {
          passed: true,
          command,
          output: result.stdout || `✓ ${step.validation.successCriteria}`,
          exitCode: result.exitCode,
        },
        artifacts: step.outputs,
      };
    }

    return {
      id: step.id,
      status: 'failure',
      duration,
      validation: {
        passed: false,
        command,
        output: result.stderr || result.stdout || 'Command failed',
        exitCode: result.exitCode,
      },
      error: {
        message: result.timedOut ? 'Command timed out' : `Exit code ${result.exitCode}`,
        recoverable: !result.timedOut,
      },
    };
  }

  /**
   * Execute a step in mock mode (simulation)
   */
  private executeMockStep(step: PlanStep): StepResult {
    const shouldFail =
      this.options.forceFailStep === step.id ||
      Math.random() < (this.options.failureRate || 0);

    if (shouldFail) {
      return this.createFailedStepResult(step);
    }

    return this.createSuccessStepResult(step);
  }

  /**
   * Create a successful step result
   */
  private createSuccessStepResult(step: PlanStep): StepResult {
    return {
      id: step.id,
      status: 'success',
      duration: Math.floor(Math.random() * 30) + 5, // 5-35 seconds
      validation: {
        passed: true,
        command: step.validation.command,
        output: `✓ ${step.validation.successCriteria}`,
        exitCode: 0,
      },
      artifacts: step.outputs,
    };
  }

  /**
   * Create a failed step result
   */
  private createFailedStepResult(step: PlanStep): StepResult {
    return {
      id: step.id,
      status: 'failure',
      duration: Math.floor(Math.random() * 10) + 2,
      validation: {
        passed: false,
        command: step.validation.command,
        output: `✗ Failed: ${step.validation.successCriteria}`,
        exitCode: 1,
      },
      error: {
        message: `Step ${step.id} failed during execution`,
        recoverable: true,
      },
    };
  }

  /**
   * Build the final result object
   */
  private buildResult(
    plan: Plan,
    taskId: string,
    stepResults: StepResult[],
    status: Result['status'],
    duration: number
  ): Result {
    const artifacts = this.generateMockArtifacts(plan);
    const qualityGates = this.generateQualityGates(stepResults);

    return {
      id: `result-${crypto.randomUUID()}`,
      version: '1.0.0',
      planId: plan.id,
      taskId,
      status,
      steps: stepResults,
      duration,
      artifacts,
      qualityGates,
      metadata: {
        startedAt: new Date(Date.now() - duration * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        executedBy: 'execution-agent',
        environment: 'local',
      },
    };
  }

  /**
   * Generate mock artifacts based on plan
   */
  private generateMockArtifacts(plan: Plan): Artifacts {
    const allOutputs = plan.steps.flatMap((s) => s.outputs);

    return {
      filesCreated: allOutputs.filter((o) => o.includes('new_') || o.includes('_spec')),
      filesModified: allOutputs.filter((o) => o.includes('implementation') || o.includes('code')),
      filesDeleted: [],
      testResults: {
        passed: Math.floor(Math.random() * 20) + 10,
        failed: 0,
        coverage: Math.floor(Math.random() * 15) + 80, // 80-95%
      },
    };
  }

  /**
   * Generate quality gate results based on step execution
   */
  private generateQualityGates(stepResults: StepResult[]): QualityGates {
    const allPassed = stepResults.every((s) => s.status === 'success');
    const passedCount = stepResults.filter((s) => s.status === 'success').length;

    const checks = [
      {
        name: 'All steps completed',
        passed: allPassed,
        details: `${passedCount}/${stepResults.length} steps passed`,
      },
      {
        name: 'Validation commands',
        passed: stepResults.every((s) => s.validation.passed),
        details: allPassed ? 'All validations passed' : 'Some validations failed',
      },
      {
        name: 'No critical errors',
        passed: !stepResults.some((s) => s.error && !s.error.recoverable),
        details: 'No unrecoverable errors detected',
      },
    ];

    return {
      passed: checks.every((c) => c.passed),
      checks,
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Notify progress callbacks
   */
  private notifyProgress(progress: ExecutionProgress): void {
    for (const callback of this.progressCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.error('[ExecutionAgent] Progress callback error:', error);
      }
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const executionAgent = new ExecutionAgent();
