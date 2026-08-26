/* eslint-disable @typescript-eslint/no-explicit-any */
import { BeerTrail } from '../../types';
import { ITrailRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { validateBeerTrail, validateBeerTrailList } from '../../validations/schemas';
import { mergeSanityEditorialWithCanonical } from './brewery';

export class SanityTrailRepository implements ITrailRepository {
  private breweryProjection = `
    "id": coalesce(breweryId, _id),
    breweryId,
    "slug": slug.current,
    name,
    description,
    highlights,
    atmosphere,
    editorialRecommendations,
    curatedContent,
    "image": image.asset->url,
    featured
  `;

  private baseProjection = `
    "id": _id,
    "slug": slug.current,
    name,
    description,
    region,
    distance,
    duration,
    "image": image.asset->url,
    highlight,
    nearbyAttractions,
    difficulty,
    "breweries": breweries[defined(@->._id)]-> {
      ${this.breweryProjection}
    }
  `;

  private mapTrailReferences(trailRecord: any): unknown {
    if (!trailRecord) return null;
    const breweries = Array.isArray(trailRecord.breweries)
      ? trailRecord.breweries.map((brewery: any) => mergeSanityEditorialWithCanonical(brewery)).filter(Boolean)
      : [];

    return {
      ...trailRecord,
      breweries,
    };
  }

  async getAll(): Promise<BeerTrail[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "trail"] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const mapped = results.map((t) => this.mapTrailReferences(t)).filter(Boolean);
    return validateBeerTrailList(mapped);
  }

  async getById(id: string): Promise<BeerTrail | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "trail" && _id == $id] { ${this.baseProjection} }`,
      { id }
    );
    if (!results || !results[0]) return null;
    const mapped = this.mapTrailReferences(results[0]);
    return mapped ? validateBeerTrail(mapped) : null;
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "trail" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    if (!results || !results[0]) return null;
    const mapped = this.mapTrailReferences(results[0]);
    return mapped ? validateBeerTrail(mapped) : null;
  }
}
