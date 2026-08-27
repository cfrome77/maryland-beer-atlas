import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecommendationsPanel } from '@/components/ui/recommendations/recommendations-panel';
import type { Recommendation } from '@/lib/services/recommendation.service';

describe('RecommendationsPanel', () => {
  it('renders curated and computed items with correct badges and distance', () => {
    const items: Recommendation[] = [
      {
        brewery: {
          id: 'b1',
          slug: 'editor-brew',
          name: 'Editor Brew',
          // minimal shape to satisfy rendering — adjust to your schema if names differ
          categories: ['taproom'],
          location: { latitude: 39, longitude: -76 },
          logoUrl: '',
        } as any,
        reason: 'From guide: Top 10',
        source: 'curated',
      } as any,
      {
        brewery: {
          id: 'b2',
          slug: 'nearby-brew',
          name: 'Nearby Brew',
          categories: ['dog-friendly'],
          location: { latitude: 39.1, longitude: -76.1 },
          logoUrl: '',
        } as any,
        reason: 'About 2.4 miles away',
        source: 'computed',
        distanceMiles: 2.4,
      } as any,
    ];

    render(<RecommendationsPanel recommendations={items} />);

    expect(screen.getByText('Editor Brew')).toBeTruthy();
    expect(screen.getByText('Nearby Brew')).toBeTruthy();
    expect(screen.getByText('Editor pick')).toBeTruthy(); // curated badge
    expect(screen.getByText('Suggested')).toBeTruthy(); // computed badge
    expect(screen.getByText(/2.4 mi/i)).toBeTruthy();
  });
});
