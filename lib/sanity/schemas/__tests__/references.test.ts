/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { schemaTypes } from '../index';
import { brewerySchema } from '../brewery';
import { guideSchema } from '../guide';
import { trailSchema } from '../trail';
import { categorySchema } from '../category';
import { countySchema } from '../county';
import { mergeSanityEditorialWithCanonical } from '../../../repositories/sanity/brewery';
import { Brewery } from '../../../types';

const sampleCanonicalBrewery: Brewery = {
  id: 'flying-dog',
  slug: 'flying-dog-brewery',
  name: 'Flying Dog Brewery',
  type: 'Microbrewery',
  region: 'Central',
  status: 'Open',
  address: '4607 Wedgewood Blvd',
  city: 'Frederick',
  county: 'Frederick County',
  state: 'MD',
  zipCode: '21703',
  phone: '301-694-7899',
  website: 'https://www.flyingdogbrewery.com',
  socialLinks: { facebook: 'https://facebook.com/flyingdog' },
  coordinates: { lat: 39.3621, lng: -77.4245 },
  hours: [{ day: 'Mon', hours: '12pm-8pm' }],
  beerStyles: ['IPA', 'Stout'],
  amenities: ['Tasting Room', 'Patio'],
  featured: true,
  lastVerified: '2025-05-01',
  verificationSource: 'Official Website',
  verificationStatus: 'Verified',
  description: 'Canonical Frederick brewery description.',
  image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
};

describe('Sanity Schema Types and References', () => {
  it('should export all required schema types and omit events', () => {
    const names = schemaTypes.map((s) => s.name);
    expect(names).toContain('brewery');
    expect(names).toContain('guide');
    expect(names).toContain('trail');
    expect(names).toContain('category');
    expect(names).toContain('county');
    expect(names).not.toContain('event');
    expect(names).not.toContain('events');
  });

  it('should define brewerySchema correctly with strict field rules', () => {
    expect(brewerySchema.name).toBe('brewery');
    expect(brewerySchema.type).toBe('document');
    const fieldNames = brewerySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('breweryId');
    expect(fieldNames).toContain('categories');
    expect(fieldNames).toContain('county');

    const slugField = brewerySchema.fields.find((f) => f.name === 'slug') as any;
    expect(slugField.validation).toBeDefined();

    const idField = brewerySchema.fields.find((f) => f.name === 'breweryId') as any;
    expect(idField.validation).toBeDefined();
  });

  it('should define categorySchema correctly with enum options', () => {
    expect(categorySchema.name).toBe('category');
    expect(categorySchema.type).toBe('document');
    const fieldNames = categorySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('type');
    expect(fieldNames).toContain('description');

    const typeField = categorySchema.fields.find((f) => f.name === 'type') as any;
    const enumValues = typeField.options.list.map((l: any) => l.value);
    expect(enumValues).toEqual(['amenity', 'style', 'experience']);
  });

  it('should define countySchema correctly with region enum options', () => {
    expect(countySchema.name).toBe('county');
    expect(countySchema.type).toBe('document');
    const fieldNames = countySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('region');
    expect(fieldNames).toContain('description');

    const regionField = countySchema.fields.find((f) => f.name === 'region') as any;
    const regionValues = regionField.options.list.map((l: any) => l.value);
    expect(regionValues).toEqual(['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western']);
  });

  it('should structure references cleanly in guideSchema and trailSchema', () => {
    const guideFields = guideSchema.fields.map((f) => f.name);
    expect(guideFields).toContain('recommendedStops');
    expect(guideFields).toContain('county');
    expect(guideFields).toContain('categories');

    const stopsField = guideSchema.fields.find((f) => f.name === 'recommendedStops') as any;
    expect(stopsField?.type).toBe('array');
    expect(stopsField?.of?.[0]?.type).toBe('reference');
    expect(stopsField?.of?.[0]?.to?.[0]?.type).toBe('brewery');

    const trailFields = trailSchema.fields.map((f) => f.name);
    expect(trailFields).toContain('breweries');
    expect(trailFields).toContain('county');
    expect(trailFields).toContain('categories');

    const breweriesField = trailSchema.fields.find((f) => f.name === 'breweries') as any;
    expect(breweriesField?.type).toBe('array');
    expect(breweriesField?.of?.[0]?.type).toBe('reference');
    expect(breweriesField?.of?.[0]?.to?.[0]?.type).toBe('brewery');
  });

  describe('mergeSanityEditorialWithCanonical helper', () => {
    it('should return null if input is null or undefined', () => {
      expect(mergeSanityEditorialWithCanonical(null)).toBeNull();
      expect(mergeSanityEditorialWithCanonical(undefined)).toBeNull();
    });

    it('should merge Sanity editorial data with canonical facts when matching by breweryId in canonical dataset', () => {
      const sanityBrewery = {
        breweryId: 'flying-dog',
        slug: 'flying-dog-brewery',
        name: 'Flying Dog Brewery',
        description: 'Sanity custom editorial description.',
        highlights: ['Custom Scenic Beer Garden'],
        atmosphere: ['Custom Vibe'],
      };

      const result = mergeSanityEditorialWithCanonical(sanityBrewery, [sampleCanonicalBrewery]) as any;

      expect(result).not.toBeNull();
      expect(result.id).toBe('flying-dog');
      // Sanity overrides editorial fields
      expect(result.description).toBe('Sanity custom editorial description.');
      expect(result.highlights).toEqual(['Custom Scenic Beer Garden']);

      // Canonical facts are preserved and NOT copied from Sanity
      expect(result.address).toBe('4607 Wedgewood Blvd');
      expect(result.city).toBe('Frederick');
      expect(result.state).toBe('MD');
      expect(result.phone).toBe('301-694-7899');
      expect(result.coordinates).toEqual({ lat: 39.3621, lng: -77.4245 });
    });

    it('should return null without fabricating fake values when Sanity record is missing from dataset and incomplete', () => {
      const incompleteSanityBrewery = {
        breweryId: 'unmatched-brewery',
        slug: 'unmatched-brewery',
        name: 'Unmatched Brewery',
        description: 'An unlinked editorial record with missing address, coordinates, etc.',
      };

      const result = mergeSanityEditorialWithCanonical(incompleteSanityBrewery, [sampleCanonicalBrewery]);

      expect(result).toBeNull();
    });

    it('should validate and return complete brewery records directly if full domain facts are provided', () => {
      const completeSanityBrewery = {
        ...sampleCanonicalBrewery,
        id: 'standalone-brewery',
        slug: 'standalone-brewery',
        name: 'Standalone Brewery',
      };

      const result = mergeSanityEditorialWithCanonical(completeSanityBrewery, []);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('standalone-brewery');
      expect(result?.name).toBe('Standalone Brewery');
    });
  });
});
