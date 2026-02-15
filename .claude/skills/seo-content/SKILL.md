# SEO Content

## Overview
8 MDX guide pages for SEO, 2 landing pages for SEA, plus LLM discovery files.

## Key Files
- `src/app/guides/*/page.mdx` — 8 guide pages with FAQ JSON-LD
- `src/app/lp/*/page.tsx` — 2 SEA landing pages (noindex)
- `public/llms.txt` + `public/llms-full.txt` — LLM crawler discovery
- `next-sitemap.config.js` — Sitemap generation config
- `src/app/layout.tsx` — Root metadata (WebApplication + Organization JSON-LD)

## Conventions
- All content in French
- MDX pages use `@next/mdx` (configured in next.config.mjs)
- Landing pages use `noindex` meta
- JSON-LD FAQPage schema on guide pages
- OpenGraph + Twitter card metadata on all pages
