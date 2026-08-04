import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../repositories/interfaces';
import { MockBreweryRepository, MockTrailRepository, MockGuideRepository } from '../repositories/mock';

export class ContentService {
  constructor(
    public breweries: IBreweryRepository,
    public trails: ITrailRepository,
    public guides: IGuideRepository
  ) {}
}

// Instantiate with Mock implementations for now.
// When Sanity or any other CMS is configured, we can easily swap them here
// with SanityBreweryRepository, etc.
export const contentService = new ContentService(
  new MockBreweryRepository(),
  new MockTrailRepository(),
  new MockGuideRepository()
);
