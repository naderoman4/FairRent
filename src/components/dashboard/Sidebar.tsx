'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSearch, FilePlus, History, Settings, Users } from 'lucide-react';
import type { UserRole } from '@/lib/supabase/types';

interface SidebarProps {
  role: UserRole;
  teamPlan?: string | null;
}

const baseItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/verifier', label: 'Vérifier un bail', icon: FileSearch },
  { href: '/dashboard/generer', label: 'Créer un bail', icon: FilePlus },
  { href: '/dashboard/historique', label: 'Historique', icon: History },
];

const teamItem = { href: '/dashboard/equipe', label: 'Équipe', icon: Users };
const settingsItem = { href: '/parametres', label: 'Paramètres', icon: Settings };

export function Sidebar({ role, teamPlan }: SidebarProps) {
  const pathname = usePathname();

  const items = [...baseItems];
  if (role === 'agency' && teamPlan && teamPlan !== 'starter') {
    items.push(teamItem);
  }
  items.push(settingsItem);

  return (
    <aside className="w-64 border-r bg-white hidden md:block shrink-0">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
