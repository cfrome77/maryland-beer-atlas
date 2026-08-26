import { describe, it, expect } from 'vitest';
import { brewerySchema } from '../brewery';

describe('Sanity Brewery Editorial Schema', () => {
  it('should define a document named brewery for editorial content', () => {
    expect(brewerySchema.name).toBe('brewery');
    expect(brewerySchema.type).toBe('document');
    expect(brewerySchema.title).toContain('Brewery Editorial Content');
  });

  it('should contain expected field groups', () => {
    const groupNames = brewerySchema.groups.map((g) => g.name);
    expect(groupNames).toContain('identity');
    expect(groupNames).toContain('editorial');
    expect(groupNames).toContain('curation');
    expect(groupNames).toContain('relationships');
  });

  it('should include required identity and editorial fields', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);

    // Identity & stable linking
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('breweryId');

    // Editorial storytelling
    expect(fieldNames).toContain('description');
    expect(fieldNames).toContain('highlights');
    expect(fieldNames).toContain('atmosphere');
    expect(fieldNames).toContain('image');

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

  it('should NOT duplicate canonical location, operational hours, or verification fields', () => {
    const fieldNames = brewerySchema.fields.map((f) => f.name);

    // Canonical location & contact
    expect(fieldNames).not.toContain('address');
    expect(fieldNames).not.toContain('city');
    expect(fieldNames).not.toContain('state');
    expect(fieldNames).not.toContain('zipCode');
    expect(fieldNames).not.toContain('phone');
    expect(fieldNames).not.toContain('website');
    expect(fieldNames).not.toContain('socialLinks');
    expect(fieldNames).not.toContain('coordinates');

    // Canonical operational facts & hours
    expect(fieldNames).not.toContain('status');
    expect(fieldNames).not.toContain('statusNotes');
    expect(fieldNames).not.toContain('statusUpdatedAt');
    expect(fieldNames).not.toContain('hours');
    expect(fieldNames).not.toContain('structuredHours');
    expect(fieldNames).not.toContain('holidayExceptions');

    // Canonical verification & provenance facts
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
