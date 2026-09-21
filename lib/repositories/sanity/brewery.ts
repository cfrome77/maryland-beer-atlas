/* eslint-disable @typescript-eslint/no-explicit-any */
import { Brewery } from '../../types';
import { IBreweryRepository, MapBreweryMarker } from '../interfaces';
import { MockBreweryRepository } from '../mock';
import { sanityClient, isSanityConfigured } from '../../sanity/client';
import { normalizeAndValidateBrewery, normalizeAndValidateBreweryList } from '../../validations/schemas';

/**
 * Lightweight GROQ projection for rendering interactive map view markers & popups efficiently.
 * Fetches minimal attributes required for spatial placement, marker filtering, and popups,
 * omitting heavy narrative and detail payload fields.
 */
export const MAP_BREWERY_PROJECTION = `
  "id": coalesce(breweryId, _id),
  breweryId,
  "slug": slug.current,
  name,
  postalCode,
  latitude,
  longitude,
  featured,
  amenities,
  "image": coalesce(image.asset->url + "?auto=format&q=80", image.asset->url, image)
`;

/**
 * Full GROQ projection for detail pages and full domain entity mapping.
 * Fetches complete storytelling content, structured hours, social media links,
 * amenity tags, and editorial recommendations.
 */
export const FULL_BREWERY_PROJECTION = `
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
  hours[] {
    day,
    hours
  },
  structuredHours[] {
    day,
    isClosed,
    periods[] {
      opens,
      closes
    }
  },
  socialLinks {
    facebook,
    instagram,
    twitter
  },
  amenities,
  "relatedGuides": *[_type == "guide" && references(^._id)].slug.current,
  "image": coalesce(image.asset->url + "?auto=format&q=80", image.asset->url, image),
  "logo": coalesce(logo.asset->url + "?auto=format&q=80", logo.asset->url, logo),
  featured
`;

export const MAP_BREWERIES_QUERY = `*[_type == "brewery"] { ${MAP_BREWERY_PROJECTION} }`;
export const ALL_BREWERIES_QUERY = `*[_type == "brewery"] { ${FULL_BREWERY_PROJECTION} }`;
export const BREWERY_BY_SLUG_QUERY = `*[_type == "brewery" && slug.current == $slug] { ${FULL_BREWERY_PROJECTION} }`;
export const BREWERY_BY_ID_QUERY = `*[_type == "brewery" && (_id == $id || breweryId == $id)] { ${FULL_BREWERY_PROJECTION} }`;
export const FEATURED_BREWERIES_QUERY = `*[_type == "brewery" && featured == true] { ${FULL_BREWERY_PROJECTION} }`;

/**
 * Resolves and merges Sanity brewery editorial content with canonical brewery domain facts.
 * Avoids copying canonical facts into Sanity while ensuring stable identity linking via breweryId or slug.
 *
 * Does NOT import mockBreweries or fabricate values for missing canonical facts.
 */
export function mergeSanityEditorialWithCanonical(
  sanityRecord: any,
  canonicalDataset: Brewery[] = []
): Brewery | null {
  if (!sanityRecord) return null;

  // Look up canonical brewery by breweryId, id, or slug from provided canonical dataset
  const canonical = canonicalDataset.find(
    (b) =>
      (sanityRecord.breweryId && b.id === sanityRecord.breweryId) ||
      (sanityRecord.id && b.id === sanityRecord.id) ||
      (sanityRecord.slug && b.slug === sanityRecord.slug)
  );

  if (canonical) {
    const canonicalRecord = canonical as any;
    const merged = {
      ...canonical,
      description: sanityRecord.description || canonical.description,
      image: sanityRecord.image || canonical.image,
      logo: sanityRecord.logo || canonicalRecord?.logo || null,
      featured: sanityRecord.featured !== undefined ? sanityRecord.featured : canonical.featured,
      highlights: sanityRecord.highlights || canonicalRecord?.highlights || [],
      atmosphere: sanityRecord.atmosphere || canonicalRecord?.atmosphere || [],
      editorialRecommendations: sanityRecord.editorialRecommendations || [],
      curatedContent: sanityRecord.curatedContent || null,
      relatedGuides: sanityRecord.relatedGuides || [],
      hours: (Array.isArray(sanityRecord.hours) && sanityRecord.hours.length > 0) ? sanityRecord.hours : canonical.hours,
      structuredHours: (Array.isArray(sanityRecord.structuredHours) && sanityRecord.structuredHours.length > 0) ? sanityRecord.structuredHours : canonical.structuredHours,
      socialLinks: sanityRecord.socialLinks && Object.keys(sanityRecord.socialLinks).length > 0 ? sanityRecord.socialLinks : canonical.socialLinks,
      amenities: (Array.isArray(sanityRecord.amenities) && sanityRecord.amenities.length > 0) ? sanityRecord.amenities : canonical.amenities,
    };
    return normalizeAndValidateBrewery(merged);
  }

  // If sanityRecord itself contains all required canonical facts, normalize & validate it.
  // Returns null if required canonical domain facts are missing, avoiding fabricated values.
  try {
    return normalizeAndValidateBrewery(sanityRecord);
  } catch {
    return null;
  }
}

