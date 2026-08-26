import { describe, it, expect } from 'vitest';
import { mockBreweries } from '../../data/mock-data';
import { Brewery } from '../../types';
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
  identifyClosedOrInactiveBreweries,
  checkRecordCompleteness,
  identifyIncompleteRecords,
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

    it('detects duplicate breweries in close geographic proximity (< 50 meters)', () => {
      const b1 = { ...mockBreweries[0], id: 'b1', slug: 'b1-slug', name: 'Site A' };
      const b2 = {
        ...mockBreweries[0],
        id: 'b2',
        slug: 'b2-slug',
        name: 'Site B',
        address: '100 Unique Street',
        city: 'Gaithersburg',
        coordinates: {
          lat: 39.3621,
          lng: -77.4245 + 0.0001, // ~8 meters away
        },
      };

      const duplicates = findDuplicateBreweries([b1, b2]);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].matchReason).toBe('geographic_proximity');
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

  describe('Record Completeness & Audit', () => {
    it('scores complete brewery records highly (>= 80)', () => {
      const completeBrewery = mockBreweries[0];
      const report = checkRecordCompleteness(completeBrewery, new Date('2025-06-01'));
      expect(report.score).toBeGreaterThanOrEqual(80);
      expect(report.isComplete).toBe(true);
      expect(report.missingFields).toHaveLength(0);
    });

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

      const audit = auditBreweryDataset(sampleDataset, new Date('2025-06-01'));
      expect(audit.totalRecords).toBe(sampleDataset.length);
      expect(audit.invalidRecordsCount).toBe(1);
      expect(audit.validRecordsCount).toBe(mockBreweries.length + 1);
      expect(audit.outOfBoundsCoordinatesCount).toBe(1);
      expect(audit.outOfBoundsBreweries[0].id).toBe('ny-brewery');
      expect(audit.averageCompletenessScore).toBeGreaterThan(70);
    });
  });
});
