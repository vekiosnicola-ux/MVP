import { CheckCircle, XCircle, FileText, TestTube, Shield } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Result status badge component
 */
export function ResultStatusBadge({ status }: { status: string }): React.ReactElement {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    success: 'success',
    partial_success: 'warning',
    failure: 'danger',
    cancelled: 'default',
  };
  return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
}

/**
 * Quality gates section - displays pass/fail status of each quality check
 */
export function QualityGatesSection({
  qualityGates,
}: {
  qualityGates: { passed: boolean; checks: Array<{ name: string; passed: boolean; details?: string }> };
}): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Quality Gates
          {qualityGates.passed ? (
            <Badge variant="success">All Passed</Badge>
          ) : (
            <Badge variant="danger">Failed</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {qualityGates.checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-md ${
              check.passed ? 'bg-accent-success/10' : 'bg-accent-danger/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle className="h-4 w-4 text-accent-success" />
              ) : (
                <XCircle className="h-4 w-4 text-accent-danger" />
              )}
              <span className="font-medium">{check.name}</span>
            </div>
            {check.details && (
              <span className="text-sm text-text-secondary">{check.details}</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Artifacts output type
 */
export interface ArtifactsOutput {
  filesCreated?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
  testResults?: { passed: number; failed: number; coverage?: number };
}

/**
 * Artifacts section - displays file changes and test results
 */
export function ArtifactsSection({
  outputs,
}: {
  outputs: ArtifactsOutput;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outputs.filesCreated && outputs.filesCreated.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-accent-success mb-2">Created</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                {outputs.filesCreated.map((file, i) => (
                  <li key={i} className="font-mono">+ {file}</li>
                ))}
              </ul>
            </div>
          )}
          {outputs.filesModified && outputs.filesModified.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-accent-warning mb-2">Modified</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                {outputs.filesModified.map((file, i) => (
                  <li key={i} className="font-mono">~ {file}</li>
                ))}
              </ul>
            </div>
          )}
          {outputs.filesDeleted && outputs.filesDeleted.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-accent-danger mb-2">Deleted</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                {outputs.filesDeleted.map((file, i) => (
                  <li key={i} className="font-mono">- {file}</li>
                ))}
              </ul>
            </div>
          )}
          {(!outputs.filesCreated?.length && !outputs.filesModified?.length && !outputs.filesDeleted?.length) && (
            <p className="text-text-tertiary">No file changes recorded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outputs.testResults ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Passed</span>
                <span className="font-bold text-accent-success">{outputs.testResults.passed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Failed</span>
                <span className="font-bold text-accent-danger">{outputs.testResults.failed}</span>
              </div>
              {outputs.testResults.coverage !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Coverage</span>
                  <span className="font-bold">{outputs.testResults.coverage}%</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-text-tertiary">No test results available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
