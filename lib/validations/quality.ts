import { Brewery } from '../types';
import {
  safeValidateBrewery,
  isWithinMarylandBounds,
  normalizeStreetAddress,
} from './schemas';

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

export interface DatasetAuditReport {
  totalRecords: number;
  validRecordsCount: number;
  invalidRecordsCount: number;
  invalidRecords: Array<{ id?: string; name?: string; error: string }>;
  duplicates: DuplicateMatch[];
  closedOrInactiveCount: number;
  closedOrInactiveBreweries: ClosedOrInactiveBreweryInfo[];
  incompleteRecordsCount: number;
  incompleteRecords: IncompleteRecordInfo[];
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
 * Performs a dataset-wide production data quality audit on an array of raw or typed brewery records.
 */
export function auditBreweryDataset(rawDataset: unknown[], targetDate: Date = new Date()): DatasetAuditReport {
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

  // 2. Duplicate Detection
  const duplicates = findDuplicateBreweries(validBreweries);

  // 3. Closed / Inactive Identification
  const closedOrInactiveBreweries = identifyClosedOrInactiveBreweries(validBreweries);

  // 4. Coordinates Bounds Check
  const outOfBoundsBreweries: Array<{ id: string; name: string; lat: number; lng: number }> = [];
  for (const b of validBreweries) {
    if (b.coordinates && !isWithinMarylandBounds(b.coordinates)) {
      outOfBoundsBreweries.push({
        id: b.id,
        name: b.name,
        lat: b.coordinates.lat,
        lng: b.coordinates.lng,
      });
    }
  }

  // 5. Record Completeness Scoring
  const incompleteRecords: IncompleteRecordInfo[] = [];
  let totalScoreSum = 0;

  for (const b of validBreweries) {
    const report = checkRecordCompleteness(b, targetDate);
    totalScoreSum += report.score;
    if (!report.isComplete || report.score < 80) {
      incompleteRecords.push({ brewery: b, report });
    }
  }

  const averageCompletenessScore = validBreweries.length > 0
    ? Math.round((totalScoreSum / validBreweries.length) * 10) / 10
    : 0;

  return {
    totalRecords,
    validRecordsCount: validBreweries.length,
    invalidRecordsCount: invalidRecords.length,
    invalidRecords,
    duplicates,
    closedOrInactiveCount: closedOrInactiveBreweries.length,
    closedOrInactiveBreweries,
    incompleteRecordsCount: incompleteRecords.length,
    incompleteRecords,
    outOfBoundsCoordinatesCount: outOfBoundsBreweries.length,
    outOfBoundsBreweries,
    averageCompletenessScore,
  };
}
