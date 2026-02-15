'use client';

import type { LeaseGenData } from '@/lib/types-lease-gen';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  data: LeaseGenData;
  complianceWarnings: string[];
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function ReviewStep({ data, complianceWarnings, onGenerate, onBack, isGenerating }: Props) {
  const paymentLabels: Record<string, string> = {
    virement: 'Virement bancaire',
    prelevement: 'Prélèvement automatique',
    cheque: 'Chèque',
    especes: 'Espèces',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Récapitulatif</h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez les informations avant de générer le bail. 2 crédits seront déduits.
        </p>
      </div>

      {complianceWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
            <AlertTriangle className="h-4 w-4" />
            Points d&apos;attention
          </div>
          <ul className="space-y-1">
            {complianceWarnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700">• {w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {/* Property */}
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Logement</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Adresse</div>
            <div>{data.property.address}</div>
            <div className="text-muted-foreground">Surface</div>
            <div>{data.property.surface} m²</div>
            <div className="text-muted-foreground">Pièces</div>
            <div>{data.property.numberOfRooms}</div>
            <div className="text-muted-foreground">Type</div>
            <div>{data.property.furnished ? 'Meublé' : 'Non meublé'}</div>
            <div className="text-muted-foreground">DPE</div>
            <div>{data.property.dpeClass || 'Non renseigné'}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Parties</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Bailleur</div>
            <div>{data.parties.landlord.firstName} {data.parties.landlord.lastName}</div>
            <div className="text-muted-foreground">Locataire</div>
            <div>{data.parties.tenant.firstName} {data.parties.tenant.lastName}</div>
            {data.parties.guarantor && (
              <>
                <div className="text-muted-foreground">Garant</div>
                <div>{data.parties.guarantor.firstName} {data.parties.guarantor.lastName}</div>
              </>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Finances</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Loyer HC</div>
            <div>{data.financial.rentExcludingCharges.toFixed(2)} EUR</div>
            <div className="text-muted-foreground">Charges</div>
            <div>{data.financial.charges.toFixed(2)} EUR</div>
            <div className="text-muted-foreground">Dépôt de garantie</div>
            <div>{data.financial.depositAmount.toFixed(2)} EUR</div>
            {data.financial.complementLoyer && (
              <>
                <div className="text-muted-foreground">Complément de loyer</div>
                <div>{data.financial.complementLoyer.toFixed(2)} EUR</div>
              </>
            )}
            <div className="text-muted-foreground">Paiement</div>
            <div>Le {data.financial.paymentDay} du mois — {paymentLabels[data.financial.paymentMethod]}</div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Conditions</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Date de début</div>
            <div>{new Date(data.terms.startDate).toLocaleDateString('fr-FR')}</div>
            <div className="text-muted-foreground">Durée</div>
            <div>{data.terms.duration} an{data.terms.duration > 1 ? 's' : ''}</div>
          </div>
          {data.terms.specialConditions && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Conditions particulières :</p>
              <p className="text-sm whitespace-pre-wrap">{data.terms.specialConditions}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:bg-primary/60 transition-colors"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération...
            </span>
          ) : (
            'Générer le bail (2 crédits)'
          )}
        </button>
      </div>
    </div>
  );
}
