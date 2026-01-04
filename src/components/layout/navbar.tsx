'use client';

import { Bell, User } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

export function Navbar(): React.ReactElement {
  const notificationCount = 3;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-primary bg-bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-secondary/80">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-text-primary">AURA MVP</span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-bg-hover transition-colors">
            <Bell className="h-5 w-5 text-text-secondary" />
            {notificationCount > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              >
                {notificationCount}
              </Badge>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border-primary">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">Virgilio</p>
              <p className="text-xs text-text-secondary">Founder</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
