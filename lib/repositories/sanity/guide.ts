/* eslint-disable @typescript-eslint/no-explicit-any */
import { TravelGuide } from '../../types';
import { IGuideRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { validateTravelGuide, validateTravelGuideList } from '../../validations/schemas';
import { mergeSanityEditorialWithCanonical } from './brewery';

export class SanityGuideRepository implements IGuideRepository {
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
    "slug": slug.current,
    title,
    description,
    author,
    publishDate,
    region,
    content,
    "image": image.asset->url,
    tips,
    "recommendedStops": recommendedStops[defined(@->._id)]-> {
      ${this.breweryProjection}
    }
  `;

  private mapGuideReferences(guideRecord: any): unknown {
    if (!guideRecord) return null;
    const stops = Array.isArray(guideRecord.recommendedStops)
      ? guideRecord.recommendedStops.map((stop: any) => mergeSanityEditorialWithCanonical(stop)).filter(Boolean)
      : [];

    return {
      ...guideRecord,
      recommendedStops: stops,
    };
  }

  async getAll(): Promise<TravelGuide[]> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "guide"] { ${this.baseProjection} }`
    );
    if (!results || results.length === 0) return [];
    const mapped = results.map((g) => this.mapGuideReferences(g)).filter(Boolean);
    return validateTravelGuideList(mapped);
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const results = await sanityClient.fetch<unknown[]>(
      `*[_type == "guide" && slug.current == $slug] { ${this.baseProjection} }`,
      { slug }
    );
    if (!results || !results[0]) return null;
    const mapped = this.mapGuideReferences(results[0]);
    return mapped ? validateTravelGuide(mapped) : null;
  }
}
