'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Brewery, BeerTrail } from '@/lib/types';

const MapView = dynamic(
  () => import('@/components/ui/map-view'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading Trail Itinerary Map...</p>
        </div>
      </div>
    ),
  }
);

interface TrailMapViewProps {
  breweries: Brewery[];
  trail: BeerTrail;
}

export function TrailMapView({ breweries, trail }: TrailMapViewProps) {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(breweries[0] || null);

  return (
    <div className="w-full h-[400px] md:h-[450px]">
      <MapView
        breweries={breweries}
        selectedBrewery={selectedBrewery}
        onSelectBrewery={(b) => setSelectedBrewery(b)}
        trails={[trail]}
        activeTrailId={trail.id}
        className="w-full h-full"
      />
    </div>
  );
}
