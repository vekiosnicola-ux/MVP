'use client';

import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import * as React from 'react';

import type { HistoryEvent } from '@/lib/mock-data';

import { EventCard } from './event-card';



interface HistoryTimelineProps {
  events: HistoryEvent[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function HistoryTimeline({ events }: HistoryTimelineProps): React.ReactElement {
  const groupedEvents = React.useMemo(() => {
    const groups: Record<string, HistoryEvent[]> = {};

    events.forEach((event) => {
      const date = new Date(event.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey]?.push(event);
    });

    return groups;
  }, [events]);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No history events found</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {sortedDates.map((dateKey) => {
        const date = new Date(dateKey);
        const dayEvents = groupedEvents[dateKey] ?? [];
        const isToday = isSameDay(date, new Date());

        return (
          <div key={dateKey}>
            {/* Date Divider */}
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {isToday ? 'Today' : format(date, 'EEEE, MMM d')}
              </h3>
              <div className="flex-1 h-px bg-border-primary" />
            </div>

            {/* Events for this date */}
            <div className="space-y-3 ml-6">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
