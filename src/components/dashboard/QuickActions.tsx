import Link from 'next/link';
import { FileSearch, FilePlus, Coins } from 'lucide-react';

const actions = [
  {
    href: '/dashboard/verifier',
    label: 'Vérifier un bail',
    description: '1 crédit par vérification',
    icon: FileSearch,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    href: '/dashboard/generer',
    label: 'Créer un bail',
    description: '2 crédits par génération',
    icon: FilePlus,
    color: 'text-green-600 bg-green-50',
  },
  {
    href: '/pricing',
    label: 'Acheter des crédits',
    description: 'Rechargez votre compte',
    icon: Coins,
    color: 'text-amber-600 bg-amber-50',
  },
];

export function QuickActions() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
