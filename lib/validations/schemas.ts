import { z } from 'zod';
import { getDataFreshnessInfo, DataFreshnessInfo } from '../utils/freshness';

/**
 * Maryland Beer Atlas - Zod Runtime Validation Layer
 *
 * Provides strict runtime validation for domain data at boundary entry points
 * (Sanity CMS, external APIs, mock repositories) based on production data quality standards.
 */

// ==========================================
// 1. Regex Formats & Boundary Constants
// ==========================================

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PHONE_REGEX = /^(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
export const ZIP_REGEX = /^\d{5}(-\d{4})?$/;
export const TIME_24H_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Geographic bounding box for the State of Maryland (approximate bounds).
 */
export const MARYLAND_BOUNDS = {
  minLat: 37.8,
  maxLat: 39.75,
  minLng: -79.5,
  maxLng: -75.0,
};

/**
 * Checks if geographic coordinates fall within Maryland state boundaries.
 */
export function isWithinMarylandBounds(coords: { lat: number; lng: number }): boolean {
  if (typeof coords?.lat !== 'number' || typeof coords?.lng !== 'number') return false;
  return (
    coords.lat >= MARYLAND_BOUNDS.minLat &&
    coords.lat <= MARYLAND_BOUNDS.maxLat &&
    coords.lng >= MARYLAND_BOUNDS.minLng &&
    coords.lng <= MARYLAND_BOUNDS.maxLng
  );
}

// ==========================================
// 2. Primitive & Reusable Value Schemas
// ==========================================

export const slugSchema = z
  .string()
  .min(1, 'Brewery slug is required')
  .regex(SLUG_REGEX, 'Slug must be lower-case alphanumeric separated by single hyphens (e.g., "flying-dog-brewery")');

export const phoneSchema = z
  .string()
  .refine((val) => val === '' || PHONE_REGEX.test(val), {
    message: 'Phone must be a valid 10-digit US telephone number (e.g., 301-694-7899)',
  });

export const zipCodeSchema = z
  .string()
  .regex(ZIP_REGEX, 'ZIP code must be a 5-digit or 9-digit US ZIP code (e.g., 21703 or 21703-1234)');

export const urlSchema = z
  .string()
  .refine((val) => val === '' || URL_REGEX.test(val), {
    message: 'Must be a valid HTTP or HTTPS URL (e.g., "https://www.example.com")',
  });

export const dateSchema = z
  .string()
  .regex(ISO_DATE_REGEX, 'Date must be formatted as YYYY-MM-DD');

export const marylandRegionSchema = z.enum([
  'Capital',
  'Central',
  'Eastern Shore',
  'Southern',
  'Western',
]);

export const breweryTypeSchema = z.enum([
  'Microbrewery',
  'Brewpub',
  'Production',
  'Farm Brewery',
]);

export const breweryOperatingStatusSchema = z.enum([
  'Open',
  'Temporarily closed',
  'Permanently closed',
  'Seasonal',
  'Opening soon',
  'Relocating',
  'Closed',
  'Contract-only',
]);

export const verificationSourceTypeSchema = z.enum([
  'Official Website',
  'Social Media',
  'Direct Communication',
  'Community Report',
  'Other',
]);

export const verificationConfidenceSchema = z.enum([
  'Low',
  'Medium',
  'High',
]);

export const verificationStatusSchema = z.enum([
  'Verified',
  'Needs Review',
  'Community Submitted',
]);

// ==========================================
// 3. Sub-object & Helper Schemas
// ==========================================

export const coordinatesSchema = z.object({
  lat: z.number({ message: 'Latitude is required' }).min(-90).max(90),
  lng: z.number({ message: 'Longitude is required' }).min(-180).max(180),
});

export const operatingHoursSchema = z.object({
  day: z.string().min(1, 'Day name is required'),
  hours: z.string().min(1, 'Hours specification is required'),
});

export const timePeriodSchema = z.object({
  opens: z.string().regex(TIME_24H_REGEX, 'Opening time must be in 24-hour HH:MM format (e.g. "11:00")'),
  closes: z.string().regex(TIME_24H_REGEX, 'Closing time must be in 24-hour HH:MM format (e.g. "22:00")'),
});

export const dailyHoursSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  isClosed: z.boolean(),
  periods: z.array(timePeriodSchema).nullish(),
});

export const holidayExceptionSchema = z.object({
  date: dateSchema,
  isClosed: z.boolean(),
  periods: z.array(timePeriodSchema).nullish(),
  notes: z.string().nullish(),
});

export const socialLinksSchema = z.object({
  facebook: urlSchema.nullish(),
  instagram: urlSchema.nullish(),
  twitter: urlSchema.nullish(),
});

