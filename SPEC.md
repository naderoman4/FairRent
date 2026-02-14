# FairRent — Complete Specification

## Context

Many Paris tenants pay rent above the legal ceiling without knowing it. The "encadrement des loyers" regulation caps rents per square meter based on neighborhood, construction period, number of rooms, and furnished status — but verifying compliance requires cross-referencing lease data with obscure government datasets. FairRent automates this: upload a lease PDF (or fill a form), and get an instant compliance report with actionable legal recourse.

This spec covers v1: **Paris only**, with architecture designed for future multi-city expansion.

---

## 1. User Flow

### Path A: PDF Upload
1. User lands on homepage → sees hero section with clear value proposition
2. Drags/drops (or clicks to browse) a PDF lease — max 20MB
3. Stepped progress bar: `Lecture du PDF...` → `Analyse du bail...` → `Vérification des loyers...`
4. Pre-filled editable form appears with extracted data; missing fields highlighted in orange
5. User reviews/corrects, clicks "Vérifier mon loyer"
6. Compliance report displays with verdict, details, and actions
7. User can download report as PDF

### Path B: Manual Entry
1. User clicks "Pas de PDF ? Remplissez le formulaire" link
2. Empty form with all required fields
3. User fills in lease details → same flow from step 5 above

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router, TypeScript, Server Components) |
| Styling | Tailwind CSS + shadcn/ui |
| PDF extraction | Server-side: `pdf-parse` (text layer) + `tesseract.js` (OCR fallback) |
| Lease parsing | Anthropic Claude API (`claude-sonnet-4-5-20250929`) — server-side only |
| Rent reference data | Paris Open Data API (Opendatasoft) + static fallback JSON |
| Geocoding | `api-adresse.data.gouv.fr` → point-in-polygon with quartier GeoJSON |
| Point-in-polygon | `@turf/boolean-point-in-polygon` + `@turf/helpers` |
| PDF report export | `@react-pdf/renderer` |
| Rate limiting | IP-based via custom middleware (in-memory) |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Analytics | Vercel Analytics (built-in) |
| Deployment | Vercel |

**No database.** Stateless app. No user accounts. No file storage.

---

## 3. Project Structure

```
fairrent/
├── CLAUDE.md
├── SPEC.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── playwright.config.ts
├── .env.local                  # ANTHROPIC_API_KEY
├── .gitignore
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, metadata, analytics)
│   │   ├── page.tsx            # Landing page + upload/form
│   │   ├── report/
│   │   │   └── page.tsx        # Report page (receives data via searchParams or state)
│   │   └── api/
│   │       ├── parse-lease/
│   │       │   └── route.ts    # PDF upload → extract text → LLM parse → stream response
│   │       └── check-rent/
│   │           └── route.ts    # Lease data → geocode → lookup → compliance check
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (Button, Input, Card, etc.)
│   │   ├── LeaseUpload.tsx     # Drag-and-drop PDF upload zone
│   │   ├── LeaseForm.tsx       # Editable form with all lease fields
│   │   ├── ProgressStepper.tsx # Multi-step progress indicator
│   │   ├── ComplianceReport.tsx# Full compliance report display
│   │   ├── ReportPDF.tsx       # @react-pdf/renderer document for export
│   │   ├── Verdict.tsx         # Verdict badge (✅/⚠️/❌)
│   │   ├── RentComparison.tsx  # Side-by-side lease vs. legal reference
│   │   ├── IssuesList.tsx      # List of issues found
│   │   ├── ActionSteps.tsx     # Actionable recourse steps
│   │   ├── Header.tsx          # Site header
│   │   └── Footer.tsx          # Footer with disclaimer + links
│   ├── lib/
│   │   ├── types.ts            # All shared TypeScript types/interfaces
│   │   ├── paris-opendata.ts   # Fetch rent references from Paris Open Data
│   │   ├── geocoding.ts        # Address → coordinates → quartier resolution
│   │   ├── quartier-lookup.ts  # Point-in-polygon quartier detection
│   │   ├── lease-parser.ts     # Claude API call to extract structured lease data
│   │   ├── pdf-extractor.ts    # PDF text extraction (pdf-parse + OCR fallback)
│   │   ├── compliance.ts       # All compliance check business logic
│   │   ├── report-generator.ts # Orchestrates checks → produces report data
│   │   ├── rate-limit.ts       # IP-based rate limiting middleware
│   │   ├── constants.ts        # Legal constants, thresholds, enums
│   │   └── city-adapters/      # Multi-city adapter pattern (future)
│   │       ├── index.ts        # CityAdapter interface + registry
│   │       └── paris.ts        # Paris adapter implementation
│   └── data/
│       ├── paris-rent-references.json  # Static fallback: all Paris rent data
│       └── paris-quartiers.geojson     # Static: 80 quartier polygons
├── tests/
│   ├── unit/
│   │   ├── compliance.test.ts
│   │   ├── geocoding.test.ts
│   │   ├── quartier-lookup.test.ts
│   │   └── lease-parser.test.ts
│   ├── integration/
│   │   └── check-rent.test.ts
│   └── e2e/
│       └── full-flow.spec.ts
```

