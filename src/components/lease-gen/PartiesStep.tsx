'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PartiesData, PartyInfo } from '@/lib/types-lease-gen';

interface Props {
  data: PartiesData;
  onChange: (data: PartiesData) => void;
  onNext: () => void;
  onBack: () => void;
}

function PartyFields({
  title,
  party,
  onChange,
  prefix,
}: {
  title: string;
  party: PartyInfo;
  onChange: (p: PartyInfo) => void;
  prefix: string;
}) {
  const update = (fields: Partial<PartyInfo>) => onChange({ ...party, ...fields });

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-firstName`}>Prénom</Label>
          <Input
            id={`${prefix}-firstName`}
            value={party.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-lastName`}>Nom</Label>
          <Input
            id={`${prefix}-lastName`}
            value={party.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${prefix}-address`}>Adresse</Label>
        <Input
          id={`${prefix}-address`}
          value={party.address}
          onChange={(e) => update({ address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefix}-email`}>Email</Label>
          <Input
            id={`${prefix}-email`}
            type="email"
            value={party.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${prefix}-phone`}>Téléphone</Label>
          <Input
            id={`${prefix}-phone`}
            type="tel"
            value={party.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function PartiesStep({ data, onChange, onNext, onBack }: Props) {
  const update = (fields: Partial<PartiesData>) => onChange({ ...data, ...fields });

  const isValid =
    data.landlord.firstName && data.landlord.lastName &&
    data.tenant.firstName && data.tenant.lastName;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Parties au bail</h2>
        <p className="text-sm text-muted-foreground">Informations du bailleur et du locataire.</p>
      </div>

      <div className="space-y-8">
        <PartyFields
          title="Bailleur (propriétaire)"
          party={data.landlord}
          onChange={(landlord) => update({ landlord })}
          prefix="landlord"
        />

        <hr />

        <PartyFields
          title="Locataire"
          party={data.tenant}
          onChange={(tenant) => update({ tenant })}
          prefix="tenant"
        />

        <hr />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Garant (optionnel)</h3>
            {data.guarantor ? (
              <button
                type="button"
                onClick={() => update({ guarantor: null })}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  update({
                    guarantor: {
                      firstName: '',
                      lastName: '',
                      address: '',
                      email: '',
                      phone: '',
                    },
                  })
                }
                className="text-sm text-primary hover:underline"
              >
                Ajouter un garant
              </button>
            )}
          </div>
          {data.guarantor && (
            <PartyFields
              title=""
              party={data.guarantor}
              onChange={(guarantor) => update({ guarantor })}
              prefix="guarantor"
            />
          )}
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
