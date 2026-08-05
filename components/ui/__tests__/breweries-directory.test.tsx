import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';
import { Brewery } from '@/lib/types';

// Mock useRouter and useSearchParams
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => null),
  }),
}));

const mockBreweries: Brewery[] = [
  {
    id: '1',
    slug: 'brewery-one',
    name: 'Brewery One',
    type: 'Microbrewery',
    region: 'Central',
    address: '123 Main St',
    city: 'Baltimore',
    county: 'Baltimore City',
    zipCode: '21201',
    phone: '410-555-0101',
    website: 'https://breweryone.com',
    socialLinks: { instagram: 'https://instagram.com/breweryone' },
    coordinates: { lat: 39.2904, lng: -76.6122 },
    description: 'A great Baltimore Microbrewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Monday', hours: '4 PM - 10 PM' }],
    beerStyles: ['IPA', 'Stout'],
    amenities: ['Dog Friendly', 'Outdoor Seating'],
    featured: true,
    lastVerified: '2026-08-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: '2',
    slug: 'brewery-two',
    name: 'Brewery Two',
    type: 'Brewpub',
    region: 'Western',
    address: '456 West St',
    city: 'Frederick',
    county: 'Frederick',
    zipCode: '21701',
    phone: '301-555-0102',
    website: 'https://brewerytwo.com',
    socialLinks: {},
    coordinates: { lat: 39.4143, lng: -77.4105 },
    description: 'Frederick premium Brewpub with kitchen.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Tuesday', hours: '12 PM - 10 PM' }],
    beerStyles: ['Pilsner', 'Sauer'],
    amenities: ['Outdoor Seating'],
    featured: false,
    lastVerified: '2026-07-28',
    verificationSource: 'Community Submit',
    verificationStatus: 'Community Submitted',
  }
];

describe('BreweriesDirectoryContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders directory with breweries lists', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    expect(screen.getByText('Brewery One')).toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
  });

  it('filters breweries based on search input', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const searchInput = screen.getByPlaceholderText('Search by name, style, city...');
    fireEvent.change(searchInput, { target: { value: 'Frederick' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
  });

  it('filters breweries based on region selection', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const regionSelect = screen.getByDisplayValue('All Regions');
    fireEvent.change(regionSelect, { target: { value: 'Western' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
  });

  it('displays empty state if no brewery matches', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const searchInput = screen.getByPlaceholderText('Search by name, style, city...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Brewery' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.queryByText('Brewery Two')).not.toBeInTheDocument();
    expect(screen.getByText('No Breweries Found')).toBeInTheDocument();
  });
});
