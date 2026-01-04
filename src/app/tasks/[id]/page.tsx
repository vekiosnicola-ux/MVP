'use client';

import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Calendar, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QualityGates } from '@/components/workflow/quality-gates';
import { StatusBadge } from '@/components/workflow/status-badge';
import { WorkflowTimeline } from '@/components/workflow/timeline';
import { getTaskById } from '@/lib/mock-data';


interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps): React.ReactElement {
  const task = getTaskById(params.id);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!task) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Task Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              {task.description}
            </h1>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="font-mono">{task.task_id}</span>
              <span>•</span>
              <div className="flex items-center gap-1" suppressHydrationWarning>
                <Calendar className="h-3.5 w-3.5" />
                Created {mounted ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true }) : 'recently'}
              </div>
            </div>
          </div>
          <StatusBadge status={task.status} className="text-lg px-4 py-2" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{task.type}</Badge>
          {task.metadata.priority && (
            <Badge variant={task.metadata.priority === 'high' || task.metadata.priority === 'critical' ? 'danger' : 'default'}>
              {task.metadata.priority} priority
            </Badge>
          )}
          {task.metadata.labels?.map((label) => (
            <Badge key={label} variant="default">
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <WorkflowTimeline currentStatus={task.status} />
        </CardContent>
      </Card>

      {/* Task Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Context */}
        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">Repository & Branch</span>
              </div>
              <p className="text-sm text-text-secondary font-mono ml-6">
                {task.context.repository} / {task.context.branch}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-text-primary">Affected Files</span>
              <ul className="mt-2 space-y-1 ml-6">
                {task.context.files.map((file) => (
                  <li key={file} className="text-sm text-text-secondary font-mono">
                    {file}
                  </li>
                ))}
              </ul>
            </div>

            {task.context.dependencies && task.context.dependencies.length > 0 && (
              <div>
                <span className="text-sm font-medium text-text-primary">Dependencies</span>
                <ul className="mt-2 space-y-1 ml-6">
                  {task.context.dependencies.map((dep) => (
                    <li key={dep} className="text-sm text-text-secondary font-mono">
                      {dep}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Max Duration</span>
              <span className="text-sm font-medium text-text-primary">
                {task.constraints.maxDuration} minutes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Requires Approval</span>
              <Badge variant={task.constraints.requiresApproval ? 'warning' : 'default'}>
                {task.constraints.requiresApproval ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Breaking Changes Allowed</span>
              <Badge variant={task.constraints.breakingChangesAllowed ? 'danger' : 'success'}>
                {task.constraints.breakingChangesAllowed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Test Coverage Minimum</span>
              <span className="text-sm font-medium text-text-primary">
                {task.constraints.testCoverageMin}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Gates */}
      <QualityGates />

      {/* Actions */}
      <div className="flex gap-3">
        {task.status === 'planning' && (
          <Link href="/approval">
            <Button>View Proposals</Button>
          </Link>
        )}
        {task.status === 'completed' && (
          <Button variant="secondary">View Results</Button>
        )}
      </div>
    </div>
  );
}
