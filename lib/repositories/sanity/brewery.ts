/* eslint-disable @typescript-eslint/no-explicit-any */
import { Brewery } from '../../types';
import { IBreweryRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { normalizeAndValidateBrewery, normalizeAndValidateBreweryList } from '../../validations/schemas';
import { mockBreweries } from '../../data/mock-data';

export class SanityBreweryRepository implements IBreweryRepository {
  private baseProjection = `
    "id": coalesce(breweryId, _id),
    "slug": slug.current,
    name,
    description,
    highlights,
    atmosphere,
    editorialRecommendations,
    curatedContent,
    "relatedGuides": relatedGuides[]->slug.current,
    "image": image.asset->url,
    featured
  `;

  /**
   * Merges Sanity editorial content with canonical brewery domain facts.
   */
  private mergeSanityEditorialWithCanonical(sanityRecord: any): unknown {
    if (!sanityRecord) return null;

    // Look up canonical brewery by slug or breweryId
    const canonical = mockBreweries.find(
      (b) => b.slug === sanityRecord.slug || b.id === sanityRecord.id
    );

    if (canonical) {
      // Complement canonical domain facts with Sanity editorial content
      return {
        ...canonical,
        description: sanityRecord.description || canonical.description,
        image: sanityRecord.image || canonical.image,
        featured: sanityRecord.featured !== undefined ? sanityRecord.featured : canonical.featured,
        highlights: sanityRecord.highlights || [],
        atmosphere: sanityRecord.atmosphere || [],
        editorialRecommendations: sanityRecord.editorialRecommendations || [],
        curatedContent: sanityRecord.curatedContent || null,
        relatedGuides: sanityRecord.relatedGuides || [],
      };
    }

    // Fallback defaults for canonical facts if record exists in Sanity but not in canonical dataset
    return {
      id: sanityRecord.id || 'sanity-brewery',
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

  async getAll(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery"] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results.map((item) => this.mergeSanityEditorialWithCanonical(item));
    return normalizeAndValidateBreweryList(merged);
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    if (!results || !results[0]) return null;
    const merged = this.mergeSanityEditorialWithCanonical(results[0]);
    return normalizeAndValidateBrewery(merged);
  }

  async getById(id: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && (_id == $id || breweryId == $id)] { ${this.baseProjection} }`,
      { id }
    );
    if (!results || !results[0]) return null;
    const merged = this.mergeSanityEditorialWithCanonical(results[0]);
    return normalizeAndValidateBrewery(merged);
  }

  async getFeatured(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && featured == true] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const merged = results.map((item) => this.mergeSanityEditorialWithCanonical(item));
    return normalizeAndValidateBreweryList(merged);
  }
}
