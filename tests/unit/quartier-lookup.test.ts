import { describe, it, expect } from 'vitest';
import { findQuartier } from '@/lib/quartier-lookup';

describe('findQuartier', () => {
  it('finds a known quartier for a central Paris location', () => {
    // Opéra area — roughly quartier Gaillon (id 6)
    const result = findQuartier(48.8702, 2.3316);
    expect(result).not.toBeNull();
    expect(result!.arrondissement).toBeGreaterThanOrEqual(1);
    expect(result!.arrondissement).toBeLessThanOrEqual(20);
    expect(result!.name).toBeTruthy();
  });

  it('finds quartier Batignolles for a known address', () => {
    // Batignolles area (17e arr.)
    const result = findQuartier(48.8850, 2.3180);
    expect(result).not.toBeNull();
    expect(result!.arrondissement).toBe(17);
  });

  it('finds quartier for a Marais location', () => {
    // Le Marais area (3e/4e arr.)
    const result = findQuartier(48.8590, 2.3580);
    expect(result).not.toBeNull();
    expect([3, 4]).toContain(result!.arrondissement);
  });

  it('returns null for non-Paris coordinates', () => {
    // Lyon
    const result = findQuartier(45.7640, 4.8357);
    expect(result).toBeNull();
  });

  it('returns null for coordinates far from Paris', () => {
    // London
    const result = findQuartier(51.5074, -0.1278);
    expect(result).toBeNull();
  });
});
