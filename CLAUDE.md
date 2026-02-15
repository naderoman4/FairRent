# FairRent

Paris rent control compliance checker. Tenants verify their rent against official legal ceilings.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (includes sitemap generation via postbuild)
- `npm run typecheck` — TypeScript check
- `npm test` — run unit + integration tests (vitest, 55 tests)
- `npm run test:e2e` — run Playwright E2E tests (requires dev server)
- `npm run lint` — ESLint

## Architecture
- **Next.js 14 App Router** with TypeScript, Tailwind CSS, shadcn/ui
- **No database** — fully stateless, no user accounts, no file storage
- **Two API routes**:
  - `/api/parse-lease` — accepts PDF (multipart) or text (JSON), runs Claude extraction + clause analysis, streaming response
  - `/api/check-rent` — accepts LeaseData + optional clauseIssues, returns compliance report
- **Static data fallback**: `src/data/paris-rent-references.json` (2,560 records) and `src/data/paris-quartiers.geojson` (80 quartiers)
- **City adapter pattern** in `src/lib/city-adapters/` for future multi-city support
- **MDX guide pages** at `/guides/*` — 8 SEO content pages using `@next/mdx`
- **Landing pages** at `/lp/*` — 2 SEA pages with `noindex`, minimal layout
- **LLM discovery** — `llms.txt` and `llms-full.txt` in public/

## Key Conventions
- All user-facing text is in **French**
- Business logic lives in `src/lib/`, UI in `src/components/`
- Types are centralized in `src/lib/types.ts`
- Tests: `tests/unit/` (vitest), `tests/integration/` (vitest), `tests/e2e/` (playwright)
- PDF extraction uses pdf-parse v1 (CommonJS, dynamic import)
- GeoJSON loaded as JSON via webpack config in next.config.mjs and vitest plugin
- The `@react-pdf/renderer` is dynamically imported client-side to avoid SSR issues
- next.config.mjs uses `@next/mdx` wrapper — do not convert to .ts

## Input Modes
Three ways to analyze a lease:
1. **PDF upload** — drag-and-drop, extracts data + clause analysis via Claude API
2. **Manual wizard** — 4-step form (property, financial, lease, optional clause text)
3. **Copy-paste** — paste lease text for full extraction + clause analysis

All flows navigate to `/report` with data in `sessionStorage`.

## Compliance Engine
- **4-level severity**: `illegal`, `red_flag`, `attention`, `ok`
- **5 issue categories**: `rent`, `lease_validity`, `financial`, `clauses`, `decency`
- Rule-based checks in `src/lib/compliance.ts`:
  - Rent ceiling, complement loyer (justification + DPE F/G ban)
  - DPE bans (G since 2025, F from 2028, F frozen since 2022)
  - Deposit amount, agency fees, lease duration/type
  - Surface minimum (9m²), mandatory rent reference mentions
- LLM clause analysis via `src/lib/prompts/clause-analysis.ts` (15+ abusive clause patterns)
- `src/lib/lease-parser.ts`: parseLeaseWithClaude, analyzeClausesWithClaude, parseAndAnalyzeWithClaude (parallel)

## Pages
| Route | Type | Description |
|-------|------|-------------|
| `/` | Client | Homepage with QuickCheck + tabbed input |
| `/report` | Client | Compliance report (reads sessionStorage) |
| `/guides/*` | Static MDX | 8 SEO guide pages with FAQ JSON-LD |
| `/lp/*` | Client | 2 SEA landing pages (noindex) |
| `/api/parse-lease` | API | PDF or text → Claude extraction + clause analysis |
| `/api/check-rent` | API | LeaseData → compliance report |

## SEO & Discovery
- Sitemap: `next-sitemap` generates `/sitemap.xml` and `/robots.txt` at build
- JSON-LD: WebApplication + Organization schema on root, FAQPage on guides
- `llms.txt` / `llms-full.txt` for LLM crawler discovery
- OpenGraph + Twitter card metadata on all pages
- Favicon: SVG scale icon in `src/app/icon.svg`

## Environment
- `ANTHROPIC_API_KEY` in `.env.local` — required for PDF parsing and clause analysis (not needed for manual entry without clause text)
- Vercel Analytics must be enabled in dashboard (package is installed)
