export type MarylandRegion = 'Capital' | 'Central' | 'Eastern Shore' | 'Southern' | 'Western';

export type BreweryType = 'Microbrewery' | 'Brewpub' | 'Production' | 'Farm Brewery';

export type BreweryOperatingStatus = 'Open' | 'Temporarily closed' | 'Seasonal' | 'Opening soon' | 'Relocating' | 'Closed' | 'Contract-only';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OperatingHours {
  day: string;
  hours: string;
}

export interface TimePeriod {
  opens: string;  // "HH:MM" e.g., "11:00"
  closes: string; // "HH:MM" e.g., "22:00"
}

export interface DailyHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isClosed: boolean;
  periods?: TimePeriod[];
}

export interface HolidayException {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  periods?: TimePeriod[];
  notes?: string;
}

export type VerificationSourceType = 'Official Website' | 'Social Media' | 'Direct Communication' | 'Community Report' | 'Other';
export type VerificationConfidence = 'Low' | 'Medium' | 'High';

export interface FieldVerification {
  verified: boolean;
  sourceType: VerificationSourceType;
  sourceUrl?: string;
  checkedAt: string; // "YYYY-MM-DD"
  confidence: VerificationConfidence;
  notes?: string;
}

export interface BreweryVerification {
  hours?: FieldVerification;
  address?: FieldVerification;
  amenities?: FieldVerification;
  general: FieldVerification;
}

export interface Brewery {
  id: string;
  slug: string;
  name: string;
  type: BreweryType;
  region: MarylandRegion;
  status: BreweryOperatingStatus;
  statusUpdatedAt?: string;
  statusNotes?: string;
  address: string;
  city: string;
  county: string;
  zipCode: string;
  phone: string;
  website: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  coordinates: Coordinates;
  description: string;
  image: string;
  hours: OperatingHours[];
  structuredHours?: DailyHours[];
  holidayExceptions?: HolidayException[];
  beerStyles: string[];
  amenities: string[];
  featured: boolean;
  lastVerified: string;
  verificationSource: string;
  verificationStatus: 'Verified' | 'Needs Review' | 'Community Submitted';
  verification?: BreweryVerification;
}

export interface BeerTrail {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: MarylandRegion;
  distance: string; // e.g., "15 miles"
  duration: string; // e.g., "Full Day" or "Weekend"
  breweries: Brewery[]; // Breweries on the trail
  image: string;
  highlight: string;
  nearbyAttractions: string[];
  difficulty: string; // e.g., "Easy", "Moderate", "Challenging"
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
