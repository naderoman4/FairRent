import type { ConstructionPeriod, DPEClass, ActionStep } from './types';

// ─── Construction Periods ───
export const CONSTRUCTION_PERIODS: ConstructionPeriod[] = [
  'Avant 1946',
  '1946-1970',
  '1971-1990',
  'Apres 1990',
];

// ─── Room categories in Paris Open Data ───
export const ROOM_CATEGORIES = [1, 2, 3, 4]; // 4 means "4 and more"

// ─── DPE Classes ───
export const DPE_CLASSES: DPEClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ─── Paris Open Data ───
export const PARIS_OPENDATA_RENT_URL =
  'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/logement-encadrement-des-loyers/records';

export const PARIS_QUARTIERS_GEOJSON_URL =
  'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/quartier_paris/exports/geojson';

export const GEOCODING_API_URL = 'https://api-adresse.data.gouv.fr/search/';

// ─── API Timeouts ───
export const API_TIMEOUT_MS = 5000;

// ─── Rate Limiting ───
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── PDF Upload ───
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const MIN_TEXT_LENGTH_FOR_OCR = 100;

// ─── Earliest available rent reference year ───
export const EARLIEST_REFERENCE_YEAR = 2019;

// ─── Geocoding thresholds ───
export const GEOCODING_MIN_SCORE = 0.5;
export const PARIS_CITYCODE_PREFIX = '751';

// ─── Compliance thresholds ───
export const MIN_LEGAL_SURFACE = 9;
export const SUSPICIOUS_RENT_MULTIPLIER = 3;

// ─── Legal dates ───
export const COMPLEMENT_LOYER_DPE_BAN_DATE = '2022-08-18';
export const DPE_G_BAN_DATE = '2025-01-01';
export const DPE_F_BAN_DATE = '2028-01-01';

// ─── Action steps for violations/warnings ───
export function getActionSteps(hasComplementLoyer: boolean): ActionStep[] {
  const steps: ActionStep[] = [
    {
      title: 'Mise en demeure du bailleur',
      description:
        'Envoyez une lettre recommandée avec accusé de réception (LRAR) à votre bailleur pour demander une réduction de loyer au niveau légal.',
      deadline: 'Peut être fait à tout moment pendant le bail',
    },
    {
      title: 'Saisir la Commission départementale de conciliation (CDC)',
      description:
        'Service gratuit de médiation obligatoire avant toute action en justice. La CDC tentera de trouver un accord amiable.',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F1216',
      deadline: hasComplementLoyer
        ? '3 mois après la signature du bail pour le complément de loyer'
        : 'Pas de délai pour le dépassement du loyer de référence majoré',
    },
    {
      title: 'Saisir le juge des contentieux de la protection',
      description:
        'Si la conciliation échoue, vous pouvez porter l\'affaire devant le tribunal judiciaire.',
      url: 'https://www.justice.fr/',
    },
    {
      title: 'Signaler sur Paris.fr',
      description:
        'Signalez le non-respect de l\'encadrement des loyers à la Ville de Paris.',
      url: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712',
    },
    {
      title: 'Contacter l\'ADIL 75',
      description:
        'L\'Agence Départementale d\'Information sur le Logement vous offre des conseils juridiques gratuits. Tél : 01 42 79 50 34',
      url: 'https://www.adil75.org/',
    },
  ];

  return steps;
}
