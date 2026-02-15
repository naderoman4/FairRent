# FairRent

Multi-sided SaaS for Paris rent control compliance. Three user types: tenants (free), landlords (credit packs), agencies (subscriptions).

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (includes sitemap generation via postbuild)
- `npm run typecheck` — TypeScript check
- `npm test` — run unit + integration tests (vitest, 55 tests)
- `npm run test:e2e` — run Playwright E2E tests (requires dev server)
- `npm run lint` — ESLint

## Architecture
- **Next.js 14 App Router** with TypeScript, Tailwind CSS, shadcn/ui
- **Supabase** — auth (email/password + magic link), PostgreSQL database, RLS
- **Stripe** — credit packs (one-time) + agency subscriptions (recurring)
- **Route groups**: `(auth)` for login/signup, `(dashboard)` for authenticated pages
- **API routes**:
  - `/api/parse-lease` — PDF or text → Claude extraction + clause analysis
  - `/api/check-rent` — LeaseData → compliance report
  - `/api/stripe/checkout` — Create Stripe checkout session (credit packs)
  - `/api/stripe/subscription` — Create subscription checkout (agencies)
  - `/api/stripe/webhooks` — Stripe webhook handler (raw body, sig verification)
  - `/api/stripe/portal` — Stripe customer portal
  - `/api/credits` — GET balance, POST deduct
  - `/api/analyses` — POST save + deduct credit, GET list
  - `/api/generate-lease` — Auth + LLM + credit deduction + save
  - `/api/teams` — POST invite member, DELETE remove member
- **Static data fallback**: `src/data/paris-rent-references.json` and `src/data/paris-quartiers.geojson`
- **City adapter pattern** in `src/lib/city-adapters/` for future multi-city support
- **MDX guide pages** at `/guides/*` — 8 SEO content pages using `@next/mdx`
- **Landing pages** at `/lp/*` — 2 SEA pages with `noindex`
- **LLM discovery** — `llms.txt` and `llms-full.txt` in public/

## Auth & Users
- Three roles: `tenant`, `landlord`, `agency` (stored in `profiles.role`)
- Supabase Auth with `@supabase/ssr` for cookie-based sessions
- Next.js middleware refreshes session on every request (excludes static + webhooks)
- Dashboard layout calls `requireAuth()` — redirects unauthenticated users to `/login`
- **AuthContext** (client-side): user, profile, credits, signIn/signUp/signOut
- **Server helpers** (`src/lib/auth.ts`): `getCurrentUser()`, `requireAuth()`, `getUserProfile()`, `getUserCredits()`
- Database generic doesn't work with `@supabase/ssr` v0.8.0 — clients are untyped with `as` casts

## Billing
- **Landlord credit packs**: 1 (4.90€), 5 (19.90€), 15 (49.90€) — no expiry
- **Agency subscriptions**: Starter (29€/mo, 10 credits), Pro (79€/mo, 30 credits), Business (199€/mo, 100 credits)
- Credits deducted AFTER successful operation (no charge on failure)
- 1 credit = verification, 2 credits = lease generation
- Atomic deduction via Supabase RPC with `FOR UPDATE` lock
- Idempotent credit granting (checks `stripe_session_id`)
- Webhook route excluded from middleware (needs raw body for signature verification)

## Lease Generation
- 5-step wizard: Property → Parties → Financial → Terms → Review
- Compliance pre-check warns about rent over max, deposit, DPE G ban, surface, duration
- LLM reformats special conditions and complement loyer justification
- PDF via `@react-pdf/renderer` (dynamic import, no SSR) — loi ALUR template
- Saved to `generated_leases` table

## Key Conventions
- All user-facing text is in **French**
- Business logic lives in `src/lib/`, UI in `src/components/`
- Types: `src/lib/types.ts` (compliance), `src/lib/supabase/types.ts` (DB), `src/lib/types-lease-gen.ts` (lease gen)
- Tests: `tests/unit/` (vitest), `tests/integration/` (vitest), `tests/e2e/` (playwright)
- PDF extraction uses pdf-parse v1 (CommonJS, dynamic import)
- GeoJSON loaded as JSON via webpack config in next.config.mjs and vitest plugin
- `@react-pdf/renderer` dynamically imported client-side to avoid SSR issues
- next.config.mjs uses `@next/mdx` wrapper — do not convert to .ts

