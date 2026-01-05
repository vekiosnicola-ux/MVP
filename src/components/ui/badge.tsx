import * as React from 'react';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'destructive';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors',
          {
            'bg-bg-tertiary text-text-secondary': variant === 'default',
            'bg-accent-success/10 text-accent-success': variant === 'success',
            'bg-accent-warning/10 text-accent-warning': variant === 'warning',
            'bg-accent-danger/10 text-accent-danger': variant === 'danger' || variant === 'destructive',
            'bg-accent-info/10 text-accent-info': variant === 'info',
            'bg-bg-secondary text-text-secondary border border-border-primary': variant === 'secondary',
            'border border-border-primary text-text-secondary': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
