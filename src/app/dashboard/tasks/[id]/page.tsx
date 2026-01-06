'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rationale, setRationale] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [taskRes, plansRes] = await Promise.all([
          fetch(`/api/tasks/${taskId}`),
          fetch(`/api/plans?taskId=${taskId}`)
        ]);

        const taskData = await taskRes.json();
        const plansResponse = await plansRes.json();

        setTask(taskData.success ? taskData.data : null);
        setPlans(plansResponse.success ? plansResponse.data : []);
      } catch (error) {
        console.error('Failed to fetch task details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [taskId]);

  const handleDecision = async (planId: string, approve: boolean) => {
    if (!approve && !rationale) {
      alert('Please provide a rationale or feedback for rejection.');
      return;
    }

    setProcessing(true);
    try {
      if (approve) {
        const response = await fetch('/api/workflow/approve-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: {
              id: `decision-${crypto.randomUUID()}`,
              taskId: task.task_id,
              planId,
              selectedOption: 0,
              rationale: rationale || 'Plan looks solid.',
              category: task.type === 'feature' ? 'architecture' : 'integration',
              proposals: plans.map(p => ({
                approach: p.approach,
                reasoning: p.reasoning,
                tradeoffs: { pros: [], cons: [], risks: p.risks.map((r: any) => r.description) }
              }))
            },
            decidedBy: 'Virgilio'
          }),
        });

        const data = await response.json();
        if (response.ok) {
          router.push('/dashboard');
        } else {
          alert(data.error || 'Failed to record decision');
        }
      } else {
        // Rejection / Iterative Refinement
        const response = await fetch('/api/workflow/generate-proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: task.task_id,
            feedback: rationale
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Feedback sent. AI is generating new proposals.');
          router.push('/dashboard');
        } else {
          alert(data.error || 'Failed to send feedback');
        }
      }
    } catch {
      alert('An error occurred while processing the decision.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading task details...</div>;
  if (!task) return <div className="p-8 text-center text-destructive">Task not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-mono">{task.task_id}</h1>
            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{task.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-2">{task.description}</p>
        </div>
        <Link href="/dashboard/tasks" className="text-sm font-medium hover:underline text-primary">
          &larr; Back to Tasks
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Proposed Plans</h2>
            {plans.length === 0 ? (
              <p className="text-muted-foreground italic">No plans proposed yet.</p>
            ) : (
              <div className="space-y-6">
                {plans.map((plan: any) => (
                  <Card key={plan.plan_id} className={plan.status === 'approved' ? 'border-primary shadow-md' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.approach}</CardTitle>
                          <CardDescription className="mt-1">{plan.reasoning}</CardDescription>
                        </div>
                        <Badge variant="outline">{plan.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Steps</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {plan.steps.map((step: any, i: number) => (
                            <li key={i} className="text-foreground">
                              {step.description}
                              {step.validation?.command && (
                                <code className="ml-2 px-1 bg-muted rounded text-[10px]">{step.validation.command}</code>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {task.status === 'awaiting_human_decision' && plan.status === 'proposed' && (
                        <div className="pt-4 border-t space-y-4">
                          <Textarea
                            placeholder="Provide rationale for your decision (required for rejection)"
                            value={rationale}
                            onChange={(e) => setRationale(e.target.value)}
                            className="bg-background"
                          />
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleDecision(plan.plan_id, true)}
                              disabled={processing}
                              className="flex-1"
                            >
                              Approve & Execute
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDecision(plan.plan_id, false)}
                              disabled={processing}
                              className="flex-1"
                            >
                              Reject & Refine
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Task Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Type</span>
                <span className="font-medium">{task.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Created</span>
                <span className="font-medium">{new Date(task.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Repository</span>
                <span className="font-mono text-xs">{task.context.repository}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
