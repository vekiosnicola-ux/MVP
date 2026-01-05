'use client';

import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResultStatusBadge,
  QualityGatesSection,
  ArtifactsSection,
  type ArtifactsOutput,
} from '@/components/verification/result-details';
import { VerificationActions } from '@/components/verification/verification-actions';
import type { ResultRow } from '@/interfaces/result';
import type { TaskRow } from '@/interfaces/task';
import { resultsApi, tasksApi, workflowApi } from '@/lib/api';

/**
 * Verification page - review execution results and approve/reject
 */
export default function VerificationPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTaskId = searchParams.get('taskId');

  const [awaitingTasks, setAwaitingTasks] = React.useState<TaskRow[]>([]);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(preselectedTaskId);
  const [result, setResult] = React.useState<ResultRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Load tasks awaiting verification
  React.useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const allTasks = await tasksApi.list();
        const awaiting = allTasks.filter(
          (task) => task.status === 'awaiting_verification'
        );
        setAwaitingTasks(awaiting);

        // Auto-select first task or preselected
        if (awaiting.length > 0) {
          const taskToSelect = preselectedTaskId
            ? awaiting.find((t) => t.task_id === preselectedTaskId)?.task_id
            : awaiting[0]?.task_id;
          if (taskToSelect) {
            setSelectedTaskId(taskToSelect);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [preselectedTaskId]);

  // Load result for selected task
  React.useEffect(() => {
    async function loadResult() {
      if (!selectedTaskId) {
        setResult(null);
        return;
      }

      try {
        const results = await resultsApi.list({ taskId: selectedTaskId });
        // Get most recent result
        setResult(results[0] || null);
      } catch (err) {
        console.error('Error loading result:', err);
        setResult(null);
      }
    }

    loadResult();
  }, [selectedTaskId]);

  const selectedTask = awaitingTasks.find((task) => task.task_id === selectedTaskId);

  const handleApprove = async (feedback: string): Promise<void> => {
    if (!selectedTaskId) return;

    try {
      setSubmitting(true);
      await workflowApi.verifyTask(selectedTaskId, true, feedback);
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (feedback: string): Promise<void> => {
    if (!selectedTaskId) return;

    try {
      setSubmitting(true);
      await workflowApi.verifyTask(selectedTaskId, false, feedback);
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading verification queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-accent-danger">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-accent-danger">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading tasks</h3>
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (awaitingTasks.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Verification Queue</h1>
          <p className="text-text-secondary">No tasks awaiting verification</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-accent-primary hover:text-accent-info"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">Verification Queue</h1>
            <p className="text-text-secondary">
              Review execution results and approve or reject
            </p>
          </div>
          <Badge variant="info" className="text-lg px-4 py-2">
            {awaitingTasks.length} awaiting review
          </Badge>
        </div>
      </div>

      {/* Task selector */}
      {awaitingTasks.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {awaitingTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.task_id)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                selectedTaskId === task.task_id
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {task.description.slice(0, 40)}...
            </button>
          ))}
        </div>
      )}

      {/* Task details */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedTask.description}</CardTitle>
              {result && <ResultStatusBadge status={result.status} />}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Badge>{selectedTask.type}</Badge>
              {result && (
                <div className="flex items-center gap-1 text-sm text-text-secondary">
                  <Clock className="h-4 w-4" />
                  {result.duration}s
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-text-primary">Repository:</span>{' '}
                <span className="text-text-secondary font-mono">{selectedTask.context.repository}</span>
              </div>
              <div>
                <span className="font-medium text-text-primary">Branch:</span>{' '}
                <span className="text-text-secondary font-mono">{selectedTask.context.branch}</span>
              </div>
              {result?.summary && (
                <div>
                  <span className="font-medium text-text-primary">Summary:</span>{' '}
                  <span className="text-text-secondary">{result.summary}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result details */}
      {result && (
        <>
          <QualityGatesSection qualityGates={result.quality_gates} />
          <ArtifactsSection outputs={result.outputs as ArtifactsOutput} />
        </>
      )}

      {/* Verification actions */}
      {selectedTask && (
        <VerificationActions
          qualityGatesPassed={result?.quality_gates?.passed}
          onApprove={handleApprove}
          onReject={handleReject}
          submitting={submitting}
        />
      )}
    </div>
  );
}
