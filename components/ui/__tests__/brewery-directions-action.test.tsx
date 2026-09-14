import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  BreweryDirectionsAction,
  hasDirectionsDestination,
} from '@/components/ui/brewery-directions-action';
import { Brewery } from '@/lib/types';

const mockBreweryWithCoords: Brewery = {
  id: 'brewery-1',
  slug: 'test-brewery',
  name: 'Test Craft Brewery',
  type: 'Microbrewery',
  description: 'A great brewery',
  image: '/images/test.jpg',
  address: '123 Main St',
  city: 'Frederick',
  state: 'MD',
  zipCode: '21701',
  county: 'Frederick',
  region: 'Central',
  coordinates: {
    lat: 39.4143,
    lng: -77.4105,
  },
  phone: '(301) 555-0199',
  website: 'https://testbrewery.com',
  socialLinks: {},
  status: 'Open',
  statusNotes: 'Open as normal',
  statusUpdatedAt: '2025-01-01',
  verificationStatus: 'Verified',
  verificationSource: 'Official Website',
  lastVerified: '2025-01-01',
  amenities: ['Dog Friendly'],
  beerStyles: ['IPA'],
  hours: [],
  featured: false,
};

const mockBreweryWithoutCoords: Brewery = {
  ...mockBreweryWithCoords,
  id: 'brewery-2',
  name: 'Fallback Address Brewery',
  coordinates: { lat: NaN, lng: NaN },
};

describe('BreweryDirectionsAction', () => {
  describe('hasDirectionsDestination', () => {
    it('returns true when valid coordinates are present', () => {
      expect(hasDirectionsDestination(mockBreweryWithCoords)).toBe(true);
    });

    it('returns true when coordinates are invalid but verified address fields exist', () => {
      expect(hasDirectionsDestination(mockBreweryWithoutCoords)).toBe(true);
    });

    it('returns false when brewery object or location data is missing or empty', () => {
      expect(hasDirectionsDestination(null)).toBe(false);
      expect(hasDirectionsDestination(undefined)).toBe(false);
      expect(hasDirectionsDestination({})).toBe(false);
      expect(
        hasDirectionsDestination({
          name: '',
          address: '   ',
          city: '',
          coordinates: undefined,
        })
      ).toBe(false);
    });
  });

  describe('Component Rendering & Accessibility', () => {
    it('renders a Google Maps directions link with lat/lng coordinates when valid', () => {
      render(<BreweryDirectionsAction brewery={mockBreweryWithCoords} />);

      const link = screen.getByRole('link', { name: /Get Directions to Test Craft Brewery using exact coordinates/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute(
        'href',
        'https://www.google.com/maps/dir/?api=1&destination=39.4143,-77.4105'
      );
    });

    it('renders address query string fallback when coordinates are missing or invalid', () => {
      render(<BreweryDirectionsAction brewery={mockBreweryWithoutCoords} />);

      const link = screen.getByRole('link', { name: /Get Directions to Fallback Address Brewery using verified address/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining('https://www.google.com/maps/dir/?api=1&destination=')
      );
      expect(link.getAttribute('href')).toContain(encodeURIComponent('Fallback Address Brewery, 123 Main St, Frederick, MD 21701'));
    });

    it('renders both Google Maps and Apple Maps links when preferredApp="both"', () => {
      render(<BreweryDirectionsAction brewery={mockBreweryWithCoords} preferredApp="both" />);

      const googleLink = screen.getByRole('link', { name: /Get Directions to Test Craft Brewery via Google Maps/i });
      const appleLink = screen.getByRole('link', { name: /Get Directions to Test Craft Brewery via Apple Maps/i });

      expect(googleLink).toBeInTheDocument();
      expect(googleLink).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=39.4143,-77.4105');

      expect(appleLink).toBeInTheDocument();
      expect(appleLink).toHaveAttribute('href', 'https://maps.apple.com/?daddr=39.4143,-77.4105');
    });

    it('supports custom size and ensures touch target height for mobile accessibility', () => {
      render(<BreweryDirectionsAction brewery={mockBreweryWithCoords} size="lg" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('min-h-[44px]');
    });

    it('does not render anything when location details are completely missing', () => {
      const { container } = render(
        <BreweryDirectionsAction
          brewery={{
            name: '',
            address: '',
            city: '',
            coordinates: undefined,
          }}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
