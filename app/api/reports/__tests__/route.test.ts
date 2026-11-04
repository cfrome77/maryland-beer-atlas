import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/reports API Route', () => {
  it('accepts and processes valid report submissions', async () => {
    const validBody = {
      breweryId: 'heavy-seas-beer',
      brewerySlug: 'heavy-seas-beer',
      breweryName: 'Heavy Seas Beer',
      reportType: 'hours_change',
      details: 'Taproom is now open on Mondays from 4 PM - 9 PM.',
      reporterName: 'Jane Sailor',
      reporterEmail: 'jane@example.com',
    };

    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain('Thank you!');
    expect(json.reportId).toBeDefined();
  });

  it('rejects malformed JSON payloads', async () => {
    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-{',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Invalid JSON request payload');
  });

  it('accepts reports with preconfigured selectedAmenities', async () => {
    const validBodyWithAmenities = {
      breweryId: 'heavy-seas-beer',
      brewerySlug: 'heavy-seas-beer',
      breweryName: 'Heavy Seas Beer',
      reportType: 'amenity_or_beer_update',
      details: 'Added dog friendly patio and arcade games.',
      selectedAmenities: ['Dog Friendly', 'Outdoor Patio', 'Arcade Games'],
    };

    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBodyWithAmenities),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('rejects reports with invalid amenity values not in preconfigured list', async () => {
    const invalidAmenitiesBody = {
      breweryId: 'heavy-seas-beer',
      brewerySlug: 'heavy-seas-beer',
      breweryName: 'Heavy Seas Beer',
      reportType: 'amenity_or_beer_update',
      details: 'Added custom fake amenity.',
      selectedAmenities: ['Dog Friendly', 'Random Nonexistent Amenity'],
    };

    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidAmenitiesBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Validation failed');
  });

  it('returns 400 validation error for missing required fields', async () => {
    const invalidBody = {
      breweryId: 'heavy-seas-beer',
      reportType: 'hours_change',
      // missing details, breweryName, brewerySlug
    };

    const req = new NextRequest('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Validation failed');
    expect(json.details).toBeDefined();
  });
});
