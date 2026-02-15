'use client';

import Link from 'next/link';
import { Scale, Menu } from 'lucide-react';
import { CreditBadge } from './CreditBadge';
import { UserMenu } from './UserMenu';

interface DashboardHeaderProps {
  credits: number;
  onMenuToggle?: () => void;
}

export function DashboardHeader({ credits, onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center px-4 gap-4">
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <Link href="/" className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <span className="font-bold text-lg text-gray-900">FairRent</span>
      </Link>
      <div className="flex-1" />
      <CreditBadge balance={credits} />
      <UserMenu />
    </header>
  );
}
