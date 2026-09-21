import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '@/components/ui/recommendations/recommendations-panel';
import type { Recommendation } from '@/lib/services/recommendation.service';

describe('RecommendationsPanel', () => {
  const sampleBrewery1 = {
    id: 'b1',
    slug: 'editor-brew',
    name: 'Editor Brew',
    type: 'Microbrewery' as const,
    region: 'Central' as const,
    status: 'Open' as const,
    address: '100 Main St',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21701',
    phone: '301-555-0100',
    website: 'https://editorbrew.com',
    socialLinks: {},
    coordinates: { lat: 39, lng: -76 },
    hours: [],
    beerStyles: ['IPA' as const],
    amenities: ['Dog Friendly'],
    featured: true,
    lastVerified: '2025-01-01',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified' as const,
    description: 'Editor pick brewery',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658',
  };

  const sampleBrewery2 = {
    ...sampleBrewery1,
    id: 'b2',
    slug: 'nearby-brew',
    name: 'Nearby Brew',
    coordinates: { lat: 39.1, lng: -76.1 },
  };

  it('renders curated and computed items with correct badges and distance', () => {
    const items: Recommendation[] = [
      {
        brewery: sampleBrewery1,
        reason: 'From guide: Top 10',
        source: 'curated',
      },
      {
        brewery: sampleBrewery2,
        reason: 'About 2.4 miles away',
        source: 'computed',
        distanceMiles: 2.4,
      },
    ];

    render(<RecommendationsPanel recommendations={items} />);

    expect(screen.getByText('Editor Brew')).toBeTruthy();
    expect(screen.getByText('Nearby Brew')).toBeTruthy();
    expect(screen.getByText('Editor pick')).toBeTruthy(); // curated badge
    expect(screen.getByText('Suggested')).toBeTruthy(); // computed badge
  });

  it('renders explainable matched attributes, status notes, and reasoning links', () => {
    const items: Recommendation[] = [
      {
        brewery: { ...sampleBrewery1, status: 'Temporarily closed' },
        reason: 'Microbrewery in Frederick, MD • Matches: Outdoor Seating, Dog Friendly',
        source: 'computed',
        matchedAttributes: ['Outdoor Seating', 'Dog Friendly'],
        statusNote: 'Temporarily Closed',
      },
    ];

    render(<RecommendationsPanel recommendations={items} />);

    expect(screen.getByText(/Microbrewery in Frederick, MD/i)).toBeTruthy();
    expect(screen.getByText(/✓ Outdoor Seating/i)).toBeTruthy();
    expect(screen.getByText(/✓ Dog Friendly/i)).toBeTruthy();
    expect(screen.getByText('Temporarily Closed')).toBeTruthy();

    const link = screen.getByRole('link', { name: 'Editor Brew' });
    expect(link.getAttribute('href')).toBe('/breweries/editor-brew');
  });
});
