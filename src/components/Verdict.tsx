import type { Verdict as VerdictType, ComplianceIssue } from '@/lib/types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface VerdictProps {
  verdict: VerdictType;
  overchargeTotal: number | null;
  issues?: ComplianceIssue[];
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
    label: 'Bail conforme',
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
    label: 'Problèmes détectés',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-800',
    iconClass: 'text-red-600',
  },
};

export function Verdict({ verdict, overchargeTotal, issues }: VerdictProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  const illegalCount = issues?.filter(i => i.severity === 'illegal').length ?? 0;
  const redFlagCount = issues?.filter(i => i.severity === 'red_flag').length ?? 0;
  const attentionCount = issues?.filter(i => i.severity === 'attention').length ?? 0;

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
      {issues && issues.length > 0 && (
        <div className="flex justify-center gap-4 mt-3 text-sm">
          {illegalCount > 0 && (
            <span className="text-red-600 font-medium">{illegalCount} illégal{illegalCount > 1 ? 's' : ''}</span>
          )}
          {redFlagCount > 0 && (
            <span className="text-orange-600 font-medium">{redFlagCount} signalement{redFlagCount > 1 ? 's' : ''}</span>
          )}
          {attentionCount > 0 && (
            <span className="text-amber-600 font-medium">{attentionCount} attention{attentionCount > 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  );
}
