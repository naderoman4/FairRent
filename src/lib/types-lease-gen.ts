import type { ConstructionPeriod, DPEClass } from './types';

export interface PropertyData {
  address: string;
  postalCode: string;
  city: string;
  surface: number;
  numberOfRooms: number;
  furnished: boolean;
  constructionPeriod: ConstructionPeriod;
  dpeClass: DPEClass | null;
  floor: number | null;
  totalFloors: number | null;
  description: string;
}

export interface PartyInfo {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
}

export interface PartiesData {
  landlord: PartyInfo;
  tenant: PartyInfo;
  guarantor: PartyInfo | null;
}

export interface FinancialData {
  rentExcludingCharges: number;
  charges: number;
  depositAmount: number;
  complementLoyer: number | null;
  complementLoyerJustification: string | null;
  paymentDay: number;
  paymentMethod: 'virement' | 'prelevement' | 'cheque' | 'especes';
}

export interface LeaseTerms {
  startDate: string;
  duration: number; // in years
  specialConditions: string;
}

export interface LeaseGenData {
  property: PropertyData;
  parties: PartiesData;
  financial: FinancialData;
  terms: LeaseTerms;
}

export interface GeneratedLeaseResult {
  id: string;
  data: LeaseGenData;
  complianceWarnings: string[];
  generatedAt: string;
}
