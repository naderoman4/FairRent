import type { RentReference, ConstructionPeriod } from './types';
import { PARIS_OPENDATA_RENT_URL, API_TIMEOUT_MS, EARLIEST_REFERENCE_YEAR } from './constants';
import fallbackData from '@/data/paris-rent-references.json';

interface OpenDataRecord {
  annee: string;
  nom_quartier: string;
  id_quartier: number;
  id_zone: number;
  piece: number;
  epoque: string;
  meuble_txt: string;
  ref: number;
  max: number;
  min: number;
}

function mapRecord(record: OpenDataRecord): RentReference {
  return {
    year: record.annee,
    quarterName: record.nom_quartier,
    quarterId: record.id_quartier,
    zoneId: record.id_zone,
    numberOfRooms: record.piece,
    constructionPeriod: record.epoque as ConstructionPeriod,
    furnished: record.meuble_txt === 'meublé',
    referenceRent: record.ref,
    maxRent: record.max,
    minRent: record.min,
  };
}

export function determineReferenceYear(leaseStartDate: string): string {
  const date = new Date(leaseStartDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, so June = 5

  // References update every July 1st
  // Lease between July 1 YYYY and June 30 YYYY+1 → use YYYY
  let refYear: number;
  if (month >= 6) {
    // July or later
    refYear = year;
  } else {
    // Jan-June → use previous year
    refYear = year - 1;
  }

  if (refYear < EARLIEST_REFERENCE_YEAR) {
    refYear = EARLIEST_REFERENCE_YEAR;
  }

  return String(refYear);
}

export async function fetchRentReference(
  quarterName: string,
  numberOfRooms: number,
  constructionPeriod: ConstructionPeriod,
  furnished: boolean,
  year: string
): Promise<RentReference> {
  const rooms = Math.min(numberOfRooms, 4);
  const meuble = furnished ? 'meublé' : 'non meublé';

  // Try live API first
  try {
    const where = `nom_quartier="${quarterName}" AND annee="${year}" AND piece=${rooms} AND meuble_txt="${meuble}" AND epoque="${constructionPeriod}"`;
    const params = new URLSearchParams({
      where,
      select: 'annee,nom_quartier,id_quartier,id_zone,piece,epoque,meuble_txt,ref,max,min',
      limit: '1',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(`${PARIS_OPENDATA_RENT_URL}?${params}`, {
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return mapRecord(data.results[0]);
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Fall through to static fallback
  }

  // Fallback to static data
  return fetchFromFallback(quarterName, rooms, constructionPeriod, meuble, year);
}

function fetchFromFallback(
  quarterName: string,
  rooms: number,
  constructionPeriod: ConstructionPeriod,
  meuble: string,
  year: string
): RentReference {
  const records = fallbackData as OpenDataRecord[];

  // Try exact match first
  let match = records.find(
    (r) =>
      r.nom_quartier === quarterName &&
      r.piece === rooms &&
      r.epoque === constructionPeriod &&
      r.meuble_txt === meuble
  );

  if (!match) {
    // If year doesn't match fallback data (fallback is latest year), still use it
    match = records.find(
      (r) =>
        r.nom_quartier === quarterName &&
        r.piece === rooms &&
        r.epoque === constructionPeriod &&
        r.meuble_txt === meuble
    );
  }

  if (!match) {
    throw new Error(
      `Référence de loyer introuvable pour le quartier "${quarterName}" avec les paramètres spécifiés.`
    );
  }

  const ref = mapRecord(match);
  // Override year to the requested year (fallback may have different year)
  ref.year = year;
  return ref;
}
