import { z } from 'zod';

/**
 * Maryland Beer Atlas - Zod Runtime Validation Layer
 *
 * This layer provides runtime validation for domain data at boundary entry points (e.g. Sanity CMS, external APIs, mock repositories).
 * Fields are explicitly categorized as:
 * - Required: Mandatory domain facts that must be present and valid.
 * - Optional / Nullable: Non-mandatory properties that may be omitted or null in external API responses.
 * - Derived: Calculated domain values derived from raw facts (e.g., full address, verification flag).
 */

// ==========================================
// 1. Primitive & Enum Schemas
// ==========================================

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
// 2. Sub-object & Helper Schemas
// ==========================================

export const coordinatesSchema = z.object({
  // Required geographic coordinates bounded to valid latitude (-90 to 90) and longitude (-180 to 180)
  lat: z.number({ message: 'Latitude is required' }).min(-90).max(90),
  lng: z.number({ message: 'Longitude is required' }).min(-180).max(180),
});

export const operatingHoursSchema = z.object({
  // Required human-readable operating hours entry
  day: z.string().min(1, 'Day name is required'),
  hours: z.string().min(1, 'Hours specification is required'),
});

export const timePeriodSchema = z.object({
  // Time format string "HH:MM" (e.g. "11:00", "22:00")
  opens: z.string().min(1, 'Opening time is required'),
  closes: z.string().min(1, 'Closing time is required'),
});

export const dailyHoursSchema = z.object({
  // Required structured day entry
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  isClosed: z.boolean(),
  // Optional / Nullable array of time slots
  periods: z.array(timePeriodSchema).nullish(),
});

export const holidayExceptionSchema = z.object({
  // Required holiday exception details
  date: z.string().min(1, 'Holiday date is required'), // "YYYY-MM-DD"
  isClosed: z.boolean(),
  // Optional / Nullable periods & notes
  periods: z.array(timePeriodSchema).nullish(),
  notes: z.string().nullish(),
});

export const socialLinksSchema = z.object({
  // Optional / Nullable social media URLs
  facebook: z.string().nullish(),
  instagram: z.string().nullish(),
  twitter: z.string().nullish(),
});

export const fieldVerificationSchema = z.object({
  // Required provenance properties
  verified: z.boolean(),
  sourceType: verificationSourceTypeSchema,
  checkedAt: z.string().min(1, 'Verification checkedAt date is required'),
  confidence: verificationConfidenceSchema,
  // Optional / Nullable verification details
  sourceUrl: z.string().nullish(),
  notes: z.string().nullish(),
});

export const breweryVerificationSchema = z.object({
  // Required general field verification
  general: fieldVerificationSchema,
  // Optional / Nullable field-specific verifications
  hours: fieldVerificationSchema.nullish(),
  address: fieldVerificationSchema.nullish(),
  amenities: fieldVerificationSchema.nullish(),
});

// ==========================================
// 3. Domain Entity Schemas
// ==========================================

/**
 * Zod Schema for Canonical Brewery domain records.
 */
export const brewerySchema = z.object({
  // --- REQUIRED DOMAIN FIELDS ---
  id: z.string().min(1, 'Brewery ID is required'),
  slug: z.string().min(1, 'Brewery slug is required'),
  name: z.string().min(1, 'Brewery name is required'),
  type: breweryTypeSchema,
  region: marylandRegionSchema,
  status: breweryOperatingStatusSchema,
  address: z.string(),
  city: z.string(),
  county: z.string(),
  state: z.string().default('MD'),
  zipCode: z.string(),
  phone: z.string(),
  website: z.string(),
  socialLinks: socialLinksSchema,
  coordinates: coordinatesSchema,
  hours: z.array(operatingHoursSchema),
  beerStyles: z.array(z.string()),
  amenities: z.array(z.string()),
  featured: z.boolean(),
  lastVerified: z.string(),
  verificationSource: z.string(),
  verificationStatus: verificationStatusSchema,
  description: z.string(),
  image: z.string(),

  // --- OPTIONAL / NULLABLE DOMAIN FIELDS ---
  statusUpdatedAt: z.string().nullish(),
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
  // --- REQUIRED FIELDS ---
  id: z.string().min(1, 'Trail ID is required'),
  slug: z.string().min(1, 'Trail slug is required'),
  name: z.string().min(1, 'Trail name is required'),
  description: z.string(),
  region: marylandRegionSchema,
  distance: z.string(),
  duration: z.string(),
  breweries: z.array(brewerySchema),
  image: z.string(),
  highlight: z.string(),
  nearbyAttractions: z.array(z.string()),
  difficulty: z.string(),
});

/**
 * Zod Schema for Travel Guide domain records (reuses brewerySchema).
 */
export const travelGuideSchema = z.object({
  // --- REQUIRED FIELDS ---
  slug: z.string().min(1, 'Guide slug is required'),
  title: z.string().min(1, 'Guide title is required'),
  description: z.string(),
  author: z.string(),
  publishDate: z.string(),
  region: marylandRegionSchema,
  content: z.string(),
  image: z.string(),
  recommendedStops: z.array(brewerySchema),
  tips: z.array(z.string()),
});

// ==========================================
// 4. Derived Fields & Helpers
// ==========================================

export interface DerivedBreweryFields {
  fullAddress: string;
  isVerified: boolean;
  hasStructuredHours: boolean;
}

/**
 * Computes derived domain properties from raw Brewery facts.
 */
export function getDerivedBreweryFields(brewery: z.infer<typeof brewerySchema>): DerivedBreweryFields {
  return {
    fullAddress: `${brewery.address}, ${brewery.city}, ${brewery.state || 'MD'} ${brewery.zipCode}`,
    isVerified: brewery.verificationStatus === 'Verified',
    hasStructuredHours: Array.isArray(brewery.structuredHours) && brewery.structuredHours.length > 0,
  };
}

/**
 * Extended Brewery Schema including derived fields.
 */
export const breweryWithDerivedSchema = brewerySchema.extend({
  fullAddress: z.string(),
  isVerified: z.boolean(),
  hasStructuredHours: z.boolean(),
});

// ==========================================
// 5. Error Formatting & Runtime Helpers
// ==========================================

/**
 * Normalizes raw or inconsistent brewery data into canonical Brewery format before validation.
 * Trims whitespace, standardizes state, normalizes phone numbers, fills missing defaults.
 */
export function normalizeBreweryData(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const data = { ...(raw as Record<string, unknown>) };

  if (typeof data.name === 'string') {
    data.name = data.name.trim();
  }

  if (typeof data.address === 'string') {
    data.address = data.address.trim();
  }

  if (typeof data.city === 'string') {
    data.city = data.city.trim();
  }

  if (typeof data.county === 'string') {
    data.county = data.county.trim();
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
    data.phone = data.phone.trim();
  }

  if (typeof data.website === 'string') {
    data.website = data.website.trim();
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
