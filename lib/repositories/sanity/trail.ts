/* eslint-disable @typescript-eslint/no-explicit-any */
import { BeerTrail, Brewery } from '../../types';
import { ITrailRepository } from '../interfaces';
import { MockTrailRepository } from '../mock';
import { sanityClient, isSanityConfigured } from '../../sanity/client';
import { validateBeerTrail, validateBeerTrailList } from '../../validations/schemas';
import { mergeSanityEditorialWithCanonical } from './brewery';

export class SanityTrailRepository implements ITrailRepository {
  private breweryProjection = `
    "id": coalesce(breweryId, _id),
    breweryId,
    "slug": slug.current,
    name,
    postalCode,
    latitude,
    longitude,
    description,
    highlights,
    atmosphere,
    editorialRecommendations[] {
      category,
      title,
      notes
    },
    curatedContent {
      editorNotes,
      curatedTags
    },
    "image": image.asset->url,
    "logo": logo.asset->url,
    featured
  `;

  private baseProjection = `
    "id": _id,
    "slug": slug.current,
    name,
    description,
    region,
    postalCode,
    latitude,
    longitude,
    distance,
    duration,
    "image": image.asset->url,
    highlight,
    nearbyAttractions,
    difficulty,
    notes,
    "stops": stops[] {
      order,
      isOptional,
      notes,
      highlight,
      recommendedDuration,
      attractions,
      "brewery": brewery-> {
        ${this.breweryProjection}
      }
    },
    "breweries": breweries[defined(@->._id)]-> {
      ${this.breweryProjection}
    }
  `;

  private fallbackRepo: MockTrailRepository;

  constructor(private canonicalBreweries: Brewery[] = []) {
    this.fallbackRepo = new MockTrailRepository();
  }

  private mapTrailReferences(trailRecord: any): unknown {
    if (!trailRecord) return null;

    let mappedStops: any[] = [];
    if (Array.isArray(trailRecord.stops) && trailRecord.stops.length > 0) {
      mappedStops = trailRecord.stops
        .map((stop: any) => {
          if (!stop || typeof stop !== 'object') return null;
          const brewery = stop.brewery
            ? mergeSanityEditorialWithCanonical(stop.brewery, this.canonicalBreweries)
            : null;
          if (!brewery) return null;
          return {
            ...stop,
            order: typeof stop.order === 'number' ? stop.order : 1,
            brewery,
            isOptional: Boolean(stop.isOptional),
          };
        })
        .filter(Boolean);

      mappedStops.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }

    const legacyBreweries = Array.isArray(trailRecord.breweries)
      ? trailRecord.breweries
          .map((brewery: any) => mergeSanityEditorialWithCanonical(brewery, this.canonicalBreweries))
          .filter(Boolean)
      : [];

    if (mappedStops.length === 0 && legacyBreweries.length > 0) {
      mappedStops = legacyBreweries.map((b: any, idx: number) => ({
        order: idx + 1,
        brewery: b,
        isOptional: false,
      }));
    }

    const breweries = mappedStops.map((s: any) => s.brewery).filter(Boolean);

    return {
      ...trailRecord,
      stops: mappedStops,
      breweries,
    };
  }

  async getAll(): Promise<BeerTrail[]> {
    if (!isSanityConfigured()) {
      console.warn('[SanityTrailRepository] Sanity unconfigured. Falling back to MockTrailRepository.');
      return this.fallbackRepo.getAll();
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(
        `*[_type == "trail"] { ${this.baseProjection} }`
      );
      if (!results || results.length === 0) return [];
      const mapped = results.map((t) => this.mapTrailReferences(t)).filter(Boolean);
      return validateBeerTrailList(mapped);
    } catch (error) {
      console.warn('[SanityTrailRepository] Sanity fetch error, falling back to MockTrailRepository:', error);
      return this.fallbackRepo.getAll();
    }
  }

  async getById(id: string): Promise<BeerTrail | null> {
    if (!isSanityConfigured()) {
      console.warn('[SanityTrailRepository] Sanity unconfigured. Falling back to MockTrailRepository.');
      return this.fallbackRepo.getById(id);
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(
        `*[_type == "trail" && _id == $id] { ${this.baseProjection} }`,
        { id }
      );
      if (!results || !results[0]) return null;
      const mapped = this.mapTrailReferences(results[0]);
      return mapped ? validateBeerTrail(mapped) : null;
    } catch (error) {
      console.warn('[SanityTrailRepository] Sanity fetch error, falling back to MockTrailRepository:', error);
      return this.fallbackRepo.getById(id);
    }
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    if (!isSanityConfigured()) {
      console.warn('[SanityTrailRepository] Sanity unconfigured. Falling back to MockTrailRepository.');
      return this.fallbackRepo.getBySlug(slug);
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(
        `*[_type == "trail" && slug.current == $slug] { ${this.baseProjection} }`,
        { slug }
      );
      if (!results || !results[0]) return null;
      const mapped = this.mapTrailReferences(results[0]);
      return mapped ? validateBeerTrail(mapped) : null;
    } catch (error) {
      console.warn('[SanityTrailRepository] Sanity fetch error, falling back to MockTrailRepository:', error);
      return this.fallbackRepo.getBySlug(slug);
    }
  }
}
