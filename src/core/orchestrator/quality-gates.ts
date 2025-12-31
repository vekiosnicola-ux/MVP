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
}

export const qualityGateExecutor = new BasicQualityGateExecutor();
