import { Brewery, BeerTrail, TravelGuide } from '../types';
import {
  safeValidateBrewery,
  isWithinMarylandBounds,
  normalizeStreetAddress,
} from './schemas';
import { getDataFreshnessInfo, FreshnessCategory } from '../utils/freshness';

/**
 * Production Brewery Data Quality Standards & Audit Utilities
 */

export interface DuplicateMatch {
  breweryId: string;
  breweryName: string;
  duplicateOfId: string;
  duplicateOfName: string;
  matchReason: 'matching_slug_or_id' | 'matching_name_and_city' | 'matching_street_address' | 'geographic_proximity';
  details: string;
}

export interface CloseDuplicateCoordinatesMatch {
  brewery1Id: string;
  brewery1Name: string;
  brewery1Coords: { lat: number; lng: number };
  brewery2Id: string;
  brewery2Name: string;
  brewery2Coords: { lat: number; lng: number };
  distanceMeters: number;
}

export interface ClosedOrInactiveBreweryInfo {
  id: string;
  slug: string;
  name: string;
  status: string;
  statusUpdatedAt?: string | null;
  statusNotes?: string | null;
  category: 'permanently_closed' | 'temporarily_closed' | 'relocating' | 'inactive';
}

export interface CompletenessReport {
  breweryId: string;
  breweryName: string;
  score: number; // 0 to 100
  isComplete: boolean;
  missingFields: string[];
  qualityWarnings: string[];
}

export interface IncompleteRecordInfo {
  brewery: Brewery;
  report: CompletenessReport;
}

export interface InvalidCoordinatesReport {
  breweryId: string;
  breweryName: string;
  coordinates: { lat: number; lng: number } | null;
  reason: 'missing_coordinates' | 'non_numeric_coordinates' | 'out_of_maryland_bounds';
  details: string;
}

export interface InvalidHoursReport {
  breweryId: string;
  breweryName: string;
  issueType: 'missing_all_hours' | 'missing_structured_hours' | 'invalid_time_periods';
  details: string;
}

export interface MissingContactOrMediaReport {
  breweryId: string;
  breweryName: string;
  missingWebsite: boolean;
  missingPhone: boolean;
  missingImage: boolean;
  missingSocialLinks: boolean;
  invalidUrls: string[];
}

export interface VerificationAuditReport {
  breweryId: string;
  breweryName: string;
  lastVerified: string | null;
  freshnessCategory: FreshnessCategory;
  daysSinceVerified: number | null;
  issue: 'missing_date' | 'stale_verification' | 'outdated_verification' | 'unverified_status' | 'needs_review';
  details: string;
}

export interface BrokenReferenceMatch {
  sourceType: 'trail' | 'guide';
  sourceIdOrSlug: string;
  sourceName: string;
  referencedBreweryRef: string;
  locationDetails: string;
}

export interface DatasetAuditReport {
  targetDate: string;
  totalRecords: number;
  validRecordsCount: number;
  invalidRecordsCount: number;
  invalidRecords: Array<{ id?: string; name?: string; error: string }>;
  duplicates: DuplicateMatch[];
  closeCoordinates: CloseDuplicateCoordinatesMatch[];
  invalidCoordinates: InvalidCoordinatesReport[];
  invalidHours: InvalidHoursReport[];
  missingContactAndMedia: MissingContactOrMediaReport[];
  verificationIssues: VerificationAuditReport[];
  closedOrInactiveCount: number;
  closedOrInactiveBreweries: ClosedOrInactiveBreweryInfo[];
  incompleteRecordsCount: number;
  incompleteRecords: IncompleteRecordInfo[];
  brokenReferences: BrokenReferenceMatch[];
  outOfBoundsCoordinatesCount: number;
  outOfBoundsBreweries: Array<{ id: string; name: string; lat: number; lng: number }>;
  averageCompletenessScore: number;
}

/**
 * Calculates geographic distance in meters between two coordinates using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Radius of the earth in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Identifies potential duplicate brewery records within a dataset based on:
 * - Duplicate ID or slug
 * - Matching normalized name and city
 * - Matching normalized street address & ZIP code
 * - Geographic proximity (< 50 meters distance)
 */
