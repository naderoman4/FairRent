import type { GeocodingResult } from './types';
import { GEOCODING_API_URL, GEOCODING_MIN_SCORE, PARIS_CITYCODE_PREFIX, API_TIMEOUT_MS } from './constants';

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const url = `${GEOCODING_API_URL}?q=${encodeURIComponent(address)}&limit=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('Adresse introuvable. Veuillez vérifier et réessayer.');
    }

    const feature = data.features[0];
    const props = feature.properties;
    const [longitude, latitude] = feature.geometry.coordinates;

    if (props.score < GEOCODING_MIN_SCORE) {
      throw new Error(
        `L'adresse n'a pas pu être localisée avec certitude (score: ${(props.score * 100).toFixed(0)}%). Veuillez vérifier l'adresse.`
      );
    }

    if (!props.citycode.startsWith(PARIS_CITYCODE_PREFIX)) {
      throw new Error(
        'L\'adresse ne semble pas être à Paris. FairRent ne couvre actuellement que Paris.'
      );
    }

    return {
      latitude,
      longitude,
      formattedAddress: props.label,
      postcode: props.postcode,
      citycode: props.citycode,
      district: props.district || '',
      score: props.score,
    };
  } finally {
    clearTimeout(timeout);
  }
}
