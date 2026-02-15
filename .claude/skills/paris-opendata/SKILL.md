# Paris Open Data Integration

## Overview
Fetches rent references and quartier data from Paris Open Data APIs.

## Key Files
- `src/lib/paris-opendata.ts` — `fetchRentReference()` API call
- `src/lib/geocoding.ts` — `geocodeAddress()` using api-adresse.data.gouv.fr
- `src/lib/quartier-lookup.ts` — Point-in-polygon lookup using Turf.js + GeoJSON
- `src/data/paris-rent-references.json` — Static fallback (2,560 records)
- `src/data/paris-quartiers.geojson` — 80 quartiers GeoJSON

## APIs
- Rent references: `opendata.paris.fr/.../logement-encadrement-des-loyers/records`
- Quartier GeoJSON: `opendata.paris.fr/.../quartier_paris/exports/geojson`
- Geocoding: `api-adresse.data.gouv.fr/search/` (Paris only: `citycode=75056`)

## Key Details
- GeoJSON `c_qu` (string) maps to `id_quartier` (number)
- Rent reference params: quartier ID, rooms (1-4, capped), period, furnished, year
- Geocoding debounced 300ms in AddressAutocomplete
- Turf.js `booleanPointInPolygon` for quartier resolution
