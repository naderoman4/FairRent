import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { Quartier } from './types';
import quartiersGeoJSON from '@/data/paris-quartiers.geojson';

interface QuartierFeature {
  type: 'Feature';
  properties: {
    c_qu: string;
    l_qu: string;
    c_ar: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface QuartierFeatureCollection {
  type: 'FeatureCollection';
  features: QuartierFeature[];
}

const geoData = quartiersGeoJSON as unknown as QuartierFeatureCollection;

export function findQuartier(latitude: number, longitude: number): Quartier | null {
  const pt = point([longitude, latitude]);

  for (const feature of geoData.features) {
    if (booleanPointInPolygon(pt, feature as any)) {
      const quarterId = parseInt(feature.properties.c_qu, 10);
      return {
        id: quarterId,
        name: feature.properties.l_qu,
        arrondissement: feature.properties.c_ar,
        zoneId: quarterId, // zoneId uses id_zone from rent data; we'll map via quartier name
      };
    }
  }

  return null;
}
