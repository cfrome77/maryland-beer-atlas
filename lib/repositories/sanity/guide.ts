import { TravelGuide } from '../../types';
import { IGuideRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { validateTravelGuide, validateTravelGuideList } from '../../validations/schemas';

export class SanityGuideRepository implements IGuideRepository {
  private breweryProjection = `
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
    verification
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
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "guide"] { ${this.baseProjection} }`
    );
    return results && results.length > 0 ? validateTravelGuideList(results) : [];
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "guide" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    return results && results[0] ? validateTravelGuide(results[0]) : null;
  }
}
