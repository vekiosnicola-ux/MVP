'use client';

import { CheckCircle, Clock, ListTodo, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import * as React from 'react';

import { StatCard } from '@/components/stats/stat-card';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TaskRow } from '@/interfaces/task';
import { tasksApi } from '@/lib/api';
import { AgentChatDialog } from '@/components/chat/agent-chat-dialog';

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
    () => tasks.filter((task) => task.status === 'awaiting_human_decision'),
    [tasks]
  );
  const planning = React.useMemo(
    () => tasks.filter((task) => task.status === 'planning'),
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

  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const triggerRefresh = React.useCallback(() => {
    setLoading(true);
    // Re-fetch tasks
    tasksApi.list().then(setTasks).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 relative">
      <AgentChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTaskCreated={() => {
          // Refresh tasks when a new one is created via chat
          triggerRefresh();
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Mission Control - Agent Active</h1>
          <p className="text-text-secondary">
            Aura AI development workflow dashboard
          </p>
        </div>
        <Button
          onClick={() => setIsChatOpen(true)}
          size="sm"
          className="bg-accent-primary hover:bg-accent-primary/90 text-white shadow-lg shadow-accent-primary/20 h-10 w-10 p-0 transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Talk to Aura
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Awaiting Approval"
          value={awaitingApproval.length}
          icon={CheckCircle}
          variant="warning"
          description="Tasks need your decision"
        />
        <StatCard
          title="Planning"
          value={planning.length}
          icon={Clock}
          variant="default"
          description="AI is generating plans"
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
