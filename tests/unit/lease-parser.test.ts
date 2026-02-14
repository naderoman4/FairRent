import { describe, it, expect } from 'vitest';
import { determineReferenceYear } from '@/lib/paris-opendata';

describe('determineReferenceYear', () => {
  it('uses same year for leases starting July or later', () => {
    expect(determineReferenceYear('2024-07-01')).toBe('2024');
    expect(determineReferenceYear('2024-09-15')).toBe('2024');
    expect(determineReferenceYear('2024-12-31')).toBe('2024');
  });

  it('uses previous year for leases starting before July', () => {
    expect(determineReferenceYear('2024-01-01')).toBe('2023');
    expect(determineReferenceYear('2024-06-30')).toBe('2023');
    expect(determineReferenceYear('2024-03-15')).toBe('2023');
  });

  it('clamps to 2019 for very old leases', () => {
    expect(determineReferenceYear('2018-09-01')).toBe('2019');
    expect(determineReferenceYear('2015-01-01')).toBe('2019');
  });

  it('handles 2025 lease start dates', () => {
    expect(determineReferenceYear('2025-08-01')).toBe('2025');
    expect(determineReferenceYear('2025-03-01')).toBe('2024');
  });
});