---

## 4. TypeScript Types (`src/lib/types.ts`)

```typescript
// ─── Lease Data (extracted from PDF or manual entry) ───
export interface LeaseData {
  address: string;
  postalCode: string;
  city: string;
  rentExcludingCharges: number;    // Loyer hors charges (€/month)
  charges: number | null;          // Charges (€/month)
  surface: number;                 // Surface habitable (m²)
  numberOfRooms: number;           // Nombre de pièces (1, 2, 3, 4+)
  furnished: boolean;              // Meublé or not
  constructionPeriod: ConstructionPeriod;
  leaseStartDate: string;          // ISO date string
  complementLoyer: number | null;  // Complément de loyer (€/month), null if none
  complementLoyerJustification: string | null;
  mentionsReferenceRent: boolean | null;     // Does lease mention loyer de référence?
  mentionsMaxRent: boolean | null;           // Does lease mention loyer de référence majoré?
  dpeClass: DPEClass | null;       // Energy performance class (A-G)
}

export type ConstructionPeriod =
  | 'Avant 1946'
  | '1946-1970'
  | '1971-1990'
  | 'Apres 1990';

export type DPEClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// ─── Rent Reference (from Paris Open Data) ───
export interface RentReference {
  year: string;
  quarterName: string;
  quarterId: number;
  zoneId: number;
  numberOfRooms: number;
  constructionPeriod: ConstructionPeriod;
  furnished: boolean;
  referenceRent: number;     // ref: loyer de référence (€/m²)
  maxRent: number;           // max: loyer de référence majoré (€/m²)
  minRent: number;           // min: loyer de référence minoré (€/m²)
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

export interface ComplianceIssue {
  id: string;
  severity: 'info' | 'warning' | 'error';
  title: string;           // Short title in French
  description: string;     // Detailed explanation in French
  legalReference: string;  // Law article reference
  legalUrl?: string;       // Link to official source
}

export interface ComplianceReport {
  verdict: Verdict;
  leaseData: LeaseData;
  rentReference: RentReference;
  quartier: Quartier;

  // Computed values
  rentPerSqm: number;               // Actual rent per m²
  maxLegalRentPerSqm: number;       // Legal ceiling per m²
  maxLegalRentTotal: number;         // Legal ceiling × surface
  overchargePerSqm: number | null;  // Amount over ceiling, null if compliant
  overchargeTotal: number | null;    // Total monthly overcharge

  issues: ComplianceIssue[];

  // Action steps
  actions: ActionStep[];

  generatedAt: string;              // ISO timestamp
}

export interface ActionStep {
  title: string;
  description: string;
  url?: string;
  deadline?: string;       // e.g., "3 mois après la signature du bail"
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
export interface ParseLeaseRequest {
  // multipart/form-data with PDF file
}

export interface ParseLeaseResponse {
  success: boolean;
  data?: Partial<LeaseData>;
  rawText?: string;        // For debugging
  confidence: Record<keyof LeaseData, number>;  // 0-1 confidence per field
  error?: string;
}

export interface CheckRentRequest {
  leaseData: LeaseData;
}

export interface CheckRentResponse {
  success: boolean;
  report?: ComplianceReport;
  error?: string;
}
```

---

## 5. API Routes

### `POST /api/parse-lease` — PDF Upload & Extraction

