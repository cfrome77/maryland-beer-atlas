# Maryland Beer Atlas

Maryland Beer Atlas is a modern, full-stack Next.js web application for discovering craft breweries, beer trails, and curated local travel guides across Maryland. Designed with a mobile-first outdoor tourism aesthetic, it offers interactive mapping, directory searching, automated recommendations, structured operating hours, data freshness verification, and Sanity CMS content management.

---

## Table of Contents
- [Key Features](#key-features)
- [Technical Architecture & Design Patterns](#technical-architecture--design-patterns)
- [Data Architecture: Mock Data vs. Sanity CMS vs. Production](#data-architecture-mock-data-vs-sanity-cms-vs-production)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Local Development Setup](#local-development-setup)
- [Sanity CMS Studio & Seeding Workflow](#sanity-cms-studio--seeding-workflow)
- [Data Quality & Pre-Release Auditing](#data-quality--pre-release-auditing)
- [Map Engine & Spatial Architecture](#map-engine--spatial-architecture)
- [Testing & Quality Assurance](#testing--quality-assurance)

---

## Key Features

1. **Interactive Maryland Beer Map (`/map`)**:
   - Built on MapLibre GL JS v6 with high-DPI CARTO Voyager raster tiles.
   - Multi-select facet filtering by Region, County, Brewery Type, and Amenities in a responsive grid.
   - Dense area marker clustering (`clusterBreweries`) and taproom popups.
   - Real-time browser geolocation positioning (`navigator.geolocation`) with proximity distance calculations.
   - Hardware-accelerated WebGL2 rendering with automatic fallback banners for unsupported hardware environments.

2. **Brewery Directory & Search (`/breweries`)**:
   - Instant text search across brewery names, cities, counties, and beer styles.
   - Multi-select filter dropdowns with keyboard navigation (ARIA listbox) and reset controls.
   - Quick preset guides (`FILTER_PRESETS`) for top experiences (e.g. Dog-Friendly, Outdoor Patios, Farmhouse Breweries).
   - Deterministic sorting by Name (A-Z/Z-A), County, City, Region, Brewery Type, Proximity/Distance, Postal Code, and Recently Verified date.
   - Debounced URL state synchronization for shareable search and filter states without browser history pollution.

3. **Brewery Detail Pages (`/breweries/[slug]`)**:
   - Merges canonical domain facts with Sanity CMS editorial descriptions, highlights, atmosphere, and recommendations.
   - Real-time "Open Now" / "Closed Now" status calculation taking into account split shifts, overnight shifts, holiday exceptions, and Maryland local time (`America/New_York`).
   - Touch-to-call phone links and direct website CTAs (intentionally avoiding outdated raw beer tap lists).
   - Operational status notes and data freshness badges (`FRESH`, `STALE`, `OUTDATED`, `UNVERIFIED`).
   - Interactive single taproom location map (`BreweryDetailMap`) with direct links to Google Maps & Apple Maps.
   - Schema.org JSON-LD microdata (`Brewery`/`LocalBusiness`) for rich search snippets.

4. **Beer Trail Itineraries (`/trails`, `/trails/[slug]`)**:
   - Sequential, ordered taproom stops (`TrailStop[]`) with stop numbers, duration estimates, highlights, and attractions.
   - Status callouts for temporarily closed or inactive stops along the route.
   - Trip summary metric cards (distance, total duration, stop count, difficulty level, region).
   - Interactive GeoJSON LineString route overlays (`TrailMapView`) auto-fitting map bounds (`fitBounds`).

5. **Curated Travel Guides (`/guides`, `/guides/[slug]`)**:
   - 5 distinct guide types: `brewery_guide`, `regional_guide`, `trip_planning`, `curated_recommendations`, `education`.
   - Rich Portable Text content rendering with custom block styling.
   - Structured links to recommended brewery stops, related trails, and related guides.

6. **SEO & Landing Pages (`/breweries/category/[slug]`, `/breweries/county/[slug]`)**:
   - Programmatically generated SEO landing pages for all Maryland counties and brewery categories/amenities.
   - Dynamic XML sitemap (`app/sitemap.ts`) and crawler directives (`app/robots.ts`).
   - Open Graph and Twitter card social image generation using `@sanity/image-url` (`lib/utils/og-image.ts`).

7. **Smart Recommendation Engine (`/api/recommendations`)**:
   - Grounded domain recommendation algorithm (`lib/services/recommendation.service.ts`).
   - Recommends breweries based on proximity, amenities, food availability, outdoor seating, family/dog friendliness, and beer styles.
   - Excludes permanently closed locations, marks non-open locations, and visually distinguishes editorial picks from computed suggestions.

8. **Embedded Sanity Studio (`/studio`)**:
   - Integrated Sanity Studio accessible directly at `/studio` for visual content editing, Vision GROQ querying, and schema management.

---

## Technical Architecture & Design Patterns

- **Framework**: Next.js 16 (App Router) & React 19.
- **Styling**: Tailwind CSS v4, Lucide Icons, and `@base-ui/react`.
- **Domain Validation**: Zod runtime schema validation (`lib/validations/schemas.ts`) enforcing canonical data shapes.
- **Repository Pattern**: Abstract repository interfaces (`IBreweryRepository`, `ITrailRepository`, `IGuideRepository`) with concrete implementations for Mock Data (`MockBreweryRepository`, etc.) and Sanity CMS (`SanityBreweryRepository`, etc.), coordinated via `ContentService` (`lib/services/content.service.ts`).
- **Data Freshness Engine**: `lib/utils/freshness.ts` evaluates data age against 90-day (`FRESH_THRESHOLD_DAYS`) and 180-day (`STALE_THRESHOLD_DAYS`) thresholds.
- **Timezone-Aware Hours**: `lib/utils/hours.ts` evaluates current operating status using `America/New_York` timezone rules.
- **Geospatial Utilities**: `lib/utils/geocoding.ts` provides Haversine distance calculations, Maryland postal code center lookups (`MARYLAND_POSTAL_CODE_CENTERS`), and regional filtering.

---

## Data Architecture: Mock Data vs. Sanity CMS vs. Production

Maryland Beer Atlas is built with a **dual-mode repository architecture** that operates seamlessly either offline with local mock data or connected to Sanity CMS.

```
                   ┌───────────────────────────────────┐
                   │          ContentService           │
                   └─────────────────┬─────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────┐                             ┌──────────────────────┐
│  USE_MOCK_DATA=true  │                             │  USE_MOCK_DATA=false │
│ (Local Development & │                             │   (Sanity CMS Mode)  │
│  Build Verification) │                             └──────────┬───────────┘
└──────────┬───────────┘                                        │
           │                                          ┌─────────┴─────────┐
           ▼                                          ▼                   ▼
┌──────────────────────┐                    ┌──────────────────┐ ┌──────────────────┐
│ Mock Repositories    │                    │ Sanity Dataset:  │ │ Sanity Dataset:  │
│ (lib/data/mock-data) │                    │  'development'   │ │   'production'   │
└──────────────────────┘                    └──────────────────┘ └──────────────────┘
```

### 1. Mock Data Mode (`USE_MOCK_DATA=true`)
- **How it works**: Uses `MockBreweryRepository`, `MockTrailRepository`, and `MockGuideRepository` to serve static in-memory data from `lib/data/mock-data.ts`.
- **When to use**: Local development without internet/Sanity credentials, rapid offline feature development, and CI build verification.
- **Zero Dependencies**: Requires no API tokens or Sanity project IDs.

### 2. Sanity CMS Mode (`USE_MOCK_DATA=false`)
- **How it works**: Uses `SanityBreweryRepository`, `SanityTrailRepository`, and `SanityGuideRepository` to query Sanity CMS via GROQ.
- **Editorial Layer Merging**: `mergeSanityEditorialWithCanonical` merges Sanity CMS editorial fields (descriptions, highlights, atmosphere, editorial recommendations) with canonical domain facts without duplicating facts.
- **Graceful Error Fallback**: If Sanity is unconfigured, network requests fail, or schema definitions are missing, the Sanity repositories automatically catch the error and fall back to mock data, ensuring the application remains functional.
- **Build-Time Resilience**: If `NEXT_PUBLIC_SANITY_PROJECT_ID` is unconfigured during dynamic build evaluation, `lib/sanity/client.ts` falls back to `placeholder-project-id` to prevent Next.js build evaluation crashes.

### 3. Development vs. Production Differences

| Feature / Behavior | Development (`npm run dev`) | Production (`npm run build` / `npm start`) |
|---|---|---|
| **Default Sanity Dataset** | `development` | `production` |
| **Sanity CDN Caching** | Disabled (`useCdn: false`) for instant CMS edit previews | Enabled (`useCdn: true`) for maximum edge performance |
| **Incremental Static Regeneration (ISR)** | Page re-renders on every request | Pages pre-rendered with `revalidate = 60` seconds |
| **Sanity Project ID Fallback** | `placeholder-project-id` with warning notice | Safe fallback prevents build compilation failures |
| **Data Quality Audits** | Optional CLI audit | Mandatory pre-release gate (`npm run audit:breweries -- --strict`) |

---

## Environment Variables Configuration

Copy `.env.example` to `.env.local` to configure environment variables.

```bash
cp .env.example .env.local
```

| Variable | Environment | Required? | Default | Description |
|---|---|---|---|---|
| `USE_MOCK_DATA` | Shared | Optional | `false` | When set to `true`, forces the app to use local mock data (`lib/data/mock-data.ts`) instead of querying Sanity CMS. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Client & Server | Required for CMS | `placeholder-project-id` | Your Sanity project ID (from [Sanity Manage](https://manage.sanity.io)). |
| `NEXT_PUBLIC_SANITY_DATASET` | Client & Server | Optional | `development` (dev) / `production` (prod) | Sanity dataset name (`development` or `production`). |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Client & Server | Optional | `2026-03-01` | Sanity API version date (`YYYY-MM-DD`). |
| `SANITY_API_WRITE_TOKEN` | Server Only | Required for Seeding | - | Secret Sanity write token (with Create/Update/Delete permissions) for dataset seeding. |
| `SANITY_API_READ_TOKEN` | Server Only | Optional | - | Optional read token for fetching draft documents or private datasets. |

> **Note on Map Keys**: No `NEXT_PUBLIC_MAPBOX_TOKEN`, `MAPTILER_KEY`, or proprietary map API keys are required! MapLibre GL JS renders open high-DPI CARTO Voyager tiles directly.

---

## Local Development Setup

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Installation
```bash
git clone https://github.com/marylandbeeratlas/maryland-beer-atlas.git
cd maryland-beer-atlas
npm install
```

### 3. Option A: Run Locally with Mock Data (Fastest Setup)
No API keys or CMS configuration required:

```bash
USE_MOCK_DATA=true npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Option B: Run Locally with Sanity CMS
1. Create a `.env.local` file with your Sanity credentials:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   NEXT_PUBLIC_SANITY_DATASET=development
   SANITY_API_WRITE_TOKEN=your_sanity_write_token
   USE_MOCK_DATA=false
   ```
2. Seed your Sanity `development` dataset with baseline documents (see below).
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the embedded Sanity Studio at [http://localhost:3000/studio](http://localhost:3000/studio) to manage content.

---

## Sanity CMS Studio & Seeding Workflow

### Embedded Sanity Studio
The Sanity Studio is embedded directly within the Next.js App Router at `/studio`. When running locally, open `http://localhost:3000/studio` to log in, view content structures, test GROQ queries with the Vision tool, and publish edits.

### Dataset Seeding (`scripts/seed-sanity.ts`)
The repository includes an automated seed script that transforms canonical mock data into fully typed Sanity schema documents (`county`, `category`, `brewery`, `trail`, `guide`).

#### 1. Optional Images & Fallback Handling
Image fields in Sanity schemas (`brewery`, `guide`, `trail`) are configured as optional (`Rule.optional()`). During dataset seeding or Sanity Studio content entry, images are not required. When image asset references are omitted, the application automatically falls back to local repository assets (`public/images/brewery-placeholder.svg`), allowing images to be added or swapped at any time.

#### 2. Development vs. Production Seeding Modes
The seeding script supports mode separation to keep local development fast and focused:

- **Development Mode (`npm run seed:sanity:dev`)**: Seeds a curated, representative subset of data (top featured breweries spanning all Maryland regions, along with matching trails and guides) to keep local datasets lightweight.
- **Production Mode (`npm run seed:sanity:prod`)**: Seeds the complete statewide dataset of all known breweries, beer trails, and travel guides.
- **Limit Flag (`--limit=N`)**: Allows seeding an explicit maximum count of brewery documents (e.g., `--limit=5`).

```bash
# Seed development dataset (curated subset)
npm run seed:sanity:dev

# Seed production dataset (full dataset)
npm run seed:sanity:prod

# Dry-run validation mode (verifies schema documents without writing)
npm run seed:sanity:dev -- --dry-run
```

---

## Data Quality & Pre-Release Auditing

Maryland Beer Atlas includes a CLI audit tool (`scripts/audit-brewery-data.ts`) to enforce high data quality across production records.

```bash
npm run audit:breweries
# or
npm run audit:data
```

### Audit Checks
- **Schema Validation**: Ensures all required domain fields and coordinates are present and valid.
- **Duplicate Detection**: Identifies matching brewery IDs, names, cities, or street addresses.
- **Proximity / Coordinate Check**: Flags taprooms located within 50 meters of each other for manual review.
- **Geographic Bounds**: Validates latitude/longitude fall within Maryland bounding coordinates.
- **Hours Integrity**: Flags missing or malformed 24h operating hours.
- **Verification Freshness**: Tracks data age using 90-day (`FRESH`), 180-day (`STALE`), and >180-day (`OUTDATED`) thresholds.
- **Contact & Media Info**: Audits missing website URLs, phone numbers, image assets, or social links.
- **Reference Integrity**: Verifies that all breweries referenced in trails and guides exist in the database.
- **Record Completeness Score**: Computes a 100-point score across 4 weighted categories (Mandatory Facts 40%, Hours & Status 20%, Verification & Freshness 20%, Curation 20%).

### Audit CLI Options
```bash
# Exit with code 1 if critical schema errors, duplicates, or broken references exist
npm run audit:breweries -- --strict

# Output structured JSON report for CI/CD pipelines
npm run audit:breweries -- --json
```

---

## Map Engine & Spatial Architecture

### Map Engine & Tile Provider
- **Library**: MapLibre GL JS (`maplibre-gl` v6).
- **Tiles**: High-DPI CARTO Voyager raster tiles (`https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`).
- **Global Stylesheet**: `@import "maplibre-gl/dist/maplibre-gl.css";` loaded in `app/globals.css`.

### Marker Pin Stability Rules
To prevent visual jitter or displacement during zoom, pan, or hover interactions in MapLibre GL JS:
- Outer marker container DOM elements (`new maplibregl.Marker(el)`) have static positioning and zero CSS transitions or transforms.
- Hover states, scale transforms, and visual animations are applied strictly to inner child elements.
- Pulsing animations (e.g. `animate-ping`) on outer containers are prohibited.

### Map Fallback Handling
- **WebGL2 Context Check**: Component mounts synchronously test WebGL2 support. If WebGL2 is disabled or unsupported, a styled fallback banner (`AlertTriangle`) displays hardware acceleration troubleshooting steps.
- **Invalid Coordinates**: Locations with invalid coordinates (`NaN` or out-of-bounds) render fallback card UIs with plain-text addresses and direct Google Maps / Apple Maps directions links (`lib/utils/directions.ts`).

---

## Testing & Quality Assurance

```bash
# Run Vitest unit & integration test suite
npm test

# Run ESLint linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Test production build compilation
USE_MOCK_DATA=true npm run build
```
