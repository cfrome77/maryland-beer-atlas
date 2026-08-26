import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';
import { Brewery } from '@/lib/types';

// Mock useRouter and useSearchParams
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

const mockBreweries: Brewery[] = [
  {
    id: '1',
    slug: 'brewery-one',
    name: 'Brewery One',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    address: '123 Main St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-0101',
    website: 'https://breweryone.com',
    socialLinks: { instagram: 'https://instagram.com/breweryone' },
    coordinates: { lat: 39.2904, lng: -76.6122 },
    description: 'A great Baltimore Microbrewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Monday', hours: '4 PM - 10 PM' }],
    structuredHours: [
      { day: 'Monday', isClosed: false, periods: [{ opens: '16:00', closes: '22:00' }] },
    ],
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
    status: 'Temporarily closed',
    address: '456 West St',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21701',
    phone: '301-555-0102',
    website: 'https://brewerytwo.com',
    socialLinks: {},
    coordinates: { lat: 39.4143, lng: -77.4105 },
    description: 'Frederick premium Brewpub with kitchen.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Tuesday', hours: '12 PM - 10 PM' }],
    structuredHours: [],
    beerStyles: ['Pilsner', 'Sauer'],
    amenities: ['Outdoor Seating'],
    featured: false,
    lastVerified: '2026-07-28',
    verificationSource: 'Community Submit',
    verificationStatus: 'Community Submitted',
  },
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
    expect(mockPush).toHaveBeenCalledWith('/breweries?region=Western');
  });

  it('filters breweries based on county selection', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const countySelect = screen.getByDisplayValue('All Counties');
    fireEvent.change(countySelect, { target: { value: 'Frederick' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/breweries?county=Frederick');
  });

  it('filters breweries based on brewery type selection', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const typeSelect = screen.getByDisplayValue('All Brewery Types');
    fireEvent.change(typeSelect, { target: { value: 'Brewpub' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/breweries?type=Brewpub');
  });

  it('filters breweries based on operational status selection', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const statusSelect = screen.getByDisplayValue('All Operational Statuses');
    fireEvent.change(statusSelect, { target: { value: 'open' } });

    expect(screen.getByText('Brewery One')).toBeInTheDocument();
    expect(screen.queryByText('Brewery Two')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/breweries?status=open');
  });

  it('filters breweries based on amenity selection', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const amenitySelect = screen.getByDisplayValue('All Amenities');
    fireEvent.change(amenitySelect, { target: { value: 'Dog Friendly' } });

    expect(screen.getByText('Brewery One')).toBeInTheDocument();
    expect(screen.queryByText('Brewery Two')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/breweries?amenity=Dog+Friendly');
  });

  it('applies quick guide preset filter', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const quickGuideSelect = screen.getByDisplayValue('Select Popular Guide or Filter Preset...');
    fireEvent.change(quickGuideSelect, { target: { value: 'Frederick County' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.getByText('Brewery Two')).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/breweries?county=Frederick&quickGuide=Frederick+County');
  });

  it('displays empty state and resets filters when reset button clicked', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const searchInput = screen.getByPlaceholderText('Search by name, style, city...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Brewery' } });

    expect(screen.queryByText('Brewery One')).not.toBeInTheDocument();
    expect(screen.queryByText('Brewery Two')).not.toBeInTheDocument();
    expect(screen.getByText('No Breweries Found')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: 'Reset All Filters' });
    fireEvent.click(resetButton);

    expect(mockPush).toHaveBeenCalledWith('/breweries');
  });

  it('changes sorting option and updates URL', () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const sortSelect = screen.getByDisplayValue('Sort: Name (A to Z)');
    fireEvent.change(sortSelect, { target: { value: 'county-asc' } });

    expect(mockPush).toHaveBeenCalledWith('/breweries?sort=county-asc');
  });
});