export function findDuplicateBreweries(breweries: Brewery[]): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const seenMatches = new Set<string>();

  for (let i = 0; i < breweries.length; i++) {
    for (let j = i + 1; j < breweries.length; j++) {
      const b1 = breweries[i];
      const b2 = breweries[j];

      const pairKey = [b1.id, b2.id].sort().join('::');
      if (seenMatches.has(pairKey)) continue;

      // 1. Check matching ID or Slug
      if (b1.id.toLowerCase() === b2.id.toLowerCase() || b1.slug.toLowerCase() === b2.slug.toLowerCase()) {
        seenMatches.add(pairKey);
        matches.push({
          breweryId: b2.id,
          breweryName: b2.name,
          duplicateOfId: b1.id,
          duplicateOfName: b1.name,
          matchReason: 'matching_slug_or_id',
          details: `Identical ID or slug ("${b1.slug}" vs "${b2.slug}")`,
        });
        continue;
      }

      // 2. Check matching name & city (normalized)
      const normName1 = b1.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const normName2 = b2.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const normCity1 = b1.city.toLowerCase().trim();
      const normCity2 = b2.city.toLowerCase().trim();

      if (normName1 === normName2 && normCity1 === normCity2) {
        seenMatches.add(pairKey);
        matches.push({
          breweryId: b2.id,
          breweryName: b2.name,
          duplicateOfId: b1.id,
          duplicateOfName: b1.name,
          matchReason: 'matching_name_and_city',
          details: `Matching normalized name "${b1.name}" in city "${b1.city}"`,
        });
        continue;
      }

      // 3. Check matching street address and zip code
      const normAddr1 = normalizeStreetAddress(b1.address).toLowerCase();
      const normAddr2 = normalizeStreetAddress(b2.address).toLowerCase();
      if (normAddr1 === normAddr2 && b1.zipCode.slice(0, 5) === b2.zipCode.slice(0, 5)) {
        seenMatches.add(pairKey);
        matches.push({
          breweryId: b2.id,
          breweryName: b2.name,
          duplicateOfId: b1.id,
          duplicateOfName: b1.name,
          matchReason: 'matching_street_address',
          details: `Matching street address "${b1.address}, ${b1.city} ${b1.zipCode}"`,
        });
        continue;
      }

      // 4. Check geographic proximity (< 50 meters)
      if (b1.coordinates && b2.coordinates) {
        const distance = calculateHaversineDistanceMeters(
          b1.coordinates.lat,
          b1.coordinates.lng,
          b2.coordinates.lat,
          b2.coordinates.lng
        );

        if (distance <= 50) {
          seenMatches.add(pairKey);
          matches.push({
            breweryId: b2.id,
            breweryName: b2.name,
            duplicateOfId: b1.id,
            duplicateOfName: b1.name,
            matchReason: 'geographic_proximity',
            details: `Coordinates located within ${Math.round(distance)} meters of each other`,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Identifies pairs of breweries located within a geographic threshold distance (default <= 50m).
 */
export function findCloseDuplicateCoordinates(
  breweries: Brewery[],
  thresholdMeters = 50
): CloseDuplicateCoordinatesMatch[] {
  const matches: CloseDuplicateCoordinatesMatch[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < breweries.length; i++) {
    for (let j = i + 1; j < breweries.length; j++) {
      const b1 = breweries[i];
      const b2 = breweries[j];

      if (!b1.coordinates || !b2.coordinates) continue;
      if (
        typeof b1.coordinates.lat !== 'number' ||
        typeof b1.coordinates.lng !== 'number' ||
        isNaN(b1.coordinates.lat) ||
        isNaN(b1.coordinates.lng) ||
        typeof b2.coordinates.lat !== 'number' ||
        typeof b2.coordinates.lng !== 'number' ||
        isNaN(b2.coordinates.lat) ||
        isNaN(b2.coordinates.lng)
      ) {
        continue;
      }

      const pairKey = [b1.id, b2.id].sort().join('::');
      if (seenPairs.has(pairKey)) continue;

      const distance = calculateHaversineDistanceMeters(
        b1.coordinates.lat,
        b1.coordinates.lng,
        b2.coordinates.lat,
        b2.coordinates.lng
      );

      if (distance <= thresholdMeters) {
        seenPairs.add(pairKey);
        matches.push({
          brewery1Id: b1.id,
          brewery1Name: b1.name,
          brewery1Coords: { lat: b1.coordinates.lat, lng: b1.coordinates.lng },
          brewery2Id: b2.id,
          brewery2Name: b2.name,
          brewery2Coords: { lat: b2.coordinates.lat, lng: b2.coordinates.lng },
          distanceMeters: Math.round(distance * 10) / 10,
        });
      }
    }
  }

  return matches;
}

/**
 * Checks for missing, non-numeric, NaN, or out-of-bounds coordinates across breweries.
 */
export function checkBreweryCoordinates(breweries: Brewery[]): InvalidCoordinatesReport[] {
  const reports: InvalidCoordinatesReport[] = [];

  for (const b of breweries) {
    if (!b.coordinates) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        coordinates: null,
        reason: 'missing_coordinates',
        details: 'Coordinates object is missing or null.',
      });
      continue;
    }

    const { lat, lng } = b.coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        coordinates: b.coordinates,
        reason: 'non_numeric_coordinates',
        details: `Latitude or longitude is non-numeric or NaN (lat: ${lat}, lng: ${lng}).`,
      });
      continue;
    }

    if (!isWithinMarylandBounds(b.coordinates)) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        coordinates: { lat, lng },
        reason: 'out_of_maryland_bounds',
        details: `Coordinates (${lat}, ${lng}) fall outside Maryland state bounding box.`,
      });
    }
  }

  return reports;
}

