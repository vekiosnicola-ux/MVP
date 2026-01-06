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
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const triggerRefresh = React.useCallback(() => {
    setLoading(true);
    tasksApi.list().then(setTasks).finally(() => setLoading(false));
  }, []);

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
          className="relative overflow-hidden bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-medium shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-secondary/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] px-3 sm:px-4 md:px-5 py-2 group animate-pulse-subtle"
        >
          <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 animate-sparkle" />
            <span className="text-xs sm:text-sm whitespace-nowrap hidden sm:inline">Talk to Aura</span>
            <span className="text-xs sm:text-sm whitespace-nowrap sm:hidden">Chat</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
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
