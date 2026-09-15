import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  getCoordinatesForPostalCode,
  filterBreweriesByPostalCode,
  filterBreweriesByRegion,
  sortBreweriesByProximity,
  sortBreweriesByPostalCode,
} from '../geocoding';
import { Brewery } from '../../types';

const sampleBreweries: Brewery[] = [
  {
    id: 'flying-dog',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick County',
    state: 'MD',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://www.flyingdogbrewery.com',
    socialLinks: {},
    coordinates: { lat: 39.3621, lng: -77.4245 },
    hours: [],
    beerStyles: ['IPA'],
    amenities: ['Tasting Room'],
    featured: true,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    description: 'Frederick brewery',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  },
  {
    id: 'monocacy',
    slug: 'monocacy-brewing-company',
    name: 'Monocacy Brewing Company',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    address: '1783 N Market St',
    city: 'Frederick',
    county: 'Frederick County',
    state: 'MD',
    zipCode: '21701',
    phone: '240-457-4232',
    website: 'https://monocacybrewing.com',
    socialLinks: {},
    coordinates: { lat: 39.4292, lng: -77.4045 },
    hours: [],
    beerStyles: ['Pilsner'],
    amenities: ['Tasting Room'],
    featured: false,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    description: 'Frederick downtown brewery',
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d',
  },
  {
    id: 'burley-oak',
    slug: 'burley-oak-brewing-company',
    name: 'Burley Oak Brewing Company',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    status: 'Open',
    address: '10016 Old Ocean City Blvd',
    city: 'Berlin',
    county: 'Worcester County',
    state: 'MD',
    zipCode: '21811',
    phone: '410-641-2622',
    website: 'https://burleyoak.com',
    socialLinks: {},
    coordinates: { lat: 38.3228, lng: -75.2215 },
    hours: [],
    beerStyles: ['Sour'],
    amenities: ['Live Music'],
    featured: true,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    description: 'Berlin brewery',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  },
];

describe('Geocoding & Geospatial Utility Helpers', () => {
  describe('calculateHaversineDistance', () => {
    it('calculates distance in miles correctly between valid coordinates', () => {
      // Frederick (Flying Dog) to Berlin (Burley Oak) is ~139 miles
      const distance = calculateHaversineDistance(39.3621, -77.4245, 38.3228, -75.2215, 'miles');
      expect(distance).toBeGreaterThan(130);
      expect(distance).toBeLessThan(150);
    });

    it('calculates distance in km correctly', () => {
      const distance = calculateHaversineDistance(39.3621, -77.4245, 38.3228, -75.2215, 'km');
      expect(distance).toBeGreaterThan(210);
      expect(distance).toBeLessThan(240);
    });

    it('returns Infinity when given invalid coordinate numbers', () => {
      expect(calculateHaversineDistance(NaN, -77.4245, 38.3228, -75.2215)).toBe(Infinity);
    });
  });

  describe('getCoordinatesForPostalCode', () => {
    it('returns exact center coordinates for known 5-digit MD ZIP codes', () => {
      const coords = getCoordinatesForPostalCode('21703');
      expect(coords).toEqual({ lat: 39.3621, lng: -77.4245 });
    });

    it('returns fallback prefix coordinates for known 3-digit MD ZIP prefixes', () => {
      const coords = getCoordinatesForPostalCode('21799'); // Not exact 5-digit, falls back to '217'
      expect(coords).toEqual({ lat: 39.5000, lng: -77.4000 });
    });

    it('returns null for empty or unknown postal codes', () => {
      expect(getCoordinatesForPostalCode('')).toBeNull();
      expect(getCoordinatesForPostalCode('99999')).toBeNull();
    });
  });

  describe('filterBreweriesByPostalCode', () => {
    it('filters breweries by exact 5-digit postal code', () => {
      const filtered = filterBreweriesByPostalCode(sampleBreweries, '21703');
      expect(filtered.map((b) => b.name)).toEqual(['Flying Dog Brewery']);
    });

    it('filters breweries by 3-digit prefix when prefixMatch is enabled', () => {
      const filtered = filterBreweriesByPostalCode(sampleBreweries, '217', true);
      expect(filtered.map((b) => b.name)).toEqual(['Flying Dog Brewery', 'Monocacy Brewing Company']);
    });
  });

  describe('filterBreweriesByRegion', () => {
    it('filters breweries by region name', () => {
      const filtered = filterBreweriesByRegion(sampleBreweries, 'Eastern Shore');
      expect(filtered.map((b) => b.name)).toEqual(['Burley Oak Brewing Company']);
    });
  });

  describe('sortBreweriesByProximity', () => {
    it('sorts breweries by distance ascending from target location', () => {
      // Near Frederick Downtown (39.42, -77.40) -> Monocacy should be closest, then Flying Dog, then Burley Oak
      const sorted = sortBreweriesByProximity(sampleBreweries, { lat: 39.42, lng: -77.40 });
      expect(sorted.map((b) => b.id)).toEqual(['monocacy', 'flying-dog', 'burley-oak']);
    });
  });

  describe('sortBreweriesByPostalCode', () => {
    it('sorts breweries by ZIP code ascending', () => {
      const sorted = sortBreweriesByPostalCode(sampleBreweries, true);
      expect(sorted.map((b) => b.zipCode)).toEqual(['21701', '21703', '21811']);
    });

    it('sorts breweries by ZIP code descending', () => {
      const sorted = sortBreweriesByPostalCode(sampleBreweries, false);
      expect(sorted.map((b) => b.zipCode)).toEqual(['21811', '21703', '21701']);
    });
  });
});
