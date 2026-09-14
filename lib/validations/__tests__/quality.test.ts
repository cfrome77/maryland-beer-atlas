import { describe, it, expect } from 'vitest';
import { mockBreweries, mockTrails, mockGuides } from '../../data/mock-data';
import { Brewery, BeerTrail, TravelGuide } from '../../types';
import {
  normalizeAndValidateBrewery,
  normalizeStreetAddress,
  normalizePhone,
  normalizeUrl,
  isWithinMarylandBounds,
  safeValidateBrewery,
} from '../schemas';
import {
  findDuplicateBreweries,
  findCloseDuplicateCoordinates,
  checkBreweryCoordinates,
  checkBreweryHoursValidity,
  checkBreweryContactAndMedia,
  auditVerificationFreshness,
  identifyClosedOrInactiveBreweries,
  checkRecordCompleteness,
  identifyIncompleteRecords,
  checkReferenceIntegrity,
  auditBreweryDataset,
  calculateHaversineDistanceMeters,
} from '../quality';

describe('Brewery Data Quality Standards', () => {
  describe('Format Validation & Schemas', () => {
    it('rejects invalid slug formats with uppercase letters or underscores', () => {
      const badSlugBrewery = {
        ...mockBreweries[0],
        slug: 'Flying_Dog_Brewery!',
      };

      const result = safeValidateBrewery(badSlugBrewery);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.formattedError).toContain('slug');
      }
    });

    it('validates 10-digit US phone numbers and rejects invalid phone formats', () => {
      const validPhoneBrewery = {
        ...mockBreweries[0],
        phone: '301-694-7899',
      };
      expect(safeValidateBrewery(validPhoneBrewery).success).toBe(true);

      const badPhoneBrewery = {
        ...mockBreweries[0],
        phone: '123-ABC-4567',
      };
      expect(safeValidateBrewery(badPhoneBrewery).success).toBe(false);
    });

    it('validates 5-digit and 9-digit ZIP codes and rejects invalid ZIP codes', () => {
      const valid9Zip = {
        ...mockBreweries[0],
        zipCode: '21703-1234',
      };
      expect(safeValidateBrewery(valid9Zip).success).toBe(true);

      const badZip = {
        ...mockBreweries[0],
        zipCode: '2170',
      };
      expect(safeValidateBrewery(badZip).success).toBe(false);
    });

    it('validates HTTP and HTTPS URLs for websites and images', () => {
      const badUrlBrewery = {
        ...mockBreweries[0],
        website: 'ftp://flyingdog.com',
      };
      expect(safeValidateBrewery(badUrlBrewery).success).toBe(false);
    });

    it('rejects invalid date formats not matching YYYY-MM-DD', () => {
      const badDateBrewery = {
        ...mockBreweries[0],
        lastVerified: '05/10/2025',
      };
      expect(safeValidateBrewery(badDateBrewery).success).toBe(false);
    });

    it('validates 24-hour time formats in structured hours', () => {
      const badTimeBrewery = {
        ...mockBreweries[0],
        structuredHours: [
          {
            day: 'Friday',
            isClosed: false,
            periods: [{ opens: '12:00 PM', closes: '10:00 PM' }], // Should be "12:00" and "22:00"
          },
        ],
      };
      expect(safeValidateBrewery(badTimeBrewery).success).toBe(false);
    });
  });

  describe('Data Normalization Helpers', () => {
    it('normalizes street address suffix abbreviations and directional indicators', () => {
      expect(normalizeStreetAddress('4607 Wedgewood Boulevard North')).toBe('4607 Wedgewood Blvd N');
      expect(normalizeStreetAddress('1783 St. Market Street East')).toBe('1783 St. Market St E');
      expect(normalizeStreetAddress('100 Main Avenue South')).toBe('100 Main Ave S');
    });

    it('normalizes raw phone numbers into canonical XXX-XXX-XXXX format', () => {
      expect(normalizePhone('3016947899')).toBe('301-694-7899');
      expect(normalizePhone('(301) 694-7899')).toBe('301-694-7899');
      expect(normalizePhone('13016947899')).toBe('301-694-7899');
    });

    it('auto-prefixes missing HTTP/HTTPS protocols on URLs during normalization', () => {
      expect(normalizeUrl('www.flyingdogbrewery.com')).toBe('https://www.flyingdogbrewery.com');
      expect(normalizeUrl('http://flyingdogbrewery.com')).toBe('http://flyingdogbrewery.com');
      expect(normalizeUrl('')).toBe('');
    });

    it('normalizes a complete unformatted raw brewery payload', () => {
      const raw = {
        ...mockBreweries[0],
        name: '   Flying   Dog Brewery  ',
        address: '4607   Wedgewood Boulevard ',
        city: ' Frederick ',
        state: ' maryland ',
        zipCode: 21703,
        phone: '3016947899',
        website: 'www.flyingdogbrewery.com',
      };

      const normalized = normalizeAndValidateBrewery(raw);
      expect(normalized.name).toBe('Flying Dog Brewery');
      expect(normalized.address).toBe('4607 Wedgewood Blvd');
      expect(normalized.city).toBe('Frederick');
      expect(normalized.state).toBe('MD');
      expect(normalized.zipCode).toBe('21703');
      expect(normalized.phone).toBe('301-694-7899');
      expect(normalized.website).toBe('https://www.flyingdogbrewery.com');
    });
  });

  describe('Geographic Coordinate Validation', () => {
    it('correctly calculates Haversine distance between two coordinates', () => {
      const distance = calculateHaversineDistanceMeters(39.3621, -77.4245, 39.3621, -77.4246);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20);
    });

    it('correctly identifies coordinates within Maryland bounds', () => {
      const frederickCoords = { lat: 39.3621, lng: -77.4245 }; // Flying Dog
      expect(isWithinMarylandBounds(frederickCoords)).toBe(true);
    });

    it('identifies coordinates outside Maryland state boundaries', () => {
      const farCoords = { lat: 40.7128, lng: -74.006 }; // New York City
      expect(isWithinMarylandBounds(farCoords)).toBe(false);
    });

    it('identifies missing, non-numeric, or out of bounds coordinates using checkBreweryCoordinates', () => {
      const testSet: Brewery[] = [
        { ...mockBreweries[0], id: 'b1', coordinates: { lat: 39.3621, lng: -77.4245 } }, // valid
        { ...mockBreweries[0], id: 'b2', coordinates: { lat: NaN, lng: -77.4245 } }, // NaN
        { ...mockBreweries[0], id: 'b3', coordinates: { lat: 41.5, lng: -74.0 } }, // out of bounds
      ];

      const coordIssues = checkBreweryCoordinates(testSet);
      expect(coordIssues.length).toBe(2);
      expect(coordIssues.find((c) => c.breweryId === 'b2')?.reason).toBe('non_numeric_coordinates');
      expect(coordIssues.find((c) => c.breweryId === 'b3')?.reason).toBe('out_of_maryland_bounds');
    });

    it('finds close duplicate coordinates within threshold meters', () => {
      const b1 = { ...mockBreweries[0], id: 'b1', name: 'Site A', coordinates: { lat: 39.3621, lng: -77.4245 } };
      const b2 = {
        ...mockBreweries[0],
        id: 'b2',
        name: 'Site B',
        coordinates: { lat: 39.3621, lng: -77.4245 + 0.0001 }, // ~8m away
      };

      const closeMatches = findCloseDuplicateCoordinates([b1, b2], 50);
      expect(closeMatches.length).toBe(1);
      expect(closeMatches[0].distanceMeters).toBeLessThan(50);
    });
  });

  describe('Hours & Contact / Media Auditing', () => {
    it('audits missing or invalid hours', () => {
      const bMissing: Brewery = { ...mockBreweries[0], id: 'b-no-hours', structuredHours: null, hours: [] };
      const reports = checkBreweryHoursValidity([bMissing]);
      expect(reports.length).toBe(1);
      expect(reports[0].issueType).toBe('missing_all_hours');
    });

    it('audits missing contact details and image media', () => {
      const bIncompleteMedia: Brewery = {
        ...mockBreweries[0],
        id: 'b-media',
        website: '',
        phone: '',
        image: '',
        socialLinks: {},
      };

      const reports = checkBreweryContactAndMedia([bIncompleteMedia]);
      expect(reports.length).toBe(1);
      expect(reports[0].missingWebsite).toBe(true);
      expect(reports[0].missingPhone).toBe(true);
      expect(reports[0].missingImage).toBe(true);
      expect(reports[0].missingSocialLinks).toBe(true);
    });

    it('audits verification freshness thresholds', () => {
      const bStale: Brewery = {
        ...mockBreweries[0],
        id: 'b-stale',
        lastVerified: '2024-01-01', // old
      };

      const reports = auditVerificationFreshness([bStale], new Date('2025-06-01'));
      expect(reports.length).toBe(1);
      expect(reports[0].freshnessCategory).toBe('outdated');
    });
  });

  describe('Duplicate Brewery Detection', () => {
    it('detects duplicate breweries with identical ID or slug', () => {
      const b1 = { ...mockBreweries[0] };
      const b2 = { ...mockBreweries[0], id: 'flying-dog-dup' }; // Same slug 'flying-dog-brewery'

      const duplicates = findDuplicateBreweries([b1, b2]);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchReason).toBe('matching_slug_or_id');
    });

    it('detects duplicate breweries with matching normalized name and city', () => {
      const b1 = { ...mockBreweries[0], id: 'b1', slug: 'b1-slug' };
      const b2 = {
        ...mockBreweries[0],
        id: 'b2',
        slug: 'b2-slug',
        name: 'Flying Dog Brewery!', // Slight punctuation difference
        city: 'Frederick',
      };

      const duplicates = findDuplicateBreweries([b1, b2]);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchReason).toBe('matching_name_and_city');
    });

    it('detects duplicate breweries with matching street address and zip code', () => {
      const b1 = { ...mockBreweries[0], id: 'b1', slug: 'b1-slug', name: 'Taproom A' };
      const b2 = {
        ...mockBreweries[0],
        id: 'b2',
        slug: 'b2-slug',
        name: 'Taproom B',
        address: '4607 Wedgewood Boulevard', // Equivalent normalized address
        zipCode: '21703',
      };

      const duplicates = findDuplicateBreweries([b1, b2]);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchReason).toBe('matching_street_address');
    });
  });

  describe('Closed & Inactive Brewery Identification', () => {
    it('identifies permanently closed, temporarily closed, and relocating breweries', () => {
      const dataset: Brewery[] = [
        { ...mockBreweries[0], id: 'b1', slug: 'b1', status: 'Open' },
        { ...mockBreweries[1], id: 'b2', slug: 'b2', status: 'Permanently closed' },
        { ...mockBreweries[2], id: 'b3', slug: 'b3', status: 'Temporarily closed' },
        { ...mockBreweries[3], id: 'b4', slug: 'b4', status: 'Relocating' },
      ];

      const closedOrInactive = identifyClosedOrInactiveBreweries(dataset);
      expect(closedOrInactive.length).toBe(3);
      expect(closedOrInactive.map((c) => c.category)).toEqual([
        'permanently_closed',
        'temporarily_closed',
        'relocating',
      ]);
    });
  });

  describe('Record Completeness & Reference Integrity', () => {
    it('scores incomplete records lower and identifies incomplete records using identifyIncompleteRecords', () => {
      const incompleteBrewery: Brewery = {
        ...mockBreweries[0],
        phone: '',
        website: '',
        structuredHours: null,
        description: 'Short',
        image: '',
      };

      const report = checkRecordCompleteness(incompleteBrewery, new Date('2025-06-01'));
      expect(report.score).toBeLessThan(80);
      expect(report.isComplete).toBe(false);
      expect(report.missingFields).toContain('website');
      expect(report.missingFields).toContain('image');

      const incompleteList = identifyIncompleteRecords([mockBreweries[0], incompleteBrewery], 80, new Date('2025-06-01'));
      expect(incompleteList.length).toBe(1);
      expect(incompleteList[0].brewery.id).toBe(incompleteBrewery.id);
    });

    it('flags broken trail and guide brewery references', () => {
      const sampleBreweries = [mockBreweries[0]]; // Flying Dog only

      const brokenTrail: BeerTrail = {
        ...mockTrails[0],
        id: 'trail-1',
        name: 'Broken Trail',
        stops: [
          {
            order: 1,
            brewery: { id: 'non-existent-brewery-id', slug: 'non-existent-slug' } as Brewery,
            isOptional: false,
          },
        ],
      };

      const brokenGuide: TravelGuide = {
        ...mockGuides[0],
        slug: 'guide-1',
        title: 'Broken Guide',
        recommendedStops: [{ id: 'missing-brewery-id', slug: 'missing-slug' } as Brewery],
      };

      const brokenRefs = checkReferenceIntegrity(sampleBreweries, [brokenTrail], [brokenGuide]);
      expect(brokenRefs.length).toBe(2);
      expect(brokenRefs[0].sourceType).toBe('trail');
      expect(brokenRefs[1].sourceType).toBe('guide');
    });

    it('performs a complete dataset audit using auditBreweryDataset', () => {
      const sampleDataset = [
        ...mockBreweries,
        // Add an invalid record
        { id: 'invalid-1', name: 'Bad Record' },
        // Add an out of state record
        {
          ...mockBreweries[0],
          id: 'ny-brewery',
          slug: 'ny-brewery',
          name: 'NYC Brewery',
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
      ];

      const audit = auditBreweryDataset(sampleDataset, new Date('2025-06-01'), mockTrails, mockGuides);
      expect(audit.totalRecords).toBe(sampleDataset.length);
      expect(audit.invalidRecordsCount).toBe(1);
      expect(audit.validRecordsCount).toBe(mockBreweries.length + 1);
      expect(audit.outOfBoundsCoordinatesCount).toBe(1);
      expect(audit.outOfBoundsBreweries[0].id).toBe('ny-brewery');
      expect(audit.averageCompletenessScore).toBeGreaterThan(70);
    });
  });
});
