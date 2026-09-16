/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { schema as studioSchema } from '../../../../sanity/schemaTypes';
import { schemaTypes as libSchemaTypes } from '../index';
import { countySchema } from '../county';
import { categorySchema } from '../category';
import { getSanityDataset, getSanityWriteClient } from '../../client';
import { generateSanitySeedDocuments, seedSanityDataset, htmlStringToPortableText, slugify } from '../../seed';
import { validateStudioDeploymentConfig, ALLOWED_CORS_ORIGINS } from '../../../../sanity/deployment';

describe('Sanity Studio Deployment & CORS Configuration', () => {
  it('should export allowed CORS origins for studio and API clients', () => {
    expect(ALLOWED_CORS_ORIGINS).toContain('http://localhost:3000');
    expect(ALLOWED_CORS_ORIGINS).toContain('https://marylandbeeratlas.com');
  });

  it('should validate studio deployment configuration', () => {
    const config = validateStudioDeploymentConfig();
    expect(config.studioBasePath).toBe('/studio');
    expect(config.dataset).toBeDefined();
    expect(config.apiVersion).toBeDefined();
    expect(Array.isArray(config.allowedOrigins)).toBe(true);
  });
});

describe('Sanity Schema Export & Studio Integration', () => {
  it('should export all 5 core schemas in studio schema definition', () => {
    expect(studioSchema.types).toBeDefined();
    expect(Array.isArray(studioSchema.types)).toBe(true);

    const studioNames = studioSchema.types.map((t: any) => t.name);
    const libNames = libSchemaTypes.map((t: any) => t.name);

    expect(studioNames).toEqual(libNames);
    expect(studioNames).toContain('brewery');
    expect(studioNames).toContain('trail');
    expect(studioNames).toContain('county');
    expect(studioNames).toContain('category');
    expect(studioNames).toContain('guide');
  });

  it('should define description validation rules on county and category schemas', () => {
    const countyDesc = countySchema.fields.find((f) => f.name === 'description') as any;
    expect(countyDesc).toBeDefined();
    expect(countyDesc.validation).toBeDefined();

    const categoryDesc = categorySchema.fields.find((f) => f.name === 'description') as any;
    expect(categoryDesc).toBeDefined();
    expect(categoryDesc.validation).toBeDefined();
  });
});

describe('Environment Variable Separation and Isolation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should default dataset to development in local/test environment', () => {
    delete process.env.NEXT_PUBLIC_SANITY_DATASET;
    const dataset = getSanityDataset();
    expect(dataset).toBe('development');
  });

  it('should respect NEXT_PUBLIC_SANITY_DATASET when explicitly provided', () => {
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'staging-v2';
    const dataset = getSanityDataset();
    expect(dataset).toBe('staging-v2');
  });

  it('should throw clear error when calling getSanityWriteClient without SANITY_API_WRITE_TOKEN', () => {
    delete process.env.SANITY_API_WRITE_TOKEN;
    delete process.env.SANITY_API_TOKEN;
    expect(() => getSanityWriteClient()).toThrow(/SANITY_API_WRITE_TOKEN environment variable is required/);
  });
});

describe('Baseline Local Seeding Script & Helpers', () => {
  it('should slugify text strings cleanly', () => {
    expect(slugify('Prince George\'s County')).toBe('prince-georges-county');
    expect(slugify('Outdoor Seating & Patio!')).toBe('outdoor-seating-patio');
  });

  it('should convert HTML strings into valid Portable Text blocks', () => {
    const html = '<p>Intro paragraph</p><h2>Section Header</h2><p>Body text</p>';
    const blocks = htmlStringToPortableText(html);

    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBe(3);

    expect(blocks[0]._type).toBe('block');
    expect(blocks[0].style).toBe('normal');
    expect(blocks[0].children[0].text).toBe('Intro paragraph');

    expect(blocks[1].style).toBe('h2');
    expect(blocks[1].children[0].text).toBe('Section Header');

    expect(blocks[2].style).toBe('normal');
    expect(blocks[2].children[0].text).toBe('Body text');
  });

  it('should generate baseline Sanity seed documents for counties, categories, breweries, trails, and guides', () => {
    const docs = generateSanitySeedDocuments({ mode: 'production' });
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(50);

    const counties = docs.filter((d) => d._type === 'county');
    const categories = docs.filter((d) => d._type === 'category');
    const breweries = docs.filter((d) => d._type === 'brewery');
    const trails = docs.filter((d) => d._type === 'trail');
    const guides = docs.filter((d) => d._type === 'guide');

    expect(counties.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
    expect(breweries.length).toBe(11);
    expect(trails.length).toBe(3);
    expect(guides.length).toBe(5);

    // Validate brewery document format
    const flyingDog = breweries.find((b) => b.breweryId === 'flying-dog');
    expect(flyingDog).toBeDefined();
    expect(flyingDog._id).toBe('brewery-flying-dog');
    expect(flyingDog.slug.current).toBe('flying-dog-brewery');
    expect(flyingDog.county._ref).toBe('county-frederick-county');

    // Validate trail stops format
    const frederickTrail = trails.find((t) => t.slug.current === 'frederick-beer-adventure');
    expect(frederickTrail).toBeDefined();
    expect(frederickTrail.stops.length).toBe(2);
    expect(frederickTrail.stops[0].brewery._ref).toBe('brewery-flying-dog');

    // Validate guide document format
    const easternShoreGuide = guides.find((g) => g.slug.current === 'beers-of-eastern-shore');
    expect(easternShoreGuide).toBeDefined();
    expect(easternShoreGuide.recommendedStops[0]._ref).toBe('brewery-burley-oak');
    expect(Array.isArray(easternShoreGuide.content)).toBe(true);
  });

  it('should generate a curated subset in development mode vs full dataset in production mode', () => {
    const devDocs = generateSanitySeedDocuments({ mode: 'development' });
    const prodDocs = generateSanitySeedDocuments({ mode: 'production' });

    const devBreweries = devDocs.filter((d) => d._type === 'brewery');
    const prodBreweries = prodDocs.filter((d) => d._type === 'brewery');

    expect(devBreweries.length).toBe(5);
    expect(prodBreweries.length).toBe(11);
    expect(devDocs.length).toBeLessThan(prodDocs.length);
  });

  it('should execute seedSanityDataset in dry-run mode cleanly without mutation', async () => {
    const result = await seedSanityDataset({ dryRun: true, mode: 'production' });
    expect(result.success).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.mode).toBe('production');
    expect(result.documentCount).toBeGreaterThan(50);
    expect(result.byType.county).toBeGreaterThan(0);
    expect(result.byType.brewery).toBe(11);
    expect(result.byType.trail).toBe(3);
    expect(result.byType.guide).toBe(5);
  });
});
