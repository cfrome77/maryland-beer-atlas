import { MetadataRoute } from 'next';
import { contentService } from '@/lib/services/content.service';
import { CATEGORY_MAP } from '@/app/breweries/category/[slug]/page';
import { slugifyCounty } from '@/app/breweries/county/[slug]/page';

const BASE_URL = 'https://marylandbeeratlas.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [breweries, trails, guides] = await Promise.all([
    contentService.breweries.getAll(),
    contentService.trails.getAll(),
    contentService.guides.getAll(),
  ]);

  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/breweries`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/trails`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Brewery detail routes
  const breweryRoutes: MetadataRoute.Sitemap = breweries.map((b) => ({
    url: `${BASE_URL}/breweries/${b.slug}`,
    lastModified: b.lastVerified ? new Date(b.lastVerified) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // County routes
  const uniqueCounties = Array.from(new Set(breweries.map((b) => b.county)));
  const countyRoutes: MetadataRoute.Sitemap = uniqueCounties.map((county) => ({
    url: `${BASE_URL}/breweries/county/${slugifyCounty(county)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Category / Amenity routes
  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORY_MAP).map((categorySlug) => ({
    url: `${BASE_URL}/breweries/category/${categorySlug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Beer trail routes
  const trailRoutes: MetadataRoute.Sitemap = trails.map((t) => ({
    url: `${BASE_URL}/trails/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Travel guide routes (excluding noIndex guides)
  const guideRoutes: MetadataRoute.Sitemap = guides
    .filter((g) => !g.seo?.noIndex)
    .map((g) => ({
      url: `${BASE_URL}/guides/${g.slug}`,
      lastModified: g.publishDate ? new Date(g.publishDate) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...breweryRoutes,
    ...countyRoutes,
    ...categoryRoutes,
    ...trailRoutes,
    ...guideRoutes,
  ];
}
