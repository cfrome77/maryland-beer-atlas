import { z } from 'zod';
import {
  marylandRegionSchema,
  breweryTypeSchema,
  breweryOperatingStatusSchema,
  coordinatesSchema,
  operatingHoursSchema,
  timePeriodSchema,
  dailyHoursSchema,
  holidayExceptionSchema,
  verificationSourceTypeSchema,
  verificationConfidenceSchema,
  verificationStatusSchema,
  fieldVerificationSchema,
  breweryVerificationSchema,
  brewerySchema,
  beerTrailSchema,
  travelGuideSchema,
  guideTypeSchema,
  guideSeoSchema,
  guideGalleryItemSchema,
} from './validations/schemas';

/**
 * Maryland Beer Atlas - Domain Models & Data Boundaries Architecture
 *
 * Types are aligned with and inferred directly from Zod validation schemas
 * to ensure compile-time TypeScript type safety matches runtime validation.
 */

export type MarylandRegion = z.infer<typeof marylandRegionSchema>;
export type BreweryType = z.infer<typeof breweryTypeSchema>;
export type BreweryOperatingStatus = z.infer<typeof breweryOperatingStatusSchema>;
export type VerificationSourceType = z.infer<typeof verificationSourceTypeSchema>;
export type VerificationConfidence = z.infer<typeof verificationConfidenceSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export type OperationalCategory = 'permanently_closed' | 'temporarily_closed' | 'open' | 'hours_unavailable';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
export type TimePeriod = z.infer<typeof timePeriodSchema>;
export type DailyHours = z.infer<typeof dailyHoursSchema>;
export type HolidayException = z.infer<typeof holidayExceptionSchema>;

export type FieldVerification = z.infer<typeof fieldVerificationSchema>;
export type BreweryVerification = z.infer<typeof breweryVerificationSchema>;

export type GuideType = z.infer<typeof guideTypeSchema>;
export type GuideSeo = z.infer<typeof guideSeoSchema>;
export type GuideGalleryItem = z.infer<typeof guideGalleryItemSchema>;

export type Brewery = z.infer<typeof brewerySchema>;
export type BeerTrail = z.infer<typeof beerTrailSchema>;
export type TravelGuide = z.infer<typeof travelGuideSchema>;

export type { DataFreshnessInfo, FreshnessCategory, VerificationBadgeInfo } from './utils/freshness';
