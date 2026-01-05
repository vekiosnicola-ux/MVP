'use client';

import { ArrowLeft, Filter, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { HistoryTimeline } from '@/components/history/history-timeline';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HistoryEvent } from '@/interfaces/history';
import { historyApi } from '@/lib/api';

export default function HistoryPage(): React.ReactElement {
  const [events, setEvents] = React.useState<HistoryEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  React.useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);
        const filters = typeFilter !== 'all' ? { type: typeFilter } : undefined;
        const data = await historyApi.list(filters);
        setEvents(data as HistoryEvent[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [typeFilter]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-accent-danger">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-accent-danger">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error loading history</h3>
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
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">History & Audit Trail</h1>
        <p className="text-text-secondary">
          Complete timeline of all decisions and task events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-bg-secondary rounded-lg border border-border-primary">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Filters:</span>
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="task_created">Task Created</SelectItem>
            <SelectItem value="task_approved">Task Approved</SelectItem>
            <SelectItem value="task_rejected">Task Rejected</SelectItem>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="task_failed">Task Failed</SelectItem>
            <SelectItem value="execution_completed">Execution Completed</SelectItem>
          </SelectContent>
        </Select>

        {typeFilter !== 'all' && (
          <button
            onClick={() => setTypeFilter('all')}
            className="text-sm text-accent-primary hover:text-accent-info transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading history...</p>
        </div>
      ) : (
        <HistoryTimeline events={events} />
      )}
    </div>
  );
}
