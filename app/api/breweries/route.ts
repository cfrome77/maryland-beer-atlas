import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/services/content.service';
import { filterBreweries, BrewerySortOption } from '@/lib/utils/filter-breweries';
import { validatePostalCode } from '@/lib/utils/geocoding';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const postalCodeInput =
      searchParams.get('postal_code') ||
      searchParams.get('postalCode') ||
      searchParams.get('zip') ||
      '';

    const radiusInput = searchParams.get('radius');
    const unitInput = (searchParams.get('unit') || 'miles').toLowerCase();
    const search = searchParams.get('search') || undefined;
    const region = searchParams.get('region') || undefined;
    const county = searchParams.get('county') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const amenity = searchParams.get('amenity') || undefined;
    const beerStyle = searchParams.get('beerStyle') || undefined;
    const sortParam = (searchParams.get('sort') as BrewerySortOption) || undefined;
    const limitInput = searchParams.get('limit');

    let radiusUnit: 'miles' | 'km' = 'miles';
    if (unitInput === 'km' || unitInput === 'kilometer' || unitInput === 'kilometers') {
      radiusUnit = 'km';
    } else if (unitInput === 'miles' || unitInput === 'mile') {
      radiusUnit = 'miles';
    } else {
      return NextResponse.json(
        { error: "Invalid unit parameter. Must be 'miles' or 'km'." },
        { status: 400 }
      );
    }

    let parsedRadius: number | undefined = undefined;
    if (radiusInput !== null && radiusInput !== '') {
      parsedRadius = parseFloat(radiusInput);
      if (isNaN(parsedRadius) || parsedRadius <= 0) {
        return NextResponse.json(
          { error: 'Radius must be a positive numerical value.' },
          { status: 400 }
        );
      }
    }

    let resolvedPostalCode: string | undefined = undefined;
    let resolvedCoordinates: { lat: number; lng: number } | null = null;

    if (postalCodeInput.trim() !== '') {
      const valResult = validatePostalCode(postalCodeInput);
      if (!valResult.isValid) {
        return NextResponse.json({ error: valResult.error }, { status: 400 });
      }

      resolvedPostalCode = valResult.postalCode;
      resolvedCoordinates = valResult.coordinates || null;

      if (parsedRadius === undefined) {
        parsedRadius = 25; // Default radius when postal code is provided
      }
    }

    const allBreweries = await contentService.breweries.getAll();

    const filtered = filterBreweries(allBreweries, {
      search,
      region,
      county,
      type,
      status,
      amenity,
      beerStyle,
      radiusPostalCode: resolvedPostalCode,
      radiusMiles: parsedRadius,
      radiusUnit,
      sort: sortParam,
    });

    let limit: number | undefined = undefined;
    if (limitInput !== null && limitInput !== '') {
      const parsedLimit = parseInt(limitInput, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    const results = limit ? filtered.slice(0, limit) : filtered;

    return NextResponse.json({
      total: filtered.length,
      count: results.length,
      query: {
        postalCode: resolvedPostalCode || null,
        radius: parsedRadius || null,
        unit: radiusUnit,
        coordinates: resolvedCoordinates,
        search: search || null,
        region: region || null,
        county: county || null,
        type: type || null,
        status: status || null,
      },
      breweries: results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
