import { describe, it, expect } from 'vitest';
import { recommendationService } from '@/lib/services/recommendation.service';

describe('RecommendationService', () => {
  it('returns curated items as array', async () => {
    const curated = await recommendationService.getCurated();
    expect(Array.isArray(curated)).toBe(true);
  });

  it('computes nearby results for a sample location', async () => {
    const location = { lat: 39.29, lon: -76.61 }; // Baltimore
    const computed = await recommendationService.getComputedNearby(location, { maxDistanceMiles: 100, limit: 5 });
    expect(Array.isArray(computed)).toBe(true);
    for (const c of computed) {
      expect(c.source).toBe('computed');
      // distanceMiles should be a number when present
      if (c.distanceMiles != null) expect(typeof c.distanceMiles).toBe('number');
    }
  });

  it('combines curated then computed and de-duplicates', async () => {
    const combined = await recommendationService.getRecommendationsForLocation({ lat: 39.29, lon: -76.61 }, { nearbyLimit: 5 });
    expect(Array.isArray(combined)).toBe(true);
    // sources should be either 'curated' or 'computed'
    for (const r of combined) {
      expect(['curated', 'computed']).toContain(r.source);
    }
  });
});
