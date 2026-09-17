import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secretEnv = process.env.SANITY_REVALIDATE_SECRET;
  const headerSecret = req.headers.get('x-revalidate-secret');
  const searchSecret = req.nextUrl.searchParams.get('secret');
  const authHeader = req.headers.get('authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const providedSecret = headerSecret || searchSecret || bearerSecret;

  if (secretEnv && providedSecret !== secretEnv) {
    return NextResponse.json({ error: 'Unauthorized: Invalid revalidation secret token' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { _type, slug, countySlug, categorySlug } = body || {};

    const revalidatedPaths = new Set<string>();

    // Revalidate home and directory pages
    revalidatedPaths.add('/');
    revalidatedPaths.add('/sitemap.xml');

    if (_type === 'brewery') {
      revalidatedPaths.add('/breweries');
      revalidatedPaths.add('/map');
      if (slug) revalidatedPaths.add(`/breweries/${slug}`);
      if (countySlug) revalidatedPaths.add(`/breweries/county/${countySlug}`);
      if (categorySlug) revalidatedPaths.add(`/breweries/category/${categorySlug}`);
    } else if (_type === 'trail') {
      revalidatedPaths.add('/trails');
      revalidatedPaths.add('/map');
      if (slug) revalidatedPaths.add(`/trails/${slug}`);
    } else if (_type === 'guide') {
      revalidatedPaths.add('/guides');
      if (slug) revalidatedPaths.add(`/guides/${slug}`);
    } else if (_type === 'county') {
      revalidatedPaths.add('/breweries');
      if (slug) revalidatedPaths.add(`/breweries/county/${slug}`);
    } else if (_type === 'category') {
      revalidatedPaths.add('/breweries');
      if (slug) revalidatedPaths.add(`/breweries/category/${slug}`);
    } else {
      // General full revalidation fallback
      revalidatedPaths.add('/breweries');
      revalidatedPaths.add('/trails');
      revalidatedPaths.add('/guides');
      revalidatedPaths.add('/map');
    }

    for (const path of revalidatedPaths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      documentType: _type || 'unknown',
      paths: Array.from(revalidatedPaths),
    });
  } catch (err) {
    console.error('[On-Demand Revalidation Error]', err);
    return NextResponse.json({ error: 'Failed to revalidate path' }, { status: 500 });
  }
}
