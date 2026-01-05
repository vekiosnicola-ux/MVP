'use client';

import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { DecisionPanel } from '@/components/proposals/decision-panel';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { PlanRow } from '@/interfaces/plan';
import type { TaskRow } from '@/interfaces/task';
import { plansApi, tasksApi, workflowApi } from '@/lib/api';
import type { Decision } from '@/core/validators/decision';

/**
 * Convert PlanRow to Decision Proposal format
 */
function planToProposal(plan: PlanRow): Decision['proposals'][0] {
  return {
    approach: plan.approach,
    reasoning: plan.reasoning,
    tradeoffs: {
      pros: [], // PlanRow doesn't have pros - would need to derive from context
      cons: [], // PlanRow doesn't have cons - would need to derive from context
      risks: plan.risks?.map(r => r.description) || [],
    },
  };
}

/**
 * Generate decision ID in correct format
 */
function generateDecisionId(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '');
  return `decision-${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(12, 16)}-${uuid.substring(16, 20)}-${uuid.substring(20, 32)}`;
}

export default function ApprovalQueuePage(): React.ReactElement {
  const router = useRouter();
  const [awaitingTasks, setAwaitingTasks] = React.useState<TaskRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = React.useState<number>(0);

  // Load tasks awaiting approval
  React.useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const allTasks = await tasksApi.list();
        const awaiting = allTasks.filter(
          (task) => task.status === 'planning' || task.status === 'awaiting_human_decision'
        );
        setAwaitingTasks(awaiting);
        if (awaiting.length > 0 && !selectedTaskId) {
          setSelectedTaskId(awaiting[0].task_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [selectedTaskId]);

  // Load plans for selected task
  React.useEffect(() => {
    async function loadPlans() {
      if (!selectedTaskId) {
        setPlans([]);
        return;
      }

      try {
        const taskPlans = await plansApi.list({ taskId: selectedTaskId });
        setPlans(taskPlans);
        setSelectedPlanIndex(0);
      } catch (err) {
        console.error('Error loading plans:', err);
        setPlans([]);
      }
    }

    loadPlans();
  }, [selectedTaskId]);

  const selectedTask = awaitingTasks.find((task) => task.task_id === selectedTaskId);

  const handleApprove = async (selectedOption: number, rationale: string): Promise<void> => {
    if (!selectedTaskId || selectedOption < 0 || selectedOption >= plans.length) {
      alert('Invalid selection. Please select a valid proposal.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedPlan = plans[selectedOption];

      // Convert plans to proposals format
      const proposals = plans.map(planToProposal);

      // Create decision object
      const decision: Decision = {
        id: generateDecisionId(),
        taskId: selectedTaskId,
        planId: selectedPlan.plan_id,
        category: 'architecture', // Default category - could be made configurable
        proposals,
        selectedOption,
        rationale,
      };

      // Submit decision via workflow API
      await workflowApi.approvePlan(decision, 'Virgilio');

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve plan';
      alert(`Error: ${errorMessage}`);
      console.error('Error approving plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading approval queue...</p>
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
              {selectedTask.metadata?.priority && (
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
