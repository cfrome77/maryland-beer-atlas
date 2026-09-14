import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../repositories/interfaces';
import { MockBreweryRepository, MockTrailRepository, MockGuideRepository } from '../repositories/mock';
import { SanityBreweryRepository } from '../repositories/sanity/brewery';
import { SanityTrailRepository } from '../repositories/sanity/trail';
import { SanityGuideRepository } from '../repositories/sanity/guide';

export class ContentService {
  private _breweries?: IBreweryRepository;
  private _trails?: ITrailRepository;
  private _guides?: IGuideRepository;

  constructor(
    breweries?: IBreweryRepository,
    trails?: ITrailRepository,
    guides?: IGuideRepository
  ) {
    this._breweries = breweries;
    this._trails = trails;
    this._guides = guides;
  }

  get breweries(): IBreweryRepository {
    if (this._breweries) return this._breweries;
    if (process.env.USE_MOCK_DATA === 'true') {
      return new MockBreweryRepository();
    }
    return new SanityBreweryRepository();
  }

  get trails(): ITrailRepository {
    if (this._trails) return this._trails;
    if (process.env.USE_MOCK_DATA === 'true') {
      return new MockTrailRepository();
    }
    return new SanityTrailRepository();
  }

  get guides(): IGuideRepository {
    if (this._guides) return this._guides;
    if (process.env.USE_MOCK_DATA === 'true') {
      return new MockGuideRepository();
    }
    return new SanityGuideRepository();
  }
}

export const contentService = new ContentService();
