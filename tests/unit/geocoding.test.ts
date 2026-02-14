import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geocodeAddress } from '@/lib/geocoding';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeGeoResponse(overrides: Record<string, unknown> = {}) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [2.3316, 48.8702],
        },
        properties: {
          label: '10 Rue de la Paix 75002 Paris',
          score: 0.95,
          postcode: '75002',
          citycode: '75102',
          city: 'Paris',
          district: 'Paris 2e Arrondissement',
          ...overrides,
        },
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('geocodeAddress', () => {
  it('returns geocoding result for a valid Paris address', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeGeoResponse(),
    });

    const result = await geocodeAddress('10 Rue de la Paix, 75002 Paris');
    expect(result.latitude).toBeCloseTo(48.8702, 2);
    expect(result.longitude).toBeCloseTo(2.3316, 2);
    expect(result.postcode).toBe('75002');
    expect(result.score).toBe(0.95);
  });

  it('throws for non-Paris address', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeGeoResponse({ citycode: '69123' }),
    });

    await expect(geocodeAddress('1 Place Bellecour, Lyon')).rejects.toThrow(
      /ne semble pas être à Paris/
    );
  });

  it('throws for low confidence score', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeGeoResponse({ score: 0.3 }),
    });

    await expect(geocodeAddress('adresse vague')).rejects.toThrow(
      /n'a pas pu être localisée/
    );
  });

  it('throws when no results found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: 'FeatureCollection', features: [] }),
    });

    await expect(geocodeAddress('zzzzz')).rejects.toThrow(/introuvable/);
  });

  it('throws when API returns error status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(geocodeAddress('10 Rue de la Paix')).rejects.toThrow();
  });
});
