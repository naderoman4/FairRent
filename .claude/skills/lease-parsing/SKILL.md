# Lease Parsing

## Overview
Extracts lease data from PDF or pasted text using Claude API. Runs clause analysis in parallel.

## Key Files
- `src/lib/lease-parser.ts` — `parseLeaseWithClaude()`, `analyzeClausesWithClaude()`, `parseAndAnalyzeWithClaude()` (parallel)
- `src/lib/prompts/clause-analysis.ts` — Clause analysis prompt (15+ abusive patterns)
- `src/app/api/parse-lease/route.ts` — Accepts multipart/form-data (PDF) or application/json (text)
- `src/components/LeaseUpload.tsx` — PDF drag-and-drop upload
- `src/components/CopyPasteInput.tsx` — Text paste input

## Key Details
- pdf-parse v1.1.1 with dynamic import (CommonJS, v2 needs DOM)
- Claude model: `claude-sonnet-4-5-20250929`
- Extraction + clause analysis run in parallel via `Promise.all`
- JSON mode: `mode: 'full'` (extraction + clauses) or `mode: 'clauses_only'`
- 4 unit tests in `tests/unit/lease-parser.test.ts`

## Clause Analysis Patterns
- Résiliation automatique, renonciation préavis réduit, charges forfaitaires abusives
- Responsabilité dommages sans preuve, interdiction animaux absolue
- Frais de quittance, pénalités de retard excessives, clause de solidarité indéfinie
- Travaux obligatoires locataire, renonciation allocations logement
- Visite sans préavis, renouvellement conditions différentes, indexation illégale
