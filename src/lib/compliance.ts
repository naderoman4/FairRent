import type { LeaseData, RentReference, ComplianceIssue } from './types';
import {
  MIN_LEGAL_SURFACE,
  SUSPICIOUS_RENT_MULTIPLIER,
  COMPLEMENT_LOYER_DPE_BAN_DATE,
  DPE_G_BAN_DATE,
  DPE_F_BAN_DATE,
} from './constants';

export function checkRentCeiling(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue | null {
  const rentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  const maxAllowed = rentReference.maxRent;

  if (rentPerSqm > maxAllowed) {
    const overchargePerSqm = rentPerSqm - maxAllowed;
    const overchargeTotal = overchargePerSqm * leaseData.surface;
    return {
      id: 'rent-ceiling',
      severity: 'error',
      title: 'Dépassement du loyer de référence majoré',
      description: `Votre loyer est de ${rentPerSqm.toFixed(2)} €/m², soit ${overchargePerSqm.toFixed(2)} €/m² au-dessus du plafond légal de ${maxAllowed.toFixed(2)} €/m². Cela représente un trop-perçu de ${overchargeTotal.toFixed(2)} € par mois.`,
      legalReference: 'Article 17 de la loi du 6 juillet 1989',
      legalUrl: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039048522',
    };
  }

  return null;
}

export function checkComplementLoyer(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.complementLoyer == null || leaseData.complementLoyer === 0) {
    return issues;
  }

  // Base rent must be <= maxRent (loyer de référence majoré)
  const baseRentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  if (baseRentPerSqm > rentReference.maxRent) {
    issues.push({
      id: 'complement-base-rent',
      severity: 'error',
      title: 'Complément de loyer illégal : loyer de base trop élevé',
      description: `Le loyer de base (${baseRentPerSqm.toFixed(2)} €/m²) dépasse déjà le loyer de référence majoré (${rentReference.maxRent.toFixed(2)} €/m²). Le complément de loyer ne peut s'appliquer que si le loyer de base est inférieur ou égal au loyer de référence majoré.`,
      legalReference: 'Article 17 §II de la loi du 6 juillet 1989',
    });
  }

  // Post-August 2022 DPE F/G ban
  if (
    leaseData.leaseStartDate >= COMPLEMENT_LOYER_DPE_BAN_DATE &&
    leaseData.dpeClass &&
    (leaseData.dpeClass === 'F' || leaseData.dpeClass === 'G')
  ) {
    issues.push({
      id: 'complement-dpe-ban',
      severity: 'error',
      title: 'Complément de loyer interdit (DPE F/G)',
      description: `Depuis le 18 août 2022, le complément de loyer est interdit pour les logements classés F ou G au DPE. Votre logement est classé ${leaseData.dpeClass}.`,
      legalReference: 'Article 159 de la loi 3DS (2022)',
    });
  }

  return issues;
}

export function checkMandatoryMentions(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.mentionsReferenceRent === false) {
    issues.push({
      id: 'missing-reference-rent',
      severity: 'warning',
      title: 'Mention manquante : loyer de référence',
      description:
        'Le bail doit obligatoirement mentionner le loyer de référence applicable. Cette mention est absente de votre bail.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  } else if (leaseData.mentionsReferenceRent === null) {
    issues.push({
      id: 'unknown-reference-rent',
      severity: 'info',
      title: 'Vérifiez la mention du loyer de référence',
      description:
        'Votre bail doit mentionner le loyer de référence. Vérifiez que cette information figure bien dans votre contrat.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  }

  if (leaseData.mentionsMaxRent === false) {
    issues.push({
      id: 'missing-max-rent',
      severity: 'warning',
      title: 'Mention manquante : loyer de référence majoré',
      description:
        'Le bail doit obligatoirement mentionner le loyer de référence majoré. Cette mention est absente de votre bail.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  } else if (leaseData.mentionsMaxRent === null) {
    issues.push({
      id: 'unknown-max-rent',
      severity: 'info',
      title: 'Vérifiez la mention du loyer de référence majoré',
      description:
        'Votre bail doit mentionner le loyer de référence majoré. Vérifiez que cette information figure bien dans votre contrat.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  }

  return issues;
}

export function checkSurfacePlausibility(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.surface < MIN_LEGAL_SURFACE) {
    issues.push({
      id: 'small-surface',
      severity: 'warning',
      title: 'Surface habitable très faible',
      description: `La surface déclarée (${leaseData.surface} m²) est inférieure au minimum légal de 9 m² (avec hauteur sous plafond ≥ 2,20 m). Vérifiez la surface indiquée dans votre bail.`,
      legalReference: 'Article R111-2 du Code de la construction',
    });
  }

  const rentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  if (rentPerSqm > rentReference.maxRent * SUSPICIOUS_RENT_MULTIPLIER) {
    issues.push({
      id: 'suspicious-rent',
      severity: 'warning',
      title: 'Loyer au m² anormalement élevé',
      description: `Le loyer au m² (${rentPerSqm.toFixed(2)} €) est plus de ${SUSPICIOUS_RENT_MULTIPLIER} fois supérieur au plafond légal (${rentReference.maxRent.toFixed(2)} €/m²). Vérifiez que la surface déclarée est correcte.`,
      legalReference: 'Vérification de cohérence',
    });
  }

  return issues;
}

export function checkDPE(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (
    leaseData.dpeClass === 'G' &&
    leaseData.leaseStartDate >= DPE_G_BAN_DATE
  ) {
    issues.push({
      id: 'dpe-g-ban',
      severity: 'warning',
      title: 'Logement classé G : interdiction de location',
      description:
        'Depuis le 1er janvier 2025, les logements classés G au DPE ne peuvent plus être mis en location. Ce bail pourrait être contesté.',
      legalReference: 'Article 160 de la loi Climat et Résilience (2021)',
    });
  }

  if (
    leaseData.dpeClass === 'F' &&
    leaseData.leaseStartDate >= DPE_F_BAN_DATE
  ) {
    issues.push({
      id: 'dpe-f-ban',
      severity: 'warning',
      title: 'Logement classé F : interdiction de location',
      description:
        'À partir du 1er janvier 2028, les logements classés F au DPE ne pourront plus être mis en location.',
      legalReference: 'Article 160 de la loi Climat et Résilience (2021)',
    });
  }

  return issues;
}

export function runAllChecks(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  const ceilingIssue = checkRentCeiling(leaseData, rentReference);
  if (ceilingIssue) {
    issues.push(ceilingIssue);
  }

  issues.push(...checkComplementLoyer(leaseData, rentReference));
  issues.push(...checkMandatoryMentions(leaseData));
  issues.push(...checkSurfacePlausibility(leaseData, rentReference));
  issues.push(...checkDPE(leaseData));

  return issues;
}
