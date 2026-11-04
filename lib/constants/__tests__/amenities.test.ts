import { describe, it, expect } from 'vitest';
import { BREWERY_AMENITIES, BreweryAmenity } from '../amenities';

describe('BREWERY_AMENITIES Taxonomy', () => {
  it('contains expected core amenities', () => {
    expect(BREWERY_AMENITIES).toContain('Dog Friendly');
    expect(BREWERY_AMENITIES).toContain('Outdoor Seating');
    expect(BREWERY_AMENITIES).toContain('Food Trucks');
    expect(BREWERY_AMENITIES).toContain('Kid Friendly');
    expect(BREWERY_AMENITIES).toContain('Tasting Room');
  });

  it('contains no duplicate items', () => {
    const unique = new Set(BREWERY_AMENITIES);
    expect(unique.size).toBe(BREWERY_AMENITIES.length);
  });

  it('is sorted alphabetically', () => {
    const sorted = [...BREWERY_AMENITIES].sort();
    expect(BREWERY_AMENITIES).toEqual(sorted);
  });

  it('types correctly with BreweryAmenity', () => {
    const sample: BreweryAmenity = 'Dog Friendly';
    expect(BREWERY_AMENITIES.includes(sample)).toBe(true);
  });
});