/**
 * Checks for missing or invalid opening hours across breweries.
 */
export function checkBreweryHoursValidity(breweries: Brewery[]): InvalidHoursReport[] {
  const reports: InvalidHoursReport[] = [];

  for (const b of breweries) {
    const hasStructured = Array.isArray(b.structuredHours) && b.structuredHours.length > 0;
    const hasPlainHours = Array.isArray(b.hours) && b.hours.length > 0;

    if (!hasStructured && !hasPlainHours) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        issueType: 'missing_all_hours',
        details: 'Both structuredHours and text hours are completely missing.',
      });
      continue;
    }

    if (!hasStructured) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        issueType: 'missing_structured_hours',
        details: 'Machine-readable structuredHours is missing, only plain text hours available.',
      });
    } else if (b.structuredHours) {
      // Validate time format in periods (HH:MM)
      let timeError = false;
      let errorDetail = '';

      for (const dh of b.structuredHours) {
        if (dh.isClosed) continue;
        if (!Array.isArray(dh.periods) || dh.periods.length === 0) {
          timeError = true;
          errorDetail = `Day ${dh.day} is marked open but has no operating periods.`;
          break;
        }

        for (const p of dh.periods) {
          if (!p.opens || !p.closes) {
            timeError = true;
            errorDetail = `Day ${dh.day} period missing opens or closes timestamp.`;
            break;
          }

          const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
          if (!timeRegex.test(p.opens) || !timeRegex.test(p.closes)) {
            timeError = true;
            errorDetail = `Day ${dh.day} operating period contains invalid 24-hour time format ("${p.opens}" - "${p.closes}"). Must be HH:MM.`;
            break;
          }
        }
        if (timeError) break;
      }

      if (timeError) {
        reports.push({
          breweryId: b.id,
          breweryName: b.name,
          issueType: 'invalid_time_periods',
          details: errorDetail,
        });
      }
    }
  }

  return reports;
}

/**
 * Checks presence and URL validity for contact info and image media.
 */
export function checkBreweryContactAndMedia(breweries: Brewery[]): MissingContactOrMediaReport[] {
  const reports: MissingContactOrMediaReport[] = [];

  for (const b of breweries) {
    const missingWebsite = !b.website || b.website.trim().length === 0;
    const missingPhone = !b.phone || b.phone.trim().length === 0;
    const missingImage = !b.image || b.image.trim().length === 0;
    const missingSocialLinks =
      !b.socialLinks || (!b.socialLinks.instagram && !b.socialLinks.facebook);

    const invalidUrls: string[] = [];
    if (b.website && !b.website.startsWith('http://') && !b.website.startsWith('https://')) {
      invalidUrls.push(`website: "${b.website}" (missing http/https)`);
    }
    if (b.image && !b.image.startsWith('http://') && !b.image.startsWith('https://') && !b.image.startsWith('/')) {
      invalidUrls.push(`image: "${b.image}" (invalid URL format)`);
    }

    if (missingWebsite || missingPhone || missingImage || missingSocialLinks || invalidUrls.length > 0) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        missingWebsite,
        missingPhone,
        missingImage,
        missingSocialLinks,
        invalidUrls,
      });
    }
  }

  return reports;
}

