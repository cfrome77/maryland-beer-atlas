import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { contentService } from '@/lib/services/content.service';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { TrailCard } from '@/components/ui/trail-card';
import { LoadingGrid } from '@/components/ui/loading-state';

export const metadata: Metadata = {
  title: "Maryland Beer Trails | Curated Craft Beer Itineraries & Road Trips",
  description: "Explore curated, self-guided Maryland beer trails. Plan craft beer road trips through historic Frederick, active hiking spots, and beautiful scenic coastal roads.",
  alternates: {
    canonical: "/trails",
  },
  openGraph: {
    title: "Maryland Beer Trails | Curated Craft Beer Itineraries",
    description: "Plan your ultimate self-guided Maryland beer road trip. Curated itineraries pairing beautiful scenic drives, historic streets, and scenic views with great craft beers.",
    type: "website",
    url: "https://marylandbeeratlas.com/trails",
  }
};

export default async function TrailsDirectoryPage() {
  const trails = await contentService.trails.getAll();

  const breadcrumbs = [
    { label: 'Trails', href: '/trails' },
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen flex flex-col">
      {/* PageHeader Component */}
      <PageHeader
        title="Maryland Beer Trails"
        description="Choose from our curated self-guided craft beer itineraries. Walk historical streets, explore rural farm valleys, or enjoy scenic waterfront roads while tasting incredible beers."
        breadcrumbs={breadcrumbs}
        badge="Curated Trails"
      />

      {/* PageContainer and Trail Listing Grid */}
      <PageContainer size="default">
        <Suspense fallback={<LoadingGrid count={2} type="trail" className="grid-cols-1 md:grid-cols-2" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </Suspense>
      </PageContainer>
    </div>
  );
}
