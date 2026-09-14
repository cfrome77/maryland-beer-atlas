import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentService } from '../content.service';
import { MockBreweryRepository, MockTrailRepository, MockGuideRepository } from '../../repositories/mock';
import { SanityBreweryRepository } from '../../repositories/sanity/brewery';
import { SanityTrailRepository } from '../../repositories/sanity/trail';
import { SanityGuideRepository } from '../../repositories/sanity/guide';

describe('ContentService Repository Selection & Production Safety', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('selects Sanity repositories in production mode (when USE_MOCK_DATA is not true)', () => {
    delete process.env.USE_MOCK_DATA;
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'real-sanity-project-id';

    const service = new ContentService();

    expect(service.breweries).toBeInstanceOf(SanityBreweryRepository);
    expect(service.breweries).not.toBeInstanceOf(MockBreweryRepository);

    expect(service.trails).toBeInstanceOf(SanityTrailRepository);
    expect(service.trails).not.toBeInstanceOf(MockTrailRepository);

    expect(service.guides).toBeInstanceOf(SanityGuideRepository);
    expect(service.guides).not.toBeInstanceOf(MockGuideRepository);
  });

  it('fails clearly with explicit Error when Sanity is unconfigured in production mode and NEVER falls back to mock data', async () => {
    delete process.env.USE_MOCK_DATA;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

    const service = new ContentService();

    expect(service.breweries).toBeInstanceOf(SanityBreweryRepository);

    await expect(service.breweries.getAll()).rejects.toThrow(
      /Sanity CMS configuration is missing or invalid/i
    );
    await expect(service.trails.getAll()).rejects.toThrow(
      /Sanity CMS configuration is missing or invalid/i
    );
    await expect(service.guides.getAll()).rejects.toThrow(
      /Sanity CMS configuration is missing or invalid/i
    );
  });

  it('selects Mock repositories ONLY when USE_MOCK_DATA is explicitly set to true', () => {
    process.env.USE_MOCK_DATA = 'true';

    const service = new ContentService();

    expect(service.breweries).toBeInstanceOf(MockBreweryRepository);
    expect(service.trails).toBeInstanceOf(MockTrailRepository);
    expect(service.guides).toBeInstanceOf(MockGuideRepository);
  });
});
