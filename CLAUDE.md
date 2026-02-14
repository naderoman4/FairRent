# FairRent

Paris rent control compliance checker. Tenants verify their rent against official legal ceilings.

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm test` — run unit + integration tests (vitest)
- `npm run test:e2e` — run Playwright E2E tests (requires dev server)
- `npm run lint` — ESLint

## Architecture
- **Next.js 14 App Router** with TypeScript, Tailwind CSS, shadcn/ui
- **No database** — fully stateless, no user accounts, no file storage
- **Two API routes**: `/api/parse-lease` (PDF → LLM extraction, streaming) and `/api/check-rent` (form data → compliance report)
- **Static data fallback**: `src/data/paris-rent-references.json` (2,560 records) and `src/data/paris-quartiers.geojson` (80 quartiers)
- **City adapter pattern** in `src/lib/city-adapters/` for future multi-city support

## Key Conventions
- All user-facing text is in **French**
- Business logic lives in `src/lib/`, UI in `src/components/`
- Types are centralized in `src/lib/types.ts`
- Tests: `tests/unit/` (vitest), `tests/integration/` (vitest), `tests/e2e/` (playwright)
- PDF extraction uses pdf-parse v1 (CommonJS, dynamic import)
- GeoJSON loaded as JSON via webpack config in next.config.mjs and vitest plugin
- The `@react-pdf/renderer` is dynamically imported client-side to avoid SSR issues

## Environment
- `ANTHROPIC_API_KEY` in `.env.local` — required for PDF parsing (not for manual entry flow)
