import type { LeaseData, RentReference, ComplianceIssue } from './types';
import {
  MIN_LEGAL_SURFACE,
  SUSPICIOUS_RENT_MULTIPLIER,
  COMPLEMENT_LOYER_DPE_BAN_DATE,
  DPE_G_BAN_DATE,
  DPE_F_BAN_DATE,
  DEPOSIT_MAX_MONTHS_UNFURNISHED,
  DEPOSIT_MAX_MONTHS_FURNISHED,
  AGENCY_FEES_CEILING_PER_SQM,
  AGENCY_FEES_ETAT_DES_LIEUX_PER_SQM,
  MIN_LEASE_DURATION_UNFURNISHED,
  MIN_LEASE_DURATION_FURNISHED,
  MIN_LEASE_DURATION_MOBILITE_MIN,
  MIN_LEASE_DURATION_MOBILITE_MAX,
  MIN_LEASE_DURATION_SCI,
} from './constants';

// ─── Rent Control Checks ───

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
      severity: 'illegal',
      category: 'rent',
      title: 'Dépassement du loyer de référence majoré',
      description: `Votre loyer est de ${rentPerSqm.toFixed(2)} €/m², soit ${overchargePerSqm.toFixed(2)} €/m² au-dessus du plafond légal de ${maxAllowed.toFixed(2)} €/m². Cela représente un trop-perçu de ${overchargeTotal.toFixed(2)} € par mois.`,
      legalReference: 'Article 17 de la loi du 6 juillet 1989',
      legalUrl: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039048522',
      recommendation: 'Demandez à votre bailleur une réduction de loyer par lettre recommandée, puis saisissez la Commission de conciliation.',
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

  // Base rent must be <= maxRent
  const baseRentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  if (baseRentPerSqm > rentReference.maxRent) {
    issues.push({
      id: 'complement-base-rent',
      severity: 'illegal',
      category: 'rent',
      title: 'Complément de loyer illégal : loyer de base trop élevé',
      description: `Le loyer de base (${baseRentPerSqm.toFixed(2)} €/m²) dépasse déjà le loyer de référence majoré (${rentReference.maxRent.toFixed(2)} €/m²). Le complément de loyer ne peut s'appliquer que si le loyer de base est inférieur ou égal au loyer de référence majoré.`,
      legalReference: 'Article 17 §II de la loi du 6 juillet 1989',
      recommendation: 'Le complément de loyer est nul. Demandez sa suppression et le remboursement des sommes versées.',
    });
  }

  // No justification
  if (!leaseData.complementLoyerJustification) {
    issues.push({
      id: 'complement-no-justification',
      severity: 'red_flag',
      category: 'rent',
      title: 'Complément de loyer sans justification',
      description: 'Un complément de loyer est mentionné mais aucune justification n\'est fournie. La loi impose que le bailleur justifie le complément par des caractéristiques exceptionnelles du logement.',
      legalReference: 'Article 17 §II de la loi du 6 juillet 1989',
      recommendation: 'Demandez au bailleur la justification du complément de loyer. Sans justification valable, il peut être contesté.',
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
      severity: 'illegal',
      category: 'rent',
      title: 'Complément de loyer interdit (DPE F/G)',
      description: `Depuis le 18 août 2022, le complément de loyer est interdit pour les logements classés F ou G au DPE. Votre logement est classé ${leaseData.dpeClass}.`,
      legalReference: 'Article 159 de la loi 3DS (2022)',
      recommendation: 'Contestez le complément de loyer auprès de la CDC dans les 3 mois suivant la signature du bail.',
    });
  }

  return issues;
}

