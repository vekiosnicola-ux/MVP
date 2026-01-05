'use client';

import { CheckCircle, Clock, ListTodo, TrendingUp, Loader2 } from 'lucide-react';
import * as React from 'react';

import { StatCard } from '@/components/stats/stat-card';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TaskRow } from '@/interfaces/task';

export default function DashboardPage(): React.ReactElement {
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/tasks');

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const awaitingApproval = tasks.filter((task) => task.status === 'planning');
  const inProgress = tasks.filter((task) => task.status === 'executing');
  const completed = tasks.filter((task) => task.status === 'completed');
  const recentTasks = tasks.slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-accent-danger">
          <CardContent className="pt-6">
            <p className="text-accent-danger">Error loading dashboard: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          value={tasks.length}
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
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No tasks yet. Create your first task to get started.</p>
            </div>
          ) : (
            <TaskList tasks={recentTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