export const fieldVerificationSchema = z.object({
  verified: z.boolean(),
  sourceType: verificationSourceTypeSchema,
  checkedAt: dateSchema,
  confidence: verificationConfidenceSchema,
  sourceUrl: urlSchema.nullish(),
  notes: z.string().nullish(),
});

export const breweryVerificationSchema = z.object({
  general: fieldVerificationSchema,
  hours: fieldVerificationSchema.nullish(),
  address: fieldVerificationSchema.nullish(),
  amenities: fieldVerificationSchema.nullish(),
});

// ==========================================
// 4. Domain Entity Schemas
// ==========================================

/**
 * Zod Schema for Canonical Brewery domain records with explicit validation rules.
 */
export const brewerySchema = z.object({
  // --- REQUIRED DOMAIN FIELDS ---
  id: z.string().min(1, 'Brewery ID is required'),
  slug: slugSchema,
  name: z.string().min(1, 'Brewery name is required'),
  type: breweryTypeSchema,
  region: marylandRegionSchema,
  status: breweryOperatingStatusSchema,
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  state: z.string().default('MD'),
  zipCode: zipCodeSchema,
  phone: phoneSchema,
  website: urlSchema,
  socialLinks: socialLinksSchema,
  coordinates: coordinatesSchema,
  hours: z.array(operatingHoursSchema),
  beerStyles: z.array(z.string()),
  amenities: z.array(z.string()),
  featured: z.boolean(),
  lastVerified: dateSchema,
  verificationSource: z.string().min(1, 'Verification source is required'),
  verificationStatus: verificationStatusSchema,
  description: z.string(),
  image: urlSchema,

  // --- OPTIONAL / NULLABLE DOMAIN FIELDS ---
  statusUpdatedAt: dateSchema.nullish(),
  statusNotes: z.string().nullish(),
  structuredHours: z.array(dailyHoursSchema).nullish(),
  holidayExceptions: z.array(holidayExceptionSchema).nullish(),
  verification: breweryVerificationSchema.nullish(),
  sourceInfo: z.string().nullish(),
});

/**
 * Zod Schema for Beer Trail domain records (reuses brewerySchema).
 */
export const beerTrailSchema = z.object({
  id: z.string().min(1, 'Trail ID is required'),
  slug: slugSchema,
  name: z.string().min(1, 'Trail name is required'),
  description: z.string(),
  region: marylandRegionSchema,
  distance: z.string(),
  duration: z.string(),
  breweries: z.array(brewerySchema),
  image: urlSchema,
  highlight: z.string(),
  nearbyAttractions: z.array(z.string()),
  difficulty: z.string(),
});

/**
 * Zod Schema for Travel Guide domain records (reuses brewerySchema).
 */
export const travelGuideSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Guide title is required'),
  description: z.string(),
  author: z.string(),
  publishDate: z.string(),
  region: marylandRegionSchema,
  content: z.string(),
  image: urlSchema,
  recommendedStops: z.array(brewerySchema),
  tips: z.array(z.string()),
});

// ==========================================
// 5. Derived Fields & Helpers
// ==========================================

export interface DerivedBreweryFields {
  fullAddress: string;
  isVerified: boolean;
  hasStructuredHours: boolean;
  isStale: boolean;
  freshness: DataFreshnessInfo;
}

/**
 * Computes derived domain properties from raw Brewery facts.
 */
export function getDerivedBreweryFields(
  brewery: z.infer<typeof brewerySchema>,
  targetDate?: Date
): DerivedBreweryFields {
  const freshness = getDataFreshnessInfo(brewery, targetDate);
  return {
    fullAddress: `${brewery.address}, ${brewery.city}, ${brewery.state || 'MD'} ${brewery.zipCode}`,
    isVerified: brewery.verificationStatus === 'Verified' && !freshness.isStale,
    hasStructuredHours: Array.isArray(brewery.structuredHours) && brewery.structuredHours.length > 0,
    isStale: freshness.isStale,
    freshness,
  };
}

/**
 * Extended Brewery Schema including derived fields.
 */
export const breweryWithDerivedSchema = brewerySchema.extend({
  fullAddress: z.string(),
  isVerified: z.boolean(),
  hasStructuredHours: z.boolean(),
  isStale: z.boolean(),
});

// ==========================================
// 6. Normalization & Format Validation Helpers
// ==========================================

/**
 * Standardizes street address suffix abbreviations and directionals.
 */
