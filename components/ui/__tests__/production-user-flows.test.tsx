import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';
import { InteractiveMapContent } from '@/components/ui/interactive-map-content';
import BreweryDetailPage from '@/app/breweries/[slug]/page';
import { Brewery, BeerTrail, TravelGuide } from '@/lib/types';

// Mock Next.js navigation hooks
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
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Mock MapView to avoid WebGL / MapLibre canvas requirements during unit tests
vi.mock('@/components/ui/map-view', () => ({
  default: function MockMapView({ breweries, selectedBrewery }: { breweries: Brewery[]; selectedBrewery: Brewery | null }) {
    return (
      <div data-testid="mock-map-view">
        <span>Mock Map ({breweries.length} markers)</span>
        {selectedBrewery && <span>Selected: {selectedBrewery.name}</span>}
      </div>
    );
  },
}));

const testBreweries: Brewery[] = [
  {
    id: 'b1',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Western',
    status: 'Open',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://flyingdogbrewery.com',
    socialLinks: { instagram: 'https://instagram.com/flyingdogbrewery' },
    coordinates: { lat: 39.3876, lng: -77.4055 },
    description: 'Iconic Frederick production brewery.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Friday', hours: '3 PM - 9 PM' }],
    structuredHours: [{ day: 'Friday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] }],
    beerStyles: ['IPA', 'Porter'],
    amenities: ['Dog Friendly', 'Outdoor Seating'],
    featured: true,
    lastVerified: '2026-08-15',
    verificationSource: 'Official Site',
    verificationStatus: 'Verified',
  },
  {
    id: 'b2',
    slug: 'heavy-seas-beer',
    name: 'Heavy Seas Beer',
    type: 'Production',
    region: 'Central',
    status: 'Closed',
    statusNotes: 'Facility undergoing seasonal maintenance.',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    county: 'Baltimore County',
    state: 'MD',
    zipCode: '21227',
    phone: '410-247-7822',
    website: 'https://hsbeer.com',
    socialLinks: {},
    coordinates: { lat: 39.2312, lng: -76.6789 },
    description: 'Baltimore craft brewing pioneer.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Saturday', hours: '12 PM - 8 PM' }],
    structuredHours: [],
    beerStyles: ['ESB', 'Stout'],
    amenities: ['Tours Available'],
    featured: false,
    lastVerified: '2026-06-10',
    verificationSource: 'Community Submit',
    verificationStatus: 'Community Submitted',
  },
];

const testTrails: BeerTrail[] = [
  {
    id: 't1',
    slug: 'frederick-craft-trail',
    name: 'Frederick Craft Trail',
    region: 'Western',
    description: 'A scenic trail connecting Frederick breweries.',
    distance: '15 miles',
    duration: '1 day',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    breweries: [testBreweries[0]],
    nearbyAttractions: ['Downtown Frederick', 'Carroll Creek Park'],
    highlight: 'Historic downtown strolls and open taprooms.',
  },
];

const testGuides: TravelGuide[] = [
  {
    slug: 'frederick-weekend-guide',
    title: 'Frederick Beer Weekend Guide',
    description: 'Top taprooms and farm breweries in Frederick MD.',
    guideType: 'trip_planning',
    region: 'Western',
    county: 'Frederick',
    author: 'Maryland Beer Editors',
    publishDate: '2026-08-01',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    content: '<p>Discover the best taprooms in Frederick County.</p>',
    recommendedStops: [testBreweries[0]],
    categories: ['Frederick', 'Weekend Trip'],
    tips: ['Visit Carroll Creek Park during golden hour', 'Check taproom hours in advance'],
    seo: {
      metaTitle: 'Frederick Beer Weekend Guide | Maryland Beer Atlas',
      metaDescription: 'Top taprooms and farm breweries in Frederick MD.',
      keywords: ['Frederick', 'Brewery Tour'],
    },
  },
];

// Mock contentService for server-side page rendering
vi.mock('@/lib/services/content.service', () => ({
  contentService: {
    breweries: {
      getAll: vi.fn(async () => testBreweries),
      getBySlug: vi.fn(async (slug: string) => testBreweries.find((b) => b.slug === slug) || null),
    },
    trails: {
      getAll: vi.fn(async () => testTrails),
      getBySlug: vi.fn(async (slug: string) => testTrails.find((t) => t.slug === slug) || null),
    },
    guides: {
      getAll: vi.fn(async () => testGuides),
      getBySlug: vi.fn(async (slug: string) => testGuides.find((g) => g.slug === slug) || null),
    },
  },
}));

describe('Production User Journeys & End-to-End Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Directory & Interactive Map Flows', () => {
    it('announces result counts dynamically with aria-live in directory', () => {
      render(<BreweriesDirectoryContainer breweries={testBreweries} />);

      const countLiveRegion = screen.getByText(/Showing/i).parentElement;
      expect(countLiveRegion).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Flying Dog Brewery')).toBeInTheDocument();
      expect(screen.getByText('Heavy Seas Beer')).toBeInTheDocument();
    });

    it('interactively updates map selection and renders sidebar inspector details', () => {
      render(<InteractiveMapContent breweries={testBreweries} trails={testTrails} guides={testGuides} />);

      expect(screen.getByText('No Brewery Selected')).toBeInTheDocument();

      const flyingDogButton = screen.getByRole('button', { name: /Flying Dog Brewery/i });
      fireEvent.click(flyingDogButton);

      expect(screen.getByText('View Taproom Profile')).toBeInTheDocument();
      expect(screen.getAllByText('Flying Dog Brewery').length).toBeGreaterThan(0);
      expect(screen.getByText('4607 Wedgewood Blvd, Frederick, MD 21703')).toBeInTheDocument();
    });
  });

  describe('Brewery Detail Page SEO & Schema.org', () => {
    it('renders detail page facts, JSON-LD schema, and directions links correctly', async () => {
      const pageJsx = await BreweryDetailPage({ params: Promise.resolve({ slug: 'flying-dog-brewery' }) });
      const { container } = render(pageJsx);

      expect(screen.getByRole('heading', { level: 1, name: 'Flying Dog Brewery' })).toBeInTheDocument();

      // Verify JSON-LD script block exists and includes schema parameters
      const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
      expect(jsonLdScript).not.toBeNull();
      const schema = JSON.parse(jsonLdScript?.textContent || '{}');
      expect(schema['@type']).toContain('Brewery');
      expect(schema.name).toBe('Flying Dog Brewery');
      expect(schema.address.addressLocality).toBe('Frederick');
      expect(schema.address.addressRegion).toBe('MD');

      // Verify call/website and directions CTAs
      const websiteLinks = screen.getAllByRole('link', { name: /Website/i });
      expect(websiteLinks[0]).toHaveAttribute('href', 'https://flyingdogbrewery.com');

      const phoneLinks = screen.getAllByRole('link', { name: /301-694-7899/i });
      expect(phoneLinks[0]).toHaveAttribute('href', 'tel:3016947899');
    });

    it('renders operating notice banner for closed/inactive status', async () => {
      const pageJsx = await BreweryDetailPage({ params: Promise.resolve({ slug: 'heavy-seas-beer' }) });
      render(pageJsx);

      expect(screen.getByText('Operating Notice')).toBeInTheDocument();
      expect(screen.getByText(/Facility undergoing seasonal maintenance/i)).toBeInTheDocument();
    });
  });
});
