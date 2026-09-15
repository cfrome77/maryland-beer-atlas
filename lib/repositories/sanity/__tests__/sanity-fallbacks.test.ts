import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SanityBreweryRepository } from '../brewery';
import { SanityTrailRepository } from '../trail';
import { SanityGuideRepository } from '../guide';
import { sanityClient } from '../../../sanity/client';
import {
  safeValidateBrewery,
  safeValidateBeerTrail,
  safeValidateTravelGuide,
} from '../../../validations/schemas';

describe('Sanity Repository Fallbacks and Zod Schema Validation', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = originalEnv;
  });

  describe('Unconfigured Sanity Environment Fallbacks', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    });

    it('SanityBreweryRepository gracefully falls back to mock breweries when unconfigured', async () => {
      const repo = new SanityBreweryRepository();
      const breweries = await repo.getAll();
      expect(breweries.length).toBeGreaterThan(0);
      expect(breweries[0]).toHaveProperty('slug');

      const single = await repo.getBySlug(breweries[0].slug);
      expect(single).not.toBeNull();
      expect(single?.slug).toBe(breweries[0].slug);

      const featured = await repo.getFeatured();
      expect(featured.length).toBeGreaterThan(0);
    });

    it('SanityTrailRepository gracefully falls back to mock trails when unconfigured', async () => {
      const repo = new SanityTrailRepository();
      const trails = await repo.getAll();
      expect(trails.length).toBeGreaterThan(0);
      expect(trails[0]).toHaveProperty('slug');

      const single = await repo.getBySlug(trails[0].slug);
      expect(single).not.toBeNull();
      expect(single?.slug).toBe(trails[0].slug);
    });

    it('SanityGuideRepository gracefully falls back to mock guides when unconfigured', async () => {
      const repo = new SanityGuideRepository();
      const guides = await repo.getAll();
      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0]).toHaveProperty('slug');

      const single = await repo.getBySlug(guides[0].slug);
      expect(single).not.toBeNull();
      expect(single?.slug).toBe(guides[0].slug);
    });
  });

  describe('Runtime API Error Fallbacks', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test-sanity-project';
    });

    it('SanityBreweryRepository falls back to mock data when sanityClient.fetch throws an error', async () => {
      vi.spyOn(sanityClient, 'fetch').mockRejectedValue(new Error('Sanity Network Timeout'));

      const repo = new SanityBreweryRepository();
      const breweries = await repo.getAll();
      expect(breweries.length).toBeGreaterThan(0);

      const single = await repo.getBySlug(breweries[0].slug);
      expect(single).not.toBeNull();
      expect(single?.slug).toBe(breweries[0].slug);

      const byId = await repo.getById(breweries[0].id);
      expect(byId).not.toBeNull();

      const featured = await repo.getFeatured();
      expect(featured.length).toBeGreaterThan(0);
    });

    it('SanityBreweryRepository handles null or non-array API responses gracefully', async () => {
      vi.spyOn(sanityClient, 'fetch').mockResolvedValue(null);

      const repo = new SanityBreweryRepository();
      const breweries = await repo.getAll();
      expect(breweries).toEqual([]);

      const single = await repo.getBySlug('non-existent');
      expect(single).toBeNull();
    });

    it('SanityTrailRepository falls back to mock data when sanityClient.fetch throws an error', async () => {
      vi.spyOn(sanityClient, 'fetch').mockRejectedValue(new Error('Sanity 500 Internal Error'));

      const repo = new SanityTrailRepository();
      const trails = await repo.getAll();
      expect(trails.length).toBeGreaterThan(0);
    });

    it('SanityGuideRepository falls back to mock data when sanityClient.fetch throws an error', async () => {
      vi.spyOn(sanityClient, 'fetch').mockRejectedValue(new Error('Sanity Unauthorized'));

      const repo = new SanityGuideRepository();
      const guides = await repo.getAll();
      expect(guides.length).toBeGreaterThan(0);
    });
  });

  describe('Zod Schema Validation Guarding', () => {
    it('safeValidateBrewery rejects invalid brewery data with detailed error message', () => {
      const invalidBrewery = {
        id: 'bad-brewery',
        slug: 'INVALID SLUG WITH SPACES',
        name: 'Invalid Brewery',
      };

      const result = safeValidateBrewery(invalidBrewery);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedError).toContain('[Runtime Validation Error]');
        expect(result.formattedError).toContain('Slug must be lower-case');
      }
    });

    it('safeValidateBeerTrail rejects invalid trail data', () => {
      const invalidTrail = {
        id: 'bad-trail',
        name: 'Empty Trail',
        stops: [], // Needs at least 1 stop
      };

      const result = safeValidateBeerTrail(invalidTrail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedError).toContain('[Runtime Validation Error]');
      }
    });

    it('safeValidateTravelGuide rejects invalid travel guide data', () => {
      const invalidGuide = {
        title: 'Guide without slug',
        content: 'Some text',
      };

      const result = safeValidateTravelGuide(invalidGuide);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedError).toContain('[Runtime Validation Error]');
      }
    });
  });
});
