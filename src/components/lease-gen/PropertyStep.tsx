'use client';

import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PropertyData } from '@/lib/types-lease-gen';
import type { ConstructionPeriod, DPEClass } from '@/lib/types';

interface Props {
  data: PropertyData;
  onChange: (data: PropertyData) => void;
  onNext: () => void;
}

const constructionPeriods: ConstructionPeriod[] = [
  'Avant 1946',
  '1946-1970',
  '1971-1990',
  'Apres 1990',
];

const dpeClasses: DPEClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export function PropertyStep({ data, onChange, onNext }: Props) {
  const update = (fields: Partial<PropertyData>) => onChange({ ...data, ...fields });

  const isValid =
    data.address.length > 5 &&
    data.postalCode.length === 5 &&
    data.surface > 0 &&
    data.numberOfRooms > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Informations du logement</h2>
        <p className="text-sm text-muted-foreground">Décrivez le bien à louer.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Adresse</Label>
          <AddressAutocomplete
            id="address"
            value={data.address}
            onChange={(v) => update({ address: v })}
            onSelect={(address, postalCode) =>
              update({ address, postalCode, city: 'Paris' })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="surface">Surface (m²)</Label>
            <Input
              id="surface"
              type="number"
              min={1}
              value={data.surface || ''}
              onChange={(e) => update({ surface: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="rooms">Nombre de pièces</Label>
            <Input
              id="rooms"
              type="number"
              min={1}
              max={10}
              value={data.numberOfRooms || ''}
              onChange={(e) => update({ numberOfRooms: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="floor">Étage</Label>
            <Input
              id="floor"
              type="number"
              min={0}
              value={data.floor ?? ''}
              onChange={(e) => update({ floor: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
          <div>
            <Label htmlFor="totalFloors">Nombre d&apos;étages</Label>
            <Input
              id="totalFloors"
              type="number"
              min={1}
              value={data.totalFloors ?? ''}
              onChange={(e) => update({ totalFloors: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
        </div>

        <div>
          <Label>Type de logement</Label>
          <div className="flex gap-3 mt-1">
            {[
              { label: 'Non meublé', value: false },
              { label: 'Meublé', value: true },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => update({ furnished: opt.value })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  data.furnished === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="constructionPeriod">Période de construction</Label>
          <select
            id="constructionPeriod"
            value={data.constructionPeriod}
            onChange={(e) => update({ constructionPeriod: e.target.value as ConstructionPeriod })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {constructionPeriods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="dpeClass">Classe DPE</Label>
          <select
            id="dpeClass"
            value={data.dpeClass || ''}
            onChange={(e) => update({ dpeClass: (e.target.value || null) as DPEClass | null })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Non renseigné</option>
            {dpeClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description">Description du logement</Label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
            placeholder="Appartement au 3e étage, lumineux, cuisine équipée..."
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </button>
    </div>
  );
}
