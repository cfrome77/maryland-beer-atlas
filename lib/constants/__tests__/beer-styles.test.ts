import { describe, it, expect } from 'vitest';
import { BEER_STYLES } from '../beer-styles';
import { beerStyleSchema, brewerySchema } from '@/lib/validations/schemas';
import { filterBreweries } from '@/lib/utils/filter-breweries';
import { Brewery } from '@/lib/types';

const sampleBrewery1: Brewery = {
  id: 'b1',
  slug: 'test-brewery-1',
  name: 'Test Brewery 1',
  type: 'Microbrewery',
  region: 'Central',
  status: 'Open',
  address: '100 Main St',
  city: 'Baltimore',
  county: 'Baltimore City',
  state: 'MD',
  zipCode: '21201',
  phone: '410-555-0100',
  website: 'https://test1.com',
  socialLinks: {},
  coordinates: { lat: 39.2904, lng: -76.6122 },
  description: 'Test brewery 1 description',
  image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  hours: [{ day: 'Monday', hours: '12 PM - 10 PM' }],
  beerStyles: ['IPA', 'Hazy IPA', 'Stout'],
  amenities: ['Dog Friendly'],
  featured: true,
  lastVerified: '2026-08-01',
  verificationSource: 'Official Website',
  verificationStatus: 'Verified',
};

const sampleBrewery2: Brewery = {
  ...sampleBrewery1,
  id: 'b2',
  slug: 'test-brewery-2',
  name: 'Test Brewery 2',
  beerStyles: ['Pilsner', 'Lager'],
};

describe('BEER_STYLES Taxonomy & Schema Validation', () => {
  it('exports a strongly typed non-empty BEER_STYLES array with unique canonical styles', () => {
    expect(Array.isArray(BEER_STYLES)).toBe(true);
    expect(BEER_STYLES.length).toBeGreaterThan(10);
    expect(BEER_STYLES).toContain('IPA');
    expect(BEER_STYLES).toContain('Hazy IPA');
    expect(BEER_STYLES).toContain('Double IPA');
    expect(BEER_STYLES).toContain('Pilsner');
    expect(BEER_STYLES).toContain('Stout');
    expect(BEER_STYLES).toContain('Sour');

    const duplicates = BEER_STYLES.filter((item, index) => BEER_STYLES.indexOf(item) !== index);
    expect(duplicates).toHaveLength(0);
  });

  it('validates canonical beer styles with beerStyleSchema', () => {
    for (const style of BEER_STYLES) {
      const result = beerStyleSchema.safeParse(style);
      expect(result.success).toBe(true);
    }

    const invalidResult = beerStyleSchema.safeParse('Nonexistent Style XYZ');
    expect(invalidResult.success).toBe(false);
  });

  it('validates brewery objects with valid beerStyles arrays in brewerySchema', () => {
    const validResult = brewerySchema.safeParse(sampleBrewery1);
    expect(validResult.success).toBe(true);

    const invalidBrewery = {
      ...sampleBrewery1,
      beerStyles: ['IPA', 'Fake Unsupported Beer Style'],
    };
    const invalidResult = brewerySchema.safeParse(invalidBrewery);
    expect(invalidResult.success).toBe(false);
  });

  it('filters breweries by single beerStyle or multiple beerStyles in filterBreweries', () => {
    // Single beerStyle filter
    const ipaResults = filterBreweries([sampleBrewery1, sampleBrewery2], { beerStyle: 'IPA' });
    expect(ipaResults).toHaveLength(1);
    expect(ipaResults[0].id).toBe('b1');

    const pilsnerResults = filterBreweries([sampleBrewery1, sampleBrewery2], { beerStyle: 'Pilsner' });
    expect(pilsnerResults).toHaveLength(1);
    expect(pilsnerResults[0].id).toBe('b2');

    // Multiple beerStyles array filter (matches breweries having ALL requested styles)
    const multiResults = filterBreweries([sampleBrewery1, sampleBrewery2], { beerStyles: ['IPA', 'Stout'] });
    expect(multiResults).toHaveLength(1);
    expect(multiResults[0].id).toBe('b1');

    const noMatchResults = filterBreweries([sampleBrewery1, sampleBrewery2], { beerStyles: ['IPA', 'Lager'] });
    expect(noMatchResults).toHaveLength(0);
  });
});
