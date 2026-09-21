import { describe, it, expect } from 'vitest';
import sitemap from '../sitemap';
import * as BreweryPageModule from '../breweries/[slug]/page';
import { contentService } from '@/lib/services/content.service';

describe('XML Sitemap Generator and Brewery SEO / JSON-LD', () => {
  describe('Automated XML Sitemap Generator (app/sitemap.ts)', () => {
    it('generates a valid sitemap containing static, brewery, trail, county, category, and guide routes', async () => {
      const sitemapEntries = await sitemap();
      expect(Array.isArray(sitemapEntries)).toBe(true);
      expect(sitemapEntries.length).toBeGreaterThan(0);

      const urls = sitemapEntries.map((e) => e.url);

      // Core static routes
      expect(urls).toContain('https://marylandbeeratlas.com');
      expect(urls).toContain('https://marylandbeeratlas.com/breweries');
      expect(urls).toContain('https://marylandbeeratlas.com/map');
      expect(urls).toContain('https://marylandbeeratlas.com/trails');
      expect(urls).toContain('https://marylandbeeratlas.com/guides');
    });

    it('includes all active brewery routes and excludes permanently closed breweries', async () => {
      const allBreweries = await contentService.breweries.getAll();
      const sitemapEntries = await sitemap();
      const urls = new Set(sitemapEntries.map((e) => e.url));

      for (const brewery of allBreweries) {
        const isPermanentlyClosed =
          brewery.status === 'Closed' || brewery.status === 'Permanently closed';
        const expectedUrl = `https://marylandbeeratlas.com/breweries/${brewery.slug}`;

        if (isPermanentlyClosed) {
          expect(urls.has(expectedUrl)).toBe(false);
        } else {
          expect(urls.has(expectedUrl)).toBe(true);
        }
      }
    });

    it('includes all active trail routes', async () => {
      const allTrails = await contentService.trails.getAll();
      const sitemapEntries = await sitemap();
      const urls = new Set(sitemapEntries.map((e) => e.url));

      for (const trail of allTrails) {
        const expectedUrl = `https://marylandbeeratlas.com/trails/${trail.slug}`;
        expect(urls.has(expectedUrl)).toBe(true);
      }
    });
  });

  describe('Individual Brewery Detail SEO Metadata (generateMetadata)', () => {
    it('generates comprehensive SEO and Open Graph metadata for a valid brewery slug', async () => {
      const metadata = await BreweryPageModule.generateMetadata({
        params: Promise.resolve({ slug: 'flying-dog-brewery' }),
      });

      expect(metadata.title).toContain('Flying Dog Brewery');
      expect(metadata.description).toContain('Flying Dog Brewery');
      expect(metadata.alternates?.canonical).toBe('/breweries/flying-dog-brewery');

      // Open Graph assertions
      expect(metadata.openGraph).toBeDefined();
      const og = metadata.openGraph as {
        title?: string;
        type?: string;
        siteName?: string;
        url?: string;
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };

      expect(og?.title).toContain('Flying Dog Brewery');
      expect(og?.type).toBe('website');
      expect(og?.siteName).toBe('Maryland Beer Atlas');
      expect(og?.url).toBe('https://marylandbeeratlas.com/breweries/flying-dog-brewery');

      const ogImages = og?.images || [];
      expect(ogImages.length).toBeGreaterThan(0);
      expect(ogImages[0].width).toBe(1200);
      expect(ogImages[0].height).toBe(630);

      // Twitter Card assertions
      expect((metadata.twitter as { card?: string })?.card).toBe('summary_large_image');
    });

    it('handles non-existent brewery slugs gracefully', async () => {
      const metadata = await BreweryPageModule.generateMetadata({
        params: Promise.resolve({ slug: 'non-existent-brewery-slug-xyz' }),
      });

      expect(metadata.title).toBe('Brewery Not Found | Maryland Beer Atlas');
    });
  });
});
