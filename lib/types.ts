export type MarylandRegion = 'Capital' | 'Central' | 'Eastern Shore' | 'Southern' | 'Western';

export type BreweryType = 'Microbrewery' | 'Brewpub' | 'Production' | 'Farm Brewery';

export interface Beer {
  name: string;
  style: string;
  abv: number;
  description: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OperatingHours {
  day: string;
  hours: string;
}

export interface Brewery {
  id: string;
  name: string;
  type: BreweryType;
  region: MarylandRegion;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  website: string;
  coordinates: Coordinates;
  description: string;
  image: string;
  hours: OperatingHours[];
  beers: Beer[];
  amenities: string[];
  featured: boolean;
}

export interface BeerTrail {
  id: string;
  name: string;
  description: string;
  region: MarylandRegion;
  distance: string; // e.g., "15 miles"
  duration: string; // e.g., "Full Day" or "Weekend"
  breweries: Brewery[]; // Breweries on the trail
  image: string;
  highlight: string;
}

export interface TravelGuide {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishDate: string;
  region: MarylandRegion;
  content: string; // Markdown or simple HTML text
  image: string;
  recommendedStops: Brewery[];
  tips: string[];
}
