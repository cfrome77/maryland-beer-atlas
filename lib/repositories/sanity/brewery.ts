import { Brewery } from '../../types';
import { IBreweryRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';

export class SanityBreweryRepository implements IBreweryRepository {
  private baseProjection = `
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

  async getAll(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<Brewery[]>(
      `*[_type == "brewery"] { ${this.baseProjection} }`
    );
    return results || [];
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<Brewery[]>(
      `*[_type == "brewery" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    return results[0] || null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<Brewery[]>(
      `*[_type == "brewery" && _id == $id] { ${this.baseProjection} }`,
      { id }
    );
    return results[0] || null;
  }

  async getFeatured(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<Brewery[]>(
      `*[_type == "brewery" && featured == true] { ${this.baseProjection} }`
    );
    return results || [];
  }
}
