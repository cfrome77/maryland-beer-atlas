import { TravelGuide } from '../../types';
import { IGuideRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';

export class SanityGuideRepository implements IGuideRepository {
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
    "slug": slug.current,
    title,
    description,
    author,
    publishDate,
    region,
    content,
    "image": image.asset->url,
    tips,
    recommendedStops[]-> {
      ${this.breweryProjection}
    }
  `;

  async getAll(): Promise<TravelGuide[]> {
    const results = await sanityClient.fetch<TravelGuide[]>(
      `*[_type == "guide"] { ${this.baseProjection} }`
    );
    return results || [];
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const results = await sanityClient.fetch<TravelGuide[]>(
      `*[_type == "guide" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    return results[0] || null;
  }
}
