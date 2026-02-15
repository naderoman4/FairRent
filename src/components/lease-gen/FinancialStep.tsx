'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FinancialData } from '@/lib/types-lease-gen';
import { AlertTriangle } from 'lucide-react';

interface Props {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
  onNext: () => void;
  onBack: () => void;
  suggestedMaxRent: number | null;
  furnished: boolean;
}

const paymentMethods = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'prelevement', label: 'Prélèvement automatique' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'especes', label: 'Espèces' },
] as const;

export function FinancialStep({ data, onChange, onNext, onBack, suggestedMaxRent, furnished }: Props) {
  const update = (fields: Partial<FinancialData>) => onChange({ ...data, ...fields });

  const maxDeposit = furnished ? data.rentExcludingCharges * 2 : data.rentExcludingCharges;
  const isDepositExcessive = data.depositAmount > maxDeposit;
  const isRentOverMax = suggestedMaxRent && data.rentExcludingCharges > suggestedMaxRent;

  const isValid = data.rentExcludingCharges > 0 && data.depositAmount > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Informations financières</h2>
        <p className="text-sm text-muted-foreground">Loyer, charges et dépôt de garantie.</p>
      </div>

      {suggestedMaxRent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Loyer majoré de référence : <strong>{suggestedMaxRent.toFixed(2)} EUR/mois</strong> (hors charges)
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="rent">Loyer hors charges (EUR/mois)</Label>
          <Input
            id="rent"
            type="number"
            min={0}
            step={0.01}
            value={data.rentExcludingCharges || ''}
            onChange={(e) => update({ rentExcludingCharges: parseFloat(e.target.value) || 0 })}
          />
          {isRentOverMax && (
            <div className="flex items-center gap-1.5 mt-1.5 text-amber-700 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Le loyer dépasse le plafond de référence majoré ({suggestedMaxRent.toFixed(2)} EUR)
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="charges">Charges (EUR/mois)</Label>
          <Input
            id="charges"
            type="number"
            min={0}
            step={0.01}
            value={data.charges || ''}
            onChange={(e) => update({ charges: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label htmlFor="deposit">Dépôt de garantie (EUR)</Label>
          <Input
            id="deposit"
            type="number"
            min={0}
            step={0.01}
            value={data.depositAmount || ''}
            onChange={(e) => update({ depositAmount: parseFloat(e.target.value) || 0 })}
          />
          {isDepositExcessive && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Maximum légal : {maxDeposit.toFixed(2)} EUR ({furnished ? '2 mois' : '1 mois'} de loyer)
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="complementLoyer">Complément de loyer (optionnel, EUR/mois)</Label>
          <Input
            id="complementLoyer"
            type="number"
            min={0}
            step={0.01}
            value={data.complementLoyer ?? ''}
            onChange={(e) =>
              update({
                complementLoyer: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
          />
        </div>

        {data.complementLoyer && data.complementLoyer > 0 && (
          <div>
            <Label htmlFor="complementJustification">Justification du complément de loyer</Label>
            <textarea
              id="complementJustification"
              value={data.complementLoyerJustification || ''}
              onChange={(e) => update({ complementLoyerJustification: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
              placeholder="Vue exceptionnelle, terrasse, prestations de luxe..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentDay">Jour de paiement</Label>
            <Input
              id="paymentDay"
              type="number"
              min={1}
              max={28}
              value={data.paymentDay || ''}
              onChange={(e) => update({ paymentDay: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Mode de paiement</Label>
            <select
              id="paymentMethod"
              value={data.paymentMethod}
              onChange={(e) => update({ paymentMethod: e.target.value as FinancialData['paymentMethod'] })}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
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
