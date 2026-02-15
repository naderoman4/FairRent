import { describe, it, expect } from 'vitest';
import {
  checkRentCeiling,
  checkComplementLoyer,
  checkMandatoryMentions,
  checkSurfacePlausibility,
  checkDPE,
  checkLeaseDuration,
  checkLeaseType,
  checkDepositAmount,
  checkAgencyFees,
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
    depositAmount: null,
    agencyFees: null,
    leaseType: null,
    leaseDuration: null,
    clauseText: null,
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
    const result = checkRentCeiling(makeLeaseData(), makeRentReference());
    expect(result).toBeNull();
  });

  it('returns violation when rent exceeds ceiling', () => {
    const lease = makeLeaseData({ rentExcludingCharges: 1500 });
    const result = checkRentCeiling(lease, makeRentReference());
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('illegal');
    expect(result!.id).toBe('rent-ceiling');
  });

  it('returns null when rent equals ceiling exactly', () => {
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

  it('flags complement without justification', () => {
    const lease = makeLeaseData({
      complementLoyer: 50,
      complementLoyerJustification: null,
    });
    const result = checkComplementLoyer(lease, makeRentReference());
    expect(result.some((i) => i.id === 'complement-no-justification')).toBe(true);
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

  it('returns red_flag when reference rent is missing', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: false });
    const result = checkMandatoryMentions(lease);
    expect(result.some((i) => i.id === 'missing-reference-rent' && i.severity === 'red_flag')).toBe(true);
  });

  it('returns red_flag when max rent is missing', () => {
    const lease = makeLeaseData({ mentionsMaxRent: false });
    const result = checkMandatoryMentions(lease);
    expect(result.some((i) => i.id === 'missing-max-rent' && i.severity === 'red_flag')).toBe(true);
  });

  it('returns attention when mentions are unknown', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: null, mentionsMaxRent: null });
    const result = checkMandatoryMentions(lease);
    expect(result.filter((i) => i.severity === 'attention')).toHaveLength(2);
  });
});

