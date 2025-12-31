'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'executing':
      return 'info';
    case 'planning':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'executing':
      return 'In Progress';
    case 'planning':
      return 'Awaiting Approval';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.ReactElement {
  const variant = getStatusVariant(status);
  const label = getStatusLabel(status);
  const shouldPulse = status === 'planning' || status === 'executing';

  return (
    <motion.div
      animate={shouldPulse ? { scale: [1, 1.05, 1] } : {}}
      transition={shouldPulse ? { repeat: Infinity, duration: 2 } : {}}
    >
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    </motion.div>
  );
}
