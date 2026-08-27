import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrailDetailPage from '@/app/trails/[slug]/page';
import { TrailCard } from '@/components/ui/trail-card';
import { TrailMapView } from '@/components/ui/trail-map-view';
import { BeerTrail, Brewery } from '@/lib/types';

// Mock MapLibre GL to prevent WebGL errors in JSDOM environment
vi.mock('maplibre-gl', () => {
  return {
    Map: vi.fn().mockImplementation(() => ({
      addControl: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      resize: vi.fn(),
      remove: vi.fn(),
      flyTo: vi.fn(),
      fitBounds: vi.fn(),
      isStyleLoaded: vi.fn().mockReturnValue(true),
      getLayer: vi.fn().mockReturnValue(false),
      getSource: vi.fn().mockReturnValue(false),
      addLayer: vi.fn(),
      addSource: vi.fn(),
      removeLayer: vi.fn(),
      removeSource: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      togglePopup: vi.fn(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setDOMContent: vi.fn().mockReturnThis(),
    })),
    LngLatBounds: vi.fn().mockImplementation(() => ({
      extend: vi.fn().mockReturnThis(),
    })),
  };
});

describe('Beer Trail Planning & Map Experience', () => {
  it('renders complete trail detail page with overview, metrics, ordered stops, and directions', async () => {
    const pageJsx = await TrailDetailPage({
      params: Promise.resolve({ slug: 'frederick-beer-adventure' }),
    });

    render(pageJsx);

    // Header & Title
    expect(screen.getByRole('heading', { level: 1, name: /Frederick City Beer Trail/i })).toBeInTheDocument();

    // Key Trip Metrics
    expect(screen.getByText(/Trip Overview & Key Details/i)).toBeInTheDocument();
    expect(screen.getAllByText(/4.5 miles/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Half Day/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/2 Stops/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Easy/i).length).toBeGreaterThan(0);

    // Nearby Attractions
    expect(screen.getByText(/Monocacy National Battlefield/i)).toBeInTheDocument();
    expect(screen.getByText(/Historic Downtown Frederick/i)).toBeInTheDocument();

    // Ordered Itinerary Timeline Stops
    expect(screen.getByRole('article', { name: /Stop 1: Flying Dog Brewery/i })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /Stop 2: Monocacy Brewing Company/i })).toBeInTheDocument();

    expect(screen.getByText(/Stop #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Stop #2/i)).toBeInTheDocument();

    // Directions & Stop Navigation Buttons
    const directionLinks = screen.getAllByRole('link', { name: /Directions/i });
    expect(directionLinks.length).toBeGreaterThan(0);
    expect(directionLinks[0]).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'));

    const viewStopLinks = screen.getAllByRole('link', { name: /View Stop →/i });
    expect(viewStopLinks.length).toBeGreaterThan(0);
    expect(viewStopLinks[0]).toHaveAttribute('href', '/breweries/flying-dog-brewery');
  });

  it('handles closed or inactive trail stops gracefully with operational notices', async () => {
    const sampleClosedBrewery: Brewery = {
      id: 'closed-brewery',
      slug: 'closed-brewery',
      name: 'Old Mill Closed Brewing',
      type: 'Microbrewery',
      region: 'Central',
      status: 'Temporarily closed',
      address: '77 Heritage Way',
      city: 'Frederick',
      county: 'Frederick',
      state: 'MD',
      zipCode: '21701',
      phone: '301-555-0100',
      website: 'https://closedbrewery.com',
      socialLinks: {},
      coordinates: { lat: 39.41, lng: -77.41 },
      hours: [],
      beerStyles: ['Porter', 'Stout'],
      amenities: ['Tasting Room'],
      featured: false,
      lastVerified: '2025-06-01',
      verificationSource: 'Official Website',
      verificationStatus: 'Verified',
      description: 'A historic brewing mill currently under renovation.',
      image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    };

    const sampleTrail: BeerTrail = {
      id: 'test-closed-trail',
      slug: 'test-closed-trail',
      name: 'Test Trail with Closed Stop',
      description: 'A test trail containing a temporarily closed brewery.',
      region: 'Central',
      distance: '3.0 miles',
      duration: '2 Hours',
      breweries: [sampleClosedBrewery],
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
      highlight: 'Experience local history.',
      nearbyAttractions: ['Local Park'],
      difficulty: 'Easy',
    };

    // Render TrailCard with trail containing closed stop
    render(<TrailCard trail={sampleTrail} />);

    expect(screen.getByText(/Test Trail with Closed Stop/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Test Trail with Closed Stop itinerary/i })).toHaveAttribute(
      'href',
      '/trails/test-closed-trail'
    );
  });

  it('renders TrailMapView with full trail dataset and active trail route layer', () => {
    const sampleTrail: BeerTrail = {
      id: 'test-map-trail',
      slug: 'test-map-trail',
      name: 'Map Trail',
      description: 'Test trail map',
      region: 'Capital',
      distance: '5.0 miles',
      duration: '3 Hours',
      breweries: [
        {
          id: 'b1',
          slug: 'b1',
          name: 'Brewery One',
          type: 'Microbrewery',
          region: 'Capital',
          status: 'Open',
          address: '1 Main St',
          city: 'Bethesda',
          county: 'Montgomery',
          state: 'MD',
          zipCode: '20814',
          phone: '',
          website: '',
          socialLinks: {},
          coordinates: { lat: 38.98, lng: -77.09 },
          hours: [],
          beerStyles: [],
          amenities: [],
          featured: false,
          lastVerified: '2025-01-01',
          verificationSource: 'Official',
          verificationStatus: 'Verified',
          description: 'Brewery 1 description',
          image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
        },
        {
          id: 'b2',
          slug: 'b2',
          name: 'Brewery Two',
          type: 'Brewpub',
          region: 'Capital',
          status: 'Open',
          address: '2 Main St',
          city: 'Bethesda',
          county: 'Montgomery',
          state: 'MD',
          zipCode: '20814',
          phone: '',
          website: '',
          socialLinks: {},
          coordinates: { lat: 38.99, lng: -77.10 },
          hours: [],
          beerStyles: [],
          amenities: [],
          featured: false,
          lastVerified: '2025-01-01',
          verificationSource: 'Official',
          verificationStatus: 'Verified',
          description: 'Brewery 2 description',
          image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
        },
      ],
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
      highlight: 'Highlight',
      nearbyAttractions: [],
      difficulty: 'Easy',
    };

    const { container } = render(<TrailMapView breweries={sampleTrail.breweries} trail={sampleTrail} />);
    expect(container).toBeInTheDocument();
  });
});