**Input:** `multipart/form-data` with a single PDF file (max 20MB)

**Processing (streaming response via ReadableStream):**

1. **Validate**: Check file type (PDF), size (≤20MB)
2. **Extract text**: Use `pdf-parse` to get text content
   - If text layer is empty/minimal (<100 chars): OCR fallback with `tesseract.js` (French language pack)
3. **LLM Parse**: Send extracted text to Claude API with structured extraction prompt
4. **Stream progress**: Send SSE-style progress events: `{step: "extracting" | "parsing" | "done", data?: Partial<LeaseData>}`
5. **Return**: Extracted `LeaseData` (partial — missing fields are null) + confidence scores

**Rate limit**: 10 requests per IP per day

**Claude prompt strategy:**
```
System: You are a French lease document analyzer. Extract the following fields from
the lease text. Return a JSON object. For fields you cannot find, return null.
For each field, also provide a confidence score (0-1).

Fields to extract:
- address (full address of the rented property)
- postalCode
- city
- rentExcludingCharges (loyer hors charges mensuel in euros)
- charges (provision pour charges in euros)
- surface (surface habitable in m²)
- numberOfRooms (nombre de pièces principales — count, not including kitchen/bathroom)
- furnished (boolean: is it a meublé?)
- constructionPeriod (one of: "Avant 1946", "1946-1970", "1971-1990", "Apres 1990")
- leaseStartDate (date de prise d'effet du bail, ISO format)
- complementLoyer (complément de loyer in euros, null if none)
- complementLoyerJustification (justification text for complément de loyer)
- mentionsReferenceRent (does the lease text mention "loyer de référence"?)
- mentionsMaxRent (does the lease text mention "loyer de référence majoré"?)
- dpeClass (DPE energy class A-G if mentioned)

User: [extracted lease text]
```

### `POST /api/check-rent` — Compliance Check

**Input:** `CheckRentRequest` (complete `LeaseData` from the form)

**Processing:**
1. **Geocode address** → get coordinates via `api-adresse.data.gouv.fr`
2. **Resolve quartier** → point-in-polygon against Paris quartier GeoJSON
3. **Determine applicable year** → based on `leaseStartDate` (reference period is July 1 to June 30)
4. **Fetch rent reference** → query Paris Open Data API (with static fallback)
5. **Run compliance checks** → see §7 below
6. **Generate report** → assemble `ComplianceReport`

**Response:** `CheckRentResponse` with full `ComplianceReport`

---

## 6. External API Integration

### 6.1 Paris Open Data — Rent References

**Endpoint:** `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/logement-encadrement-des-loyers/records`

**Query example:**
```
?where=nom_quartier="Batignolles" AND annee="2024" AND piece=2 AND meuble_txt="non meublé" AND epoque="Avant 1946"
&select=annee,nom_quartier,id_quartier,id_zone,piece,epoque,meuble_txt,ref,max,min
&limit=1
```

**Response format:**
```json
{
  "total_count": 1,
  "results": [
    {
      "annee": "2024",
      "id_zone": 10,
      "id_quartier": 67,
      "nom_quartier": "Batignolles",
      "piece": 2,
      "epoque": "1946-1970",
      "meuble_txt": "non meublé",
      "ref": 23.3,
      "max": 28.0,
      "min": 16.3
    }
  ]
}
```

**Field mapping:**
| API Field | Our Field |
|-----------|-----------|
| `ref` | `referenceRent` |
| `max` | `maxRent` (= ref × 1.2, the legal ceiling) |
| `min` | `minRent` (= ref × 0.7) |
| `annee` | `year` |
| `nom_quartier` | `quarterName` |
| `piece` | `numberOfRooms` (4 = "4 and more") |
| `epoque` | `constructionPeriod` |
| `meuble_txt` | `furnished` ("meublé" / "non meublé") |

**Enumeration values:**
- `annee`: "2019", "2020", "2021", "2022", "2023", "2024", "2025"
- `epoque`: "Avant 1946", "1946-1970", "1971-1990", "Apres 1990"
- `meuble_txt`: "meublé", "non meublé"
- `piece`: 1, 2, 3, 4 (4 means "4 rooms and more")

