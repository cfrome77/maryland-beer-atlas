import { contentService } from './content.service';
import type { Brewery, TravelGuide } from '../types';

export type RecommendationSource = 'curated' | 'computed';

export interface Recommendation {
  brewery: Brewery;
  reason: string; // Human-friendly explainable reason to visit
  source: RecommendationSource;
  tags?: string[]; // Trustworthy amenity or style tags present on brewery
  distanceMiles?: number; // Distance when computed from a user location
  matchedAttributes?: string[]; // Specific trustworthy attributes that matched
  statusNote?: string; // Operating status annotation (e.g., 'Temporarily Closed', 'Opening Soon')
}

export interface RecommendationOptions {
  location?: { lat: number; lon: number } | null;
  maxDistanceMiles?: number;
  nearbyMaxMiles?: number; // Alias for maxDistanceMiles
  limit?: number;
  nearbyLimit?: number; // Alias for limit
  tags?: string[]; // Required amenity or style tags (e.g., 'dog-friendly', 'outdoor seating')
  amenities?: string[];
  foodRequired?: boolean;
  outdoorSeatingRequired?: boolean;
  dogFriendlyRequired?: boolean;
  familyFriendlyRequired?: boolean;
  breweryType?: string;
  beerStyles?: string[];
  region?: string;
  includeTemporarilyClosed?: boolean; // Default true (with explicit statusNote callouts)
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

/** Check if brewery is permanently closed */
export function isPermanentlyClosed(b: Brewery): boolean {
  if (!b || !b.status) return false;
  const s = b.status.trim().toLowerCase();
  return s === 'permanently closed' || s === 'closed';
}

/** Get operating status annotation for non-open, non-permanently closed breweries */
export function getNonOpenStatusNote(b: Brewery): string | null {
  if (!b || !b.status) return null;
  const s = b.status.trim().toLowerCase();
  if (s === 'temporarily closed') return 'Temporarily Closed';
  if (s === 'opening soon') return 'Opening Soon';
  if (s === 'seasonal') return 'Seasonal Operations';
  if (s === 'relocating') return 'Relocating';
  return null;
}

/** Helper attributes checks based strictly on actual brewery properties */
export function hasFood(b: Brewery): boolean {
  if (!b?.amenities) return false;
  const foodKeywords = ['food', 'kitchen', 'food trucks', 'dining', 'restaurant', 'on-site food'];
  return b.amenities.some((a) => foodKeywords.some((k) => a.toLowerCase().includes(k)));
}

export function hasOutdoorSeating(b: Brewery): boolean {
  if (!b?.amenities) return false;
  const outdoorKeywords = ['outdoor', 'patio', 'beer garden', 'deck'];
  return b.amenities.some((a) => outdoorKeywords.some((k) => a.toLowerCase().includes(k)));
}

export function hasDogFriendly(b: Brewery): boolean {
  if (!b?.amenities) return false;
  const dogKeywords = ['dog', 'pet'];
  return b.amenities.some((a) => dogKeywords.some((k) => a.toLowerCase().includes(k)));
}

export function hasFamilyFriendly(b: Brewery): boolean {
  if (!b?.amenities) return false;
  const familyKeywords = ['family', 'kid', 'children'];
  return b.amenities.some((a) => familyKeywords.some((k) => a.toLowerCase().includes(k)));
}

export class RecommendationService {
  /** Return curated/editorial recommendations sourced from guides or brewery.featured */
  async getCurated(options?: { includeTemporarilyClosed?: boolean }): Promise<Recommendation[]> {
    const [guides, featured] = await Promise.all([
      contentService.guides.getAll().catch(() => [] as TravelGuide[]),
      contentService.breweries.getFeatured().catch(() => []),
    ]);

    const allowTempClosed = options?.includeTemporarilyClosed ?? true;
    const map = new Map<string, Recommendation>();

    const processBrewery = (b: Brewery, reasonPrefix: string) => {
      if (!b || isPermanentlyClosed(b)) return;
      const statusNote = getNonOpenStatusNote(b);
      if (statusNote && !allowTempClosed) return;

      const matchedAttrs: string[] = [];
      if (b.type) matchedAttrs.push(b.type);
      if (b.city) matchedAttrs.push(b.city);
      if (b.region) matchedAttrs.push(`${b.region} Region`);

      let fullReason = reasonPrefix;
      if (statusNote) {
        fullReason += ` [Note: ${statusNote}]`;
      } else if (b.city) {
        fullReason += ` • ${b.type || 'Brewery'} in ${b.city}, MD`;
      }

      map.set(b.id, {
        brewery: b,
        reason: fullReason,
        source: 'curated',
        tags: b.amenities || [],
        matchedAttributes: matchedAttrs,
        statusNote: statusNote || undefined,
      });
    };

    for (const g of guides || []) {
      if (!g?.recommendedStops || !Array.isArray(g.recommendedStops)) continue;
      for (const b of g.recommendedStops) {
        processBrewery(b, `Featured in guide: ${g.title}`);
      }
    }

    for (const b of featured || []) {
      if (!map.has(b.id)) {
        processBrewery(b, `Featured by Maryland Beer Atlas editors`);
      }
    }

    return Array.from(map.values());
  }

