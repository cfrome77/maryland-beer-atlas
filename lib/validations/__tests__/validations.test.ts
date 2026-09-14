import { describe, it, expect } from 'vitest';
import {
  brewerySchema,
  validateBrewery,
  safeValidateBrewery,
  validateBreweryList,
  validateBeerTrail,
  validateBeerTrailList,
  validateTravelGuide,
  validateTravelGuideList,
  getDerivedBreweryFields,
  formatZodError,
  normalizeAndValidateBrewery,
  normalizeAndValidateBreweryList,
} from '../schemas';
import { mockBreweries, mockTrails, mockGuides } from '../../data/mock-data';
import { MockBreweryRepository, MockTrailRepository, MockGuideRepository } from '../../repositories/mock';

describe('Zod Validation Layer', () => {
  describe('Brewery Schema Validation', () => {
    it('validates a complete, valid brewery record', () => {
      const validBrewery = mockBreweries[0];
      const result = brewerySchema.safeParse(validBrewery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Flying Dog Brewery');
        expect(result.data.region).toBe('Central');
      }
    });

    it('validates a minimal brewery record with nullish optional fields', () => {
      const minimalBrewery = {
        id: 'minimal-brewery',
        slug: 'minimal-brewery',
        name: 'Minimal Brewery',
        type: 'Microbrewery',
        region: 'Western',
        status: 'Open',
        address: '100 Main St',
        city: 'Cumberland',
        county: 'Allegany',
        zipCode: '21502',
        phone: '301-555-0199',
        website: 'https://minimalbrewery.com',
        socialLinks: { facebook: null, instagram: undefined },
        coordinates: { lat: 39.6528, lng: -78.7625 },
        hours: [{ day: 'Friday', hours: '4:00 PM - 9:00 PM' }],
        beerStyles: ['Pilsner'],
        amenities: ['Tasting Room'],
        featured: false,
        lastVerified: '2025-07-01',
        verificationSource: 'Official Website',
        verificationStatus: 'Verified',
        description: 'A minimal craft brewery in Cumberland.',
        image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
        statusUpdatedAt: null,
        statusNotes: undefined,
        structuredHours: null,
        holidayExceptions: undefined,
        verification: null,
      };

      const parsed = validateBrewery(minimalBrewery);
      expect(parsed.name).toBe('Minimal Brewery');
      expect(parsed.statusNotes).toBeUndefined();
      expect(parsed.verification).toBeNull();
    });

    it('fails validation when required fields are missing and provides structured error messages', () => {
      const invalidBrewery = {
        id: 'invalid-brewery',
        // missing slug, name, type, region, status
        address: '123 Main St',
      };

      const safeResult = safeValidateBrewery(invalidBrewery);
      expect(safeResult.success).toBe(false);
      if (!safeResult.success) {
        expect(safeResult.formattedError).toContain('[Runtime Validation Error]');
        expect(safeResult.formattedError).toContain('slug');
        expect(safeResult.formattedError).toContain('name');
      }
    });

    it('rejects invalid latitude and longitude values in coordinates', () => {
      const badCoordsBrewery = {
        ...mockBreweries[0],
        coordinates: { lat: 105.0, lng: -77.4245 }, // lat out of [-90, 90] bounds
      };

      expect(() => validateBrewery(badCoordsBrewery)).toThrowError(/coordinates.lat/);
    });

    it('rejects invalid enum values for brewery type and operating status', () => {
      const badEnumBrewery = {
        ...mockBreweries[0],
        type: 'Mega Brewery', // Invalid BreweryType
      };

      expect(() => validateBrewery(badEnumBrewery)).toThrowError(/type/);
    });

    it('validates a list of brewery records successfully', () => {
      const list = validateBreweryList(mockBreweries);
      expect(list.length).toBe(mockBreweries.length);
      expect(list[0].id).toBe(mockBreweries[0].id);
    });
  });

  describe('Normalization Helpers', () => {
    it('normalizes inconsistent or un-trimmed brewery data', () => {
      const messyData = {
        ...mockBreweries[0],
        name: '   Flying Dog Brewery   ',
        city: ' Frederick  ',
        state: ' Maryland ',
        zipCode: 21703, // numeric zip
        verificationSource: 'Official Website',
      };

      const normalized = normalizeAndValidateBrewery(messyData);
      expect(normalized.name).toBe('Flying Dog Brewery');
      expect(normalized.city).toBe('Frederick');
      expect(normalized.state).toBe('MD');
      expect(normalized.zipCode).toBe('21703');
      expect(normalized.sourceInfo).toBe('Official Website');
    });

    it('normalizes a list of unnormalized brewery items', () => {
      const list = normalizeAndValidateBreweryList([
        { ...mockBreweries[0], name: ' Flying Dog ' },
        { ...mockBreweries[1], state: '' },
      ]);
      expect(list[0].name).toBe('Flying Dog');
      expect(list[1].state).toBe('MD');
    });
  });

  describe('Derived Fields Helper', () => {
    it('correctly calculates derived domain fields for a brewery', () => {
      const brewery = mockBreweries[0];
      // Pass a targetDate close to lastVerified date (2025-05-10) to test fresh verified state
      const targetDate = new Date('2025-05-20');
      const derived = getDerivedBreweryFields(brewery, targetDate);

      expect(derived.fullAddress).toBe('4607 Wedgewood Blvd, Frederick, MD 21703');
      expect(derived.isVerified).toBe(true);
      expect(derived.hasStructuredHours).toBe(true);
      expect(derived.isStale).toBe(false);
      expect(derived.freshness.freshnessCategory).toBe('fresh');
    });

    it('identifies stale verified data when verification date is old', () => {
      const brewery = { ...mockBreweries[0], lastVerified: '2025-05-10' };
      // Target date > 180 days after 2025-05-10
      const targetDate = new Date('2026-01-01');
      const derived = getDerivedBreweryFields(brewery, targetDate);

      expect(derived.isStale).toBe(true);
      expect(derived.isVerified).toBe(false);
      expect(derived.freshness.freshnessCategory).toBe('outdated');
    });
  });

  describe('Beer Trail & Structured Itinerary Validation', () => {
    it('validates beer trails structured as explicit ordered itineraries with stops', () => {
      const trail = mockTrails[0];
      const parsed = validateBeerTrail(trail);
      expect(parsed.name).toBe('Frederick City Beer Trail');
      expect(parsed.stops.length).toBe(2);
      expect(parsed.stops[0].order).toBe(1);
      expect(parsed.stops[0].brewery.name).toBe('Flying Dog Brewery');
      expect(parsed.stops[0].isOptional).toBe(false);
      expect(parsed.stops[0].notes).toBeDefined();
      expect(parsed.breweries.length).toBe(2);
      expect(parsed.breweries[0].name).toBe('Flying Dog Brewery');
    });

    it('supports optional stops and explicit stop metadata', () => {
      const trailWithOptionalStop = mockTrails.find(t => t.id === 'baltimore-craft-loop')!;
      const parsed = validateBeerTrail(trailWithOptionalStop);
      expect(parsed.stops.length).toBe(3);

      const optionalStop = parsed.stops.find(s => s.isOptional);
      expect(optionalStop).toBeDefined();
      expect(optionalStop?.brewery.name).toBe('Heavy Seas Beer');
      expect(optionalStop?.order).toBe(3);
    });

    it('normalizes legacy un-ordered breweries array into ordered stops automatically', () => {
      const legacyTrailData = {
        id: 'legacy-trail',
        slug: 'legacy-trail',
        name: 'Legacy Craft Trail',
        description: 'A legacy trail format with only breweries array.',
        region: 'Central',
        distance: '10 miles',
        duration: 'Full Day',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        highlight: 'Legacy highlights',
        difficulty: 'Moderate',
        breweries: [mockBreweries[0], mockBreweries[1]],
      };

      const parsed = validateBeerTrail(legacyTrailData);
      expect(parsed.stops.length).toBe(2);
      expect(parsed.stops[0].order).toBe(1);
      expect(parsed.stops[0].brewery.name).toBe('Flying Dog Brewery');
      expect(parsed.stops[1].order).toBe(2);
      expect(parsed.stops[1].brewery.name).toBe('Monocacy Brewing Company');
      expect(parsed.breweries.length).toBe(2);
    });

    it('sorts out-of-order stops explicitly by order number ascending', () => {
      const unSortedTrailData = {
        id: 'unsorted-trail',
        slug: 'unsorted-trail',
        name: 'Unsorted Trail',
        description: 'Trail with stops out of order.',
        region: 'Central',
        distance: '6 miles',
        duration: '3 Hours',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        highlight: 'Out of order test',
        difficulty: 'Easy',
        stops: [
          { order: 2, brewery: mockBreweries[1], isOptional: false },
          { order: 1, brewery: mockBreweries[0], isOptional: false },
        ],
      };

      const parsed = validateBeerTrail(unSortedTrailData);
      expect(parsed.stops[0].order).toBe(1);
      expect(parsed.stops[0].brewery.name).toBe('Flying Dog Brewery');
      expect(parsed.stops[1].order).toBe(2);
      expect(parsed.stops[1].brewery.name).toBe('Monocacy Brewing Company');
    });

    it('fails beer trail validation if stops array is empty or an embedded brewery is invalid', () => {
      const invalidTrail = {
        ...mockTrails[0],
        stops: [
          {
            order: 1,
            brewery: {
              ...mockBreweries[0],
              region: 'Invalid Region Name',
            },
          },
        ],
      };

      expect(() => validateBeerTrail(invalidTrail)).toThrowError(/region/);

      const emptyStopsTrail = {
        ...mockTrails[0],
        stops: [],
        breweries: [],
      };

      expect(() => validateBeerTrail(emptyStopsTrail)).toThrowError(/stop/);
    });

    it('validates travel guides reusing brewery schema', () => {
      const guide = mockGuides[0];
      const parsed = validateTravelGuide(guide);
      expect(parsed.title).toBe("A Weekend Beer Guide to Maryland's Eastern Shore");
      expect(parsed.recommendedStops.length).toBe(1);
    });

    it('validates trail and guide lists', () => {
      const trails = validateBeerTrailList(mockTrails);
      const guides = validateTravelGuideList(mockGuides);
      expect(trails.length).toBe(mockTrails.length);
      expect(guides.length).toBe(mockGuides.length);
    });
  });

  describe('Repository Boundary Integration', () => {
    it('returns runtime validated brewery objects from MockBreweryRepository', async () => {
      const repo = new MockBreweryRepository();
      const breweries = await repo.getAll();
      expect(breweries.length).toBeGreaterThan(0);
      expect(breweries[0].name).toBe('Flying Dog Brewery');

      const single = await repo.getBySlug('flying-dog-brewery');
      expect(single).not.toBeNull();
      expect(single?.slug).toBe('flying-dog-brewery');
    });

    it('returns runtime validated trail objects from MockTrailRepository', async () => {
      const repo = new MockTrailRepository();
      const trails = await repo.getAll();
      expect(trails.length).toBeGreaterThan(0);
      expect(trails[0].breweries.length).toBeGreaterThan(0);
    });

    it('returns runtime validated guide objects from MockGuideRepository', async () => {
      const repo = new MockGuideRepository();
      const guides = await repo.getAll();
      expect(guides.length).toBeGreaterThan(0);
    });
  });

  describe('Error Formatting Utility', () => {
    it('formats ZodError into clear, descriptive text', () => {
      const parseResult = brewerySchema.safeParse({ id: '123' });
      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const formatted = formatZodError(parseResult.error, 'Test Entity');
        expect(formatted).toContain('[Runtime Validation Error] Invalid Test Entity:');
        expect(formatted).toContain('Field "slug":');
        expect(formatted).toContain('Field "name":');
      }
    });
  });
});
