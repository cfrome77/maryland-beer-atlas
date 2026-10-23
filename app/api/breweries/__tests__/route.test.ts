import { describe, it, expect } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/breweries - Proximity & Radius Filtering API', () => {
  it('returns filtered breweries for a valid postal code and radius query', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?postal_code=21701&radius=25');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.query.postalCode).toBe('21701');
    expect(json.query.radius).toBe(25);
    expect(json.query.unit).toBe('miles');
    expect(json.query.coordinates).toBeDefined();
    expect(Array.isArray(json.breweries)).toBe(true);
    expect(json.count).toBeGreaterThan(0);
  });

  it('supports unit=km parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?zip=21701&radius=40&unit=km');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.query.unit).toBe('km');
    expect(json.query.radius).toBe(40);
  });

  it('returns 400 Bad Request for malformed or non-numerical radius values', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?postal_code=21701&radius=-10');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Radius must be a positive numerical value');
  });

  it('returns 400 Bad Request for invalid unit parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?unit=invalid');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("Invalid unit parameter. Must be 'miles' or 'km'");
  });

  it('returns 400 Bad Request for invalid/unsupported postal code format', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?postal_code=ABCDE');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Invalid postal code format');
  });

  it('returns 400 Bad Request for postal codes outside supported region', async () => {
    const req = new NextRequest('http://localhost:3000/api/breweries?postal_code=90210');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('outside our supported geographic region');
  });
});
