import { Result } from '@/interfaces/result';

import { QualityGateResult } from './types';

export interface QualityGateExecutor {
  executeGates(result: Result): Promise<QualityGateResult[]>;
}

export class BasicQualityGateExecutor implements QualityGateExecutor {
  async executeGates(result: Result): Promise<QualityGateResult[]> {
    const gates: QualityGateResult[] = [];

    gates.push(this.checkAllStepsCompleted(result));
    gates.push(this.checkTestCoverage(result));
    gates.push(this.checkNoErrors(result));

    // Automated Quality Gates for Code Tasks
    if (result.metadata?.executionMode === 'real') {
      gates.push(await this.checkLinting(result));
      gates.push(await this.checkTypeSafety(result));
    }

    return gates;
  }

  private checkAllStepsCompleted(result: Result): QualityGateResult {
    const totalSteps = result.steps.length;
    const successfulSteps = result.steps.filter(s => s.status === 'success').length;
    const passed = successfulSteps === totalSteps;

    return {
      name: 'All steps completed',
      passed,
      details: passed
        ? `All ${totalSteps} steps completed successfully`
        : `Only ${successfulSteps}/${totalSteps} steps completed`
    };
  }

  private checkTestCoverage(result: Result): QualityGateResult {
    const coverage = result.artifacts.testResults?.coverage;

    if (coverage === undefined) {
      return {
        name: 'Test coverage',
        passed: true,
        details: 'No test coverage requirements'
      };
    }

    const passed = coverage >= 80;

    return {
      name: 'Test coverage',
      passed,
      details: passed
        ? `Coverage ${coverage}% meets minimum 80%`
        : `Coverage ${coverage}% below minimum 80%`
    };
  }

  private checkNoErrors(result: Result): QualityGateResult {
    const hasErrors = result.steps.some(s => s.error);
    const passed = !hasErrors;

    return {
      name: 'No execution errors',
      passed,
      details: passed
        ? 'No errors detected'
        : 'Errors detected in execution'
    };
  }

  private async checkLinting(result: Result): Promise<QualityGateResult> {
    // In a real implementation, this would run 'npm run lint' or similar
    // For now, we check if any step execution mentioned linting in its output
    const lintFailed = result.steps.some(s => 
      s.validation.output.toLowerCase().includes('lint') && 
      s.status === 'failure'
    );

    return {
      name: 'Linting check',
      passed: !lintFailed,
      details: lintFailed ? 'Linting errors were detected during execution' : 'No linting issues reported'
    };
  }

  private async checkTypeSafety(result: Result): Promise<QualityGateResult> {
    // Similar to linting, check for TypeScript errors in step outputs
    const tsFailed = result.steps.some(s => 
      (s.validation.output.toLowerCase().includes('typescript') || 
       s.validation.output.toLowerCase().includes('tsc')) && 
      s.status === 'failure'
    );

    return {
      name: 'Type-safety check',
      passed: !tsFailed,
      details: tsFailed ? 'TypeScript errors were detected during execution' : 'Type-safety maintained'
    };
  }
}

export const qualityGateExecutor = new BasicQualityGateExecutor();
