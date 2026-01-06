/**
 * Test Metrics Tracking
 * 
 * Tracks test execution metrics for analytics and reporting.
 */

export interface TestMetrics {
  timestamp: Date;
  testSuite: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number; // milliseconds
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export class TestMetricsCollector {
  private metrics: TestMetrics[] = [];

  record(metrics: TestMetrics): void {
    this.metrics.push(metrics);
  }

  getMetrics(): TestMetrics[] {
    return [...this.metrics];
  }

  getLatest(): TestMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] ?? null : null;
  }

  getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  getPassRate(): number {
    if (this.metrics.length === 0) return 0;
    const latest = this.getLatest();
    if (!latest) return 0;
    return latest.passedTests / latest.totalTests;
  }

  getTrend(): 'improving' | 'declining' | 'stable' {
    if (this.metrics.length < 2) return 'stable';
    
    const recent = this.metrics.slice(-5);
    const passRates = recent.map(m => m.passedTests / m.totalTests);
    
    const first = passRates[0];
    const last = passRates[passRates.length - 1];
    
    if (first === undefined || last === undefined) return 'stable';
    if (last > first + 0.05) return 'improving';
    if (last < first - 0.05) return 'declining';
    return 'stable';
  }

  exportJSON(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Singleton instance
export const testMetricsCollector = new TestMetricsCollector();

