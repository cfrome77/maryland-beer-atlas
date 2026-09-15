import { describe, it, expect } from 'vitest';
import { clusterBreweries } from '../map-view';
import { Brewery } from '@/lib/types';

const testBreweries: Brewery[] = [
  {
    id: 'b1',
    slug: 'brewery-1',
    name: 'Brewery One',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    address: '100 Main St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-0001',
    website: 'https://b1.com',
    socialLinks: {},
    coordinates: { lat: 39.2900, lng: -76.6100 },
    description: 'Test brewery 1',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['IPA'],
    amenities: [],
    featured: false,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: 'b2',
    slug: 'brewery-2',
    name: 'Brewery Two',
    type: 'Brewpub',
    region: 'Central',
    status: 'Open',
    address: '102 Main St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-0002',
    website: 'https://b2.com',
    socialLinks: {},
    coordinates: { lat: 39.2905, lng: -76.6105 }, // Very close to b1
    description: 'Test brewery 2',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Stout'],
    amenities: [],
    featured: false,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: 'b3',
    slug: 'brewery-3',
    name: 'Brewery Three',
    type: 'Production',
    region: 'Western',
    status: 'Open',
    address: '100 Hill Rd',
    city: 'Cumberland',
    county: 'Allegany',
    state: 'MD',
    zipCode: '21502',
    phone: '301-555-0003',
    website: 'https://b3.com',
    socialLinks: {},
    coordinates: { lat: 39.6500, lng: -78.7600 }, // Far away in Cumberland
    description: 'Test brewery 3',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Lager'],
    amenities: [],
    featured: false,
    lastVerified: '2025-05-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
];

describe('clusterBreweries function', () => {
  it('clusters close breweries at zoom 7.5', () => {
    const clusters = clusterBreweries(testBreweries, 7.5);
    expect(clusters.length).toBe(2);

    const clusterOne = clusters.find((c) => c.isCluster);
    expect(clusterOne).toBeDefined();
    expect(clusterOne?.breweries.length).toBe(2);
    expect(clusterOne?.breweries.map((b) => b.id)).toEqual(['b1', 'b2']);

    const singleOne = clusters.find((c) => !c.isCluster);
    expect(singleOne).toBeDefined();
    expect(singleOne?.breweries[0].id).toBe('b3');
  });

  it('unclusters all breweries at high zoom levels (>= 13)', () => {
    const clusters = clusterBreweries(testBreweries, 13);
    expect(clusters.length).toBe(3);
    expect(clusters.every((c) => !c.isCluster)).toBe(true);
  });

  it('filters out invalid or missing coordinates before clustering', () => {
    const breweriesWithInvalid = [
      ...testBreweries,
      {
        ...testBreweries[0],
        id: 'bad-1',
        coordinates: { lat: NaN, lng: -76.61 },
      },
      {
        ...testBreweries[0],
        id: 'bad-2',
        coordinates: { lat: 100, lng: -76.61 }, // Out of bounds lat
      },
    ];

    const clusters = clusterBreweries(breweriesWithInvalid, 13);
    expect(clusters.length).toBe(3);
  });

  it('handles zoom boundary transitions smoothly (12.9 vs 13.0)', () => {
    const clustersAt12_9 = clusterBreweries(testBreweries, 12.9);
    expect(clustersAt12_9.some((c) => c.isCluster)).toBe(true);

    const clustersAt13_0 = clusterBreweries(testBreweries, 13.0);
    expect(clustersAt13_0.every((c) => !c.isCluster)).toBe(true);
  });

  it('handles empty brewery arrays and single brewery arrays cleanly', () => {
    const emptyClusters = clusterBreweries([], 8);
    expect(emptyClusters).toEqual([]);

    const singleClusters = clusterBreweries([testBreweries[0]], 8);
    expect(singleClusters.length).toBe(1);
    expect(singleClusters[0].isCluster).toBe(false);
    expect(singleClusters[0].breweries[0].id).toBe('b1');
  });
});
