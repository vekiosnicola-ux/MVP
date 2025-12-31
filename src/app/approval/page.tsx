'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { DecisionPanel } from '@/components/proposals/decision-panel';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getTasksAwaitingApproval, getPlansByTaskId } from '@/lib/mock-data';

export default function ApprovalQueuePage(): React.ReactElement {
  const awaitingTasks = getTasksAwaitingApproval();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    awaitingTasks.length > 0 ? awaitingTasks[0]?.task_id ?? null : null
  );
  const [selectedPlanIndex, setSelectedPlanIndex] = React.useState<number>(0);

  const selectedTask = awaitingTasks.find((task) => task.task_id === selectedTaskId);
  const plans = selectedTaskId ? getPlansByTaskId(selectedTaskId) : [];

  const handleApprove = async (selectedOption: number, rationale: string): Promise<void> => {
    console.log('Approving decision:', { selectedTaskId, selectedOption, rationale });
    alert(`Decision approved!\nTask: ${selectedTaskId}\nProposal: ${selectedOption + 1}\nRationale: ${rationale}`);
  };

  const handleCancel = (): void => {
    console.log('Decision cancelled');
  };

  if (awaitingTasks.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Approval Queue</h1>
          <p className="text-text-secondary">No tasks awaiting approval</p>
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
            <h1 className="text-4xl font-bold text-text-primary mb-2">Approval Queue</h1>
            <p className="text-text-secondary">
              Review AI proposals and make decisions
            </p>
          </div>
          <Badge variant="warning" className="text-lg px-4 py-2">
            {awaitingTasks.length} awaiting review
          </Badge>
        </div>
      </div>

      {/* Task selector (if multiple tasks) */}
      {awaitingTasks.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {awaitingTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                setSelectedTaskId(task.task_id);
                setSelectedPlanIndex(0);
              }}
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
            <CardTitle>{selectedTask.description}</CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <Badge>{selectedTask.type}</Badge>
              {selectedTask.metadata.priority && (
                <Badge variant={selectedTask.metadata.priority === 'high' ? 'warning' : 'default'}>
                  {selectedTask.metadata.priority} priority
                </Badge>
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
              <div>
                <span className="font-medium text-text-primary">Max Duration:</span>{' '}
                <span className="text-text-secondary">{selectedTask.constraints.maxDuration} minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals */}
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          AI Proposals ({plans.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <ProposalCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanIndex === index}
              onSelect={() => setSelectedPlanIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Decision Panel */}
      {plans.length > 0 && (
        <DecisionPanel
          taskId={selectedTask?.task_id ?? ''}
          proposalCount={plans.length}
          onApprove={handleApprove}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
