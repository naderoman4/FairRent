'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LeaseTerms } from '@/lib/types-lease-gen';

interface Props {
  data: LeaseTerms;
  onChange: (data: LeaseTerms) => void;
  onNext: () => void;
  onBack: () => void;
  furnished: boolean;
}

export function TermsStep({ data, onChange, onNext, onBack, furnished }: Props) {
  const update = (fields: Partial<LeaseTerms>) => onChange({ ...data, ...fields });
  const minDuration = furnished ? 1 : 3;

  const isValid = data.startDate.length > 0 && data.duration >= minDuration;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Conditions du bail</h2>
        <p className="text-sm text-muted-foreground">Durée, date de début et conditions particulières.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="startDate">Date de début du bail</Label>
          <Input
            id="startDate"
            type="date"
            value={data.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="duration">Durée (années)</Label>
          <Input
            id="duration"
            type="number"
            min={minDuration}
            max={12}
            value={data.duration || ''}
            onChange={(e) => update({ duration: parseInt(e.target.value) || minDuration })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Minimum légal : {minDuration} an{minDuration > 1 ? 's' : ''} ({furnished ? 'meublé' : 'non meublé'})
          </p>
        </div>

        <div>
          <Label htmlFor="specialConditions">
            Conditions particulières (optionnel, max 2000 caractères)
          </Label>
          <textarea
            id="specialConditions"
            value={data.specialConditions}
            onChange={(e) => update({ specialConditions: e.target.value.slice(0, 2000) })}
            rows={4}
            maxLength={2000}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
            placeholder="Interdiction de sous-location, animaux autorisés, travaux prévus..."
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {data.specialConditions.length} / 2000
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
