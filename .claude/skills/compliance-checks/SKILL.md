# Compliance Checks

## Overview
Paris rent control compliance engine with 4-level severity (`illegal`, `red_flag`, `attention`, `ok`) and 5 categories (`rent`, `lease_validity`, `financial`, `clauses`, `decency`).

## Key Files
- `src/lib/compliance.ts` — All rule-based checks (`runAllChecks()`)
- `src/lib/types.ts` — `ComplianceIssue`, `ComplianceReport`, severity/category types
- `src/lib/report-generator.ts` — `generateReport()` with clause issue merging

## Rules
- Rent ceiling check against Paris Open Data references (loyer majoré)
- Complement loyer: requires justification + banned for DPE F/G
- DPE bans: G since 2025, F from 2028, F rent frozen since 2022
- Deposit: max 1 month (unfurnished) or 2 months (furnished)
- Agency fees: capped by zone
- Lease duration: min 3 years (unfurnished loi_1989), 1 year (furnished)
- Surface minimum: 9m²
- Mandatory rent reference mentions in lease

## Testing
- 38 unit tests in `tests/unit/compliance.test.ts`
- 3 integration tests in `tests/integration/check-rent.test.ts`
