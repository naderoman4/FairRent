'use client';

import type { ComplianceIssue } from '@/lib/types';
import { Lightbulb } from 'lucide-react';

interface Props {
  issues: ComplianceIssue[];
}

const guidanceMap: Record<string, string> = {
  rent_overcharge:
    'Ajustez le loyer au plafond légal avant le prochain avis d\'échéance. Le locataire peut demander un remboursement du trop-perçu jusqu\'à 3 ans en arrière.',
  complement_loyer_no_justification:
    'Documentez précisément les caractéristiques exceptionnelles du logement (vue, terrasse, prestations haut de gamme) dans un avenant au bail.',
  complement_loyer_dpe_fg:
    'Supprimez le complément de loyer : il est interdit pour les logements classés F ou G. Régularisez immédiatement.',
  dpe_g_ban:
    'Ce logement ne peut plus être loué avec un DPE G depuis janvier 2025. Engagez des travaux de rénovation énergétique pour atteindre au minimum la classe F.',
  dpe_f_frozen:
    'Le loyer est gelé tant que le DPE est F. Aucune augmentation n\'est possible, même en cas de changement de locataire.',
  deposit_excessive:
    'Remboursez l\'excédent du dépôt de garantie au locataire. Le maximum légal est 1 mois pour un logement non meublé, 2 mois pour un meublé.',
  agency_fees_excessive:
    'Les frais d\'agence à charge du locataire sont plafonnés par zone géographique. Remboursez la différence.',
  missing_rent_reference:
    'Ajoutez les références de loyer (loyer de référence et loyer majoré) dans le bail via un avenant. C\'est une obligation légale.',
  short_lease_duration:
    'Régularisez la durée du bail : minimum 3 ans pour un propriétaire personne physique, 6 ans pour une personne morale (loi 1989).',
  surface_below_minimum:
    'Un logement de moins de 9m² ne peut pas être loué comme résidence principale. Vérifiez la surface habitable.',
};

export function LandlordGuidance({ issues }: Props) {
  const actionableIssues = issues.filter(
    (issue) => issue.severity === 'illegal' || issue.severity === 'red_flag'
  );

  if (actionableIssues.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Conseils propriétaire</h3>
      </div>
      <p className="text-sm text-blue-800">
        Voici comment corriger les points identifiés dans cette analyse :
      </p>
      <div className="space-y-3">
        {actionableIssues.map((issue) => {
          const guidance = guidanceMap[issue.id] || issue.recommendation;
          if (!guidance) return null;

          return (
            <div key={issue.id} className="bg-white rounded-lg p-4 space-y-1">
              <p className="text-sm font-medium text-gray-900">{issue.title}</p>
              <p className="text-sm text-gray-600">{guidance}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
