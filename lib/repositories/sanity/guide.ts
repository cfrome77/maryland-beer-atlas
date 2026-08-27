/* eslint-disable @typescript-eslint/no-explicit-any */
import { TravelGuide } from '../../types';
import { IGuideRepository } from '../interfaces';
import { sanityClient } from '../../sanity/client';
import { validateTravelGuide, validateTravelGuideList } from '../../validations/schemas';
import { mergeSanityEditorialWithCanonical } from './brewery';

/**
 * Converts Sanity Portable Text block objects into structured HTML text.
 * Passes plain HTML string through untouched if already serialized.
 */
export function portableTextToHtml(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((block: any) => {
      if (block._type === 'block') {
        const style = block.style || 'normal';
        const childrenHtml = (block.children || [])
          .map((child: any) => {
            let text = child.text || '';
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (child.marks && Array.isArray(child.marks)) {
              if (child.marks.includes('strong')) text = `<strong>${text}</strong>`;
              if (child.marks.includes('em')) text = `<em>${text}</em>`;
              if (child.marks.includes('code')) text = `<code>${text}</code>`;
            }
            return text;
          })
          .join('');

        if (style === 'h2') return `<h2>${childrenHtml}</h2>`;
        if (style === 'h3') return `<h3>${childrenHtml}</h3>`;
        if (style === 'h4') return `<h4>${childrenHtml}</h4>`;
        if (style === 'blockquote') return `<blockquote>${childrenHtml}</blockquote>`;
        return `<p>${childrenHtml}</p>`;
      }
      if (block._type === 'image' && (block.asset?.url || block.url)) {
        const imageUrl = block.asset?.url || block.url;
        const caption = block.caption ? `<figcaption class="text-xs text-zinc-500 mt-1 text-center">${block.caption}</figcaption>` : '';
        return `<figure class="my-6"><img src="${imageUrl}" alt="${block.alt || 'Guide photo'}" class="rounded-xl w-full object-cover" />${caption}</figure>`;
      }
      return '';
    })
    .join('');
}

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
    guideType,
    description,
    author,
    publishDate,
    region,
    "county": county->name,
    "categories": categories[]->name,
    content,
    "image": image.asset->url,
    "gallery": gallery[] {
      "url": asset->url,
      caption,
      alt
    },
    tips,
    "recommendedStops": recommendedStops[defined(@->._id)]-> {
      ${this.breweryProjection}
    },
    "relatedTrails": relatedTrails[defined(@->._id)]-> {
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
    },
    "relatedGuides": relatedGuides[defined(@->._id)]-> {
      "slug": slug.current,
      title,
      description,
      guideType,
      "image": image.asset->url
    },
    "seo": {
      metaTitle,
      metaDescription,
      keywords,
      "ogImage": seo.ogImage.asset->url,
      noIndex
    }
  `;

  private mapGuideReferences(guideRecord: any): unknown {
    if (!guideRecord) return null;
    const stops = Array.isArray(guideRecord.recommendedStops)
      ? guideRecord.recommendedStops.map((stop: any) => mergeSanityEditorialWithCanonical(stop)).filter(Boolean)
      : [];

    const trails = Array.isArray(guideRecord.relatedTrails)
      ? guideRecord.relatedTrails.map((trail: any) => ({
          ...trail,
          breweries: Array.isArray(trail.breweries)
            ? trail.breweries.map((b: any) => mergeSanityEditorialWithCanonical(b)).filter(Boolean)
            : [],
        }))
      : undefined;

    const contentHtml = portableTextToHtml(guideRecord.content);

    return {
      ...guideRecord,
      guideType: guideRecord.guideType || 'brewery_guide',
      content: contentHtml,
      recommendedStops: stops,
      relatedTrails: trails && trails.length > 0 ? trails : undefined,
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
