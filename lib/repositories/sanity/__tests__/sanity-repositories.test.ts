/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SanityBreweryRepository } from '../brewery';
import { SanityTrailRepository } from '../trail';
import { SanityGuideRepository } from '../guide';
import { sanityClient } from '../../../sanity/client';
import { Brewery } from '../../../types';

const canonicalBrewery: Brewery = {
  id: 'guinness-open-gate',
  slug: 'guinness-open-gate-brewery',
  name: 'Guinness Open Gate Brewery',
  type: 'Production',
  region: 'Central',
  status: 'Open',
  address: '5001 Washington Blvd',
  city: 'Halethorpe',
  county: 'Baltimore County',
  state: 'MD',
  zipCode: '21227',
  phone: '800-521-1859',
  website: 'https://www.guinnessbrewerybaltimore.com',
  socialLinks: {},
  coordinates: { lat: 39.2082, lng: -76.7118 },
  hours: [{ day: 'Thu-Sun', hours: '11am-10pm' }],
  beerStyles: ['Stout', 'Lager'],
  amenities: ['Outdoor Seating', 'Restaurant'],
  featured: true,
  lastVerified: '2025-05-10',
  verificationSource: 'Official Website',
  verificationStatus: 'Verified',
  description: 'Canonical description of Guinness Open Gate.',
  image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
};

describe('Sanity Repositories with Canonical Dataset Injection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('SanityBreweryRepository', () => {
    it('should map Sanity records and merge with provided canonical dataset', async () => {
      (vi.spyOn(sanityClient, 'fetch') as any).mockResolvedValueOnce([
        {
          id: 'guinness-open-gate',
          breweryId: 'guinness-open-gate',
          slug: 'guinness-open-gate-brewery',
          name: 'Guinness Open Gate Brewery',
          description: 'Editorial description from Sanity.',
          highlights: ['Lawn Games', 'Historic Barrel Room'],
          atmosphere: ['Spacious'],
          featured: true,
        },
      ]);

      const repo = new SanityBreweryRepository([canonicalBrewery]);
      const results = await repo.getAll();

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('guinness-open-gate');
      expect(results[0].description).toBe('Editorial description from Sanity.');
      expect(results[0].highlights).toEqual(['Lawn Games', 'Historic Barrel Room']);
      expect(results[0].address).toBe('5001 Washington Blvd');
    });

    it('should filter out incomplete Sanity brewery records that do not match canonical dataset', async () => {
      (vi.spyOn(sanityClient, 'fetch') as any).mockResolvedValueOnce([
        {
          id: 'unmatched-id',
          breweryId: 'unmatched-id',
          slug: 'unmatched-brewery',
          name: 'Unmatched Brewery',
          description: 'No matching canonical facts',
        },
      ]);

      const repo = new SanityBreweryRepository([canonicalBrewery]);
      const results = await repo.getAll();

      expect(results).toHaveLength(0);
    });

    it('should fetch single brewery by slug', async () => {
      (vi.spyOn(sanityClient, 'fetch') as any).mockResolvedValueOnce([
        {
          id: 'guinness-open-gate',
          breweryId: 'guinness-open-gate',
          slug: 'guinness-open-gate-brewery',
          name: 'Guinness Open Gate Brewery',
          description: 'Detailed description.',
        },
      ]);

      const repo = new SanityBreweryRepository([canonicalBrewery]);
      const result = await repo.getBySlug('guinness-open-gate-brewery');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('guinness-open-gate-brewery');
      expect(result?.city).toBe('Halethorpe');
    });
  });

  describe('SanityTrailRepository', () => {
    it('should map trail records and resolve referenced breweries from canonical dataset', async () => {
      (vi.spyOn(sanityClient, 'fetch') as any).mockResolvedValueOnce([
        {
          id: 'central-trail',
          _id: 'central-trail',
          slug: 'central-maryland-trail',
          name: 'Central Maryland Beer Trail',
          description: 'Scenic trail through Central MD.',
          region: 'Central',
          distance: '25 miles',
          duration: 'Full Day',
          image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
          highlight: 'Great scenic views',
          nearbyAttractions: ['B&O Railroad Museum'],
          difficulty: 'Easy',
          breweries: [
            {
              id: 'guinness-open-gate',
              breweryId: 'guinness-open-gate',
              slug: 'guinness-open-gate-brewery',
              name: 'Guinness Open Gate Brewery',
            },
          ],
        },
      ]);

      const repo = new SanityTrailRepository([canonicalBrewery]);
      const trails = await repo.getAll();

      expect(trails).toHaveLength(1);
      expect(trails[0].slug).toBe('central-maryland-trail');
      expect(trails[0].breweries).toHaveLength(1);
      expect(trails[0].breweries[0].id).toBe('guinness-open-gate');
    });
  });

  describe('SanityGuideRepository', () => {
    it('should map travel guide records and resolve recommended stops from canonical dataset', async () => {
      (vi.spyOn(sanityClient, 'fetch') as any).mockResolvedValueOnce([
        {
          slug: 'ultimate-baltimore-beer-guide',
          title: 'Ultimate Baltimore Beer Guide',
          guideType: 'regional_guide',
          description: 'Guide to Baltimore breweries',
          author: 'Editor Staff',
          publishDate: '2025-05-15',
          region: 'Central',
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [{ _type: 'span', text: 'Welcome to Baltimore beer scene.' }],
            },
          ],
          image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
          tips: ['Arrive early on weekends'],
          recommendedStops: [
            {
              id: 'guinness-open-gate',
              breweryId: 'guinness-open-gate',
              slug: 'guinness-open-gate-brewery',
              name: 'Guinness Open Gate Brewery',
            },
          ],
        },
      ]);

      const repo = new SanityGuideRepository([canonicalBrewery]);
      const guides = await repo.getAll();

      expect(guides).toHaveLength(1);
      expect(guides[0].slug).toBe('ultimate-baltimore-beer-guide');
      expect(guides[0].recommendedStops).toHaveLength(1);
      expect(guides[0].recommendedStops[0].id).toBe('guinness-open-gate');
      expect(guides[0].content).toContain('Welcome to Baltimore beer scene.');
    });
  });
});
