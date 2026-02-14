import type { CityAdapter } from '../types';
import { ParisAdapter } from './paris';

const adapters: Map<string, CityAdapter> = new Map();
adapters.set('paris', new ParisAdapter());

export function getAdapter(cityId: string): CityAdapter | null {
  return adapters.get(cityId) ?? null;
}

export function detectCity(citycode: string): string | null {
  if (citycode.startsWith('751')) return 'paris';
  // Future: if (citycode === '69123' || citycode === '69266') return 'lyon';
  return null;
}
