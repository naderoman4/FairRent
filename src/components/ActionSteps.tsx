import type { ActionStep } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface ActionStepsProps {
  actions: ActionStep[];
}

export function ActionSteps({ actions }: ActionStepsProps) {
  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Que faire ?</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {actions.map((action, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                {action.deadline && (
                  <p className="text-xs text-muted-foreground mt-1">Délai : {action.deadline}</p>
                )}
                {action.url && (
                  <a
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-sm mt-1 hover:underline"
                  >
                    En savoir plus <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
