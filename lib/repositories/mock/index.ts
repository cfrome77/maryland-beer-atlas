import { Brewery, BeerTrail, TravelGuide } from '../../types';
import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../interfaces';
import { mockBreweries, mockTrails, mockGuides } from '../../data/mock-data';
import {
  validateBrewery,
  validateBreweryList,
  validateBeerTrail,
  validateBeerTrailList,
  validateTravelGuide,
  validateTravelGuideList,
} from '../../validations/schemas';

export class MockBreweryRepository implements IBreweryRepository {
  async getAll(): Promise<Brewery[]> {
    return validateBreweryList(mockBreweries);
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const brewery = mockBreweries.find((b) => b.slug === slug);
    return brewery ? validateBrewery(brewery) : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const brewery = mockBreweries.find((b) => b.id === id);
    return brewery ? validateBrewery(brewery) : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    const featured = mockBreweries.filter((b) => b.featured);
    return validateBreweryList(featured);
  }
}

export class MockTrailRepository implements ITrailRepository {
  async getAll(): Promise<BeerTrail[]> {
    return validateBeerTrailList(mockTrails);
  }

  async getById(id: string): Promise<BeerTrail | null> {
    const trail = mockTrails.find((t) => t.id === id);
    return trail ? validateBeerTrail(trail) : null;
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    const trail = mockTrails.find((t) => t.slug === slug);
    return trail ? validateBeerTrail(trail) : null;
  }
}

export class MockGuideRepository implements IGuideRepository {
  async getAll(): Promise<TravelGuide[]> {
    return validateTravelGuideList(mockGuides);
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const guide = mockGuides.find((g) => g.slug === slug);
    return guide ? validateTravelGuide(guide) : null;
  }
}
