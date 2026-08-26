import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InteractiveMapContent } from '@/components/ui/interactive-map-content';
import { Brewery, BeerTrail } from '@/lib/types';

// Mock dynamic import of MapView to render a dummy test component
vi.mock('next/dynamic', () => ({
  default: () => {
    return function DummyMapView({ breweries, selectedBrewery }: { breweries: Brewery[]; selectedBrewery: Brewery | null }) {
      return (
        <div data-testid="mock-map-view">
          <span data-testid="map-brewery-count">{breweries.length}</span>
          {selectedBrewery && <span data-testid="selected-brewery-id">{selectedBrewery.id}</span>}
        </div>
      );
    };
  },
}));

const mockBreweries: Brewery[] = [
  {
    id: 'b1',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://www.flyingdogbrewery.com',
    socialLinks: {},
    coordinates: { lat: 39.3621, lng: -77.4245 },
    description: 'Flying Dog Brewery in Frederick.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['IPA'],
    amenities: ['Outdoor Seating'],
    featured: true,
    lastVerified: '2025-05-10',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: 'b2',
    slug: 'burley-oak-brewing-company',
    name: 'Burley Oak Brewing Company',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    status: 'Open',
    address: '10016 Old Ocean City Blvd',
    city: 'Berlin',
    county: 'Worcester',
    state: 'MD',
    zipCode: '21811',
    phone: '410-641-2622',
    website: 'https://burleyoak.com',
    socialLinks: {},
    coordinates: { lat: 38.3228, lng: -75.2215 },
    description: 'Burley Oak in Berlin.',
    image: 'https://images.unsplash.com/photo-1608270176050-12ec057de8d8',
    hours: [],
    structuredHours: [],
    beerStyles: ['Sour'],
    amenities: ['Live Music'],
    featured: true,
    lastVerified: '2025-05-15',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
  {
    id: 'b3',
    slug: 'invalid-coords-brewery',
    name: 'Invalid Coords Brewery',
    type: 'Brewpub',
    region: 'Central',
    status: 'Open',
    address: '100 Bad Coords Rd',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21201',
    phone: '410-555-0000',
    website: 'https://invalid.com',
    socialLinks: {},
    coordinates: { lat: NaN, lng: -76.6 },
    description: 'Brewery with invalid coordinates.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [],
    structuredHours: [],
    beerStyles: ['Pilsner'],
    amenities: ['Outdoor Seating'],
    featured: false,
    lastVerified: '2025-05-20',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
  },
];

const mockTrails: BeerTrail[] = [
  {
    id: 't1',
    slug: 'frederick-trail',
    name: 'Frederick Trail',
    description: 'Trail in Frederick',
    region: 'Central',
    distance: '5 miles',
    duration: 'Half Day',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    highlight: 'Flying dog trail',
    breweries: [mockBreweries[0]],
    nearbyAttractions: ['Downtown Frederick'],
    difficulty: 'Easy',
  },
];

describe('InteractiveMapContent Component', () => {
  it('renders interactive map content correctly with initial brewery state as null for full overview', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    expect(screen.getByText('Map Filters & Layer Explorer')).toBeInTheDocument();
    expect(screen.getByText('Matching Breweries (3)')).toBeInTheDocument();
    expect(screen.getByText('No Brewery Selected')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-brewery-id')).not.toBeInTheDocument();
    expect(screen.getAllByText('Flying Dog Brewery').length).toBeGreaterThan(0);
    expect(screen.getByText('Burley Oak Brewing Company')).toBeInTheDocument();
  });

  it('selects a brewery and displays path to detail page', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const flyingDogButton = screen.getAllByText('Flying Dog Brewery')[0];
    fireEvent.click(flyingDogButton);

    expect(screen.getByText('View Taproom Profile')).toBeInTheDocument();
    const profileLink = screen.getByRole('link', { name: 'View Taproom Profile' });
    expect(profileLink).toHaveAttribute('href', '/breweries/flying-dog-brewery');
  });

  it('filters breweries when active trail layer is toggled and keeps selectedBrewery as null for route overview', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const trailToggle = screen.getByRole('button', { name: /Frederick Trail/i });
    fireEvent.click(trailToggle);

    expect(screen.getByText('Matching Breweries (1)')).toBeInTheDocument();
    expect(screen.getByText('No Brewery Selected')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-brewery-id')).not.toBeInTheDocument();
    expect(screen.getAllByText('Flying Dog Brewery').length).toBeGreaterThan(0);
    expect(screen.queryByText('Burley Oak Brewing Company')).not.toBeInTheDocument();
  });

  it('contains no event markers or event elements on the map container', () => {
    const { container } = render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    expect(container.innerHTML).not.toContain('event-marker');
    expect(container.innerHTML).not.toContain('Event Schedule');
  });
});
