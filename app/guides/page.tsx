import React from 'react';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { GuidesDirectoryContent } from '@/components/ui/guides-directory-content';

export const metadata: Metadata = {
  title: 'Maryland Beer Travel Guides & Editorial Articles | Maryland Beer Atlas',
  description:
    'Read expert Maryland craft beer travel guides, regional brewery tours, trip-planning itineraries, curated recommendations, and Maryland beer history.',
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title: 'Maryland Beer Travel Guides & Editorial Articles',
    description:
      'Expertly curated travel guides exploring Maryland’s craft beer regions, complete with canonical brewery stop suggestions, trails, and regional tips.',
    type: 'website',
    url: 'https://marylandbeeratlas.com/guides',
  },
};

export default async function TravelGuidesDirectoryPage() {
  const guides = await contentService.guides.getAll();

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Header */}
        <div className="text-left mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-amber-500 shrink-0" />
            Maryland Beer Travel Guides
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl leading-relaxed">
            Get insider advice, regional tourism highlights, and curated itineraries. Our travel experts share the finest details about exploring Maryland&apos;s rich historical landscape, farm breweries, and coastal taprooms.
          </p>
        </div>

        {/* Interactive Guides Directory Container */}
        <GuidesDirectoryContent initialGuides={guides} />
      </div>
    </div>
  );
}
