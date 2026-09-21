import { Brewery, BeerTrail, TravelGuide } from '../types';

export interface MapBreweryMarker {
  id: string;
  breweryId?: string;
  slug: string;
  name: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  featured?: boolean;
  amenities?: string[];
  image?: string;
}

export interface IBreweryRepository {
  getAll(): Promise<Brewery[]>;
  getBySlug(slug: string): Promise<Brewery | null>;
  getById(id: string): Promise<Brewery | null>;
  getFeatured(): Promise<Brewery[]>;
  getMapBreweries?(): Promise<MapBreweryMarker[]>;
}

export interface ITrailRepository {
  getAll(): Promise<BeerTrail[]>;
  getById(id: string): Promise<BeerTrail | null>;
  getBySlug(slug: string): Promise<BeerTrail | null>;
}

export interface IGuideRepository {
  getAll(): Promise<TravelGuide[]>;
  getBySlug(slug: string): Promise<TravelGuide | null>;
}
