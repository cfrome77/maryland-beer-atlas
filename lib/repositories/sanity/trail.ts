import { BeerTrail } from '../../types';
import { ITrailRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';

export class SanityTrailRepository implements ITrailRepository {
  private breweryProjection = `
    "id": _id,
    "slug": slug.current,
    name,
    type,
    region,
    address,
    city,
    county,
    zipCode,
    phone,
    website,
    socialLinks,
    coordinates,
    description,
    "image": image.asset->url,
    hours,
    beerStyles,
    amenities,
    featured,
    lastVerified,
    verificationSource,
    verificationStatus
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
    breweries[]-> {
      ${this.breweryProjection}
    }
  `;

  async getAll(): Promise<BeerTrail[]> {
    const results = await sanityClient.fetch<BeerTrail[]>(
      `*[_type == "trail"] { ${this.baseProjection} }`
    );
    return results || [];
  }

  async getById(id: string): Promise<BeerTrail | null> {
    const results = await sanityClient.fetch<BeerTrail[]>(
      `*[_type == "trail" && _id == $id] { ${this.baseProjection} }`,
      { id }
    );
    return results[0] || null;
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    const results = await sanityClient.fetch<BeerTrail[]>(
      `*[_type == "trail" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    return results[0] || null;
  }
}
