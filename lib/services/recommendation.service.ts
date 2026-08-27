import { contentService } from './content.service';
import type { Brewery, TravelGuide } from '../types';

export type RecommendationSource = 'curated' | 'computed';

export interface Recommendation {
  brewery: Brewery;
  reason: string; // human-friendly reason to visit
  source: RecommendationSource;
  tags?: string[]; // e.g., ['dog-friendly', 'taproom', 'family']
  distanceMiles?: number; // when computed from a user location
}

/** Haversine distance in miles */
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RecommendationService {
  /** Return curated/editorial recommendations sourced from guides or brewery.featured */
  async getCurated(): Promise<Recommendation[]> {
    // Use guides (editor-curated lists) and brewery.getFeatured() as editorial sources.
    const [guides, featured] = await Promise.all([
      contentService.guides.getAll().catch(() => [] as TravelGuide[]),
      contentService.breweries.getFeatured().catch(() => []),
    ]);

    const fromGuides: Recommendation[] = [];
    for (const g of guides || []) {
      // Expect guides to include lists of brewery slugs or brewery ids; be defensive
      if (!g?.breweries || !Array.isArray(g.breweries)) continue;
      for (const bRef of g.breweries) {
        const brewery = await contentService.breweries.getById?.(bRef.id || bRef) || await contentService.breweries.getBySlug?.(bRef.slug || bRef);
        if (!brewery) continue;
        fromGuides.push({
          brewery,
          reason: `From guide: ${g.title}`,
          source: 'curated',
          tags: brewery.categories || [],
        });
      }
    }

    const fromFeatured: Recommendation[] = (featured || []).map((b) => ({
      brewery: b,
      reason: 'Featured by the Atlas editors',
      source: 'curated',
      tags: b.categories || [],
    }));

    // De-duplicate by brewery id
    const map = new Map<string, Recommendation>();
    for (const r of [...fromGuides, ...fromFeatured]) {
      if (!r.brewery?.id) continue;
      map.set(r.brewery.id, r);
    }
    return Array.from(map.values());
  }

  /** Compute nearby / trip suggestions from a location and filters.
   *  location: {lat, lon}
   *  options:
   *    maxDistanceMiles - only include breweries within this radius
   *    limit - number of breweries to return
   *    tags - required tags (amenities) like 'dog-friendly'
   */
  async getComputedNearby(
    location: { lat: number; lon: number },
    options?: { maxDistanceMiles?: number; limit?: number; tags?: string[] }
  ): Promise<Recommendation[]> {
    const breweries = await contentService.breweries.getAll();
    if (!location || !Array.isArray(breweries)) return [];

    const maxDist = options?.maxDistanceMiles ?? 50; // default 50 miles
    const tags = options?.tags ?? [];

    const scored = breweries
      .map((b) => {
        if (!b?.location?.latitude || !b?.location?.longitude) return null;
        const dist = haversineMiles(location.lat, location.lon, b.location.latitude, b.location.longitude);
        return { brewery: b, distance: dist };
      })
      .filter(Boolean) as { brewery: Brewery; distance: number }[];

    const filtered = scored
      .filter((s) => s.distance <= maxDist)
      .filter((s) => {
        if (!tags.length) return true;
        const cats = (s.brewery.categories || []).map((c) => c.toLowerCase());
        return tags.every((t) => cats.includes(t.toLowerCase()));
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, options?.limit ?? 10);

    const results: Recommendation[] = filtered.map((f) => ({
      brewery: f.brewery,
      distanceMiles: Number(f.distance.toFixed(1)),
      source: 'computed',
      reason: `About ${Number(f.distance.toFixed(1))} miles away`,
      tags: f.brewery.categories || [],
    }));

    return results;
  }

  /** Combined view: curated first (clearly editorial), then computed nearby. */
  async getRecommendationsForLocation(
    location: { lat: number; lon: number } | null,
    options?: { nearbyMaxMiles?: number; nearbyLimit?: number; tags?: string[] }
  ): Promise<Recommendation[]> {
    const curated = await this.getCurated();
    const computed = location ? await this.getComputedNearby(location, { maxDistanceMiles: options?.nearbyMaxMiles, limit: options?.nearbyLimit, tags: options?.tags }) : [];
    // Keep curated first and mark their source. De-duplicate computed items that are also curated.
    const curatedIds = new Set(curated.map((c) => c.brewery.id));
    const computedFiltered = computed.filter((c) => !curatedIds.has(c.brewery.id));
    return [...curated, ...computedFiltered];
  }
}

export const recommendationService = new RecommendationService();
