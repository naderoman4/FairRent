# Lease Generation

## Overview
5-step wizard generating loi ALUR compliant lease PDFs for landlords/agencies. Costs 2 credits.

## Key Files
- `src/components/lease-gen/LeaseGenWizard.tsx` — Main wizard orchestrator
- `src/components/lease-gen/PropertyStep.tsx` — Property info (uses AddressAutocomplete)
- `src/components/lease-gen/PartiesStep.tsx` — Landlord + tenant + guarantor
- `src/components/lease-gen/FinancialStep.tsx` — Rent, charges, deposit (with rent reference suggestion)
- `src/components/lease-gen/TermsStep.tsx` — Duration, start date, special conditions
- `src/components/lease-gen/ReviewStep.tsx` — Summary with compliance pre-check warnings
- `src/components/lease-gen/LeasePDFContent.tsx` — @react-pdf/renderer Document
- `src/components/lease-gen/LeasePDF.tsx` — Dynamic import wrapper (no SSR)
- `src/lib/lease-generator.ts` — LLM processing for special conditions/complement justification
- `src/lib/prompts/lease-generation.ts` — Claude prompt template
- `src/lib/types-lease-gen.ts` — Type definitions (LeaseGenData, PropertyData, etc.)
- `src/app/api/generate-lease/route.ts` — API: auth + LLM + credit deduction + save
- `src/app/(dashboard)/dashboard/generer/page.tsx` — Dashboard page

## Compliance Pre-check
Warnings computed before generation: rent over max, deposit excessive, DPE G ban, surface < 9m², lease duration below minimum.

## PDF Pattern
Uses `@react-pdf/renderer` with dynamic import (same as ReportPDF). Multi-page: main contract + special conditions page.