export function normalizeStreetAddress(address: string): string {
  let cleaned = address.trim().replace(/\s+/g, ' ');

  // Standardize directional prefixes / suffixes
  cleaned = cleaned
    .replace(/\bN\.\b/gi, 'N')
    .replace(/\bS\.\b/gi, 'S')
    .replace(/\bE\.\b/gi, 'E')
    .replace(/\bW\.\b/gi, 'W')
    .replace(/\bNorth\b/gi, 'N')
    .replace(/\bSouth\b/gi, 'S')
    .replace(/\bEast\b/gi, 'E')
    .replace(/\bWest\b/gi, 'W');

  // Standardize common street suffixes
  cleaned = cleaned
    .replace(/\bStreet\b/gi, 'St')
    .replace(/\bSt\.\b/gi, 'St')
    .replace(/\bAvenue\b/gi, 'Ave')
    .replace(/\bAve\.\b/gi, 'Ave')
    .replace(/\bRoad\b/gi, 'Rd')
    .replace(/\bRd\.\b/gi, 'Rd')
    .replace(/\bBoulevard\b/gi, 'Blvd')
    .replace(/\bBlvd\.\b/gi, 'Blvd')
    .replace(/\bDrive\b/gi, 'Dr')
    .replace(/\bDr\.\b/gi, 'Dr')
    .replace(/\bCourt\b/gi, 'Ct')
    .replace(/\bCt\.\b/gi, 'Ct')
    .replace(/\bParkway\b/gi, 'Pkwy')
    .replace(/\bPkwy\.\b/gi, 'Pkwy')
    .replace(/\bLane\b/gi, 'Ln')
    .replace(/\bLn\.\b/gi, 'Ln');

  return cleaned;
}

/**
 * Standardizes phone numbers into canonical "XXX-XXX-XXXX" format.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

/**
 * Standardizes URL strings, auto-prefixing missing HTTP/HTTPS protocols.
 */
export function normalizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Normalizes raw or inconsistent brewery data into canonical Brewery format before validation.
 * Trims whitespace, normalizes street addresses, formats phone numbers, prefixes URLs.
 */
export function normalizeBreweryData(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const data = { ...(raw as Record<string, unknown>) };

  if (typeof data.name === 'string') {
    data.name = data.name.trim().replace(/\s+/g, ' ');
  }

  if (typeof data.address === 'string') {
    data.address = normalizeStreetAddress(data.address);
  }

  if (typeof data.city === 'string') {
    data.city = data.city.trim().replace(/\s+/g, ' ');
  }

  if (typeof data.county === 'string') {
    data.county = data.county.trim().replace(/\s+/g, ' ');
  }

  if (!data.state || typeof data.state !== 'string' || !data.state.trim()) {
    data.state = 'MD';
  } else {
    data.state = data.state.trim().toUpperCase();
    if (data.state === 'MARYLAND') {
      data.state = 'MD';
    }
  }

  if (typeof data.zipCode === 'string') {
    data.zipCode = data.zipCode.trim();
  } else if (typeof data.zipCode === 'number') {
    data.zipCode = String(data.zipCode).padStart(5, '0');
  }

  if (typeof data.phone === 'string') {
    data.phone = normalizePhone(data.phone);
  }

  if (typeof data.website === 'string') {
    data.website = normalizeUrl(data.website);
  }

  if (typeof data.image === 'string') {
    data.image = normalizeUrl(data.image);
  }

  if (data.socialLinks && typeof data.socialLinks === 'object') {
    const socials = { ...(data.socialLinks as Record<string, unknown>) };
    if (typeof socials.facebook === 'string') socials.facebook = normalizeUrl(socials.facebook);
    if (typeof socials.instagram === 'string') socials.instagram = normalizeUrl(socials.instagram);
    if (typeof socials.twitter === 'string') socials.twitter = normalizeUrl(socials.twitter);
    data.socialLinks = socials;
  }

  if (typeof data.description === 'string') {
    data.description = data.description.trim();
  }

  if (data.verificationSource && !data.sourceInfo) {
    data.sourceInfo = String(data.verificationSource);
  } else if (data.sourceInfo && !data.verificationSource) {
    data.verificationSource = String(data.sourceInfo);
  }

  return data;
}

/**
 * Normalizes and validates raw data as a Brewery domain object. Throws formatted Error on failure.
 */
export function normalizeAndValidateBrewery(data: unknown): z.infer<typeof brewerySchema> {
  const normalized = normalizeBreweryData(data);
  return validateBrewery(normalized);
}

/**
 * Normalizes and validates an array of Brewery objects.
 */