**Fallback:** Bundle `src/data/paris-rent-references.json` with the latest year's data (2,560 records = 80 quartiers × 4 epoques × 4 room counts × 2 furnished types). Fetch from API first; if it fails, use static data.

**Year determination logic:**
- References update every July 1st
- For a lease starting between July 1 YYYY and June 30 YYYY+1, use `annee = YYYY`
- For a lease starting before July 1 2019, use `annee = "2019"` (earliest available)

### 6.2 Paris Quartiers GeoJSON

**Endpoint:** `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/quartier_paris/exports/geojson`

**Usage:** Download once and bundle as `src/data/paris-quartiers.geojson`. Use Turf.js point-in-polygon to find which quartier contains the geocoded coordinates.

**Key fields:**
- `c_qu` — quartier ID (1-80, as string)
- `l_qu` — quartier name (e.g., "Batignolles")
- `c_ar` — arrondissement number (1-20)

**Relationship:** `c_qu` maps to `id_quartier` in the rent reference dataset.

### 6.3 French Geocoding API

**Endpoint:** `https://api-adresse.data.gouv.fr/search/?q={address}&limit=1`

**Response format:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [2.316931, 48.87063]
      },
      "properties": {
        "label": "55 Rue du Faubourg Saint-Honore 75008 Paris",
        "score": 0.9762,
        "housenumber": "55",
        "postcode": "75008",
        "citycode": "75108",
        "city": "Paris",
        "district": "Paris 8e Arrondissement",
        "context": "75, Paris, Ile-de-France",
        "type": "housenumber",
        "street": "Rue du Faubourg Saint-Honore"
      }
    }
  ]
}
```

**Validation:**
- Check `score > 0.5` for confidence
- Check `citycode` starts with `"751"` to confirm address is in Paris
- If score is low or city is not Paris, return an error asking user to verify the address

---

## 7. Compliance Check Business Logic (`src/lib/compliance.ts`)

### Check 1: Rent Ceiling (CRITICAL)

```
rentPerSqm = leaseData.rentExcludingCharges / leaseData.surface
maxAllowed = rentReference.maxRent  // loyer de référence majoré

if (rentPerSqm > maxAllowed):
    → VIOLATION: "Dépassement du loyer de référence majoré"
    → overcharge = (rentPerSqm - maxAllowed) × surface per month
```

**Severity:** `error` if exceeded, `info` if compliant

### Check 2: Complément de Loyer

If `complementLoyer` is declared:
- **Base rent must equal maxRent**: The base rent (hors complément) must be ≤ `ref_majore`. If not → `error`
- **Post-August 18, 2022 rules**: If lease starts after 2022-08-18 AND any of these apply, complément is **forbidden**:
  - DPE class F or G
  - (Other criteria: we ask about DPE in the form; for other criteria like humidity/shared toilets, we add a note suggesting the tenant check)
- If complément exists and DPE is F or G → `error`: "Le complément de loyer est interdit pour les logements classés F ou G au DPE"

### Check 3: Mandatory Lease Mentions

By law (Article 3-3 loi 89-462), the lease must mention:
- The loyer de référence
- The loyer de référence majoré

If `mentionsReferenceRent === false` → `warning`: "Le bail doit mentionner le loyer de référence"
If `mentionsMaxRent === false` → `warning`: "Le bail doit mentionner le loyer de référence majoré"
If null (unknown) → `info`: note that these mentions are legally required

### Check 4: Surface Plausibility

Basic sanity check:
- If `surface < 9` → `warning`: "La surface habitable semble très faible (minimum légal = 9m² avec hauteur sous plafond ≥ 2.20m)"
- If `rentPerSqm` is more than 3× the `maxRent` → `warning`: "Le loyer au m² semble anormalement élevé — vérifiez la surface déclarée"

### Check 5: DPE Warning

- If DPE is G and lease starts after 2025-01-01 → `warning`: "Depuis le 1er janvier 2025, les logements classés G ne peuvent plus être mis en location (loi Climat et Résilience)"
- If DPE is F and lease starts after 2028-01-01 → `warning` (future-proofing)

### Verdict Determination

```
if any issue has severity 'error' → verdict = 'violation'
else if any issue has severity 'warning' → verdict = 'warning'
else → verdict = 'compliant'
```

---

## 8. Action Steps (Legal Recourse)

Always included in report when verdict is `warning` or `violation`:

1. **Mise en demeure du bailleur**
   - Description: Send a registered letter (LRAR) to the landlord requesting rent reduction
   - Deadline: Can be done at any time during the lease

2. **Saisir la Commission départementale de conciliation (CDC)**
   - URL: `https://www.service-public.fr/particuliers/vosdroits/F1216`
   - Description: Free mediation service. Mandatory before going to court.
   - Deadline: No deadline for rent ceiling; 3 months from lease signing for complément de loyer

