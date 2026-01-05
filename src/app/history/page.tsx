'use client';

import { ArrowLeft, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { HistoryTimeline } from '@/components/history/history-timeline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { HistoryEvent } from '@/interfaces/history';

export default function HistoryPage(): React.ReactElement {
  const [events, setEvents] = React.useState<HistoryEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeFilter, setTimeFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  React.useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/history');

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredEvents = React.useMemo(() => {
    let filtered = events;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    return filtered;
  }, [events, typeFilter]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
          <p className="text-text-secondary">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-accent-danger">
          <CardContent className="pt-6">
            <p className="text-accent-danger">Error loading history: {error}</p>
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

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

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
            <SelectItem value="decision_made">Decision Made</SelectItem>
          </SelectContent>
        </Select>

        {(timeFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setTimeFilter('all');
              setTypeFilter('all');
            }}
            className="text-sm text-accent-primary hover:text-accent-info transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 && events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No history events yet. Start creating tasks to see activity here.</p>
        </div>
      ) : (
        <HistoryTimeline events={filteredEvents} />
      )}
    </div>
  );
}
