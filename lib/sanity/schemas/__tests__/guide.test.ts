/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { guideSchema } from '../guide';
import { schemaTypes } from '../index';

describe('Sanity Guide Editorial Schema', () => {
  it('should define a document named guide for editorial content', () => {
    expect(guideSchema.name).toBe('guide');
    expect(guideSchema.type).toBe('document');
    expect(guideSchema.title).toContain('Travel Guide & Editorial Article');
  });

  it('should contain expected field groups for Studio management', () => {
    const groupNames = guideSchema.groups.map((g) => g.name);
    expect(groupNames).toContain('identity');
    expect(groupNames).toContain('editorial');
    expect(groupNames).toContain('relationships');
    expect(groupNames).toContain('seo');
  });

  it('should include required identity and guideType fields', () => {
    const fieldNames = guideSchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('guideType');
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('author');
    expect(fieldNames).toContain('publishDate');

    const typeField = guideSchema.fields.find((f) => f.name === 'guideType') as any;
    expect(typeField?.type).toBe('string');
    const optionValues = typeField?.options?.list?.map((item: any) => item.value);
    expect(optionValues).toContain('brewery_guide');
    expect(optionValues).toContain('regional_guide');
    expect(optionValues).toContain('trip_planning');
    expect(optionValues).toContain('curated_recommendations');
    expect(optionValues).toContain('education');
  });

  it('should include rich text content and media fields', () => {
    const fieldNames = guideSchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('image');
    expect(fieldNames).toContain('content');
    expect(fieldNames).toContain('gallery');
    expect(fieldNames).toContain('tips');

    const contentField = guideSchema.fields.find((f) => f.name === 'content') as any;
    expect(contentField?.type).toBe('array');
    const blockTypes = contentField?.of?.map((item: any) => item.type);
    expect(blockTypes).toContain('block');
    expect(blockTypes).toContain('image');
  });

  it('should structure references cleanly for breweries, trails, counties, categories, and related guides', () => {
    const fieldNames = guideSchema.fields.map((f) => f.name);
    expect(fieldNames).toContain('region');
    expect(fieldNames).toContain('county');
    expect(fieldNames).toContain('categories');
    expect(fieldNames).toContain('recommendedStops');
    expect(fieldNames).toContain('relatedTrails');
    expect(fieldNames).toContain('relatedGuides');

    const stopsField = guideSchema.fields.find((f) => f.name === 'recommendedStops') as any;
    expect(stopsField?.of?.[0]?.to?.[0]?.type).toBe('brewery');

    const trailsField = guideSchema.fields.find((f) => f.name === 'relatedTrails') as any;
    expect(trailsField?.of?.[0]?.to?.[0]?.type).toBe('trail');

    const relatedField = guideSchema.fields.find((f) => f.name === 'relatedGuides') as any;
    expect(relatedField?.of?.[0]?.to?.[0]?.type).toBe('guide');
  });

  it('should include structured SEO metadata field', () => {
    const seoField = guideSchema.fields.find((f) => f.name === 'seo') as any;
    expect(seoField).toBeDefined();
    expect(seoField?.type).toBe('object');
    const seoFieldNames = seoField?.fields?.map((f: any) => f.name);
    expect(seoFieldNames).toContain('metaTitle');
    expect(seoFieldNames).toContain('metaDescription');
    expect(seoFieldNames).toContain('keywords');
    expect(seoFieldNames).toContain('ogImage');
    expect(seoFieldNames).toContain('noIndex');
  });

  it('should NOT contain event CMS fields or event documents', () => {
    const fieldNames = guideSchema.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('events');
    expect(fieldNames).not.toContain('event');

    const schemaNames = schemaTypes.map((s) => s.name);
    expect(schemaNames).not.toContain('event');
    expect(schemaNames).not.toContain('events');
  });
});
