/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { schemaTypes } from '../index';
import { brewerySchema } from '../brewery';
import { guideSchema } from '../guide';
import { trailSchema } from '../trail';
import { categorySchema } from '../category';
import { countySchema } from '../county';
import { mergeSanityEditorialWithCanonical } from '../../../repositories/sanity/brewery';

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

  it('should define brewerySchema correctly', () => {
    expect(brewerySchema.name).toBe('brewery');
    expect(brewerySchema.type).toBe('document');
    const fieldNames = brewerySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('breweryId');
    expect(fieldNames).toContain('categories');
    expect(fieldNames).toContain('county');
  });

  it('should define categorySchema correctly', () => {
    expect(categorySchema.name).toBe('category');
    expect(categorySchema.type).toBe('document');
    const fieldNames = categorySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('type');
    expect(fieldNames).toContain('description');
  });

  it('should define countySchema correctly', () => {
    expect(countySchema.name).toBe('county');
    expect(countySchema.type).toBe('document');
    const fieldNames = countySchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('region');
    expect(fieldNames).toContain('description');
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

    it('should merge Sanity editorial data with canonical facts when matching by breweryId', () => {
      const sanityBrewery = {
        breweryId: 'flying-dog',
        slug: 'flying-dog-brewery',
        name: 'Flying Dog Brewery',
        description: 'Sanity custom editorial description.',
        highlights: ['Custom Scenic Beer Garden'],
        atmosphere: ['Custom Vibe'],
      };

      const result = mergeSanityEditorialWithCanonical(sanityBrewery) as any;

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
      expect(result.hours).toHaveLength(4);
    });

    it('should handle fallbacks gracefully when Sanity record is not in canonical dataset', () => {
      const newSanityBrewery = {
        breweryId: 'new-unknown-brewery',
        slug: 'new-unknown-brewery',
        name: 'New Unknown Brewery',
        description: 'A brand new editorial brewery.',
      };

      const result = mergeSanityEditorialWithCanonical(newSanityBrewery) as any;

      expect(result).not.toBeNull();
      expect(result.id).toBe('new-unknown-brewery');
      expect(result.name).toBe('New Unknown Brewery');
      expect(result.state).toBe('MD');
      expect(result.verificationStatus).toBe('Needs Review');
    });
  });
});
