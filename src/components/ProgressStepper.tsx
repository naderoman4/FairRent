import { FileText, Search, CheckCircle, Shield } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: string;
}

const steps = [
  { id: 'extracting', label: 'Lecture du PDF...', icon: FileText },
  { id: 'analyzing', label: 'Analyse du bail et des clauses...', icon: Search },
  { id: 'done', label: 'Terminé', icon: CheckCircle },
];

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-center">Analyse en cours</h2>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;

          return (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-green-100 text-green-600'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-sm ${
                  isDone
                    ? 'text-green-600'
                    : isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
