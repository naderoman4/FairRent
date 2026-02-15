import type { LeaseData, ComplianceReport, ComplianceIssue, Verdict, Quartier } from './types';
import { geocodeAddress } from './geocoding';
import { findQuartier } from './quartier-lookup';
import { fetchRentReference, determineReferenceYear } from './paris-opendata';
import { runAllChecks } from './compliance';
import { getActionSteps } from './constants';

function determineVerdict(issues: ComplianceIssue[]): Verdict {
  if (issues.some((i) => i.severity === 'illegal')) return 'violation';
  if (issues.some((i) => i.severity === 'red_flag' || i.severity === 'attention')) return 'warning';
  return 'compliant';
}

export async function generateReport(
  leaseData: LeaseData,
  clauseIssues?: ComplianceIssue[]
): Promise<ComplianceReport> {
  // 1. Geocode address
  const fullAddress = `${leaseData.address}, ${leaseData.postalCode} ${leaseData.city}`;
  const geo = await geocodeAddress(fullAddress);

  // 2. Find quartier
  const quartier = findQuartier(geo.latitude, geo.longitude);
  if (!quartier) {
    throw new Error(
      'Impossible de déterminer le quartier pour cette adresse. Vérifiez que l\'adresse est bien à Paris.'
    );
  }

  // 3. Determine reference year
  const year = determineReferenceYear(leaseData.leaseStartDate);

  // 4. Fetch rent reference
  const rentReference = await fetchRentReference(
    quartier.name,
    leaseData.numberOfRooms,
    leaseData.constructionPeriod,
    leaseData.furnished,
    year
  );

  // Update quartier zoneId from the rent reference data
  const enrichedQuartier: Quartier = {
    ...quartier,
    zoneId: rentReference.zoneId,
  };

  // 5. Run rule-based compliance checks
  const issues = runAllChecks(leaseData, rentReference);

  // 6. Merge LLM clause analysis issues if provided
  if (clauseIssues && clauseIssues.length > 0) {
    issues.push(...clauseIssues);
  }

  // 7. Determine verdict
  const verdict = determineVerdict(issues);

  // 8. Compute values
  const rentPerSqm = leaseData.rentExcludingCharges / leaseData.surface;
  const maxLegalRentPerSqm = rentReference.maxRent;
  const maxLegalRentTotal = maxLegalRentPerSqm * leaseData.surface;
  const overchargePerSqm = rentPerSqm > maxLegalRentPerSqm ? rentPerSqm - maxLegalRentPerSqm : null;
  const overchargeTotal = overchargePerSqm ? overchargePerSqm * leaseData.surface : null;

  // 9. Get action steps if needed
  const hasComplementLoyer = (leaseData.complementLoyer ?? 0) > 0;
  const actions = verdict !== 'compliant' ? getActionSteps(hasComplementLoyer) : [];

  return {
    verdict,
    leaseData,
    rentReference,
    quartier: enrichedQuartier,
    rentPerSqm: Math.round(rentPerSqm * 100) / 100,
    maxLegalRentPerSqm: Math.round(maxLegalRentPerSqm * 100) / 100,
    maxLegalRentTotal: Math.round(maxLegalRentTotal * 100) / 100,
    overchargePerSqm: overchargePerSqm ? Math.round(overchargePerSqm * 100) / 100 : null,
    overchargeTotal: overchargeTotal ? Math.round(overchargeTotal * 100) / 100 : null,
    issues,
    actions,
    generatedAt: new Date().toISOString(),
  };
}
