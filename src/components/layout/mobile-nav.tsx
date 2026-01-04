'use client';

import { LayoutDashboard, CheckCircle, Plus, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Approval',
    href: '/approval',
    icon: CheckCircle,
  },
  {
    title: 'Create',
    href: '/tasks/new',
    icon: Plus,
  },
  {
    title: 'History',
    href: '/history',
    icon: Clock,
  },
];

export function MobileNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-secondary/80">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                isActive
                  ? 'text-accent-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
