'use client';

import { CheckCircle, Clock, ListTodo, TrendingUp } from 'lucide-react';
import * as React from 'react';

import { StatCard } from '@/components/stats/stat-card';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockTasks, getTasksAwaitingApproval, getTasksInProgress, getCompletedTasks } from '@/lib/mock-data';

export default function DashboardPage(): React.ReactElement {
  const awaitingApproval = getTasksAwaitingApproval();
  const inProgress = getTasksInProgress();
  const completed = getCompletedTasks();
  const recentTasks = mockTasks.slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">Mission Control</h1>
        <p className="text-text-secondary">
          Aura AI development workflow dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Awaiting Approval"
          value={awaitingApproval.length}
          icon={CheckCircle}
          variant="warning"
          description="Tasks need your decision"
        />
        <StatCard
          title="In Progress"
          value={inProgress.length}
          icon={TrendingUp}
          variant="info"
          description="Currently executing"
        />
        <StatCard
          title="Completed Today"
          value={completed.length}
          icon={ListTodo}
          variant="success"
          description="Tasks finished"
        />
        <StatCard
          title="Total Tasks"
          value={mockTasks.length}
          icon={Clock}
          variant="default"
          description="All time"
        />
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList tasks={recentTasks} />
        </CardContent>
      </Card>
    </div>
  );
}
