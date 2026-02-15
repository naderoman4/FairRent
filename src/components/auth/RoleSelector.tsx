'use client';

import { Building2, Home } from 'lucide-react';

interface RoleSelectorProps {
  value: 'landlord' | 'agency';
  onChange: (role: 'landlord' | 'agency') => void;
}

const roles = [
  {
    id: 'landlord' as const,
    label: 'Propriétaire',
    description: 'Vérifiez et créez vos baux en toute conformité',
    icon: Home,
  },
  {
    id: 'agency' as const,
    label: 'Agence immobilière',
    description: 'Gérez vos baux à grande échelle avec votre équipe',
    icon: Building2,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.id;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
            <span className="font-medium text-sm text-center">{role.label}</span>
            <span className="text-xs text-muted-foreground text-center">{role.description}</span>
          </button>
        );
      })}
    </div>
  );
}
