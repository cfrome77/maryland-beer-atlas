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