export function checkMandatoryMentions(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.mentionsReferenceRent === false) {
    issues.push({
      id: 'missing-reference-rent',
      severity: 'red_flag',
      category: 'rent',
      title: 'Mention manquante : loyer de référence',
      description:
        'Le bail doit obligatoirement mentionner le loyer de référence applicable. Cette mention est absente de votre bail.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
      recommendation: 'Demandez à votre bailleur de vous communiquer le loyer de référence applicable.',
    });
  } else if (leaseData.mentionsReferenceRent === null) {
    issues.push({
      id: 'unknown-reference-rent',
      severity: 'attention',
      category: 'rent',
      title: 'Vérifiez la mention du loyer de référence',
      description:
        'Votre bail doit mentionner le loyer de référence. Vérifiez que cette information figure bien dans votre contrat.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  }

  if (leaseData.mentionsMaxRent === false) {
    issues.push({
      id: 'missing-max-rent',
      severity: 'red_flag',
      category: 'rent',
      title: 'Mention manquante : loyer de référence majoré',
      description:
        'Le bail doit obligatoirement mentionner le loyer de référence majoré. Cette mention est absente de votre bail.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
      recommendation: 'Demandez à votre bailleur de vous communiquer le loyer de référence majoré applicable.',
    });
  } else if (leaseData.mentionsMaxRent === null) {
    issues.push({
      id: 'unknown-max-rent',
      severity: 'attention',
      category: 'rent',
      title: 'Vérifiez la mention du loyer de référence majoré',
      description:
        'Votre bail doit mentionner le loyer de référence majoré. Vérifiez que cette information figure bien dans votre contrat.',
      legalReference: 'Article 3-3 de la loi du 6 juillet 1989',
    });
  }

  return issues;
}

// ─── Lease Validity Checks ───

export function checkLeaseDuration(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.leaseDuration == null) return issues;

  if (leaseData.leaseType === 'mobilite') {
    if (
      leaseData.leaseDuration < MIN_LEASE_DURATION_MOBILITE_MIN ||
      leaseData.leaseDuration > MIN_LEASE_DURATION_MOBILITE_MAX
    ) {
      issues.push({
        id: 'mobilite-duration',
        severity: 'illegal',
        category: 'lease_validity',
        title: 'Durée du bail mobilité non conforme',
        description: `Un bail mobilité doit avoir une durée comprise entre 1 et 10 mois. La durée de votre bail est de ${leaseData.leaseDuration} mois.`,
        legalReference: 'Article 25-12 de la loi du 6 juillet 1989',
        recommendation: 'Vérifiez les conditions du bail mobilité avec votre bailleur.',
      });
    }
    return issues;
  }

  if (leaseData.furnished) {
    if (leaseData.leaseDuration < MIN_LEASE_DURATION_FURNISHED) {
      issues.push({
        id: 'furnished-duration',
        severity: 'illegal',
        category: 'lease_validity',
        title: 'Durée du bail meublé trop courte',
        description: `Un bail meublé doit avoir une durée minimale de 1 an. La durée de votre bail est de ${leaseData.leaseDuration} mois.`,
        legalReference: 'Article 25-7 de la loi du 6 juillet 1989',
        recommendation: 'La durée du bail doit être d\'au moins 1 an (ou 9 mois pour un bail étudiant).',
      });
    }
  } else {
    if (leaseData.leaseDuration < MIN_LEASE_DURATION_UNFURNISHED) {
      issues.push({
        id: 'unfurnished-duration',
        severity: 'illegal',
        category: 'lease_validity',
        title: 'Durée du bail non meublé trop courte',
        description: `Un bail non meublé doit avoir une durée minimale de 3 ans (6 ans pour un bailleur personne morale). La durée de votre bail est de ${leaseData.leaseDuration} mois.`,
        legalReference: 'Article 10 de la loi du 6 juillet 1989',
        recommendation: 'Un bail de durée inférieure au minimum légal est réputé conclu pour la durée légale minimale.',
      });
    }
  }

  return issues;
}

export function checkLeaseType(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.leaseType === 'code_civil') {
    issues.push({
      id: 'code-civil-residence',
      severity: 'illegal',
      category: 'lease_validity',
      title: 'Bail code civil pour une résidence principale',
      description: 'Un bail régi par le code civil ne peut pas être utilisé pour une résidence principale. Les baux de résidence principale doivent être régis par la loi du 6 juillet 1989.',
      legalReference: 'Article 2 de la loi du 6 juillet 1989',
      recommendation: 'Demandez la requalification du bail en bail loi de 1989, qui vous accorde davantage de protections.',
    });
  }

  return issues;
}

// ─── Financial Checks ───

export function checkDepositAmount(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.depositAmount == null) return issues;
  if (leaseData.leaseType === 'mobilite') return issues; // No deposit for bail mobilité

  const maxMonths = leaseData.furnished
    ? DEPOSIT_MAX_MONTHS_FURNISHED
    : DEPOSIT_MAX_MONTHS_UNFURNISHED;
  const maxDeposit = leaseData.rentExcludingCharges * maxMonths;

  if (leaseData.depositAmount > maxDeposit) {
    const label = leaseData.furnished ? '2 mois' : '1 mois';
    issues.push({
      id: 'deposit-excessive',
      severity: 'illegal',
      category: 'financial',
      title: 'Dépôt de garantie excessif',
      description: `Le dépôt de garantie (${leaseData.depositAmount} €) dépasse le maximum légal de ${label} de loyer hors charges (${maxDeposit.toFixed(2)} €).`,
      legalReference: 'Article 22 de la loi du 6 juillet 1989',
      recommendation: 'Demandez la restitution de l\'excédent à votre bailleur.',
    });
  }

  return issues;
}

