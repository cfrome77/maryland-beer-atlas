import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MapView from '@/components/ui/map-view';
import BreweryDetailMap from '@/components/ui/brewery-detail-map';
import { TrailMapView } from '@/components/ui/trail-map-view';
import { Brewery, BeerTrail } from '@/lib/types';

// Mock maplibregl for testing DOM initialization without full WebGL context in JSDOM
vi.mock('maplibre-gl', () => {
  class MockMap {
    addControl = vi.fn();
    on = vi.fn((event: string, cb: () => void) => {
      if (event === 'load' || event === 'style.load') {
        cb();
      }
    });
    resize = vi.fn();
    remove = vi.fn();
    flyTo = vi.fn();
    fitBounds = vi.fn();
    addSource = vi.fn();
    addLayer = vi.fn();
    getSource = vi.fn();
    getLayer = vi.fn();
    removeSource = vi.fn();
    removeLayer = vi.fn();
    isStyleLoaded = vi.fn().mockReturnValue(true);
    once = vi.fn();
  }

  class MockNavigationControl {}
  class MockMarker {
    setLngLat = vi.fn().mockReturnThis();
    setPopup = vi.fn().mockReturnThis();
    addTo = vi.fn().mockReturnThis();
    remove = vi.fn();
    togglePopup = vi.fn();
  }
  class MockPopup {
    setDOMContent = vi.fn().mockReturnThis();
  }
  class MockLngLatBounds {
    extend = vi.fn().mockReturnThis();
  }

  return {
    Map: MockMap,
    NavigationControl: MockNavigationControl,
    Marker: MockMarker,
    Popup: MockPopup,
    LngLatBounds: MockLngLatBounds,
  };
});

const sampleBrewery: Brewery = {
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
};

const sampleTrail: BeerTrail = {
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
      brewery: sampleBrewery,
      isOptional: false,
    },
  ],
  breweries: [sampleBrewery],
  nearbyAttractions: ['Downtown Frederick'],
  difficulty: 'Easy',
};

describe('Map Provider & Configuration Tests', () => {
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalWebGL2Context: unknown;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalWebGL2Context = (window as unknown as Record<string, unknown>).WebGL2RenderingContext;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    if (originalWebGL2Context !== undefined) {
      (window as unknown as Record<string, unknown>).WebGL2RenderingContext = originalWebGL2Context;
    } else {
      delete (window as unknown as Record<string, unknown>).WebGL2RenderingContext;
    }
    vi.restoreAllMocks();
  });

  function enableWebGL2Mock() {
    (window as unknown as Record<string, unknown>).WebGL2RenderingContext = class WebGL2RenderingContext {};
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType: string) => {
      if (contextType === 'webgl2' || contextType === 'experimental-webgl2') {
        return {} as WebGL2RenderingContext;
      }
      return null;
    });
  }

  function disableWebGL2Mock() {
    delete (window as unknown as Record<string, unknown>).WebGL2RenderingContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
  }

  it('renders MapView without needing Mapbox or MapTiler API keys when WebGL2 is supported', () => {
    enableWebGL2Mock();

    render(
      <MapView
        breweries={[sampleBrewery]}
        selectedBrewery={null}
        onSelectBrewery={() => {}}
      />
    );

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Micro')).toBeInTheDocument();
    expect(screen.getByText('Brewpub')).toBeInTheDocument();
  });

  it('renders graceful fallback UI in MapView when WebGL2 context is unavailable', () => {
    disableWebGL2Mock();

    render(
      <MapView
        breweries={[sampleBrewery]}
        selectedBrewery={null}
        onSelectBrewery={() => {}}
      />
    );

    expect(screen.getByText('WebGL2 is Disabled or Unsupported')).toBeInTheDocument();
    expect(
      screen.getByText(
        /This interactive map requires WebGL2 hardware graphics acceleration to render the high-performance CARTO maps/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText('How to resolve:')).toBeInTheDocument();
  });

  it('renders BreweryDetailMap gracefully when coordinates are invalid without API key errors', () => {
    const invalidBrewery: Brewery = {
      ...sampleBrewery,
      coordinates: { lat: NaN, lng: -77.4245 },
    };

    render(<BreweryDetailMap brewery={invalidBrewery} />);

    expect(screen.getByText('Location & Address')).toBeInTheDocument();
    expect(screen.getByText(/4607 Wedgewood Blvd, Frederick, MD 21703/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Directions \(Google Maps\)/i })).toBeInTheDocument();
  });

  it('renders BreweryDetailMap with fallback banner when WebGL2 context is unavailable', () => {
    disableWebGL2Mock();

    render(<BreweryDetailMap brewery={sampleBrewery} />);

    expect(screen.getByText('Interactive Map Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/4607 Wedgewood Blvd, Frederick, MD 21703/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open in Google Maps/i })).toBeInTheDocument();
  });

  it('renders TrailMapView without requiring map tokens or throwing unhandled errors', async () => {
    enableWebGL2Mock();

    render(<TrailMapView breweries={[sampleBrewery]} trail={sampleTrail} />);

    const legend = await screen.findByText('Legend');
    expect(legend).toBeInTheDocument();
  });
});
