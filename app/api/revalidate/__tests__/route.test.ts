import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock next/cache revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from 'next/cache';

describe('Sanity Webhook On-Demand Revalidation API Route', () => {
  const originalEnv = process.env.SANITY_REVALIDATE_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SANITY_REVALIDATE_SECRET;
  });

  afterEach(() => {
    process.env.SANITY_REVALIDATE_SECRET = originalEnv;
  });

  it('rejects unauthorized requests when SANITY_REVALIDATE_SECRET is set and invalid secret is provided', async () => {
    process.env.SANITY_REVALIDATE_SECRET = 'my-super-secret-token';

    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'wrong-token',
      },
      body: JSON.stringify({ _type: 'brewery', slug: 'flying-dog-brewery' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('Unauthorized');
  });

  it('accepts revalidation requests when valid secret token is provided in headers', async () => {
    process.env.SANITY_REVALIDATE_SECRET = 'my-super-secret-token';

    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'my-super-secret-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ _type: 'brewery', slug: 'flying-dog-brewery' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.revalidated).toBe(true);
    expect(json.documentType).toBe('brewery');
    expect(json.paths).toContain('/breweries/flying-dog-brewery');
    expect(json.paths).toContain('/breweries');
    expect(json.paths).toContain('/map');
    expect(revalidatePath).toHaveBeenCalledWith('/breweries/flying-dog-brewery');
  });

  it('revalidates trail paths when a trail document is updated', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ _type: 'trail', slug: 'frederick-beer-adventure' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.revalidated).toBe(true);
    expect(json.paths).toContain('/trails/frederick-beer-adventure');
    expect(json.paths).toContain('/trails');
    expect(json.paths).toContain('/map');
  });

  it('revalidates guide paths when a guide document is updated', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ _type: 'guide', slug: 'beers-of-eastern-shore' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.revalidated).toBe(true);
    expect(json.paths).toContain('/guides/beers-of-eastern-shore');
    expect(json.paths).toContain('/guides');
  });
});
