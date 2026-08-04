'use client';

import React, { Suspense } from 'react';
import { mockTrails } from '@/lib/data/mock-data';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { TrailCard } from '@/components/ui/trail-card';
import { LoadingGrid } from '@/components/ui/loading-state';

export default function TrailsDirectoryPage() {
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
            {mockTrails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </Suspense>
      </PageContainer>
    </div>
  );
}
