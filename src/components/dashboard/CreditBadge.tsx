'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';

interface CreditBadgeProps {
  balance: number;
}

export function CreditBadge({ balance }: CreditBadgeProps) {
  return (
    <Link
      href="/pricing"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        balance <= 1
          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      <Coins className="h-3.5 w-3.5" />
      {balance} crédit{balance !== 1 ? 's' : ''}
    </Link>
  );
}
