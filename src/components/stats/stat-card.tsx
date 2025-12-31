'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success' | 'info';
  description?: string;
}

const cardVariants = {
  rest: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
  },
  hover: {
    scale: 1.02,
    rotateX: 2,
    rotateY: 2,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

export function StatCard({ title, value, icon: Icon, variant = 'default', description }: StatCardProps): React.ReactElement {
  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      className="perspective-1000"
    >
      <Card className={cn(
        'p-6 border-2 transition-all',
        {
          'border-border-primary hover:border-text-tertiary': variant === 'default',
          'border-accent-warning/30 hover:border-accent-warning hover:shadow-glow': variant === 'warning',
          'border-accent-success/30 hover:border-accent-success': variant === 'success',
          'border-accent-info/30 hover:border-accent-info': variant === 'info',
        }
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
            {description && (
              <p className="text-xs text-text-tertiary mt-1">{description}</p>
            )}
          </div>
          <div className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            {
              'bg-bg-tertiary text-text-secondary': variant === 'default',
              'bg-accent-warning/10 text-accent-warning': variant === 'warning',
              'bg-accent-success/10 text-accent-success': variant === 'success',
              'bg-accent-info/10 text-accent-info': variant === 'info',
            }
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
