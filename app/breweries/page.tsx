import React from 'react';
import { contentService } from '@/lib/services/content.service';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { BreweriesDirectoryContainer } from '@/components/ui/breweries-directory-content';

export default async function BreweriesDirectoryPage() {
  const breweries = await contentService.breweries.getAll();

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
        <BreweriesDirectoryContainer breweries={breweries} />
      </PageContainer>
    </div>
  );
}
