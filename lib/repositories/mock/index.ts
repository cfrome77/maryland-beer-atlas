import { Brewery, BeerTrail, TravelGuide } from '../../types';
import { IBreweryRepository, ITrailRepository, IGuideRepository } from '../interfaces';
import { mockBreweries, mockTrails, mockGuides } from '../../data/mock-data';

export class MockBreweryRepository implements IBreweryRepository {
  async getAll(): Promise<Brewery[]> {
    return [...mockBreweries];
  }

  async getBySlug(slug: string): Promise<Brewery | null> {
    const brewery = mockBreweries.find((b) => b.slug === slug);
    return brewery ? { ...brewery } : null;
  }

  async getById(id: string): Promise<Brewery | null> {
    const brewery = mockBreweries.find((b) => b.id === id);
    return brewery ? { ...brewery } : null;
  }

  async getFeatured(): Promise<Brewery[]> {
    return mockBreweries.filter((b) => b.featured).map((b) => ({ ...b }));
  }
}

export class MockTrailRepository implements ITrailRepository {
  async getAll(): Promise<BeerTrail[]> {
    return [...mockTrails];
  }

  async getById(id: string): Promise<BeerTrail | null> {
    const trail = mockTrails.find((t) => t.id === id);
    return trail ? { ...trail } : null;
  }

  async getBySlug(slug: string): Promise<BeerTrail | null> {
    const trail = mockTrails.find((t) => t.slug === slug);
    return trail ? { ...trail } : null;
  }
}

export class MockGuideRepository implements IGuideRepository {
  async getAll(): Promise<TravelGuide[]> {
    return [...mockGuides];
  }

  async getBySlug(slug: string): Promise<TravelGuide | null> {
    const guide = mockGuides.find((g) => g.slug === slug);
    return guide ? { ...guide } : null;
  }
}
