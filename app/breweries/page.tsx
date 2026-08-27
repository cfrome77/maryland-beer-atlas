import React from 'react';
import type { Metadata } from 'next';
import { contentService } from '@/lib/services/content.service';
import { recommendationService } from '@/lib/services/recommendation.service';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';

export const metadata: Metadata = {
  title: "Maryland Brewery Directory | Find Local MD Craft Breweries",
  description: "Browse and filter Maryland craft breweries by region, county, brewery type, and amenities. Search for dog-friendly breweries or find your new favorite taproom.",
  openGraph: {
    title: "Maryland Brewery Directory | Find Local MD Craft Breweries",
    description: "Complete database of Maryland's craft breweries. Filter by county, region, amenities (like dog friendly), or type to map out your next visit.",
    type: "website",
    url: "https://marylandbeeratlas.com/breweries",
  }
};

export default async function BreweriesDirectoryPage() {
  const breweries = await contentService.breweries.getAll();
  const guides = await contentService.guides.getAll();

  // Fetch curated recommendations (no user location by default). Guides and featured breweries
  // will surface as 'curated' editorial recommendations. Computed nearby suggestions require
  // a location; client-side location handling can be added later. We return up to 6 nearby items
  // when a location is provided; for now just include curated items and any featured breweries.
  const recommendations = await recommendationService.getRecommendationsForLocation(null, { nearbyMaxMiles: 40, nearbyLimit: 6 });

  const breadcrumbs = [
    { label: 'Directory', href: '/breweries' },
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen flex flex-col">
      {/* Refactored PageHeader */}
      <PageHeader
        title="Maryland Brewery Directory"
        description="Explore and filter through our comprehensive atlas of local Maryland breweries. Search by style, region, or city to find your next perfect pint."
        breadcrumbs={breadcrumbs}
        badge="Brewery Atlas"
      />

      {/* PageContainer structure */}
      <PageContainer size="default">
        <BreweriesDirectoryContainer breweries={breweries} guides={guides} recommendations={recommendations} />
      </PageContainer>
    </div>
  );
}
