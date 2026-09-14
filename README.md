# Maryland Beer Atlas

Maryland Beer Atlas is a Next.js web application for discovering craft breweries, beer trails, and curated local travel guides across Maryland.

## Map Provider & Architecture Configuration

### Map Engine & Tile Provider
- **Map Library**: [MapLibre GL JS](https://maplibre.org/) (`maplibre-gl` v6).
- **Base Tile Provider**: High-DPI **CARTO Voyager** raster tiles derived from OpenStreetMap data (`https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`).
- **API Keys / Tokens Required**: **NONE**. MapLibre GL JS renders open CARTO Voyager raster map tiles directly via WebGL, eliminating dependencies on Mapbox, MapTiler, or proprietary map API keys/access tokens.

### Map Components & Routes
1. **Interactive Maryland Beer Map (`/map`)**:
   - Component: `components/ui/map-view.tsx` (rendered via `components/ui/interactive-map-content.tsx`).
   - Features: Multi-select filtering (regions, counties, brewery types, amenities), interactive marker pins, taproom popups, and layer toggling.
2. **Brewery Detail Map (`/breweries/[slug]`)**:
   - Component: `components/ui/brewery-detail-map.tsx`.
   - Features: Highlighting single taproom location, zoom level 14 view, directions links to Google Maps & Apple Maps.
3. **Beer Trail Itinerary Map (`/trails/[slug]`)**:
   - Component: `components/ui/trail-map-view.tsx` (dynamic wrapper around `MapView`).
   - Features: Connected sequence route layer (`GeoJSON` LineString) mapping trail stops in order and auto-fitting map bounds (`fitBounds`).

### Graceful Fallback & Error Handling
All map components perform client-side WebGL2 context checks on mount and handle missing or invalid geographic coordinates gracefully:
- **Disabled/Unsupported WebGL2**: Displays a styled, high-contrast fallback banner (`AlertTriangle` icon) explaining hardware acceleration requirements along with troubleshooting steps, preventing application crashes.
- **Missing or Invalid Coordinates (`NaN`, out-of-bounds `lat`/`lng`)**: Renders location cards with direct text addresses and instant direction links to Google Maps and Apple Maps without breaking map initialization.

## Environment Variables Configuration

The application operates seamlessly in mock mode or connected to Sanity CMS.

| Variable | Required | Default | Description |
|---|---|---|---|
| `USE_MOCK_DATA` | Optional | `false` | When set to `true`, the application uses local mock data (`lib/data/mock-data.ts`) instead of querying Sanity CMS. Useful for local development and build verification. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Required (if `USE_MOCK_DATA` is not `true`) | `placeholder-project-id` | Sanity CMS project ID. |
| `NEXT_PUBLIC_SANITY_DATASET` | Optional | `production` | Sanity CMS dataset name. |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional | `2023-05-03` | Sanity CMS API version. |
| `SANITY_API_TOKEN` | Optional | - | Server-side Sanity API token for authenticated queries. |

*Note: No `NEXT_PUBLIC_MAPBOX_TOKEN`, `MAPTILER_KEY`, or map API keys are required.*

## Getting Started

First, install dependencies:

```bash
npm install
```

To run in local development mode using mock data:

```bash
USE_MOCK_DATA=true npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing & Verification

Run Vitest unit and integration test suite:

```bash
npm test
```

Perform production build verification:

```bash
USE_MOCK_DATA=true npm run build
```

Run linter:

```bash
npm run lint
```
