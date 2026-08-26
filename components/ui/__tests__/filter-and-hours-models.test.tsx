import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';
import BreweryDetailPage from '@/app/breweries/[slug]/page';
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
  notFound: () => {
    throw new Error('Not Found');
  }
}));

// Mock content service for Detail page
vi.mock('@/lib/services/content.service', () => ({
  contentService: {
    breweries: {
      getBySlug: async (slug: string) => {
        return mockBreweries.find(b => b.slug === slug) || null;
      }
    }
  }
}));

const mockBreweries: Brewery[] = [
  {
    id: 'flying-dog',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-05-10',
    statusNotes: 'Normal taproom operating hours.',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://www.flyingdogbrewery.com',
    socialLinks: { facebook: 'https://facebook.com/flyingdog' },
    coordinates: { lat: 39.3621, lng: -77.4245 },
    description: 'One of the largest craft breweries in Maryland.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
    hours: [{ day: 'Thursday', hours: '4:00 PM - 9:00 PM' }],
    structuredHours: [
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] }
    ],
    beerStyles: ['IPA'],
    amenities: ['Tasting Room'],
    featured: true,
    lastVerified: '2025-05-10',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', checkedAt: '2025-05-10', confidence: 'High' }
    }
  },
  {
    id: 'calvert-brewing',
    slug: 'calvert-brewing-company',
    name: 'Calvert Brewing Company',
    type: 'Production',
    region: 'Southern',
    status: 'Opening soon',
    statusUpdatedAt: '2025-04-30',
    statusNotes: 'Undergoing taproom renovations. Grand reopening next month!',
    address: '15850 Commerce Ct',
    city: 'Upper Marlboro',
    county: "Prince George's",
    state: 'MD',
    zipCode: '20774',
    phone: '240-245-4609',
    website: 'https://www.calvertbrewingcompany.com',
    socialLinks: {},
    coordinates: { lat: 38.8950, lng: -76.7325 },
    description: "Calvert Brewing is one of Southern Maryland's premiere production facilities.",
    image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13',
    hours: [{ day: 'Thursday', hours: '4:00 PM - 9:00 PM' }],
    structuredHours: [
      { day: 'Monday', isClosed: true }
    ],
    beerStyles: ['IPA'],
    amenities: ['Spacious Taproom'],
    featured: false,
    lastVerified: '2025-04-30',
    verificationSource: 'Community Submission',
    verificationStatus: 'Community Submitted',
  }
];

describe('Data Models & Filter Presets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly applies quick guide filter presets config-driven', async () => {
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const quickSelect = screen.getByLabelText('Popular guides and presets');
    fireEvent.change(quickSelect, { target: { value: 'Frederick County' } });

    // Should push filters for Frederick
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('county=Frederick'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('quickGuide=Frederick+County'));
  });

  it('debounces the search parameter updates using replace', async () => {
    vi.useFakeTimers();
    render(<BreweriesDirectoryContainer breweries={mockBreweries} />);

    const searchInput = screen.getByPlaceholderText('Search by name, style, city...');
    fireEvent.change(searchInput, { target: { value: 'Flying' } });

    // Router should not have been called immediately
    expect(mockReplace).not.toHaveBeenCalled();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=Flying'));
    vi.useRealTimers();
  });

  it('renders brewery operating status, notes and structured hours in detail view', async () => {
    const detailElement = await BreweryDetailPage({ params: Promise.resolve({ slug: 'calvert-brewing-company' }) });
    render(detailElement);

    // Check that custom operating status notices are displayed
    expect(screen.getByText('Status: Opening soon')).toBeInTheDocument();
    expect(screen.getByText(/Undergoing taproom renovations/)).toBeInTheDocument();

    // Check structured hours parsing (Monday Closed)
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders field verifications and confidence ratings in detail view', async () => {
    const detailElement = await BreweryDetailPage({ params: Promise.resolve({ slug: 'flying-dog-brewery' }) });
    render(detailElement);

    // Checks individual field-level badges and confidence
    expect(screen.getByText('Field-Level Verification')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Confidence Level:')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
