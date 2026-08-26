import { describe, it, expect } from 'vitest';
import { filterBreweries } from '../filter-breweries';
import { Brewery } from '../../types';

const sampleBreweries: Brewery[] = [
  {
    id: '1',
    slug: 'flying-dog-brewery',
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
    coordinates: { lat: 39.3821, lng: -77.4045 },
    description: 'Iconic Frederick craft brewery producing bold IPAs.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Monday', hours: '12 PM - 8 PM' }],
    structuredHours: [
      { day: 'Monday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] }
    ],
    beerStyles: ['IPA', 'Stout', 'Porter'],
    amenities: ['Dog Friendly', 'Outdoor Seating', 'Food Truck'],
    featured: true,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '2',
    slug: 'heavy-seas-beer',
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
    coordinates: { lat: 39.2272, lng: -76.6669 },
    description: 'Production facility in Halethorpe specializing in Loose Cannon IPA.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Friday', hours: '4 PM - 9 PM' }],
    structuredHours: [
      { day: 'Friday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] }
    ],
    beerStyles: ['IPA', 'Amber Ale'],
    amenities: ['Tours', 'Outdoor Seating'],
    featured: false,
    lastVerified: '2026-07-25',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '3',
    slug: 'brewpub-station',
    name: 'Station Brewpub',
    type: 'Brewpub',
    region: 'Central',
    status: 'Temporarily closed',
    address: '100 North Charles St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-9999',
    website: 'https://stationbrewpub.com',
    socialLinks: {},
    coordinates: { lat: 39.2904, lng: -76.6122 },
    description: 'Downtown Baltimore brewpub undergoing taproom renovations.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Pilsner', 'Lager'],
    amenities: ['Food Served', 'Dog Friendly'],
    featured: false,
    lastVerified: '2026-06-10',
    verificationSource: 'Community Report',
    verificationStatus: 'Needs Review',
  },
  {
    id: '4',
    slug: 'closed-craft-co',
    name: 'Old Craft Co',
    type: 'Farm Brewery',
    region: 'Southern',
    status: 'Permanently closed',
    address: '500 Farm Rd',
    city: 'Annapolis',
    county: 'Anne Arundel',
    state: 'MD',
    zipCode: '21401',
    phone: '410-555-1111',
    website: 'https://oldcraftco.com',
    socialLinks: {},
    coordinates: { lat: 38.9784, lng: -76.4922 },
    description: 'Former farm brewery permanently closed.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Farmhouse Ale', 'Saison'],
    amenities: [],
    featured: false,
    lastVerified: '2025-12-01',
    verificationSource: 'Direct Communication',
    verificationStatus: 'Verified',
  },
  {
    id: '5',
    slug: 'unlisted-hours-brewery',
    name: 'Mystery Brews',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    status: 'Open',
    address: '10 Ocean Hwy',
    city: 'Ocean City',
    county: 'Worcester',
    state: 'MD',
    zipCode: '21842',
    phone: '410-555-2222',
    website: 'https://mysterybrews.com',
    socialLinks: {},
    coordinates: { lat: 38.3365, lng: -75.0849 },
    description: 'Ocean City spot open for pop-ups with unlisted structured hours.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Saturday', hours: 'Call for hours' }],
    structuredHours: [],
    beerStyles: ['Gose', 'Sour'],
    amenities: ['Dog Friendly'],
    featured: false,
    lastVerified: '2026-07-01',
    verificationSource: 'Social Media',
    verificationStatus: 'Verified',
  },
];

describe('filterBreweries', () => {
  it('returns all breweries when filters are empty', () => {
    const result = filterBreweries(sampleBreweries, {});
    expect(result).toHaveLength(5);
  });

  it('filters by search query (name, city, description, beer styles)', () => {
    // Search by name
    expect(filterBreweries(sampleBreweries, { search: 'Flying' })).toHaveLength(1);
    // Search by city
    expect(filterBreweries(sampleBreweries, { search: 'Halethorpe' })).toHaveLength(1);
    // Search by description
    expect(filterBreweries(sampleBreweries, { search: 'Loose Cannon' })).toHaveLength(1);
    // Search by beer style
    expect(filterBreweries(sampleBreweries, { search: 'Pilsner' })).toHaveLength(1);
  });

  it('filters by region', () => {
    const result = filterBreweries(sampleBreweries, { region: 'Western' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Flying Dog Brewery');
  });

  it('filters by county', () => {
    const result = filterBreweries(sampleBreweries, { county: 'Baltimore County' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Heavy Seas Beer');
  });

  it('filters by brewery type', () => {
    const result = filterBreweries(sampleBreweries, { type: 'Brewpub' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Station Brewpub');
  });

  it('filters by operational status (canonical OperationalCategory)', () => {
    // Open with hours
    const openBreweries = filterBreweries(sampleBreweries, { status: 'open' });
    expect(openBreweries.map((b) => b.name)).toEqual(['Flying Dog Brewery', 'Heavy Seas Beer']);

    // Temporarily closed
    const tempClosed = filterBreweries(sampleBreweries, { status: 'temporarily_closed' });
    expect(tempClosed.map((b) => b.name)).toEqual(['Station Brewpub']);

    // Permanently closed
    const permClosed = filterBreweries(sampleBreweries, { status: 'permanently_closed' });
    expect(permClosed.map((b) => b.name)).toEqual(['Old Craft Co']);

    // Hours unavailable
    const hoursUnavail = filterBreweries(sampleBreweries, { status: 'hours_unavailable' });
    expect(hoursUnavail.map((b) => b.name)).toEqual(['Mystery Brews']);
  });

  it('filters by amenity', () => {
    const result = filterBreweries(sampleBreweries, { amenity: 'Dog Friendly' });
    expect(result).toHaveLength(3);
    expect(result.map((b) => b.name)).toContain('Flying Dog Brewery');
    expect(result.map((b) => b.name)).toContain('Station Brewpub');
    expect(result.map((b) => b.name)).toContain('Mystery Brews');
  });

  it('filters by multiple amenities', () => {
    const result = filterBreweries(sampleBreweries, { amenities: ['Dog Friendly', 'Outdoor Seating'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Flying Dog Brewery');
  });

  it('combines multiple filter parameters correctly', () => {
    const result = filterBreweries(sampleBreweries, {
      region: 'Western',
      type: 'Microbrewery',
      status: 'open',
      amenity: 'Dog Friendly',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Flying Dog Brewery');
  });
});
