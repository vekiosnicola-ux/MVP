'use client';

import { CheckCircle, Clock, ListTodo, TrendingUp, AlertCircle } from 'lucide-react';
import * as React from 'react';

import { StatCard } from '@/components/stats/stat-card';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TaskRow } from '@/interfaces/task';
import { tasksApi } from '@/lib/api';

export default function DashboardPage(): React.ReactElement {
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const allTasks = await tasksApi.list();
        setTasks(allTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const awaitingApproval = React.useMemo(
    () => tasks.filter((task) => task.status === 'planning' || task.status === 'awaiting_human_decision'),
    [tasks]
  );
  const inProgress = React.useMemo(
    () => tasks.filter((task) => task.status === 'executing' || task.status === 'awaiting_verification'),
    [tasks]
  );
  const completed = React.useMemo(
    () => tasks.filter((task) => task.status === 'completed'),
    [tasks]
  );
  const recentTasks = React.useMemo(() => tasks.slice(0, 5), [tasks]);

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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">Loading tasks...</p>
            </div>
          ) : (
            <TaskList tasks={recentTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
