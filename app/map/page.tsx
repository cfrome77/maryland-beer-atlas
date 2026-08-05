import React from 'react';
import type { Metadata } from 'next';
import { contentService } from '@/lib/services/content.service';
import { InteractiveMapContent } from '@/components/ui/interactive-map-content';

export const metadata: Metadata = {
  title: "Interactive Maryland Beer Map | Locate MD Craft Breweries",
  description: "Use our interactive map of Maryland to locate and explore craft breweries throughout the state. Filter by region to plan your perfect taproom tour.",
  openGraph: {
    title: "Interactive Maryland Beer Map | Locate MD Craft Breweries",
    description: "Map and locate Maryland's craft breweries geographically. Plan routes and filter by region with our interactive map.",
    type: "website",
    url: "https://marylandbeeratlas.com/map",
  }
};

export default async function InteractiveMapPage() {
  const breweries = await contentService.breweries.getAll();
  const guides = await contentService.guides.getAll();

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Header */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Interactive Maryland Beer Map
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl">
            Locate and explore craft breweries throughout Maryland. Select regions to filter the map, then tap on marker dots or the sidebar list to see rich taproom details.
          </p>
        </div>

        {/* Interactive Map Component Content */}
        <InteractiveMapContent breweries={breweries} guides={guides} />
      </div>
    </div>
  );
}
