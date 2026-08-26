/* eslint-disable @typescript-eslint/no-explicit-any */
import { Brewery } from '../../types';
import { IBreweryRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { normalizeAndValidateBrewery, normalizeAndValidateBreweryList } from '../../validations/schemas';
import { mockBreweries } from '../../data/mock-data';

/**
 * Resolves and merges Sanity brewery editorial content with canonical brewery domain facts.
 * Avoids copying canonical facts into Sanity while ensuring stable identity linking via breweryId or slug.
 */
export function mergeSanityEditorialWithCanonical(sanityRecord: any): unknown {
  if (!sanityRecord) return null;

  // Look up canonical brewery by breweryId, id, or slug
  const canonical = mockBreweries.find(
    (b) =>
      (sanityRecord.breweryId && b.id === sanityRecord.breweryId) ||
      (sanityRecord.id && b.id === sanityRecord.id) ||
      (sanityRecord.slug && b.slug === sanityRecord.slug)
  );

  const canonicalRecord = canonical as any;

  if (canonical) {
    // Complement canonical domain facts with Sanity editorial content
    return {
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
  }

  // Fallback defaults for canonical facts if record exists in Sanity but not in canonical dataset
  return {
    id: sanityRecord.breweryId || sanityRecord.id || 'sanity-brewery',
    slug: sanityRecord.slug || 'sanity-brewery',
    name: sanityRecord.name || 'Sanity Editorial Brewery',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    address: 'Unknown',
    city: 'Unknown',
    county: 'Unknown',
    state: 'MD',
    zipCode: '00000',
    phone: '',
    website: '',
    socialLinks: {},
    coordinates: { lat: 39.0458, lng: -76.6413 },
    hours: [],
    beerStyles: [],
    amenities: [],
    featured: Boolean(sanityRecord.featured),
    lastVerified: new Date().toISOString().split('T')[0],
    verificationSource: 'Sanity CMS',
    verificationStatus: 'Needs Review',
    description: sanityRecord.description || '',
    image: sanityRecord.image || 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=800',
    highlights: sanityRecord.highlights || [],
    atmosphere: sanityRecord.atmosphere || [],
    editorialRecommendations: sanityRecord.editorialRecommendations || [],
    curatedContent: sanityRecord.curatedContent || null,
    relatedGuides: sanityRecord.relatedGuides || [],
  };
}

export class SanityBreweryRepository implements IBreweryRepository {
  private baseProjection = `
    "id": coalesce(breweryId, _id),
    breweryId,
    "slug": slug.current,
    name,
    description,
    highlights,
    atmosphere,
    editorialRecommendations,
    curatedContent,
    "relatedGuides": *[_type == "guide" && references(^._id)].slug.current,
    "image": image.asset->url,
    featured
  `;

  async getAll(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery"] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results.map((item) => mergeSanityEditorialWithCanonical(item)).filter(Boolean);
    return normalizeAndValidateBreweryList(merged);
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    if (!results || !results[0]) return null;
    const merged = mergeSanityEditorialWithCanonical(results[0]);
    return merged ? normalizeAndValidateBrewery(merged) : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && (_id == $id || breweryId == $id)] { ${this.baseProjection} }`,
      { id }
    );
    if (!results || !results[0]) return null;
    const merged = mergeSanityEditorialWithCanonical(results[0]);
    return merged ? normalizeAndValidateBrewery(merged) : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && featured == true] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results.map((item) => mergeSanityEditorialWithCanonical(item)).filter(Boolean);
    return normalizeAndValidateBreweryList(merged);
  }
}
