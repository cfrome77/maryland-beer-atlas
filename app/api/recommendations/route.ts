import { NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lon, maxMiles, limit, tags } = body || {};

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return NextResponse.json({ error: 'lat and lon (numbers) are required' }, { status: 400 });
    }

    const recs = await recommendationService.getRecommendationsForLocation(
      { lat, lon },
      { nearbyMaxMiles: typeof maxMiles === 'number' ? maxMiles : 50, nearbyLimit: typeof limit === 'number' ? limit : 10, tags }
    );

    return NextResponse.json({ recommendations: recs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
