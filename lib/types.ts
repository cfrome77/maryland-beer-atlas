/**
 * Maryland Beer Atlas - Domain Models & Data Boundaries Architecture
 *
 * Data Boundary Separation:
 * 1. Canonical Brewery Domain Facts (System of Record):
 *    - Identity: id, slug, name, type, region
 *    - Location & Contact: address, city, county, zipCode, phone, website, socialLinks, coordinates
 *    - Operational Facts: status, statusUpdatedAt, statusNotes, hours, structuredHours, holidayExceptions, beerStyles, amenities, featured
 *
 * 2. Data Verification & Freshness Metadata:
 *    - Summary Metadata: lastVerified, verificationSource, verificationStatus
 *    - Field-Level Provenance: verification (general, hours, address, amenities verification details with source URLs, dates, and confidence)
 *
 * 3. Editorial & Marketing Content (Headless Sanity CMS):
 *    - Editorial Descriptions & Media: description, image
 *    - Travel Guides & Beer Trails: TravelGuide (articles, tips, recommendedStops), BeerTrail (curated itineraries, highlights, difficulty)
 */

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

/**
 * Canonical Brewery Domain Model
 */
export interface Brewery {
  // Identity Facts
  id: string;
  slug: string;
  name: string;
  type: BreweryType;
  region: MarylandRegion;

  // Operational Status & Details
  status: BreweryOperatingStatus;
  statusUpdatedAt?: string;
  statusNotes?: string;

  // Location & Contact Facts
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

  // Operating Hours
  hours: OperatingHours[];
  structuredHours?: DailyHours[];
  holidayExceptions?: HolidayException[];

  // Features & Offerings
  beerStyles: string[];
  amenities: string[];
  featured: boolean;

  // Verification & Provenance Metadata
  lastVerified: string;
  verificationSource: string;
  verificationStatus: 'Verified' | 'Needs Review' | 'Community Submitted';
  verification?: BreweryVerification;

  // Editorial Content (Managed via Headless Sanity CMS)
  description: string;
  image: string;
}

/**
 * Editorial Beer Trail Model
 */
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

/**
 * Editorial Travel Guide Article Model
 */
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
