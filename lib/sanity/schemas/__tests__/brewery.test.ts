import { describe, it, expect, vi } from 'vitest';
import { brewerySchema } from '../brewery';

describe('Sanity Brewery Editorial Schema', () => {
  it('should define a document named brewery for editorial content', () => {
    expect(brewerySchema.name).toBe('brewery');
    expect(brewerySchema.type).toBe('document');
    expect(brewerySchema.title).toContain('Brewery Editorial Content');
  });

  it('should contain expected field groups including operations', () => {
    const groupNames = brewerySchema.groups.map((g) => g.name);
    expect(groupNames).toContain('identity');
    expect(groupNames).toContain('editorial');
    expect(groupNames).toContain('operations');
    expect(groupNames).toContain('curation');
    expect(groupNames).toContain('relationships');
  });

  it('should include required identity, editorial, and operations fields', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);

    // Identity & stable linking
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('breweryId');
    expect(fieldNames).toContain('postalCode');
    expect(fieldNames).toContain('latitude');
    expect(fieldNames).toContain('longitude');

    // Editorial storytelling
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('highlights');
    expect(fieldNames).toContain('atmosphere');
    expect(fieldNames).toContain('image');
    expect(fieldNames).toContain('logo');

    // Structured operations, contact, and amenities
    expect(fieldNames).toContain('hours');
    expect(fieldNames).toContain('structuredHours');
    expect(fieldNames).toContain('socialLinks');
    expect(fieldNames).toContain('amenities');

    type SchemaField = {
      name: string;
      type: string;
      options?: { hotspot?: boolean };
      validation?: (rule: { optional: () => unknown }) => unknown;
    };

    const logoField = brewerySchema.fields.find((f) => f.name === 'logo') as SchemaField | undefined;
    expect(logoField?.type).toBe('image');
    expect(logoField?.options?.hotspot).toBe(true);

    const imageField = brewerySchema.fields.find((f) => f.name === 'image') as SchemaField | undefined;
    expect(imageField?.type).toBe('image');
    const mockRule = { optional: vi.fn().mockReturnThis() };
    if (imageField?.validation) {
      imageField.validation(mockRule);
      expect(mockRule.optional).toHaveBeenCalled();
    }

    // Curation & recommendations
    expect(fieldNames).toContain('featured');
    expect(fieldNames).toContain('editorialRecommendations');
    expect(fieldNames).toContain('curatedContent');

    // Editorial relationships
    expect(fieldNames).toContain('categories');
    expect(fieldNames).toContain('county');
  });

  it('should NOT duplicate static inverse relatedGuides array field to avoid bidirectional duplication', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('relatedGuides');
  });

  it('should NOT duplicate canonical street address, state, or verification fields', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);

    // Canonical address & coordinates
    expect(fieldNames).not.toContain('address');
    expect(fieldNames).not.toContain('city');
    expect(fieldNames).not.toContain('state');
    expect(fieldNames).not.toContain('zipCode');
    expect(fieldNames).not.toContain('coordinates');

    // Canonical operational status & verification
    expect(fieldNames).not.toContain('statusNotes');
    expect(fieldNames).not.toContain('statusUpdatedAt');
    expect(fieldNames).not.toContain('holidayExceptions');
    expect(fieldNames).not.toContain('lastVerified');
    expect(fieldNames).not.toContain('verificationSource');
    expect(fieldNames).not.toContain('verificationStatus');
    expect(fieldNames).not.toContain('verification');
  });

  it('should NOT contain event definitions', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);
    expect(fieldNames).not.toContain('events');
    expect(fieldNames).not.toContain('event');
  });
});