export function checkAgencyFees(leaseData: LeaseData): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.agencyFees == null || leaseData.agencyFees === 0) return issues;

  const maxFees = (AGENCY_FEES_CEILING_PER_SQM + AGENCY_FEES_ETAT_DES_LIEUX_PER_SQM) * leaseData.surface;

  if (leaseData.agencyFees > maxFees) {
    issues.push({
      id: 'agency-fees-excessive',
      severity: 'illegal',
      category: 'financial',
      title: 'Honoraires d\'agence excessifs',
      description: `Les honoraires à la charge du locataire (${leaseData.agencyFees} €) dépassent le plafond légal de ${AGENCY_FEES_CEILING_PER_SQM} €/m² pour les prestations + ${AGENCY_FEES_ETAT_DES_LIEUX_PER_SQM} €/m² pour l'état des lieux, soit ${maxFees.toFixed(2)} € maximum pour ${leaseData.surface} m².`,
      legalReference: 'Article 5 de la loi du 6 juillet 1989 et décret du 1er août 2014',
      recommendation: 'Demandez le remboursement de l\'excédent à l\'agence immobilière.',
    });
  }

  return issues;
}

// ─── Property Decency Checks ───

export function checkSurfacePlausibility(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (leaseData.surface < MIN_LEGAL_SURFACE) {
    issues.push({
      id: 'small-surface',
      severity: 'illegal',
      category: 'decency',
      title: 'Surface habitable inférieure au minimum légal',
      description: `La surface déclarée (${leaseData.surface} m²) est inférieure au minimum légal de ${MIN_LEGAL_SURFACE} m² (avec hauteur sous plafond ≥ 2,20 m ou volume ≥ 20 m³).`,
      legalReference: 'Article R111-2 du Code de la construction et décret décence du 30 janvier 2002',
      recommendation: 'Un logement de moins de 9 m² ne respecte pas les critères de décence. Vous pouvez demander une mise en conformité ou la résiliation du bail.',
    });
  }

  const rentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  if (rentPerSqm > rentReference.maxRent * SUSPICIOUS_RENT_MULTIPLIER) {
    issues.push({
      id: 'suspicious-rent',
      severity: 'attention',
      category: 'decency',
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
      severity: 'illegal',
      category: 'decency',
      title: 'Logement classé G : interdiction de location',
      description:
        'Depuis le 1er janvier 2025, les logements classés G au DPE ne peuvent plus être mis en location. Ce bail est illégal.',
      legalReference: 'Article 160 de la loi Climat et Résilience (2021)',
      recommendation: 'Ce logement ne peut légalement pas être loué. Contactez l\'ADIL pour connaître vos recours.',
    });
  }

  if (
    leaseData.dpeClass === 'F' &&
    leaseData.leaseStartDate >= DPE_F_BAN_DATE
  ) {
    issues.push({
      id: 'dpe-f-ban',
      severity: 'illegal',
      category: 'decency',
      title: 'Logement classé F : interdiction de location',
      description:
        'À partir du 1er janvier 2028, les logements classés F au DPE ne pourront plus être mis en location.',
      legalReference: 'Article 160 de la loi Climat et Résilience (2021)',
      recommendation: 'Ce logement ne pourra plus être loué à partir de 2028. Le bailleur doit entreprendre des travaux de rénovation énergétique.',
    });
  } else if (leaseData.dpeClass === 'F') {
    issues.push({
      id: 'dpe-f-freeze',
      severity: 'attention',
      category: 'decency',
      title: 'Logement classé F : loyer gelé',
      description:
        'Les logements classés F au DPE ont un loyer gelé depuis août 2022 (pas de révision ni de réévaluation possible). L\'interdiction de location prendra effet en 2028.',
      legalReference: 'Loi Climat et Résilience (2021) et loi pouvoir d\'achat (2022)',
    });
  }

  return issues;
}

// ─── Run All Checks ───

export function runAllChecks(
  leaseData: LeaseData,
  rentReference: RentReference
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // Rent control
  const ceilingIssue = checkRentCeiling(leaseData, rentReference);
  if (ceilingIssue) {
    issues.push(ceilingIssue);
  }
  issues.push(...checkComplementLoyer(leaseData, rentReference));
  issues.push(...checkMandatoryMentions(leaseData));

  // Lease validity
  issues.push(...checkLeaseDuration(leaseData));
  issues.push(...checkLeaseType(leaseData));

  // Financial
  issues.push(...checkDepositAmount(leaseData));
  issues.push(...checkAgencyFees(leaseData));

  // Decency
  issues.push(...checkSurfacePlausibility(leaseData, rentReference));
  issues.push(...checkDPE(leaseData));

  return issues;
}
