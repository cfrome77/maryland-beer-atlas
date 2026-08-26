import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BreweryDetailPage from '@/app/breweries/[slug]/page';
import BreweryDetailMap from '@/components/ui/brewery-detail-map';
import { Brewery } from '@/lib/types';

// Mock MapLibre GL to avoid WebGL context errors in JSDOM
vi.mock('maplibre-gl', () => {
  return {
    Map: vi.fn().mockImplementation(() => ({
      addControl: vi.fn(),
      on: vi.fn(),
      resize: vi.fn(),
      remove: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setDOMContent: vi.fn().mockReturnThis(),
    })),
  };
});

describe('Brewery Detail Page & Map Components', () => {
  it('renders complete brewery detail page with canonical facts and Sanity editorial content', async () => {
    const pageJsx = await BreweryDetailPage({
      params: Promise.resolve({ slug: 'flying-dog-brewery' }),
    });

    render(pageJsx);

    // Canonical brewery facts
    expect(screen.getByRole('heading', { level: 1, name: /Flying Dog Brewery/i })).toBeInTheDocument();
    expect(screen.getAllByText(/4607 Wedgewood Blvd/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Frederick County/i).length).toBeGreaterThan(0);

    const websiteLinks = screen.getAllByRole('link', { name: /Website/i });
    expect(websiteLinks.length).toBeGreaterThan(0);
    expect(websiteLinks[0]).toHaveAttribute('href', 'https://www.flyingdogbrewery.com');

    expect(screen.getByRole('link', { name: /Call/i })).toHaveAttribute('href', 'tel:3016947899');

    // Sanity Editorial Content
    expect(screen.getByText(/Ralph Steadman Label Art Gallery/i)).toBeInTheDocument();
    expect(screen.getByText(/Expansive Outdoor Beer Garden/i)).toBeInTheDocument();
    expect(screen.getByText(/Raging Bitch Belgian IPA/i)).toBeInTheDocument();
    expect(screen.getByText(/Flying Dog remains an indispensable pillar of Maryland craft beer history/i)).toBeInTheDocument();

    // Data verification sidebar
    expect(screen.getByText(/Data Verification & Freshness/i)).toBeInTheDocument();
  });

  it('handles incomplete brewery data gracefully without crashing or rendering empty cards', async () => {
    const pageJsx = await BreweryDetailPage({
      params: Promise.resolve({ slug: 'franklins-brewery' }),
    });

    render(pageJsx);

    expect(screen.getByRole('heading', { level: 1, name: /Franklin's Brewery/i })).toBeInTheDocument();
    expect(screen.getAllByText(/5123 Baltimore Ave/i).length).toBeGreaterThan(0);
  });

  it('renders BreweryDetailMap with address details and direction links', () => {
    const sampleBrewery: Brewery = {
      id: 'test-brewery',
      slug: 'test-brewery',
      name: 'Test Brewery',
      type: 'Microbrewery',
      region: 'Capital',
      status: 'Open',
      address: '100 Main Street',
      city: 'Bethesda',
      county: 'Montgomery',
      state: 'MD',
      zipCode: '20814',
      phone: '301-555-0199',
      website: 'https://testbrewery.com',
      socialLinks: {},
      coordinates: { lat: 38.98, lng: -77.09 },
      hours: [],
      beerStyles: [],
      amenities: [],
      featured: false,
      lastVerified: '2025-06-01',
      verificationSource: 'Official Website',
      verificationStatus: 'Verified',
      description: 'Test description',
      image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    };

    render(<BreweryDetailMap brewery={sampleBrewery} />);

    expect(screen.getByText(/100 Main Street/i)).toBeInTheDocument();
    expect(screen.getByText(/Bethesda/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Google Maps/i })).toBeInTheDocument();
  });
});
