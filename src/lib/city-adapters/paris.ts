import type { CityAdapter, ConstructionPeriod, RentLookupParams, RentReference } from '../types';
import { findQuartier } from '../quartier-lookup';
import { fetchRentReference } from '../paris-opendata';
import { CONSTRUCTION_PERIODS, ROOM_CATEGORIES } from '../constants';

export class ParisAdapter implements CityAdapter {
  cityId = 'paris';
  cityName = 'Paris';
  isSupported = true;

  async resolveZone(lat: number, lon: number) {
    const quartier = findQuartier(lat, lon);
    if (!quartier) {
      throw new Error('Adresse non trouvée dans les quartiers parisiens.');
    }
    return {
      zoneId: String(quartier.id),
      zoneName: quartier.name,
    };
  }

  async fetchRentReference(params: RentLookupParams): Promise<RentReference> {
    // Resolve quartier name from zoneId
    // For Paris, zoneId is the quartier name stored during resolveZone
    return fetchRentReference(
      params.zoneId, // quartier name
      params.numberOfRooms,
      params.constructionPeriod as ConstructionPeriod,
      params.furnished,
      params.year
    );
  }

  getConstructionPeriods(): ConstructionPeriod[] {
    return CONSTRUCTION_PERIODS;
  }

  getRoomCategories(): number[] {
    return ROOM_CATEGORIES;
  }
}
