import { describe, it, expect } from 'vitest';
import {
  checkRentCeiling,
  checkComplementLoyer,
  checkMandatoryMentions,
  checkSurfacePlausibility,
  checkDPE,
  runAllChecks,
} from '@/lib/compliance';
import type { LeaseData, RentReference } from '@/lib/types';

function makeLeaseData(overrides: Partial<LeaseData> = {}): LeaseData {
  return {
    address: '10 Rue de la Paix',
    postalCode: '75002',
    city: 'Paris',
    rentExcludingCharges: 1000,
    charges: 50,
    surface: 40,
    numberOfRooms: 2,
    furnished: false,
    constructionPeriod: 'Avant 1946',
    leaseStartDate: '2024-09-01',
    complementLoyer: null,
    complementLoyerJustification: null,
    mentionsReferenceRent: true,
    mentionsMaxRent: true,
    dpeClass: 'D',
    ...overrides,
  };
}

function makeRentReference(overrides: Partial<RentReference> = {}): RentReference {
  return {
    year: '2024',
    quarterName: 'Gaillon',
    quarterId: 6,
    zoneId: 2,
    numberOfRooms: 2,
    constructionPeriod: 'Avant 1946',
    furnished: false,
    referenceRent: 28.0,
    maxRent: 33.6,
    minRent: 19.6,
    ...overrides,
  };
}

describe('checkRentCeiling', () => {
  it('returns null when rent is below ceiling', () => {
    // 1000€ / 40m² = 25€/m², ceiling is 33.6€/m²
    const result = checkRentCeiling(makeLeaseData(), makeRentReference());
    expect(result).toBeNull();
  });

  it('returns violation when rent exceeds ceiling', () => {
    // 1500€ / 40m² = 37.5€/m², ceiling is 33.6€/m²
    const lease = makeLeaseData({ rentExcludingCharges: 1500 });
    const result = checkRentCeiling(lease, makeRentReference());
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('error');
    expect(result!.id).toBe('rent-ceiling');
  });

  it('returns null when rent equals ceiling exactly', () => {
    // 33.6 * 40 = 1344€
    const lease = makeLeaseData({ rentExcludingCharges: 1344 });
    const result = checkRentCeiling(lease, makeRentReference());
    expect(result).toBeNull();
  });
});

describe('checkComplementLoyer', () => {
  it('returns empty array when no complement', () => {
    const result = checkComplementLoyer(makeLeaseData(), makeRentReference());
    expect(result).toEqual([]);
  });

  it('returns error when base rent exceeds max and complement exists', () => {
    const lease = makeLeaseData({
      rentExcludingCharges: 1500,
      complementLoyer: 100,
    });
    const result = checkComplementLoyer(lease, makeRentReference());
    expect(result.some((i) => i.id === 'complement-base-rent')).toBe(true);
  });

  it('flags complement with DPE F after Aug 2022', () => {
    const lease = makeLeaseData({
      complementLoyer: 50,
      dpeClass: 'F',
      leaseStartDate: '2023-01-01',
    });
    const result = checkComplementLoyer(lease, makeRentReference());
    expect(result.some((i) => i.id === 'complement-dpe-ban')).toBe(true);
  });

  it('flags complement with DPE G after Aug 2022', () => {
    const lease = makeLeaseData({
      complementLoyer: 50,
      dpeClass: 'G',
      leaseStartDate: '2023-01-01',
    });
    const result = checkComplementLoyer(lease, makeRentReference());
    expect(result.some((i) => i.id === 'complement-dpe-ban')).toBe(true);
  });

  it('allows complement with DPE F before Aug 2022', () => {
    const lease = makeLeaseData({
      complementLoyer: 50,
      dpeClass: 'F',
      leaseStartDate: '2022-07-01',
    });
    const result = checkComplementLoyer(lease, makeRentReference());
    expect(result.some((i) => i.id === 'complement-dpe-ban')).toBe(false);
  });
});

describe('checkMandatoryMentions', () => {
  it('returns no issues when mentions are present', () => {
    const result = checkMandatoryMentions(makeLeaseData());
    expect(result).toEqual([]);
  });

  it('returns warning when reference rent is missing', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: false });
    const result = checkMandatoryMentions(lease);
    expect(result.some((i) => i.id === 'missing-reference-rent' && i.severity === 'warning')).toBe(true);
  });

  it('returns warning when max rent is missing', () => {
    const lease = makeLeaseData({ mentionsMaxRent: false });
    const result = checkMandatoryMentions(lease);
    expect(result.some((i) => i.id === 'missing-max-rent' && i.severity === 'warning')).toBe(true);
  });

  it('returns info when mentions are unknown', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: null, mentionsMaxRent: null });
    const result = checkMandatoryMentions(lease);
    expect(result.filter((i) => i.severity === 'info')).toHaveLength(2);
  });
});

describe('checkSurfacePlausibility', () => {
  it('returns no issues for normal surface', () => {
    const result = checkSurfacePlausibility(makeLeaseData(), makeRentReference());
    expect(result).toEqual([]);
  });

  it('warns when surface is below 9m²', () => {
    const lease = makeLeaseData({ surface: 7 });
    const result = checkSurfacePlausibility(lease, makeRentReference());
    expect(result.some((i) => i.id === 'small-surface')).toBe(true);
  });

  it('warns when rent per m² is suspiciously high', () => {
    // 5000€ / 10m² = 500€/m², ceiling is 33.6€/m², 500 > 33.6*3
    const lease = makeLeaseData({ rentExcludingCharges: 5000, surface: 10 });
    const result = checkSurfacePlausibility(lease, makeRentReference());
    expect(result.some((i) => i.id === 'suspicious-rent')).toBe(true);
  });
});

describe('checkDPE', () => {
  it('returns no issues for good DPE', () => {
    const result = checkDPE(makeLeaseData());
    expect(result).toEqual([]);
  });

  it('warns for DPE G after 2025-01-01', () => {
    const lease = makeLeaseData({ dpeClass: 'G', leaseStartDate: '2025-03-01' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-g-ban')).toBe(true);
  });

  it('no warning for DPE G before 2025-01-01', () => {
    const lease = makeLeaseData({ dpeClass: 'G', leaseStartDate: '2024-12-31' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-g-ban')).toBe(false);
  });

  it('warns for DPE F after 2028-01-01', () => {
    const lease = makeLeaseData({ dpeClass: 'F', leaseStartDate: '2028-03-01' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-f-ban')).toBe(true);
  });
});

describe('runAllChecks — verdict determination', () => {
  it('returns compliant when no issues', () => {
    const issues = runAllChecks(makeLeaseData(), makeRentReference());
    const hasError = issues.some((i) => i.severity === 'error');
    const hasWarning = issues.some((i) => i.severity === 'warning');
    expect(hasError).toBe(false);
    expect(hasWarning).toBe(false);
  });

  it('returns violation when rent exceeds ceiling', () => {
    const lease = makeLeaseData({ rentExcludingCharges: 1500 });
    const issues = runAllChecks(lease, makeRentReference());
    expect(issues.some((i) => i.severity === 'error')).toBe(true);
  });

  it('returns warning when mandatory mentions missing', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: false });
    const issues = runAllChecks(lease, makeRentReference());
    expect(issues.some((i) => i.severity === 'warning')).toBe(true);
  });
});
