import { describe, it, expect } from 'vitest';
import {
  recommendationService,
  isPermanentlyClosed,
  getNonOpenStatusNote,
  hasFood,
  hasOutdoorSeating,
  hasDogFriendly,
  hasFamilyFriendly,
} from '@/lib/services/recommendation.service';
import type { Brewery } from '@/lib/types';

describe('RecommendationService Core Logic', () => {
  const baseBrewery: Brewery = {
    id: 'test-1',
    slug: 'test-brewery',
    name: 'Test Brewery',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    address: '123 Main St',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21701',
    phone: '301-555-0199',
    website: 'https://testbrewery.com',
    socialLinks: {},
    coordinates: { lat: 39.41, lng: -77.41 },
    hours: [],
    beerStyles: ['IPA', 'Stout'],
    amenities: ['Dog Friendly', 'Outdoor Seating', 'Food Trucks'],
    featured: false,
    lastVerified: '2025-01-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    description: 'A great local test brewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  };

  it('correctly identifies permanently closed breweries', () => {
    expect(isPermanentlyClosed({ ...baseBrewery, status: 'Permanently closed' })).toBe(true);
    expect(isPermanentlyClosed({ ...baseBrewery, status: 'Closed' })).toBe(true);
    expect(isPermanentlyClosed({ ...baseBrewery, status: 'Open' })).toBe(false);
    expect(isPermanentlyClosed({ ...baseBrewery, status: 'Temporarily closed' })).toBe(false);
  });

  it('extracts non-open operating status notes intentionally', () => {
    expect(getNonOpenStatusNote({ ...baseBrewery, status: 'Temporarily closed' })).toBe('Temporarily Closed');
    expect(getNonOpenStatusNote({ ...baseBrewery, status: 'Opening soon' })).toBe('Opening Soon');
    expect(getNonOpenStatusNote({ ...baseBrewery, status: 'Seasonal' })).toBe('Seasonal Operations');
    expect(getNonOpenStatusNote({ ...baseBrewery, status: 'Relocating' })).toBe('Relocating');
    expect(getNonOpenStatusNote({ ...baseBrewery, status: 'Open' })).toBe(null);
  });

  it('checks trustworthy attributes strictly based on actual brewery facts', () => {
    expect(hasFood(baseBrewery)).toBe(true); // Food Trucks
    expect(hasOutdoorSeating(baseBrewery)).toBe(true); // Outdoor Seating
    expect(hasDogFriendly(baseBrewery)).toBe(true); // Dog Friendly
    expect(hasFamilyFriendly(baseBrewery)).toBe(false);

    const familyBrewery = { ...baseBrewery, amenities: ['Kid Friendly', 'Games'] };
    expect(hasFamilyFriendly(familyBrewery)).toBe(true);
  });

  it('returns curated items as array', async () => {
    const curated = await recommendationService.getCurated();
    expect(Array.isArray(curated)).toBe(true);
    for (const r of curated) {
      expect(r.source).toBe('curated');
      expect(isPermanentlyClosed(r.brewery)).toBe(false);
    }
  });

  it('computes nearby results for a sample location and excludes permanently closed breweries', async () => {
    const location = { lat: 39.29, lon: -76.61 }; // Baltimore
    const computed = await recommendationService.getComputedNearby(location, { maxDistanceMiles: 100, limit: 5 });
    expect(Array.isArray(computed)).toBe(true);
    for (const c of computed) {
      expect(c.source).toBe('computed');
      expect(isPermanentlyClosed(c.brewery)).toBe(false);
      if (c.distanceMiles != null) expect(typeof c.distanceMiles).toBe('number');
      expect(typeof c.reason).toBe('string');
    }
  });

  it('supports attribute filtering (food, dog-friendly, outdoor seating, region, brewery type)', async () => {
    const computed = await recommendationService.getComputedNearby(null, {
      dogFriendlyRequired: true,
      outdoorSeatingRequired: true,
      limit: 10,
    });

    expect(Array.isArray(computed)).toBe(true);
    for (const c of computed) {
      expect(hasDogFriendly(c.brewery)).toBe(true);
      expect(hasOutdoorSeating(c.brewery)).toBe(true);
      expect(c.matchedAttributes?.length).toBeGreaterThan(0);
    }
  });

  it('combines curated then computed and de-duplicates', async () => {
    const combined = await recommendationService.getRecommendationsForLocation({ lat: 39.29, lon: -76.61 }, { nearbyLimit: 5 });
    expect(Array.isArray(combined)).toBe(true);
    for (const r of combined) {
      expect(['curated', 'computed']).toContain(r.source);
      expect(isPermanentlyClosed(r.brewery)).toBe(false);
    }
  });
});
