import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '@/components/ui/recommendations/recommendations-panel';
import type { Recommendation } from '@/lib/services/recommendation.service';

describe('RecommendationsPanel', () => {
  it('renders curated and computed items with correct badges and distance', () => {
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
      beerStyles: [],
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
    expect(screen.getAllByText(/2.4/i).length).toBeGreaterThan(0);
  });
});
