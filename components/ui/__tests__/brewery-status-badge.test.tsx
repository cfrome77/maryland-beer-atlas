import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BreweryStatusBadge, BreweryFreshnessBadge } from '../brewery-status-badge';
import { Brewery } from '@/lib/types';

const mockBrewery: Brewery = {
  id: 'test-brewery-1',
  slug: 'test-brewery',
  name: 'Test Craft Brewery',
  type: 'Microbrewery',
  region: 'Central',
  status: 'Open',
  address: '123 Main St',
  city: 'Baltimore',
  county: 'Baltimore City',
  state: 'MD',
  zipCode: '21201',
  phone: '410-555-0100',
  website: 'https://example.com',
  socialLinks: {},
  coordinates: { lat: 39.29, lng: -76.61 },
  description: 'A fine test craft brewery',
  image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  hours: [{ day: 'Monday', hours: '12:00 PM - 8:00 PM' }],
  structuredHours: [
    { day: 'Monday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] },
  ],
  beerStyles: ['IPA'],
  amenities: ['Dog Friendly'],
  featured: false,
  lastVerified: '2025-06-01',
  verificationSource: 'Official Website',
  verificationStatus: 'Verified',
};

describe('BreweryStatusBadge Component', () => {
  it('renders "Open Now" when brewery is open at target date/time', () => {
    // Target date: Monday June 16, 2025 15:00 EDT (19:00 UTC)
    const targetDate = new Date('2025-06-16T19:00:00Z');
    render(<BreweryStatusBadge brewery={mockBrewery} targetDate={targetDate} showDetail={true} />);

    expect(screen.getByText('Open Now')).toBeInTheDocument();
    expect(screen.getByText('• Closes at 8:00 PM')).toBeInTheDocument();
  });

  it('renders "Closed Now" when brewery is closed at target date/time', () => {
    // Target date: Monday June 16, 2025 21:00 EDT (Tuesday 01:00 UTC)
    const targetDate = new Date('2025-06-17T01:00:00Z');
    render(<BreweryStatusBadge brewery={mockBrewery} targetDate={targetDate} showDetail={true} />);

    expect(screen.getByText('Closed Now')).toBeInTheDocument();
  });

  it('renders "Closed Permanently" for permanently closed breweries', () => {
    const closedBrewery: Brewery = {
      ...mockBrewery,
      status: 'Permanently closed',
    };
    render(<BreweryStatusBadge brewery={closedBrewery} />);

    expect(screen.getByText('Closed Permanently')).toBeInTheDocument();
  });

  it('renders "Temporarily Closed" or "Seasonal Closure" for temporarily closed breweries', () => {
    const tempBrewery: Brewery = {
      ...mockBrewery,
      status: 'Temporarily closed',
    };
    render(<BreweryStatusBadge brewery={tempBrewery} />);

    expect(screen.getByText('Temporarily Closed')).toBeInTheDocument();

    const seasonalBrewery: Brewery = {
      ...mockBrewery,
      status: 'Seasonal',
    };
    render(<BreweryStatusBadge brewery={seasonalBrewery} />);

    expect(screen.getByText('Seasonal Closure')).toBeInTheDocument();
  });

  it('renders "Hours Unavailable" when structured hours are missing', () => {
    const noHoursBrewery: Brewery = {
      ...mockBrewery,
      structuredHours: [],
    };
    render(<BreweryStatusBadge brewery={noHoursBrewery} />);

    expect(screen.getByText('Hours Unavailable')).toBeInTheDocument();
  });
});

describe('BreweryFreshnessBadge Component', () => {
  const referenceDate = new Date('2025-07-01T00:00:00Z');

  it('renders "Recently Verified" badge when last verified within 90 days', () => {
    const freshBrewery: Brewery = {
      ...mockBrewery,
      lastVerified: '2025-06-15',
      verificationStatus: 'Verified',
    };
    render(<BreweryFreshnessBadge brewery={freshBrewery} targetDate={referenceDate} />);

    expect(screen.getByText('Recently Verified')).toBeInTheDocument();
  });

  it('renders "Stale Data" badge when last verified between 91 and 180 days', () => {
    const staleBrewery: Brewery = {
      ...mockBrewery,
      lastVerified: '2025-02-15',
      verificationStatus: 'Verified',
    };
    render(<BreweryFreshnessBadge brewery={staleBrewery} targetDate={referenceDate} />);

    expect(screen.getByText('Stale Data')).toBeInTheDocument();
  });

  it('renders "Outdated Verification" badge when verified over 180 days ago', () => {
    const outdatedBrewery: Brewery = {
      ...mockBrewery,
      lastVerified: '2024-11-01',
      verificationStatus: 'Verified',
    };
    render(<BreweryFreshnessBadge brewery={outdatedBrewery} targetDate={referenceDate} />);

    expect(screen.getByText('Outdated Verification')).toBeInTheDocument();
  });

  it('renders "Needs Review" badge when status is Needs Review', () => {
    const reviewBrewery: Brewery = {
      ...mockBrewery,
      lastVerified: '2025-06-30',
      verificationStatus: 'Needs Review',
    };
    render(<BreweryFreshnessBadge brewery={reviewBrewery} targetDate={referenceDate} />);

    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });

  it('renders "Community Submitted" or "Unverified Data" when lastVerified is empty', () => {
    const unverifiedBrewery: Brewery = {
      ...mockBrewery,
      lastVerified: '',
      verificationStatus: 'Community Submitted',
    };
    render(<BreweryFreshnessBadge brewery={unverifiedBrewery} targetDate={referenceDate} />);

    expect(screen.getByText('Community Submitted')).toBeInTheDocument();
  });
});
