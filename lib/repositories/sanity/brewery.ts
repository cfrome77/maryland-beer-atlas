import { Brewery } from '../../types';
import { IBreweryRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { normalizeAndValidateBrewery, normalizeAndValidateBreweryList } from '../../validations/schemas';

export class SanityBreweryRepository implements IBreweryRepository {
  private baseProjection = `
    "id": _id,
    "slug": slug.current,
    name,
    type,
    region,
    status,
    statusUpdatedAt,
    statusNotes,
    address,
    city,
    county,
    "state": coalesce(state, "MD"),
    zipCode,
    phone,
    website,
    socialLinks,
    coordinates,
    description,
    "image": image.asset->url,
    hours,
    structuredHours,
    holidayExceptions,
    beerStyles,
    amenities,
    featured,
    lastVerified,
    verificationSource,
    verificationStatus,
    verification,
    sourceInfo
  `;

  async getAll(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery"] { ${this.baseProjection} }`
    );
    return results && results.length > 0 ? normalizeAndValidateBreweryList(results) : [];
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    return results && results[0] ? normalizeAndValidateBrewery(results[0]) : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && _id == $id] { ${this.baseProjection} }`,
      { id }
    );
    return results && results[0] ? normalizeAndValidateBrewery(results[0]) : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "brewery" && featured == true] { ${this.baseProjection} }`
    );
    return results && results.length > 0 ? normalizeAndValidateBreweryList(results) : [];
  }
}
