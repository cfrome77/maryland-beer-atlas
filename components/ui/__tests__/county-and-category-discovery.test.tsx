import { describe, it, expect } from 'vitest';
import { slugifyCounty } from '@/app/breweries/county/[slug]/page';
import { CATEGORY_MAP } from '@/app/breweries/category/[slug]/page';
import { Brewery } from '@/lib/types';

const sampleBreweries: Brewery[] = [
  {
    id: '1',
    slug: 'flying-dog',
    name: 'Flying Dog Brewery',
    type: 'Microbrewery',
    region: 'Western',
    status: 'Open',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://flyingdogbrewery.com',
    socialLinks: {},
    coordinates: { lat: 39.3623, lng: -77.4262 },
    description: 'Iconic Frederick microbrewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['IPA'],
    amenities: ['Dog Friendly', 'Outdoor Seating'],
    featured: true,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '2',
    slug: 'franklins',
    name: "Franklin's General Store & Brewery",
    type: 'Brewpub',
    region: 'Capital',
    status: 'Open',
    address: '5123 Baltimore Ave',
    city: 'Hyattsville',
    county: "Prince George's",
    state: 'MD',
    zipCode: '20781',
    phone: '301-927-2740',
    website: 'https://franklinsbrewery.com',
    socialLinks: {},
    coordinates: { lat: 38.9553, lng: -76.9402 },
    description: 'Hyattsville brewpub.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Stout'],
    amenities: ['Food Menu'],
    featured: false,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '3',
    slug: 'elder-pine',
    name: 'Elder Pine Brewing & Blending',
    type: 'Farm Brewery',
    region: 'Capital',
    status: 'Open',
    address: '4200 Sundown Rd',
    city: 'Gaithersburg',
    county: 'Montgomery',
    state: 'MD',
    zipCode: '20882',
    phone: '301-555-0199',
    website: 'https://elderpine.com',
    socialLinks: {},
    coordinates: { lat: 39.2312, lng: -77.0987 },
    description: 'Scenic farm brewery in Montgomery County.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Lager', 'Wild Ale'],
    amenities: ['Dog Friendly', 'Outdoor Seating'],
    featured: true,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '4',
    slug: 'heavy-seas',
    name: 'Heavy Seas Beer',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    county: 'Baltimore County',
    state: 'MD',
    zipCode: '21227',
    phone: '410-247-7822',
    website: 'https://hsbeer.com',
    socialLinks: {},
    coordinates: { lat: 39.2274, lng: -76.6669 },
    description: 'Large scale production brewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['IPA', 'Amber Ale'],
    amenities: ['Tasting Room'],
    featured: false,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
];

describe('County and Category Discovery Logic', () => {
  describe('slugifyCounty', () => {
    it('converts county names into standardized URL slugs', () => {
      expect(slugifyCounty("Prince George's")).toBe('prince-georges');
      expect(slugifyCounty('Baltimore City')).toBe('baltimore-city');
      expect(slugifyCounty('Baltimore County')).toBe('baltimore-county');
      expect(slugifyCounty('Anne Arundel')).toBe('anne-arundel');
      expect(slugifyCounty('Frederick')).toBe('frederick');
    });
  });

  describe('CATEGORY_MAP Filter Logic', () => {
    it('filters dog-friendly breweries accurately', () => {
      const dogFriendlyDef = CATEGORY_MAP['dog-friendly'];
      expect(dogFriendlyDef).toBeDefined();

      const matched = sampleBreweries.filter(dogFriendlyDef.filterFn);
      expect(matched.map((b) => b.slug)).toEqual(['flying-dog', 'elder-pine']);
    });

    it('filters brewpubs accurately', () => {
      const brewpubDef = CATEGORY_MAP['brewpub'];
      expect(brewpubDef).toBeDefined();

      const matched = sampleBreweries.filter(brewpubDef.filterFn);
      expect(matched.map((b) => b.slug)).toEqual(['franklins']);
    });

    it('filters farm breweries accurately', () => {
      const farmDef = CATEGORY_MAP['farm-brewery'];
      expect(farmDef).toBeDefined();

      const matched = sampleBreweries.filter(farmDef.filterFn);
      expect(matched.map((b) => b.slug)).toEqual(['elder-pine']);
    });

    it('filters production breweries accurately', () => {
      const prodDef = CATEGORY_MAP['production'];
      expect(prodDef).toBeDefined();

      const matched = sampleBreweries.filter(prodDef.filterFn);
      expect(matched.map((b) => b.slug)).toEqual(['heavy-seas']);
    });

    it('filters microbreweries accurately', () => {
      const microDef = CATEGORY_MAP['microbrewery'];
      expect(microDef).toBeDefined();

      const matched = sampleBreweries.filter(microDef.filterFn);
      expect(matched.map((b) => b.slug)).toEqual(['flying-dog']);
    });
  });
});
