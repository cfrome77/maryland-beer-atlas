import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../repositories/interfaces';
import { MockBreweryRepository, MockTrailRepository, MockGuideRepository } from '../repositories/mock';
import { SanityBreweryRepository } from '../repositories/sanity/brewery';
import { SanityTrailRepository } from '../repositories/sanity/trail';
import { SanityGuideRepository } from '../repositories/sanity/guide';

export class ContentService {
  constructor(
    public breweries: IBreweryRepository,
    public trails: ITrailRepository,
    public guides: IGuideRepository
  ) {}
}

// Check if Sanity is configured
const isSanityConfigured = !!(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'placeholder_project_id' &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
);

// Instantiate with Sanity implementations if configured, fallback to Mock implementations.
export const contentService = new ContentService(
  isSanityConfigured ? new SanityBreweryRepository() : new MockBreweryRepository(),
  isSanityConfigured ? new SanityTrailRepository() : new MockTrailRepository(),
  isSanityConfigured ? new SanityGuideRepository() : new MockGuideRepository()
);
