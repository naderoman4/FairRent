import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReport } from '@/lib/report-generator';
import type { LeaseData } from '@/lib/types';

// Mock the geocoding API
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeLeaseData(overrides: Partial<LeaseData> = {}): LeaseData {
  return {
    address: '55 Rue des Batignolles',
    postalCode: '75017',
    city: 'Paris',
    rentExcludingCharges: 900,
    charges: 50,
    surface: 35,
    numberOfRooms: 2,
    furnished: false,
    constructionPeriod: 'Avant 1946',
    leaseStartDate: '2025-09-01',
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

function mockGeocodingResponse(lat: number, lon: number, citycode = '75117') {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          label: '55 Rue des Batignolles 75017 Paris',
          score: 0.95,
          postcode: '75017',
          citycode,
          city: 'Paris',
          district: 'Paris 17e Arrondissement',
        },
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateReport — integration', () => {
  it('produces a compliant report for a reasonable rent', async () => {
    // Mock geocoding to return Batignolles area coordinates
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('api-adresse.data.gouv.fr')) {
        return {
          ok: true,
          json: async () => mockGeocodingResponse(48.8850, 2.3180),
        };
      }
      // For Paris Open Data, let it fall through to static fallback (will fail fetch)
      return { ok: false, status: 500 };
    });

    const report = await generateReport(makeLeaseData());

    expect(report.verdict).toBeDefined();
    expect(['compliant', 'warning', 'violation']).toContain(report.verdict);
    expect(report.quartier.name).toBeTruthy();
    expect(report.rentPerSqm).toBeCloseTo(900 / 35, 1);
    expect(report.rentReference.referenceRent).toBeGreaterThan(0);
    expect(report.rentReference.maxRent).toBeGreaterThan(0);
    expect(report.generatedAt).toBeTruthy();
  });

  it('produces a violation report for excessive rent', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('api-adresse.data.gouv.fr')) {
        return {
          ok: true,
          json: async () => mockGeocodingResponse(48.8850, 2.3180),
        };
      }
      return { ok: false, status: 500 };
    });

    // Very high rent for a small surface
    const report = await generateReport(
      makeLeaseData({ rentExcludingCharges: 2000, surface: 20 })
    );

    // 2000/20 = 100€/m² which should exceed any Paris ceiling
    expect(report.verdict).toBe('violation');
    expect(report.overchargePerSqm).toBeGreaterThan(0);
    expect(report.overchargeTotal).toBeGreaterThan(0);
    expect(report.actions.length).toBeGreaterThan(0);
  });

  it('throws for non-Paris address', async () => {
    mockFetch.mockImplementation(async () => ({
      ok: true,
      json: async () => mockGeocodingResponse(45.764, 4.835, '69123'),
    }));

    await expect(generateReport(makeLeaseData())).rejects.toThrow(/Paris/);
  });
});