  /** Compute nearby / preference-matched trip suggestions from location & attribute filters. */
  async getComputedNearby(
    location: { lat: number; lon: number } | null,
    options?: RecommendationOptions
  ): Promise<Recommendation[]> {
    const breweries = await contentService.breweries.getAll();
    if (!Array.isArray(breweries)) return [];

    const maxDist = options?.maxDistanceMiles ?? options?.nearbyMaxMiles ?? 50;
    const allowTempClosed = options?.includeTemporarilyClosed ?? true;

    // Requested filters
    const requestedTags = [...(options?.tags || []), ...(options?.amenities || [])].map((t) => t.toLowerCase());
    const reqFood = options?.foodRequired;
    const reqOutdoor = options?.outdoorSeatingRequired;
    const reqDog = options?.dogFriendlyRequired;
    const reqFamily = options?.familyFriendlyRequired;
    const reqType = options?.breweryType?.toLowerCase();
    const reqRegion = options?.region?.toLowerCase();
    const reqBeerStyles = (options?.beerStyles || []).map((s) => s.toLowerCase());

    const candidates = breweries.filter((b) => {
      if (!b || isPermanentlyClosed(b)) return false;

      const statusNote = getNonOpenStatusNote(b);
      if (statusNote && !allowTempClosed) return false;

      // Filter by region if specified
      if (reqRegion && b.region?.toLowerCase() !== reqRegion) return false;

      // Filter by brewery type if specified
      if (reqType && b.type?.toLowerCase() !== reqType) return false;

      // Filter by boolean requirements strictly grounded in data
      if (reqFood && !hasFood(b)) return false;
      if (reqOutdoor && !hasOutdoorSeating(b)) return false;
      if (reqDog && !hasDogFriendly(b)) return false;
      if (reqFamily && !hasFamilyFriendly(b)) return false;

      // Filter by tags (amenities)
      if (requestedTags.length > 0) {
        const ams = (b.amenities || []).map((a) => a.toLowerCase());
        const matchesAllTags = requestedTags.every((t) => ams.some((a) => a.includes(t) || t.includes(a)));
        if (!matchesAllTags) return false;
      }

      // Filter by beer styles if specified
      if (reqBeerStyles.length > 0) {
        const styles = (b.beerStyles || []).map((s) => s.toLowerCase());
        const matchesStyle = reqBeerStyles.some((reqS) => styles.some((s) => s.includes(reqS) || reqS.includes(s)));
        if (!matchesStyle) return false;
      }

      return true;
    });

    // Score distance if location is provided
    const scored = candidates.map((b) => {
      let distance: number | undefined;
      if (
        location &&
        b.coordinates &&
        typeof b.coordinates.lat === 'number' &&
        typeof b.coordinates.lng === 'number'
      ) {
        distance = haversineMiles(location.lat, location.lon, b.coordinates.lat, b.coordinates.lng);
      }
      return { brewery: b, distance };
    });

    // Filter by max distance if location provided
    const distanceFiltered = scored.filter((s) => {
      if (location && s.distance !== undefined) {
        return s.distance <= maxDist;
      }
      return true;
    });

    // Sort: if distance is present, sort by distance. Otherwise, sort by number of matching attributes
    distanceFiltered.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

    const limit = options?.limit ?? options?.nearbyLimit ?? 10;
    const sliced = distanceFiltered.slice(0, limit);

    return sliced.map((item) => {
      const b = item.brewery;
      const distMiles = item.distance !== undefined ? Number(item.distance.toFixed(1)) : undefined;
      const statusNote = getNonOpenStatusNote(b);

      const matchedAttrs: string[] = [];
      if (b.type) matchedAttrs.push(b.type);
      if (hasFood(b)) matchedAttrs.push('Food Available');
      if (hasOutdoorSeating(b)) matchedAttrs.push('Outdoor Seating');
      if (hasDogFriendly(b)) matchedAttrs.push('Dog Friendly');
      if (hasFamilyFriendly(b)) matchedAttrs.push('Family Friendly');
      if (b.beerStyles && b.beerStyles.length > 0) matchedAttrs.push(b.beerStyles.slice(0, 2).join(', '));

      // Build explainable human-readable reason string
      let reason = '';
      if (distMiles !== undefined) {
        reason = `About ${distMiles} mi away in ${b.city}, MD (${b.region})`;
        if (matchedAttrs.length > 0) {
          reason += ` • Matches: ${matchedAttrs.slice(0, 3).join(', ')}`;
        }
      } else {
        reason = `${b.type || 'Brewery'} in ${b.city}, MD (${b.region})`;
        if (matchedAttrs.length > 0) {
          reason += ` • Offers ${matchedAttrs.slice(0, 3).join(', ')}`;
        }
      }

      if (statusNote) {
        reason += ` [Note: ${statusNote}]`;
      }

      return {
        brewery: b,
        reason,
        source: 'computed',
        tags: b.amenities || [],
        distanceMiles: distMiles,
        matchedAttributes: matchedAttrs,
        statusNote: statusNote || undefined,
      };
    });
  }

  /** Combined view: curated picks first (clearly editorial), followed by computed/attribute suggestions. */
  async getRecommendationsForLocation(
    location: { lat: number; lon: number } | null,
    options?: RecommendationOptions
  ): Promise<Recommendation[]> {
    const curated = await this.getCurated({ includeTemporarilyClosed: options?.includeTemporarilyClosed });
    const computed = await this.getComputedNearby(location, options);

    // Keep curated first and mark source. De-duplicate computed items that are already in curated.
    const curatedIds = new Set(curated.map((c) => c.brewery.id));
    const computedFiltered = computed.filter((c) => !curatedIds.has(c.brewery.id));

    return [...curated, ...computedFiltered];
  }
}

export const recommendationService = new RecommendationService();