export function normalizeAndValidateBreweryList(data: unknown[]): z.infer<typeof brewerySchema>[] {
  if (!Array.isArray(data)) {
    throw new Error('[Runtime Validation Error] Input for normalizeAndValidateBreweryList must be an array');
  }
  return data.map((item, idx) => {
    const normalized = normalizeBreweryData(item);
    const result = brewerySchema.safeParse(normalized);
    if (!result.success) {
      const name = (normalized && typeof normalized === 'object' && 'name' in normalized) ? (normalized as { name: unknown }).name : `Index ${idx}`;
      throw new Error(formatZodError(result.error, `Brewery "${name}"`));
    }
    return result.data;
  });
}

/**
 * Formats a Zod validation error into a useful, human-readable error message.
 */
export function formatZodError(error: z.ZodError, entityContext = 'Record'): string {
  const issuesSummary = error.issues
    .map((issue) => {
      const pathStr = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `  - Field "${pathStr}": ${issue.message}`;
    })
    .join('\n');

  return `[Runtime Validation Error] Invalid ${entityContext}:\n${issuesSummary}`;
}

/**
 * Validates raw data as a Brewery domain object. Throws formatted Error on failure.
 */
export function validateBrewery(data: unknown): z.infer<typeof brewerySchema> {
  const result = brewerySchema.safeParse(data);
  if (!result.success) {
    const context = (data && typeof data === 'object' && 'name' in data) ? `Brewery "${(data as { name: unknown }).name}"` : 'Brewery';
    throw new Error(formatZodError(result.error, context));
  }
  return result.data;
}

/**
 * Safely validates raw data as a Brewery.
 */
export function safeValidateBrewery(data: unknown) {
  const result = brewerySchema.safeParse(data);
  if (!result.success) {
    const context = (data && typeof data === 'object' && 'name' in data) ? `Brewery "${(data as { name: unknown }).name}"` : 'Brewery';
    return {
      success: false as const,
      formattedError: formatZodError(result.error, context),
      error: result.error,
    };
  }
  return {
    success: true as const,
    data: result.data,
  };
}

/**
 * Validates an array of Brewery objects.
 */
export function validateBreweryList(data: unknown[]): z.infer<typeof brewerySchema>[] {
  if (!Array.isArray(data)) {
    throw new Error('[Runtime Validation Error] Input for validateBreweryList must be an array');
  }
  return data.map((item, idx) => {
    const result = brewerySchema.safeParse(item);
    if (!result.success) {
      const name = (item && typeof item === 'object' && 'name' in item) ? (item as { name: unknown }).name : `Index ${idx}`;
      throw new Error(formatZodError(result.error, `Brewery "${name}"`));
    }
    return result.data;
  });
}

/**
 * Validates raw data as a BeerTrail domain object.
 */
export function validateBeerTrail(data: unknown): z.infer<typeof beerTrailSchema> {
  const result = beerTrailSchema.safeParse(data);
  if (!result.success) {
    const context = (data && typeof data === 'object' && 'name' in data) ? `Beer Trail "${(data as { name: unknown }).name}"` : 'Beer Trail';
    throw new Error(formatZodError(result.error, context));
  }
  return result.data;
}

/**
 * Validates an array of BeerTrail objects.
 */
export function validateBeerTrailList(data: unknown[]): z.infer<typeof beerTrailSchema>[] {
  if (!Array.isArray(data)) {
    throw new Error('[Runtime Validation Error] Input for validateBeerTrailList must be an array');
  }
  return data.map((item, idx) => {
    const result = beerTrailSchema.safeParse(item);
    if (!result.success) {
      const name = (item && typeof item === 'object' && 'name' in item) ? (item as { name: unknown }).name : `Index ${idx}`;
      throw new Error(formatZodError(result.error, `Beer Trail "${name}"`));
    }
    return result.data;
  });
}

/**
 * Validates raw data as a TravelGuide domain object.
 */
export function validateTravelGuide(data: unknown): z.infer<typeof travelGuideSchema> {
  const result = travelGuideSchema.safeParse(data);
  if (!result.success) {
    const context = (data && typeof data === 'object' && 'title' in data) ? `Travel Guide "${(data as { title: unknown }).title}"` : 'Travel Guide';
    throw new Error(formatZodError(result.error, context));
  }
  return result.data;
}

/**
 * Validates an array of TravelGuide objects.
 */
export function validateTravelGuideList(data: unknown[]): z.infer<typeof travelGuideSchema>[] {
  if (!Array.isArray(data)) {
    throw new Error('[Runtime Validation Error] Input for validateTravelGuideList must be an array');
  }
  return data.map((item, idx) => {
    const result = travelGuideSchema.safeParse(item);
    if (!result.success) {
      const title = (item && typeof item === 'object' && 'title' in item) ? (item as { title: unknown }).title : `Index ${idx}`;
      throw new Error(formatZodError(result.error, `Travel Guide "${title}"`));
    }
    return result.data;
  });
}
