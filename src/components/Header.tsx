'use client';

import Link from 'next/link';
import { Scale, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-gray-900">FairRent</span>
          </Link>
          <span className="ml-3 text-xs text-muted-foreground hidden sm:inline">
            Encadrement des loyers à Paris
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/guides/encadrement-loyers-paris"
            className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:inline"
          >
            Guides
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:inline"
          >
            Tarifs
          </Link>
          {!loading && (
            user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Se connecter</span>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
