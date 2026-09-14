import { NextResponse } from 'next/server';
import { recommendationService } from '@/lib/services/recommendation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      lat,
      lon,
      maxMiles,
      limit,
      tags,
      amenities,
      foodRequired,
      outdoorSeatingRequired,
      dogFriendlyRequired,
      familyFriendlyRequired,
      breweryType,
      beerStyles,
      region,
      includeTemporarilyClosed,
    } = body || {};

    let location: { lat: number; lon: number } | null = null;
    if (typeof lat === 'number' && typeof lon === 'number') {
      location = { lat, lon };
    }

    const recs = await recommendationService.getRecommendationsForLocation(
      location,
      {
        maxDistanceMiles: typeof maxMiles === 'number' ? maxMiles : 50,
        limit: typeof limit === 'number' ? limit : 10,
        tags: Array.isArray(tags) ? tags : undefined,
        amenities: Array.isArray(amenities) ? amenities : undefined,
        foodRequired: typeof foodRequired === 'boolean' ? foodRequired : undefined,
        outdoorSeatingRequired: typeof outdoorSeatingRequired === 'boolean' ? outdoorSeatingRequired : undefined,
        dogFriendlyRequired: typeof dogFriendlyRequired === 'boolean' ? dogFriendlyRequired : undefined,
        familyFriendlyRequired: typeof familyFriendlyRequired === 'boolean' ? familyFriendlyRequired : undefined,
        breweryType: typeof breweryType === 'string' ? breweryType : undefined,
        beerStyles: Array.isArray(beerStyles) ? beerStyles : undefined,
        region: typeof region === 'string' ? region : undefined,
        includeTemporarilyClosed: typeof includeTemporarilyClosed === 'boolean' ? includeTemporarilyClosed : undefined,
      }
    );

    return NextResponse.json({ recommendations: recs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
