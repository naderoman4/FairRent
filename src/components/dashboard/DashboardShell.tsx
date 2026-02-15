'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import type { UserRole } from '@/lib/supabase/types';

interface DashboardShellProps {
  role: UserRole;
  credits: number;
  teamPlan?: string | null;
  children: React.ReactNode;
}

export function DashboardShell({ role, credits, teamPlan, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        credits={credits}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <Sidebar role={role} teamPlan={teamPlan} />

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-16 bottom-0 z-50 md:hidden">
              <Sidebar role={role} teamPlan={teamPlan} />
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
