/* eslint-disable @typescript-eslint/no-explicit-any */
import { Brewery } from '../../types';
import { IBreweryRepository } from '../interfaces';
import { sanityClient, isSanityConfigured } from '../../sanity/client';
import { normalizeAndValidateBrewery, normalizeAndValidateBreweryList } from '../../validations/schemas';

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
      featured: sanityRecord.featured !== undefined ? sanityRecord.featured : canonical.featured,
      highlights: sanityRecord.highlights || canonicalRecord?.highlights || [],
      atmosphere: sanityRecord.atmosphere || canonicalRecord?.atmosphere || [],
      editorialRecommendations: sanityRecord.editorialRecommendations || [],
      curatedContent: sanityRecord.curatedContent || null,
      relatedGuides: sanityRecord.relatedGuides || [],
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
  private baseProjection = `
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
    editorialRecommendations,
    curatedContent,
    "relatedGuides": *[_type == "guide" && references(^._id)].slug.current,
    "image": image.asset->url,
    featured
  `;

  constructor(private canonicalBreweries: Brewery[] = []) {}

  private ensureConfigured(): void {
    if (!isSanityConfigured()) {
      throw new Error(
        'Sanity CMS configuration is missing or invalid (NEXT_PUBLIC_SANITY_PROJECT_ID is unconfigured). ' +
        'Set valid Sanity environment variables or set USE_MOCK_DATA=true for development mock data.'
      );
    }
  }

  async getAll(): Promise<Brewery[]> {
    this.ensureConfigured();
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery"] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results
      .map((item) => mergeSanityEditorialWithCanonical(item, this.canonicalBreweries))
      .filter((item): item is Brewery => item !== null);
    return normalizeAndValidateBreweryList(merged);
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    this.ensureConfigured();
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    if (!results || !results[0]) return null;
    const merged = mergeSanityEditorialWithCanonical(results[0], this.canonicalBreweries);
    return merged ? normalizeAndValidateBrewery(merged) : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    this.ensureConfigured();
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && (_id == $id || breweryId == $id)] { ${this.baseProjection} }`,
      { id }
    );
    if (!results || !results[0]) return null;
    const merged = mergeSanityEditorialWithCanonical(results[0], this.canonicalBreweries);
    return merged ? normalizeAndValidateBrewery(merged) : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    this.ensureConfigured();
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && featured == true] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results
      .map((item) => mergeSanityEditorialWithCanonical(item, this.canonicalBreweries))
      .filter((item): item is Brewery => item !== null);
    return normalizeAndValidateBreweryList(merged);
  }
}