## Input Modes (Tenant — Free)
Three ways at `/analyser`:
1. **PDF upload** — drag-and-drop, extracts data + clause analysis via Claude API
2. **Manual wizard** — 4-step form (property, financial, lease, optional clause text)
3. **Copy-paste** — paste lease text for full extraction + clause analysis

All flows navigate to `/report` with data in `sessionStorage`.

## Input Modes (Landlord/Agency — Dashboard)
Same 3 input modes at `/dashboard/verifier`. Results saved to `saved_analyses` table with credit deduction. Landlord guidance shown below report.

## Compliance Engine
- **4-level severity**: `illegal`, `red_flag`, `attention`, `ok`
- **5 issue categories**: `rent`, `lease_validity`, `financial`, `clauses`, `decency`
- Rule-based checks in `src/lib/compliance.ts`
- LLM clause analysis via `src/lib/prompts/clause-analysis.ts` (15+ abusive clause patterns)

## Pages
| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Landing page with role-based CTAs |
| `/analyser` | Client | Tenant analysis flow (free, 3 input modes) |
| `/report` | Client | Compliance report (reads sessionStorage) |
| `/pricing` | Server+Client | 3-tab pricing page (tenant/landlord/agency) |
| `/login` | Client | Email/password + magic link login |
| `/signup` | Client | Signup with role selection |
| `/dashboard` | Server | Dashboard overview with credits + quick actions |
| `/dashboard/verifier` | Client | Landlord verification (credit-gated) |
| `/dashboard/verifier/[id]` | Server | View saved analysis |
| `/dashboard/historique` | Server | List of saved analyses |
| `/dashboard/generer` | Client | 5-step lease generation wizard |
| `/dashboard/equipe` | Server | Team management (agency Pro/Business) |
| `/parametres` | Server | User settings |
| `/guides/*` | Static MDX | 8 SEO guide pages |
| `/lp/*` | Client | 2 SEA landing pages (noindex) |

## Database (Supabase)
- `profiles` — extends auth.users with role, team_id, stripe_customer_id
- `teams` — agency teams with plan, subscription, max_members
- `team_members` — team membership with role (admin/member)
- `credits` — individual credit balances
- `team_credits` — team credit balances with monthly allowance
- `credit_transactions` — audit log for all credit operations
- `usage_logs` — API usage tracking
- `saved_analyses` — landlord/agency saved compliance reports
- `generated_leases` — generated lease data
- Migrations in `supabase/migrations/001-004`
- RLS enabled on all tables

## SEO & Discovery
- Sitemap: `next-sitemap` generates `/sitemap.xml` and `/robots.txt` at build
- JSON-LD: WebApplication + Organization schema on root, FAQPage on guides
- `llms.txt` / `llms-full.txt` for LLM crawler discovery
- OpenGraph + Twitter card metadata on all pages

## Environment Variables
- `ANTHROPIC_API_KEY` — Claude API for parsing + clause analysis + lease generation
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (webhooks, admin ops)
- `STRIPE_SECRET_KEY` — Stripe server-side key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe client-side key
- `STRIPE_PRICE_1_CREDIT`, `STRIPE_PRICE_5_CREDITS`, `STRIPE_PRICE_15_CREDITS` — Credit pack price IDs
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` — Subscription price IDs

## Skills
Domain-specific context files in `.claude/skills/`:
- `compliance-checks` — Compliance engine rules and testing
- `lease-generation` — Lease wizard, PDF generation, LLM processing
- `stripe-billing` — Credit packs, subscriptions, webhooks
- `paris-opendata` — Rent references, geocoding, quartier lookup
- `seo-content` — MDX guides, landing pages, structured data
- `lease-parsing` — PDF/text extraction, clause analysis