/**
 * Audits data verification freshness against standard thresholds (fresh <= 90d, stale 91-180d, outdated > 180d).
 */
export function auditVerificationFreshness(
  breweries: Brewery[],
  targetDate: Date = new Date()
): VerificationAuditReport[] {
  const reports: VerificationAuditReport[] = [];

  for (const b of breweries) {
    const info = getDataFreshnessInfo(b, targetDate);

    if (!b.lastVerified) {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        lastVerified: null,
        freshnessCategory: info.freshnessCategory,
        daysSinceVerified: null,
        issue: 'missing_date',
        details: 'No lastVerified date provided.',
      });
    } else if (info.freshnessCategory === 'stale') {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        lastVerified: b.lastVerified,
        freshnessCategory: 'stale',
        daysSinceVerified: info.daysSinceVerified,
        issue: 'stale_verification',
        details: `Last verified ${info.daysSinceVerified} days ago (${b.lastVerified}). Exceeds 90-day fresh threshold.`,
      });
    } else if (info.freshnessCategory === 'outdated') {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        lastVerified: b.lastVerified,
        freshnessCategory: 'outdated',
        daysSinceVerified: info.daysSinceVerified,
        issue: 'outdated_verification',
        details: `Last verified ${info.daysSinceVerified} days ago (${b.lastVerified}). Exceeds 180-day stale threshold.`,
      });
    } else if (b.verificationStatus === 'Needs Review') {
      reports.push({
        breweryId: b.id,
        breweryName: b.name,
        lastVerified: b.lastVerified,
        freshnessCategory: info.freshnessCategory,
        daysSinceVerified: info.daysSinceVerified,
        issue: 'needs_review',
        details: 'Data flagged with status "Needs Review".',
      });
    }
  }

  return reports;
}

/**
 * Identifies closed, temporarily closed, or inactive brewery records.
 */
export function identifyClosedOrInactiveBreweries(breweries: Brewery[]): ClosedOrInactiveBreweryInfo[] {
  const inactiveStatuses = ['Permanently closed', 'Closed', 'Temporarily closed', 'Relocating'];

  return breweries
    .filter((b) => inactiveStatuses.includes(b.status))
    .map((b) => {
      let category: ClosedOrInactiveBreweryInfo['category'] = 'inactive';
      if (b.status === 'Permanently closed' || b.status === 'Closed') {
        category = 'permanently_closed';
      } else if (b.status === 'Temporarily closed') {
        category = 'temporarily_closed';
      } else if (b.status === 'Relocating') {
        category = 'relocating';
      }

      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        status: b.status,
        statusUpdatedAt: b.statusUpdatedAt,
        statusNotes: b.statusNotes,
        category,
      };
    });
}

/**
 * Computes a record completeness score and identifies missing domain facts or warnings.
 */
