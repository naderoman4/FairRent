// ─── Lease Data (extracted from PDF or manual entry) ───
export interface LeaseData {
  address: string;
  postalCode: string;
  city: string;
  rentExcludingCharges: number;
  charges: number | null;
  surface: number;
  numberOfRooms: number;
  furnished: boolean;
  constructionPeriod: ConstructionPeriod;
  leaseStartDate: string;
  complementLoyer: number | null;
  complementLoyerJustification: string | null;
  mentionsReferenceRent: boolean | null;
  mentionsMaxRent: boolean | null;
  dpeClass: DPEClass | null;
  depositAmount: number | null;
  agencyFees: number | null;
  leaseType: LeaseType | null;
  leaseDuration: number | null;
  clauseText: string | null;
}

export type ConstructionPeriod =
  | 'Avant 1946'
  | '1946-1970'
  | '1971-1990'
  | 'Apres 1990';

export type DPEClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type LeaseType = 'loi_1989' | 'mobilite' | 'code_civil' | 'other';

// ─── Rent Reference (from Paris Open Data) ───
export interface RentReference {
  year: string;
  quarterName: string;
  quarterId: number;
  zoneId: number;
  numberOfRooms: number;
  constructionPeriod: ConstructionPeriod;
  furnished: boolean;
  referenceRent: number;
  maxRent: number;
  minRent: number;
}

// ─── Geocoding Result ───
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  postcode: string;
  citycode: string;
  district: string;
  score: number;
}

// ─── Quartier ───
export interface Quartier {
  id: number;
  name: string;
  arrondissement: number;
  zoneId: number;
}

// ─── Compliance Report ───
export type Verdict = 'compliant' | 'warning' | 'violation';

export type IssueSeverity = 'illegal' | 'red_flag' | 'attention' | 'ok';

export type IssueCategory = 'rent' | 'lease_validity' | 'financial' | 'clauses' | 'decency';

export interface ComplianceIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  legalReference: string;
  legalUrl?: string;
  recommendation?: string;
}

export interface ComplianceReport {
  verdict: Verdict;
  leaseData: LeaseData;
  rentReference: RentReference;
  quartier: Quartier;

  rentPerSqm: number;
  maxLegalRentPerSqm: number;
  maxLegalRentTotal: number;
  overchargePerSqm: number | null;
  overchargeTotal: number | null;

  issues: ComplianceIssue[];
  actions: ActionStep[];
  generatedAt: string;
}

export interface ActionStep {
  title: string;
  description: string;
  url?: string;
  deadline?: string;
}

// ─── Clause Analysis ───
export interface ClauseAnalysisResult {
  issues: ComplianceIssue[];
  rawAnalysis: string;
}

// ─── City Adapter Interface (for future multi-city) ───
export interface CityAdapter {
  cityId: string;
  cityName: string;
  isSupported: boolean;

  resolveZone(lat: number, lon: number): Promise<{ zoneId: string; zoneName: string }>;
  fetchRentReference(params: RentLookupParams): Promise<RentReference>;
  getConstructionPeriods(): ConstructionPeriod[];
  getRoomCategories(): number[];
}

export interface RentLookupParams {
  zoneId: string;
  numberOfRooms: number;
  constructionPeriod: string;
  furnished: boolean;
  year: string;
}

// ─── API Request/Response types ───
export interface ParseLeaseResponse {
  success: boolean;
  data?: Partial<LeaseData>;
  rawText?: string;
  confidence: Record<string, number>;
  clauseIssues?: ComplianceIssue[];
  error?: string;
}

export interface CheckRentRequest {
  leaseData: LeaseData;
  clauseIssues?: ComplianceIssue[];
}

export interface CheckRentResponse {
  success: boolean;
  report?: ComplianceReport;
  error?: string;
}
