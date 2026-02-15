import type { ComplianceIssue, IssueCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface IssuesListProps {
  issues: ComplianceIssue[];
}

const severityConfig = {
  illegal: {
    icon: XCircle,
    label: 'Illégal',
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
  },
  red_flag: {
    icon: AlertTriangle,
    label: 'Signalement',
    iconClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
    borderClass: 'border-l-orange-500',
  },
  attention: {
    icon: AlertCircle,
    label: 'Attention',
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50',
    borderClass: 'border-l-amber-500',
  },
  ok: {
    icon: CheckCircle,
    label: 'Conforme',
    iconClass: 'text-green-500',
    bgClass: 'bg-green-50',
    borderClass: 'border-l-green-500',
  },
};

const categoryLabels: Record<IssueCategory, string> = {
  rent: 'Encadrement du loyer',
  lease_validity: 'Validité du bail',
  financial: 'Aspects financiers',
  clauses: 'Clauses du bail',
  decency: 'Décence du logement',
};

function groupByCategory(issues: ComplianceIssue[]): Record<string, ComplianceIssue[]> {
  const groups: Record<string, ComplianceIssue[]> = {};
  for (const issue of issues) {
    const cat = issue.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(issue);
  }
  return groups;
}

export function IssuesList({ issues }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Aucun problème détecté. Votre bail semble conforme.
          </p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupByCategory(issues);
  const categoryOrder: IssueCategory[] = ['rent', 'lease_validity', 'financial', 'clauses', 'decency'];

  return (
    <div className="space-y-4">
      {categoryOrder.map((cat) => {
        const catIssues = grouped[cat];
        if (!catIssues || catIssues.length === 0) return null;

        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {categoryLabels[cat]} ({catIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catIssues.map((issue) => {
                const config = severityConfig[issue.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={issue.id}
                    className={`rounded-lg border-l-4 ${config.borderClass} ${config.bgClass} p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconClass}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{issue.title}</h4>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.iconClass} ${config.bgClass}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                        {issue.recommendation && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {issue.recommendation}
                          </p>
                        )}
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
      })}
    </div>
  );
}
