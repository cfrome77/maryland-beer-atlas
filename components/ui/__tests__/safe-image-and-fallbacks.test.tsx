import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SafeImage, isValidImageSrc, DEFAULT_PLACEHOLDER } from '@/components/ui/safe-image';
import { BreweryCard } from '@/components/ui/brewery-card';
import { RecommendationsPanel } from '@/components/ui/recommendations/recommendations-panel';
import { Brewery } from '@/lib/types';
import { Recommendation } from '@/lib/services/recommendation.service';

// Mock next/image to render a standard HTML <img> element in JSDOM tests
vi.mock('next/image', () => ({
  default: function DummyImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
    const { fill, priority, alt = '', ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...rest} data-fill={fill ? 'true' : 'false'} data-priority={priority ? 'true' : 'false'} />;
  },
}));

describe('Image Safety & Fallback Test Suite', () => {
  describe('isValidImageSrc Utility', () => {
    it('identifies valid HTTP, HTTPS, and local relative image paths', () => {
      expect(isValidImageSrc('https://images.unsplash.com/photo-123')).toBe(true);
      expect(isValidImageSrc('http://example.com/brewery.jpg')).toBe(true);
      expect(isValidImageSrc('/images/brewery-placeholder.svg')).toBe(true);
    });

    it('identifies invalid, empty, whitespace, and non-string image sources', () => {
      expect(isValidImageSrc('')).toBe(false);
      expect(isValidImageSrc('   ')).toBe(false);
      expect(isValidImageSrc(null)).toBe(false);
      expect(isValidImageSrc(undefined)).toBe(false);
      expect(isValidImageSrc('invalid-url-string')).toBe(false);
      expect(isValidImageSrc('javascript:alert(1)')).toBe(false);
    });
  });

  describe('SafeImage Component', () => {
    it('renders valid image source directly', () => {
      render(
        <SafeImage
          src="https://images.unsplash.com/photo-1550345332-09e3ac987658"
          alt="Flying Dog Brewery"
          width={400}
          height={300}
        />
      );

      const img = screen.getByAltText('Flying Dog Brewery');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1550345332-09e3ac987658');
    });

    it('falls back to default placeholder SVG when src is empty or invalid', () => {
      render(
        <SafeImage
          src=""
          alt="Brewery without photo"
          width={400}
          height={300}
        />
      );

      const img = screen.getByAltText('Brewery without photo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', DEFAULT_PLACEHOLDER);
    });

    it('switches to fallback placeholder when onError fires on image load failure', () => {
      render(
        <SafeImage
          src="https://images.unsplash.com/broken-photo-404"
          alt="Broken Remote Photo"
          width={400}
          height={300}
        />
      );

      const img = screen.getByAltText('Broken Remote Photo');
      expect(img).toHaveAttribute('src', 'https://images.unsplash.com/broken-photo-404');

      // Simulate browser image error event
      fireEvent.error(img);

      expect(img).toHaveAttribute('src', DEFAULT_PLACEHOLDER);
    });

    it('renders icon fallback UI container when showIconFallbackOnFailure is enabled and error occurs', () => {
      render(
        <SafeImage
          src="invalid-src"
          alt="Missing Taproom Image"
          showIconFallbackOnFailure
        />
      );

      // Should render the fallback container with label
      expect(screen.getByLabelText('Missing Taproom Image')).toBeInTheDocument();
      expect(screen.getByText('Missing Taproom Image')).toBeInTheDocument();
    });
  });

  describe('Surfaces & UI Components Image Resilience', () => {
    const mockBreweryNoImage: Brewery = {
      id: 'b-no-img',
      slug: 'no-image-brewery',
      name: 'No Image Brewery',
      type: 'Microbrewery',
      region: 'Central',
      status: 'Open',
      address: '100 Main St',
      city: 'Annapolis',
      county: 'Anne Arundel',
      state: 'MD',
      zipCode: '21401',
      phone: '410-555-1234',
      website: 'https://noimage.com',
      socialLinks: {},
      coordinates: { lat: 38.9784, lng: -76.4922 },
      description: 'A brewery without an explicit photo.',
      image: '',
      hours: [],
      structuredHours: [],
      beerStyles: ['IPA'],
      amenities: [],
      featured: false,
      lastVerified: '2025-06-01',
      verificationSource: 'Official Website',
      verificationStatus: 'Verified',
    };

    it('renders BreweryCard safely when brewery.image is empty string', () => {
      render(<BreweryCard brewery={mockBreweryNoImage} />);

      expect(screen.getByText('No Image Brewery')).toBeInTheDocument();
      const img = screen.getByAltText('No Image Brewery');
      expect(img).toHaveAttribute('src', DEFAULT_PLACEHOLDER);
    });

    it('renders RecommendationsPanel safely when brewery image is missing or broken', () => {
      const mockRecommendations: Recommendation[] = [
        {
          brewery: mockBreweryNoImage,
          source: 'curated',
          reason: 'Great local atmosphere',
          tags: ['Dog-Friendly'],
        },
      ];

      render(<RecommendationsPanel recommendations={mockRecommendations} />);

      expect(screen.getAllByText('No Image Brewery').length).toBeGreaterThan(0);
      expect(screen.getByLabelText('No Image Brewery')).toBeInTheDocument();
    });
  });
});