export function checkRecordCompleteness(brewery: Brewery, targetDate: Date = new Date()): CompletenessReport {
  const missingFields: string[] = [];
  const qualityWarnings: string[] = [];
  let points = 0;

  // Mandatory facts (40 points total)
  if (brewery.name && brewery.name.trim().length > 0) points += 5;
  else missingFields.push('name');

  if (brewery.address && brewery.city && brewery.county && brewery.zipCode) points += 10;
  else missingFields.push('address_components');

  if (brewery.coordinates && typeof brewery.coordinates.lat === 'number' && typeof brewery.coordinates.lng === 'number') {
    points += 10;
    if (!isWithinMarylandBounds(brewery.coordinates)) {
      qualityWarnings.push('Coordinates outside Maryland state boundaries');
    }
  } else {
    missingFields.push('coordinates');
  }

  if (brewery.type && brewery.region) points += 5;
  else missingFields.push('type_or_region');

  if (brewery.status) points += 10;
  else missingFields.push('status');

  // Contact & Web Facts (20 points)
  if (brewery.phone && brewery.phone.trim().length > 0) {
    points += 5;
  } else {
    qualityWarnings.push('Missing phone number');
  }

  if (brewery.website && brewery.website.trim().length > 0) {
    points += 10;
  } else {
    missingFields.push('website');
  }

  if (brewery.socialLinks && (brewery.socialLinks.instagram || brewery.socialLinks.facebook)) {
    points += 5;
  } else {
    qualityWarnings.push('Missing social media links');
  }

  // Hours & Operational Facts (20 points)
  if (Array.isArray(brewery.structuredHours) && brewery.structuredHours.length > 0) {
    points += 15;
  } else if (Array.isArray(brewery.hours) && brewery.hours.length > 0) {
    points += 10;
    qualityWarnings.push('Missing machine-readable structuredHours');
  } else {
    missingFields.push('hours');
  }

  if (Array.isArray(brewery.beerStyles) && brewery.beerStyles.length > 0) {
    points += 5;
  } else {
    qualityWarnings.push('Missing beer styles');
  }

  // Curation & Verification Facts (20 points)
  if (brewery.description && brewery.description.trim().length >= 25) {
    points += 10;
  } else {
    qualityWarnings.push('Description is brief or missing');
  }

  if (brewery.image && brewery.image.trim().length > 0) {
    points += 5;
  } else {
    missingFields.push('image');
  }

  if (brewery.lastVerified) {
    const verifiedDate = new Date(brewery.lastVerified);
    const diffDays = Math.floor((targetDate.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 180) {
      points += 5;
    } else {
      qualityWarnings.push(`Verification date is stale (${diffDays} days old)`);
    }
  } else {
    qualityWarnings.push('Missing lastVerified date');
  }

  const score = Math.min(100, Math.max(0, points));

  return {
    breweryId: brewery.id,
    breweryName: brewery.name,
    score,
    isComplete: score >= 80 && missingFields.length === 0,
    missingFields,
    qualityWarnings,
  };
}

/**
 * Identifies incomplete brewery records scoring below a threshold or missing essential fields.
 */
export function identifyIncompleteRecords(
  breweries: Brewery[],
  thresholdScore = 80,
  targetDate: Date = new Date()
): IncompleteRecordInfo[] {
  const results: IncompleteRecordInfo[] = [];

  for (const brewery of breweries) {
    const report = checkRecordCompleteness(brewery, targetDate);
    if (!report.isComplete || report.score < thresholdScore) {
      results.push({ brewery, report });
    }
  }

  return results;
}

/**
 * Validates reference integrity across trails and guides pointing to canonical breweries.
 */
export function checkReferenceIntegrity(
  breweries: Brewery[],
  trails: BeerTrail[] = [],
  guides: TravelGuide[] = []
): BrokenReferenceMatch[] {
  const matches: BrokenReferenceMatch[] = [];

  const knownIdsAndSlugs = new Set<string>();
  for (const b of breweries) {
    if (b.id) knownIdsAndSlugs.add(b.id.toLowerCase());
    if (b.slug) knownIdsAndSlugs.add(b.slug.toLowerCase());
  }

  // Check Trails
  for (const t of trails) {
    if (Array.isArray(t.stops)) {
      for (const stop of t.stops) {
        if (!stop.brewery) continue;
        const refId = stop.brewery.id;
        const refSlug = stop.brewery.slug;

        const isKnown =
          (refId && knownIdsAndSlugs.has(refId.toLowerCase())) ||
          (refSlug && knownIdsAndSlugs.has(refSlug.toLowerCase()));

        if (!isKnown) {
          matches.push({
            sourceType: 'trail',
            sourceIdOrSlug: t.slug || t.id,
            sourceName: t.name,
            referencedBreweryRef: refSlug || refId || 'unknown',
            locationDetails: `Stop #${stop.order || 1} in trail "${t.name}"`,
          });
        }
      }
    }
  }

  // Check Guides
  for (const g of guides) {
    if (Array.isArray(g.recommendedStops)) {
      for (let idx = 0; idx < g.recommendedStops.length; idx++) {
        const stop = g.recommendedStops[idx];
        if (!stop) continue;
        const refId = stop.id;
        const refSlug = stop.slug;

        const isKnown =
          (refId && knownIdsAndSlugs.has(refId.toLowerCase())) ||
          (refSlug && knownIdsAndSlugs.has(refSlug.toLowerCase()));

        if (!isKnown) {
          matches.push({
            sourceType: 'guide',
            sourceIdOrSlug: g.slug,
            sourceName: g.title,
            referencedBreweryRef: refSlug || refId || 'unknown',
            locationDetails: `Recommended stop #${idx + 1} in travel guide "${g.title}"`,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Performs a dataset-wide production data quality audit on raw or typed brewery records, trails, and guides.
 */
export function auditBreweryDataset(
  rawDataset: unknown[],
  targetDate: Date = new Date(),
  trails: BeerTrail[] = [],
  guides: TravelGuide[] = []
): DatasetAuditReport {
  const totalRecords = rawDataset.length;
  const invalidRecords: Array<{ id?: string; name?: string; error: string }> = [];
  const validBreweries: Brewery[] = [];

  // 1. Schema Validation Phase
  for (const item of rawDataset) {
    const result = safeValidateBrewery(item);
    if (result.success) {
      validBreweries.push(result.data);
    } else {
      const record = item as Record<string, unknown>;
      invalidRecords.push({
        id: typeof record?.id === 'string' ? record.id : undefined,
        name: typeof record?.name === 'string' ? record.name : undefined,
        error: result.formattedError,
      });
    }
  }

  // 2. Duplicates Detection
  const duplicates = findDuplicateBreweries(validBreweries);
  const closeCoordinates = findCloseDuplicateCoordinates(validBreweries, 50);

  // 3. Coordinates Validation
  const invalidCoordinates = checkBreweryCoordinates(validBreweries);
  const outOfBoundsBreweries = invalidCoordinates
    .filter((c) => c.reason === 'out_of_maryland_bounds' && c.coordinates)
    .map((c) => ({
      id: c.breweryId,
      name: c.breweryName,
      lat: c.coordinates!.lat,
      lng: c.coordinates!.lng,
    }));

  // 4. Hours Validation
  const invalidHours = checkBreweryHoursValidity(validBreweries);

  // 5. Contact Info & Media Validation
  const missingContactAndMedia = checkBreweryContactAndMedia(validBreweries);

  // 6. Verification Freshness Audit
  const verificationIssues = auditVerificationFreshness(validBreweries, targetDate);

  // 7. Closed / Inactive Identification
  const closedOrInactiveBreweries = identifyClosedOrInactiveBreweries(validBreweries);

  // 8. Record Completeness Scoring
  const incompleteRecords: IncompleteRecordInfo[] = [];
  let totalScoreSum = 0;

  for (const b of validBreweries) {
    const report = checkRecordCompleteness(b, targetDate);
    totalScoreSum += report.score;
    if (!report.isComplete || report.score < 80) {
      incompleteRecords.push({ brewery: b, report });
    }
  }

  // 9. Reference Integrity Audit
  const brokenReferences = checkReferenceIntegrity(validBreweries, trails, guides);

  const averageCompletenessScore = validBreweries.length > 0
    ? Math.round((totalScoreSum / validBreweries.length) * 10) / 10
    : 0;

  return {
    targetDate: targetDate.toISOString().split('T')[0],
    totalRecords,
    validRecordsCount: validBreweries.length,
    invalidRecordsCount: invalidRecords.length,
    invalidRecords,
    duplicates,
    closeCoordinates,
    invalidCoordinates,
    invalidHours,
    missingContactAndMedia,
    verificationIssues,
    closedOrInactiveCount: closedOrInactiveBreweries.length,
    closedOrInactiveBreweries,
    incompleteRecordsCount: incompleteRecords.length,
    incompleteRecords,
    brokenReferences,
    outOfBoundsCoordinatesCount: outOfBoundsBreweries.length,
    outOfBoundsBreweries,
    averageCompletenessScore,
  };
}
