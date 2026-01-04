'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { HistoryTimeline } from '@/components/history/history-timeline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockHistory } from '@/lib/mock-data';

export default function HistoryPage(): React.ReactElement {
  const [timeFilter, setTimeFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  const filteredEvents = React.useMemo(() => {
    let filtered = mockHistory;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    return filtered;
  }, [typeFilter]);

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
      <HistoryTimeline events={filteredEvents} />
    </div>
  );
}
