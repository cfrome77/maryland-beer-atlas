import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
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
    stops: [
      {
        order: 1,
        brewery: mockBreweries[0],
        isOptional: false,
      },
    ],
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

  it('selects a brewery and displays path to detail page and directions link', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const flyingDogButton = screen.getAllByText('Flying Dog Brewery')[0];
    fireEvent.click(flyingDogButton);

    expect(screen.getByText('View Taproom Profile')).toBeInTheDocument();
    const profileLink = screen.getByRole('link', { name: 'View Taproom Profile' });
    expect(profileLink).toHaveAttribute('href', '/breweries/flying-dog-brewery');

    const directionsLink = screen.getByRole('link', { name: /Directions/i });
    expect(directionsLink).toHaveAttribute('href', expect.stringContaining('google.com/maps/'));
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

  it('filters visible breweries by search text query', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const searchInput = screen.getByPlaceholderText('Search by brewery, city, or style...');
    fireEvent.change(searchInput, { target: { value: 'Burley' } });

    expect(screen.getByText('Matching Breweries (1)')).toBeInTheDocument();
    expect(screen.getByText('Burley Oak Brewing Company')).toBeInTheDocument();
    expect(screen.queryByText('Flying Dog Brewery')).not.toBeInTheDocument();
  });

  it('filters visible breweries by operational status and clears all filters on click', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const statusSelect = screen.getByRole('combobox', { name: /Filter by operational status/i });
    fireEvent.change(statusSelect, { target: { value: 'hours_unavailable' } });

    expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);

    expect(screen.getByText('Matching Breweries (3)')).toBeInTheDocument();
  });

  it('contains no event markers or event elements on the map container', () => {
    const { container } = render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    expect(container.innerHTML).not.toContain('event-marker');
    expect(container.innerHTML).not.toContain('Event Schedule');
  });

  it('handles user geolocation and proximity sorting with distance badge displays', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 39.3621,
            longitude: -77.4245,
          },
        })
      ),
    };

    // @ts-expect-error Mocking browser navigator.geolocation
    global.navigator.geolocation = mockGeolocation;

    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    const sortSelect = screen.getByRole('combobox', { name: /Sort breweries by/i });
    fireEvent.change(sortSelect, { target: { value: 'proximity' } });

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(screen.getByText(/Showing distance relative to your current location/i)).toBeInTheDocument();
    expect(screen.getByText('0.0 mi')).toBeInTheDocument();
  });

  it('supports multi-select dropdown ARIA listbox attributes and keyboard navigation', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    // Find the button for Regions multi-select dropdown
    const regionsBtn = screen.getByRole('button', { name: /All Regions/i });
    expect(regionsBtn).toHaveAttribute('aria-haspopup', 'listbox');
    expect(regionsBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open listbox
    fireEvent.click(regionsBtn);
    expect(regionsBtn).toHaveAttribute('aria-expanded', 'true');

    const listbox = screen.getByRole('listbox', { name: 'Regions' });
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);

    // Option Central
    const centralOption = screen.getByRole('option', { name: /Central/i });
    expect(centralOption).toHaveAttribute('aria-selected', 'false');

    // Toggle Central using Space key
    fireEvent.keyDown(centralOption, { key: ' ' });
    expect(centralOption).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Matching Breweries (2)')).toBeInTheDocument();

    // Close listbox with Escape key
    fireEvent.keyDown(listbox, { key: 'Escape' });
    expect(screen.queryByRole('listbox', { name: 'Regions' })).not.toBeInTheDocument();
  });

  it('filters map results using multi-criteria filter combinations simultaneously', () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    // Filter by Region = Central
    const regionsBtn = screen.getByRole('button', { name: /All Regions/i });
    fireEvent.click(regionsBtn);
    const centralOption = screen.getByRole('option', { name: /Central/i });
    fireEvent.click(centralOption);

    // Filter by Amenities = Outdoor Seating
    const amenitiesBtn = screen.getByRole('button', { name: /All Amenities/i });
    fireEvent.click(amenitiesBtn);
    const outdoorOption = screen.getByRole('option', { name: /Outdoor Seating/i });
    fireEvent.click(outdoorOption);

    // Enter Search query = Flying
    const searchInput = screen.getByPlaceholderText('Search by brewery, city, or style...');
    fireEvent.change(searchInput, { target: { value: 'Flying' } });

    expect(screen.getByText('Matching Breweries (1)')).toBeInTheDocument();
    expect(screen.getAllByText('Flying Dog Brewery').length).toBeGreaterThan(0);
    expect(screen.queryByText('Burley Oak Brewing Company')).not.toBeInTheDocument();
  });

  it('deselects selectedBrewery when filter change removes the brewery from visible list', async () => {
    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    // Select Burley Oak Brewing Company (b2)
    const burleyBtn = screen.getByText('Burley Oak Brewing Company');
    fireEvent.click(burleyBtn);

    expect(screen.getByTestId('selected-brewery-id')).toHaveTextContent('b2');

    // Filter by Region = Central (which hides Burley Oak which is Eastern Shore)
    const regionsBtn = screen.getByRole('button', { name: /All Regions/i });
    fireEvent.click(regionsBtn);
    const centralOption = screen.getByRole('option', { name: /Central/i });
    fireEvent.click(centralOption);

    // selectedBrewery should automatically reset to null (async timeout sync)
    await waitFor(() => {
      expect(screen.queryByTestId('selected-brewery-id')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No Brewery Selected')).toBeInTheDocument();
  });

  it('allows clearing user location and resetting location error message', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 39.3621,
            longitude: -77.4245,
          },
        })
      ),
    };

    // @ts-expect-error Mocking browser navigator.geolocation
    global.navigator.geolocation = mockGeolocation;

    render(<InteractiveMapContent breweries={mockBreweries} trails={mockTrails} />);

    // Click Near Me button
    const nearMeBtn = screen.getByRole('button', { name: /Use my location to find nearby breweries/i });
    fireEvent.click(nearMeBtn);

    expect(screen.getByText(/Showing distance relative to your current location/i)).toBeInTheDocument();

    // Click Clear Location button
    const clearLocBtn = screen.getByRole('button', { name: /Clear Location/i });
    fireEvent.click(clearLocBtn);

    expect(screen.queryByText(/Showing distance relative to your current location/i)).not.toBeInTheDocument();
  });
});
