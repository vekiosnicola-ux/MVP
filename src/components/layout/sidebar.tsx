'use client';

import { LayoutDashboard, CheckCircle, ClipboardCheck, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import type { TaskRow } from '@/interfaces/task';
import { tasksApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Approval Queue',
    href: '/approval',
    icon: CheckCircle,
    badge: 1,
  },
  {
    title: 'Verification',
    href: '/verification',
    icon: ClipboardCheck,
    badge: 0,
  },
  {
    title: 'Create Task',
    href: '/tasks/new',
    icon: Plus,
  },
  {
    title: 'History',
    href: '/history',
    icon: Clock,
  },
];

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const [approvalCount, setApprovalCount] = React.useState(0);
  const [verificationCount, setVerificationCount] = React.useState(0);

  // Fetch counts for approval and verification queues
  React.useEffect(() => {
    async function fetchCounts() {
      try {
        const allTasks = await tasksApi.list();
        const awaiting = allTasks.filter(
          (task: TaskRow) => task.status === 'planning' || task.status === 'awaiting_human_decision'
        );
        const verification = allTasks.filter(
          (task: TaskRow) => task.status === 'awaiting_verification'
        );
        setApprovalCount(awaiting.length);
        setVerificationCount(verification.length);
      } catch (err) {
        console.error('Error fetching queue counts:', err);
      }
    }

    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border-primary lg:bg-bg-secondary">
      <div className="flex-1 overflow-y-auto py-6 scrollbar-thin">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const badgeValue =
              item.title === 'Approval Queue'
                ? approvalCount
                : item.title === 'Verification'
                  ? verificationCount
                  : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                {badgeValue !== undefined && badgeValue > 0 && (
                  <Badge variant={isActive ? 'default' : 'warning'} className="ml-auto">
                    {badgeValue}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="border-t border-border-primary p-4">
        <div className="text-xs text-text-tertiary">
          <p>Aura MVP v0.1.0</p>
          <p className="mt-1">Phase 2B: Dashboard UI</p>
        </div>
      </div>
    </aside>
  );
}
