import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TravelGuidesDirectoryPage from '@/app/guides/page';
import GuideDetailPage from '@/app/guides/[slug]/page';
import { portableTextToHtml } from '@/lib/repositories/sanity/guide';
import { MockGuideRepository } from '@/lib/repositories/mock';

describe('Guide Editorial System & Components', () => {
  it('converts Portable Text blocks into clean structured HTML', () => {
    const sampleBlocks = [
      {
        _type: 'block',
        style: 'h2',
        children: [{ text: 'Historic Breweries' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          { text: 'This is ' },
          { text: 'bold text', marks: ['strong'] },
          { text: ' in Maryland.' },
        ],
      },
      {
        _type: 'image',
        asset: { url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658' },
        alt: 'Sample photo',
        caption: 'Beautiful patio view',
      },
    ];

    const html = portableTextToHtml(sampleBlocks);
    expect(html).toContain('<h2>Historic Breweries</h2>');
    expect(html).toContain('<p>This is <strong>bold text</strong> in Maryland.</p>');
    expect(html).toContain('<img src="https://images.unsplash.com/photo-1550345332-09e3ac987658" alt="Sample photo"');
    expect(html).toContain('Beautiful patio view');
  });

  it('fetches mock guides with rich guide types, categories, and SEO metadata', async () => {
    const repo = new MockGuideRepository();
    const guides = await repo.getAll();

    expect(guides.length).toBeGreaterThanOrEqual(5);

    const regionalGuide = await repo.getBySlug('beers-of-eastern-shore');
    expect(regionalGuide).not.toBeNull();
    expect(regionalGuide?.guideType).toBe('regional_guide');
    expect(regionalGuide?.county).toBe('Worcester');
    expect(regionalGuide?.seo?.metaTitle).toContain('Eastern Shore');
    expect(regionalGuide?.recommendedStops).toHaveLength(1);
    expect(regionalGuide?.recommendedStops[0].name).toBe('Burley Oak Brewing Company');

    const educationGuide = await repo.getBySlug('maryland-farm-brewery-revolution');
    expect(educationGuide).not.toBeNull();
    expect(educationGuide?.guideType).toBe('education');
  });

  it('renders travel guides directory page with filter tabs and guide cards', async () => {
    const pageJsx = await TravelGuidesDirectoryPage();
    render(pageJsx);

    expect(screen.getByRole('heading', { level: 1, name: /Maryland Beer Travel Guides/i })).toBeInTheDocument();

    // Filter tabs
    expect(screen.getByRole('tab', { name: /All Guides/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Regional Guides/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Beer Education/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Curated Picks/i })).toBeInTheDocument();

    // Click on Beer Education tab
    const eduTab = screen.getByRole('tab', { name: /Beer Education/i });
    fireEvent.click(eduTab);

    expect(screen.getByText(/The Farm Brewery Revolution: Agricultural Craft Beer in Maryland/i)).toBeInTheDocument();
  });

  it('renders guide detail page with JSON-LD schema, canonical brewery stops, tips, and related trails', async () => {
    const pageJsx = await GuideDetailPage({
      params: Promise.resolve({ slug: 'frederick-historic-brews' }),
    });

    render(pageJsx);

    // Header & Meta
    expect(screen.getByRole('heading', { level: 1, name: /Historic Sips: Touring Frederick's Industrial Breweries/i })).toBeInTheDocument();
    expect(screen.getByText(/Central Region/i)).toBeInTheDocument();
    expect(screen.getByText(/Frederick County/i)).toBeInTheDocument();
    expect(screen.getByText(/By Brewmaster Pete/i)).toBeInTheDocument();

    // Recommended Brewery Stops (reusing canonical facts)
    expect(screen.getByText(/Featured Brewery Stops \(2\)/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Flying Dog Brewery/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Monocacy Brewing Company/i })).toBeInTheDocument();

    // Associated Trail
    expect(screen.getByText(/Associated Beer Trails/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Frederick City Beer Trail/i })).toBeInTheDocument();

    // Expert Tips
    expect(screen.getByText(/Expert Advice/i)).toBeInTheDocument();
    expect(screen.getByText(/Bring your hiking shoes/i)).toBeInTheDocument();
  });
});