describe('checkSurfacePlausibility', () => {
  it('returns no issues for normal surface', () => {
    const result = checkSurfacePlausibility(makeLeaseData(), makeRentReference());
    expect(result).toEqual([]);
  });

  it('flags surface below 9m² as illegal', () => {
    const lease = makeLeaseData({ surface: 7 });
    const result = checkSurfacePlausibility(lease, makeRentReference());
    expect(result.some((i) => i.id === 'small-surface' && i.severity === 'illegal')).toBe(true);
  });

  it('flags suspiciously high rent per m²', () => {
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

  it('flags DPE G after 2025-01-01 as illegal', () => {
    const lease = makeLeaseData({ dpeClass: 'G', leaseStartDate: '2025-03-01' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-g-ban' && i.severity === 'illegal')).toBe(true);
  });

  it('no flag for DPE G before 2025-01-01', () => {
    const lease = makeLeaseData({ dpeClass: 'G', leaseStartDate: '2024-12-31' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-g-ban')).toBe(false);
  });

  it('flags DPE F after 2028-01-01 as illegal', () => {
    const lease = makeLeaseData({ dpeClass: 'F', leaseStartDate: '2028-03-01' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-f-ban' && i.severity === 'illegal')).toBe(true);
  });

  it('flags DPE F before 2028 as attention (frozen rent)', () => {
    const lease = makeLeaseData({ dpeClass: 'F', leaseStartDate: '2025-01-01' });
    const result = checkDPE(lease);
    expect(result.some((i) => i.id === 'dpe-f-freeze' && i.severity === 'attention')).toBe(true);
  });
});

describe('checkLeaseDuration', () => {
  it('returns no issues when duration is null', () => {
    const result = checkLeaseDuration(makeLeaseData());
    expect(result).toEqual([]);
  });

  it('flags unfurnished lease shorter than 3 years', () => {
    const lease = makeLeaseData({ leaseDuration: 24, furnished: false });
    const result = checkLeaseDuration(lease);
    expect(result.some((i) => i.id === 'unfurnished-duration' && i.severity === 'illegal')).toBe(true);
  });

  it('flags furnished lease shorter than 1 year', () => {
    const lease = makeLeaseData({ leaseDuration: 6, furnished: true });
    const result = checkLeaseDuration(lease);
    expect(result.some((i) => i.id === 'furnished-duration' && i.severity === 'illegal')).toBe(true);
  });

  it('flags bail mobilité with invalid duration', () => {
    const lease = makeLeaseData({ leaseDuration: 12, leaseType: 'mobilite' });
    const result = checkLeaseDuration(lease);
    expect(result.some((i) => i.id === 'mobilite-duration')).toBe(true);
  });

  it('accepts bail mobilité with valid duration', () => {
    const lease = makeLeaseData({ leaseDuration: 6, leaseType: 'mobilite' });
    const result = checkLeaseDuration(lease);
    expect(result).toEqual([]);
  });
});

describe('checkLeaseType', () => {
  it('flags code civil lease', () => {
    const lease = makeLeaseData({ leaseType: 'code_civil' });
    const result = checkLeaseType(lease);
    expect(result.some((i) => i.id === 'code-civil-residence' && i.severity === 'illegal')).toBe(true);
  });

  it('returns empty for loi 1989 lease', () => {
    const lease = makeLeaseData({ leaseType: 'loi_1989' });
    const result = checkLeaseType(lease);
    expect(result).toEqual([]);
  });
});

describe('checkDepositAmount', () => {
  it('returns no issues when deposit is null', () => {
    const result = checkDepositAmount(makeLeaseData());
    expect(result).toEqual([]);
  });

  it('flags excessive deposit for unfurnished', () => {
    const lease = makeLeaseData({ depositAmount: 1500, rentExcludingCharges: 1000 });
    const result = checkDepositAmount(lease);
    expect(result.some((i) => i.id === 'deposit-excessive')).toBe(true);
  });

  it('accepts valid deposit for unfurnished', () => {
    const lease = makeLeaseData({ depositAmount: 1000, rentExcludingCharges: 1000 });
    const result = checkDepositAmount(lease);
    expect(result).toEqual([]);
  });

  it('accepts 2 months deposit for furnished', () => {
    const lease = makeLeaseData({ depositAmount: 2000, rentExcludingCharges: 1000, furnished: true });
    const result = checkDepositAmount(lease);
    expect(result).toEqual([]);
  });
});

describe('checkAgencyFees', () => {
  it('returns no issues when fees are null', () => {
    const result = checkAgencyFees(makeLeaseData());
    expect(result).toEqual([]);
  });

  it('flags excessive agency fees', () => {
    // 40m² × (12 + 3) = 600€ max
    const lease = makeLeaseData({ agencyFees: 800 });
    const result = checkAgencyFees(lease);
    expect(result.some((i) => i.id === 'agency-fees-excessive')).toBe(true);
  });

  it('accepts valid agency fees', () => {
    const lease = makeLeaseData({ agencyFees: 500 });
    const result = checkAgencyFees(lease);
    expect(result).toEqual([]);
  });
});

describe('runAllChecks — verdict determination', () => {
  it('returns no illegal/red_flag issues when all is compliant', () => {
    const issues = runAllChecks(makeLeaseData(), makeRentReference());
    const hasIllegal = issues.some((i) => i.severity === 'illegal');
    const hasRedFlag = issues.some((i) => i.severity === 'red_flag');
    expect(hasIllegal).toBe(false);
    expect(hasRedFlag).toBe(false);
  });

  it('returns illegal when rent exceeds ceiling', () => {
    const lease = makeLeaseData({ rentExcludingCharges: 1500 });
    const issues = runAllChecks(lease, makeRentReference());
    expect(issues.some((i) => i.severity === 'illegal')).toBe(true);
  });

  it('returns red_flag when mandatory mentions missing', () => {
    const lease = makeLeaseData({ mentionsReferenceRent: false });
    const issues = runAllChecks(lease, makeRentReference());
    expect(issues.some((i) => i.severity === 'red_flag')).toBe(true);
  });
});