export class SanityBreweryRepository implements IBreweryRepository {
  private fallbackRepo: MockBreweryRepository;

  constructor(private canonicalBreweries: Brewery[] = []) {
    this.fallbackRepo = new MockBreweryRepository(
      canonicalBreweries.length > 0 ? canonicalBreweries : undefined
    );
  }

  async getAll(): Promise<Brewery[]> {
    if (!isSanityConfigured()) {
      console.warn('[SanityBreweryRepository] Sanity unconfigured. Falling back to MockBreweryRepository.');
      return this.fallbackRepo.getAll();
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(ALL_BREWERIES_QUERY);
      if (!results || results.length === 0) return [];
      const merged = results
        .map((item) => mergeSanityEditorialWithCanonical(item, this.canonicalBreweries))
        .filter((item): item is Brewery => item !== null);
      return normalizeAndValidateBreweryList(merged);
    } catch (error) {
      console.warn('[SanityBreweryRepository] Sanity fetch error, falling back to MockBreweryRepository:', error);
      return this.fallbackRepo.getAll();
    }
  }

  async getMapBreweries(): Promise<MapBreweryMarker[]> {
    if (!isSanityConfigured()) {
      console.warn('[SanityBreweryRepository] Sanity unconfigured. Falling back to MockBreweryRepository.');
      return this.fallbackRepo.getMapBreweries();
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(MAP_BREWERIES_QUERY);
      if (!results || results.length === 0) return [];
      return results.map((item: any) => {
        const canonical = this.canonicalBreweries.find(
          (b) => (item.breweryId && b.id === item.breweryId) || (item.id && b.id === item.id) || (item.slug && b.slug === item.slug)
        );
        return {
          id: item.id || canonical?.id,
          breweryId: item.breweryId || canonical?.id,
          slug: item.slug || canonical?.slug,
          name: item.name || canonical?.name,
          latitude: item.latitude ?? canonical?.coordinates?.lat,
          longitude: item.longitude ?? canonical?.coordinates?.lng,
          postalCode: item.postalCode || canonical?.zipCode,
          featured: item.featured ?? canonical?.featured,
          amenities: item.amenities || canonical?.amenities || [],
          image: item.image || canonical?.image,
        };
      });
    } catch (error) {
      console.warn('[SanityBreweryRepository] Sanity fetch error, falling back to MockBreweryRepository:', error);
      return this.fallbackRepo.getMapBreweries();
    }
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    if (!isSanityConfigured()) {
      console.warn('[SanityBreweryRepository] Sanity unconfigured. Falling back to MockBreweryRepository.');
      return this.fallbackRepo.getBySlug(slug);
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(BREWERY_BY_SLUG_QUERY, { slug });
      if (!results || !results[0]) return null;
      const merged = mergeSanityEditorialWithCanonical(results[0], this.canonicalBreweries);
      return merged ? normalizeAndValidateBrewery(merged) : null;
    } catch (error) {
      console.warn('[SanityBreweryRepository] Sanity fetch error, falling back to MockBreweryRepository:', error);
      return this.fallbackRepo.getBySlug(slug);
    }
  }

  async getById(id: string): Promise<Brewery | null> {
    if (!isSanityConfigured()) {
      console.warn('[SanityBreweryRepository] Sanity unconfigured. Falling back to MockBreweryRepository.');
      return this.fallbackRepo.getById(id);
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(BREWERY_BY_ID_QUERY, { id });
      if (!results || !results[0]) return null;
      const merged = mergeSanityEditorialWithCanonical(results[0], this.canonicalBreweries);
      return merged ? normalizeAndValidateBrewery(merged) : null;
    } catch (error) {
      console.warn('[SanityBreweryRepository] Sanity fetch error, falling back to MockBreweryRepository:', error);
      return this.fallbackRepo.getById(id);
    }
  }

  async getFeatured(): Promise<Brewery[]> {
    if (!isSanityConfigured()) {
      console.warn('[SanityBreweryRepository] Sanity unconfigured. Falling back to MockBreweryRepository.');
      return this.fallbackRepo.getFeatured();
    }
    try {
      const results = await sanityClient.fetch<unknown[]>(FEATURED_BREWERIES_QUERY);
      if (!results || results.length === 0) return [];
      const merged = results
        .map((item) => mergeSanityEditorialWithCanonical(item, this.canonicalBreweries))
        .filter((item): item is Brewery => item !== null);
      return normalizeAndValidateBreweryList(merged);
    } catch (error) {
      console.warn('[SanityBreweryRepository] Sanity fetch error, falling back to MockBreweryRepository:', error);
      return this.fallbackRepo.getFeatured();
    }
  }
}