3. **Saisir le juge des contentieux de la protection**
   - Description: If conciliation fails, take the case to court
   - URL: `https://www.justice.fr/`

4. **Signaler sur Paris.fr**
   - URL: `https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-aout-2712`

5. **Contacter l'ADIL 75**
   - Description: Free legal advice on housing rights
   - URL: `https://www.adil75.org/`
   - Phone: 01 42 79 50 34

### Deadline specifics for complément de loyer:
- Tenant has **3 months from lease signing** to contest the complément de loyer before the CDC
- After 3 months: can still go to court directly (within the lease term)

---

## 9. UI/UX Design

### Design Direction: Modern & Friendly
- Rounded corners, soft shadows
- Color palette: Blue primary (#2563EB), warm accents (amber for warnings, red for violations, green for compliant)
- Clean typography: Inter or similar sans-serif
- Illustrations or icons for the stepper (optional)
- Responsive: mobile-first design

### Landing Page (`/`)
```
┌──────────────────────────────────────────┐
│  Header: FairRent logo + tagline         │
├──────────────────────────────────────────┤
│  Hero Section:                           │
│  "Votre loyer est-il légal ?"           │
│  Subtitle explaining the tool            │
│                                          │
│  ┌────────────────────────────────┐      │
│  │  Drag & drop zone for PDF     │      │
│  │  "Glissez votre bail ici"     │      │
│  │  [ou parcourir vos fichiers]  │      │
│  └────────────────────────────────┘      │
│                                          │
│  "Pas de PDF ? Remplissez le formulaire" │
│                                          │
│  Trust indicators:                       │
│  🔒 Aucun fichier conservé              │
│  ⚡ Résultat en moins d'une minute      │
│  📊 Données officielles Paris            │
├──────────────────────────────────────────┤
│  How it works (3-step visual)            │
│  1. Importez  2. Vérifiez  3. Agissez   │
├──────────────────────────────────────────┤
│  Footer: Disclaimer + legal mentions     │
│  "Outil informatif — ne constitue pas    │
│   un avis juridique"                     │
└──────────────────────────────────────────┘
```

### Editable Form (after extraction or manual)
Fields grouped in sections:
- **Le logement**: Address, postal code, surface, rooms, construction period, furnished, DPE
- **Le bail**: Lease start date, rent excluding charges, charges, complément de loyer + justification
- **Mentions légales**: Does the lease mention loyer de référence? Loyer de référence majoré?

Missing/uncertain fields highlighted with orange border + tooltip: "Ce champ n'a pas pu être extrait automatiquement"

### Report Page
```
┌──────────────────────────────────────────┐
│  Verdict Banner:                         │
│  ✅ Conforme / ⚠️ Points d'attention /  │
│  ❌ Dépassement du loyer                │
│  (with total overcharge if applicable)   │
├──────────────────────────────────────────┤
│  Rent Comparison Card:                   │
│  Your rent: XX.XX €/m² (XX€/month)      │
│  Legal ceiling: XX.XX €/m²              │
│  Reference rent: XX.XX €/m²             │
│  Quartier: [name] | Period: [epoch]     │
├──────────────────────────────────────────┤
│  Issues Found:                           │
│  🔴 [Issue title] — [explanation]       │
│  🟡 [Issue title] — [explanation]       │
│  ℹ️  [Issue title] — [explanation]       │
├──────────────────────────────────────────┤
│  Que faire ?                             │
│  Numbered action steps with links        │
├──────────────────────────────────────────┤
│  [Télécharger le rapport PDF]            │
│  [Vérifier un autre bail]               │
└──────────────────────────────────────────┘
```

---

## 10. Streaming Architecture

The `/api/parse-lease` route uses a `ReadableStream` to send progress events:

```typescript
// Server: stream progress via SSE-like format
const stream = new ReadableStream({
  async start(controller) {
    controller.enqueue(encode({ step: 'extracting', message: 'Lecture du PDF...' }));
    const text = await extractPdfText(file);

    controller.enqueue(encode({ step: 'parsing', message: 'Analyse du bail...' }));
    const leaseData = await parseLeaseWithClaude(text);

    controller.enqueue(encode({ step: 'done', data: leaseData }));
    controller.close();
  }
});

return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' }
});
```

Client-side: use `fetch` + `ReadableStream` reader to update the `ProgressStepper` component in real-time.

---

## 11. Rate Limiting (`src/lib/rate-limit.ts`)

Simple in-memory IP-based rate limiter:
- 10 requests per IP per day to `/api/parse-lease`
- No limit on `/api/check-rent` (lightweight, no API costs)
- Uses a `Map<string, { count: number, resetAt: number }>` in memory
- Resets daily at midnight UTC
- Returns `429 Too Many Requests` with French message: "Vous avez atteint la limite de 10 analyses par jour. Réessayez demain."

Note: In-memory rate limiting resets on serverless cold starts. Acceptable for v1; for production scale, consider Vercel KV or Upstash Redis.

---

## 12. PDF Report Export (`src/components/ReportPDF.tsx`)

Using `@react-pdf/renderer` to generate a downloadable PDF:

**Content:**
- Header with FairRent logo/name + generation date
- Verdict section with color coding
- Lease data summary table
- Rent reference comparison table
- Issues list with explanations
- Action steps with URLs
- Footer with disclaimer

**Triggered by:** "Télécharger le rapport PDF" button on the report page using `<PDFDownloadLink>`.

---

## 13. Static Fallback Data

### `src/data/paris-rent-references.json`
- Contains the latest year's rent reference data for all 80 quartiers
- 2,560 records (80 × 4 epoques × 4 room counts × 2 furnished types)
- Generated by fetching from Paris Open Data API at build time (or manually)
- Updated when new reference period starts (every July 1st)

### `src/data/paris-quartiers.geojson`
- GeoJSON FeatureCollection with all 80 quartier polygons
- Downloaded from Paris Open Data quartier_paris dataset
- Static — quartier boundaries don't change

**Fallback logic:** Try the live API first with a 5-second timeout. If it fails or times out, fall back to static data with a note: "Données de référence en cache — vérifiez sur opendata.paris.fr pour les dernières mises à jour."

---

## 14. Security & Privacy

- **No file storage**: PDF is processed in memory in the API route, then discarded
- **No database**: No user data persisted anywhere
- **No cookies**: No tracking cookies, no session
- **API key protection**: `ANTHROPIC_API_KEY` in `.env.local`, never exposed client-side
- **Input validation**: Sanitize all form inputs; validate PDF MIME type and size
- **CORS**: Default Next.js API route CORS (same-origin)
- **Rate limiting**: Prevent API abuse
- **Privacy notice**: Displayed prominently: "Votre bail est analysé en temps réel et n'est jamais conservé sur nos serveurs."

---

## 15. Multi-City Architecture (Future)

Although v1 is Paris-only, the code is structured for extension:

```typescript
// src/lib/city-adapters/index.ts
export interface CityAdapter {
  cityId: string;                    // e.g., "paris", "lyon"
  cityName: string;                  // e.g., "Paris", "Lyon"
  supportedYears: string[];          // ["2019", "2020", ...]

  resolveZone(lat: number, lon: number): Promise<ZoneResult>;
  fetchRentReference(params: RentLookupParams): Promise<RentReference>;
  getConstructionPeriods(): string[];
  getRoomCategories(): number[];
}

// Registry
const adapters: Map<string, CityAdapter> = new Map();
adapters.set('paris', new ParisAdapter());
// Future: adapters.set('lyon', new LyonAdapter());

export function getAdapter(cityId: string): CityAdapter | null {
  return adapters.get(cityId) ?? null;
}

export function detectCity(citycode: string): string | null {
  if (citycode.startsWith('751')) return 'paris';
  // Future: if (citycode === '69123' || citycode === '69266') return 'lyon';
  return null;
}
```

**Future cities and data sources:**
| Territory | Data Quality | Source |
|-----------|-------------|--------|
| Lyon + Villeurbanne | Good (WFS API) | Grand Lyon WFS + data.gouv.fr |
| Lille + Hellemmes + Lomme | Good (Opendatasoft) | OpenData MEL + data.gouv.fr |
| Bordeaux | Good (CSV) | data.gouv.fr |
| Montpellier | Moderate (CSV) | data.gouv.fr |
| Plaine Commune (9 communes) | Moderate (KML) | DRIHL + data.gouv.fr |
| Est Ensemble (9 communes) | Moderate (KML) | DRIHL + data.gouv.fr |
| Pays Basque (24 communes) | Limited (PDF) | Prefectural decrees |
| Grenoble (21 communes) | Limited (PDF) | Prefectural decrees |

---

## 16. Testing Strategy

### Unit Tests (Vitest)

**`tests/unit/compliance.test.ts`** — Core business logic:
- Rent ceiling check: compliant, borderline, violation
- Complément de loyer: valid, invalid base rent, forbidden with DPE F/G
- Mandatory mentions: present, absent, unknown
- Surface plausibility: normal, too small, suspicious rent/m²
- DPE restrictions: G after 2025, F after 2028
- Verdict determination: all combinations

**`tests/unit/quartier-lookup.test.ts`**:
- Known addresses → correct quartier
- Edge cases: near quartier boundaries
- Non-Paris coordinates → error

**`tests/unit/geocoding.test.ts`** (with mocked HTTP):
- Valid Paris address → coordinates
- Non-Paris address → rejection
- Low confidence score → warning
- API failure → error handling

### Integration Tests (Vitest)

**`tests/integration/check-rent.test.ts`**:
- Full flow: address → geocode → quartier → rent lookup → compliance check
- Uses mocked external APIs but real business logic

### E2E Tests (Playwright)

**`tests/e2e/full-flow.spec.ts`**:
- Upload a sample PDF → verify form pre-fill → submit → verify report
- Manual form entry → submit → verify report
- Error states: invalid file, non-Paris address

---

## 17. Environment & Deployment

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Vercel Configuration
- Framework: Next.js (auto-detected)
- Node.js 20+
- `maxDuration` on API routes: not needed (using streaming)
- Environment variable: `ANTHROPIC_API_KEY` set in Vercel dashboard

### Build Commands
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 18. Key Legal References

| Topic | Law | Article |
|-------|-----|---------|
| Rent control framework | Loi ELAN (2018) | Art. 140 |
| Rent ceiling | Loi du 6 juillet 1989 | Art. 17 |
| Complément de loyer | Loi du 6 juillet 1989 | Art. 17 §II |
| Complément de loyer restrictions (2022) | Loi 3DS | Art. 159 |
| Mandatory lease mentions | Loi du 6 juillet 1989 | Art. 3 |
| DPE rental ban | Loi Climat et Résilience (2021) | Art. 160 |
| Surface habitable minimum | Code de la construction | Art. R111-2 |

---

## 19. Implementation Order

1. **Project scaffolding**: Next.js + Tailwind + shadcn/ui + CLAUDE.md
2. **Types & constants**: `types.ts`, `constants.ts`
3. **Static data**: Download and bundle Paris quartier GeoJSON + rent reference JSON
4. **Core library**: `geocoding.ts`, `quartier-lookup.ts`, `paris-opendata.ts`
5. **Compliance logic**: `compliance.ts`, `report-generator.ts`
6. **API route — check-rent**: Manual entry flow working end-to-end
7. **UI — form + report**: `LeaseForm.tsx`, `ComplianceReport.tsx`, all sub-components
8. **PDF extraction**: `pdf-extractor.ts`, `lease-parser.ts`
9. **API route — parse-lease**: Streaming upload flow
10. **UI — upload + progress**: `LeaseUpload.tsx`, `ProgressStepper.tsx`
11. **PDF export**: `ReportPDF.tsx`
12. **Rate limiting**: `rate-limit.ts`
13. **City adapter pattern**: `city-adapters/` structure
14. **Tests**: Unit → integration → E2E
15. **Polish**: Error handling, loading states, mobile responsive, disclaimer
16. **Deploy**: Git repo, Vercel connection, env vars
