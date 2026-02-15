'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Settings, LogOut } from 'lucide-react';

const roleLabels: Record<string, string> = {
  tenant: 'Locataire',
  landlord: 'Propriétaire',
  agency: 'Agence',
};

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
          {profile?.email?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <span className="hidden lg:block text-gray-700 max-w-[150px] truncate">
          {profile?.email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.email}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[profile?.role ?? 'tenant']}
            </p>
          </div>
          <Link
            href="/parametres"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
