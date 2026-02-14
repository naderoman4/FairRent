import type { Verdict as VerdictType } from '@/lib/types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface VerdictProps {
  verdict: VerdictType;
  overchargeTotal: number | null;
}

const verdictConfig: Record<VerdictType, {
  icon: typeof CheckCircle;
  label: string;
  bgClass: string;
  textClass: string;
  iconClass: string;
}> = {
  compliant: {
    icon: CheckCircle,
    label: 'Conforme',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-800',
    iconClass: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Points d\'attention',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-800',
    iconClass: 'text-amber-600',
  },
  violation: {
    icon: XCircle,
    label: 'Dépassement du loyer',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-800',
    iconClass: 'text-red-600',
  },
};

export function Verdict({ verdict, overchargeTotal }: VerdictProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border-2 p-6 ${config.bgClass}`}>
      <div className="flex items-center justify-center gap-3">
        <Icon className={`h-8 w-8 ${config.iconClass}`} />
        <h2 className={`text-2xl font-bold ${config.textClass}`}>{config.label}</h2>
      </div>
      {overchargeTotal && overchargeTotal > 0 && (
        <p className={`text-center mt-2 text-lg ${config.textClass}`}>
          Trop-perçu estimé : <strong>{overchargeTotal.toFixed(2)} €/mois</strong>
        </p>
      )}
    </div>
  );
}
