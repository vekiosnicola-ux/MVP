/**
 * Execution Agent (Mock)
 *
 * Simulates plan execution for workflow testing.
 * Will be replaced with real execution in a future phase.
 */

import type { Plan, PlanStep } from '@/interfaces/plan';
import type { Result, StepResult, Artifacts, QualityGates } from '@/interfaces/result';

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

export interface ExecutionOptions {
  /** Simulate delay per step (ms) */
  stepDelay?: number;
  /** Probability of step failure (0-1) */
  failureRate?: number;
  /** Force specific step to fail */
  forceFailStep?: string;
  /** Circuit breaker configuration */
  circuitBreaker?: Partial<CircuitBreakerConfig>;
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

  constructor(options: ExecutionOptions = {}) {
    this.options = {
      stepDelay: options.stepDelay ?? 500,
      failureRate: options.failureRate ?? 0,
      forceFailStep: options.forceFailStep,
    };
    this.circuitBreaker = {
      ...DEFAULT_CIRCUIT_BREAKER,
      ...options.circuitBreaker,
    };
  }

  /**
   * Execute a plan and return results
   * Includes circuit breaker: stops after maxConsecutiveFailures
   */
  async execute(plan: Plan, taskId: string): Promise<Result> {
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let overallStatus: Result['status'] = 'success';
    let consecutiveFailures = 0;
    let circuitBroken = false;

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      if (!step) continue;

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

      // Simulate execution delay
      await this.delay(this.options.stepDelay || 500);

      // Execute step with retry logic
      const stepResult = await this.executeStepWithRetry(step);
      stepResults.push(stepResult);

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

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const result = this.buildResult(plan, taskId, stepResults, overallStatus, duration);

    // Add circuit breaker metadata if triggered
    if (circuitBroken) {
      result.metadata = {
        ...result.metadata,
        circuitBroken: true,
        skippedSteps: plan.steps.length - stepResults.length,
      };
    }

    return result;
  }

  /**
   * Execute a step with retry logic and timeout
   */
  private async executeStepWithRetry(step: PlanStep): Promise<StepResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.circuitBreaker.maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(
          () => this.executeStep(step),
          this.circuitBreaker.stepTimeout
        );

        if (result.status === 'success') {
          return result;
        }

        // Step failed but didn't throw - check if we should retry
        if (attempt < this.circuitBreaker.maxRetries) {
          console.log(`[ExecutionAgent] Step ${step.id} failed, retrying (${attempt + 1}/${this.circuitBreaker.maxRetries})`);
          await this.delay(1000); // Wait 1s before retry
          continue;
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[ExecutionAgent] Step ${step.id} threw error:`, lastError.message);

        if (attempt < this.circuitBreaker.maxRetries) {
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
   * Execute a single step (mock)
   */
  private async executeStep(step: PlanStep): Promise<StepResult> {
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
