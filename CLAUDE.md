# FairRent

Paris rent control compliance checker. Tenants verify their rent against official legal ceilings.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (includes sitemap generation)
- `npm run typecheck` — TypeScript check
- `npm test` — run unit + integration tests (vitest)
- `npm run test:e2e` — run Playwright E2E tests (requires dev server)
- `npm run lint` — ESLint

## Architecture
- **Next.js 14 App Router** with TypeScript, Tailwind CSS, shadcn/ui
- **No database** — fully stateless, no user accounts, no file storage
- **Two API routes**: `/api/parse-lease` (PDF or text → LLM extraction + clause analysis, streaming) and `/api/check-rent` (form data → compliance report)
- **Static data fallback**: `src/data/paris-rent-references.json` (2,560 records) and `src/data/paris-quartiers.geojson` (80 quartiers)
- **City adapter pattern** in `src/lib/city-adapters/` for future multi-city support
- **MDX guide pages** at `/guides/*` — SEO content pages using `@next/mdx`
- **Landing pages** at `/lp/*` — SEA pages with `noindex`, minimal layout

## Key Conventions
- All user-facing text is in **French**
- Business logic lives in `src/lib/`, UI in `src/components/`
- Types are centralized in `src/lib/types.ts`
- Tests: `tests/unit/` (vitest), `tests/integration/` (vitest), `tests/e2e/` (playwright)
- PDF extraction uses pdf-parse v1 (CommonJS, dynamic import)
- GeoJSON loaded as JSON via webpack config in next.config.mjs and vitest plugin
- The `@react-pdf/renderer` is dynamically imported client-side to avoid SSR issues

## Input Modes
Three ways to analyze a lease:
1. **PDF upload** — drag-and-drop, extracts data + clause analysis via Claude
2. **Manual wizard** — 4-step form (property, financial, lease, optional clause text)
3. **Copy-paste** — paste lease text for full extraction + clause analysis

All flows navigate to `/report` with data in `sessionStorage`.

## Compliance Engine
- **4-level severity**: `illegal`, `red_flag`, `attention`, `ok`
- **5 issue categories**: `rent`, `lease_validity`, `financial`, `clauses`, `decency`
- Rule-based checks in `src/lib/compliance.ts`
- LLM clause analysis via `src/lib/prompts/clause-analysis.ts`

## Environment
- `ANTHROPIC_API_KEY` in `.env.local` — required for PDF parsing and clause analysis (not for manual entry flow without clause text)
