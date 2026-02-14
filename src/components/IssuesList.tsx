import type { ComplianceIssue } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle, Info } from 'lucide-react';

interface IssuesListProps {
  issues: ComplianceIssue[];
}

const severityConfig = {
  error: {
    icon: XCircle,
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50',
    borderClass: 'border-l-amber-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
    borderClass: 'border-l-blue-500',
  },
};

export function IssuesList({ issues }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Aucun problème détecté. Votre loyer semble conforme.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Points relevés ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue) => {
          const config = severityConfig[issue.severity];
          const Icon = config.icon;
          return (
            <div
              key={issue.id}
              className={`rounded-lg border-l-4 ${config.borderClass} ${config.bgClass} p-4`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconClass}`} />
                <div>
                  <h4 className="font-semibold text-sm">{issue.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Réf. : {issue.legalReference}
                    {issue.legalUrl && (
                      <>
                        {' — '}
                        <a href={issue.legalUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          Voir le texte
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
