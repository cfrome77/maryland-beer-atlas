import { Brewery, BeerTrail, TravelGuide } from '../../types';
import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../interfaces';
import { mockBreweries, mockTrails, mockGuides } from '../../data/mock-data';
import {
  normalizeAndValidateBrewery,
  normalizeAndValidateBreweryList,
  validateBeerTrail,
  validateBeerTrailList,
  validateTravelGuide,
  validateTravelGuideList,
} from '../../validations/schemas';

export class MockBreweryRepository implements IBreweryRepository {
  constructor(private breweries: Brewery[] = mockBreweries) {}

  async getAll(): Promise<Brewery[]> {
    return normalizeAndValidateBreweryList(this.breweries);
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const brewery = this.breweries.find((b) => b.slug === slug);
    return brewery ? normalizeAndValidateBrewery(brewery) : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const brewery = this.breweries.find((b) => b.id === id);
    return brewery ? normalizeAndValidateBrewery(brewery) : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    const featured = this.breweries.filter((b) => b.featured);
    return normalizeAndValidateBreweryList(featured);
  }
}

export class MockTrailRepository implements ITrailRepository {
  constructor(private trails: BeerTrail[] = mockTrails) {}

  async getAll(): Promise<BeerTrail[]> {
    return validateBeerTrailList(this.trails);
  }

  async getById(id: string): Promise<BeerTrail | null> {
    const trail = this.trails.find((t) => t.id === id);
    return trail ? validateBeerTrail(trail) : null;
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    const trail = this.trails.find((t) => t.slug === slug);
    return trail ? validateBeerTrail(trail) : null;
  }
}

export class MockGuideRepository implements IGuideRepository {
  constructor(private guides: TravelGuide[] = mockGuides) {}

  async getAll(): Promise<TravelGuide[]> {
    return validateTravelGuideList(this.guides);
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const guide = this.guides.find((g) => g.slug === slug);
    return guide ? validateTravelGuide(guide) : null;
  }
}
