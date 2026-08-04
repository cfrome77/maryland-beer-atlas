import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Compass, MapPin, Star, Beer as BeerIcon } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';

interface TrailDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrailDetailPage({ params }: TrailDetailPageProps) {
  const { id } = await params;
  const trail = await contentService.trails.getById(id);

  if (!trail) {
    notFound();
  }

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <Link
          href="/trails"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Beer Trails
        </Link>

        {/* Trail Banner */}
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm mb-10">
          <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={trail.image}
              alt={trail.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-sm">
                    {trail.region} Region
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm border border-white/20">
                    {trail.distance} • {trail.duration}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {trail.name}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Trail Description & Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-zinc-100 dark:border-zinc-850 pb-8">
              <div className="md:col-span-8 space-y-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Overview</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                  {trail.description}
                </p>
              </div>
              <div className="md:col-span-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-current" />
                  Trail Highlight
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                  {trail.highlight}
                </p>
              </div>
            </div>

            {/* Brewery Itinerary Timeline */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Compass className="w-6 h-6 text-amber-500" />
                Trail Stops &amp; Itinerary
              </h2>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-6 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800 before:pointer-events-none">
                {trail.breweries.map((brewery, index) => (
                  <div key={brewery.id} className="relative pl-10 md:pl-16">
                    {/* Circle Node on Timeline */}
                    <div className="absolute left-1.5 md:left-3 top-2.5 w-5 h-5 md:w-7 md:h-7 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs md:text-sm flex items-center justify-center border-4 border-zinc-100 dark:border-zinc-900 shadow-md ring-2 ring-amber-500/20 z-10">
                      {index + 1}
                    </div>

                    {/* Brewery Stop Card */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                      {/* Photo */}
                      <div className="md:col-span-4 relative aspect-video md:aspect-auto rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <Image
                          src={brewery.image}
                          alt={brewery.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 250px"
                          className="object-cover"
                        />
                      </div>

                      {/* Info details */}
                      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                              {brewery.type}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                              <MapPin className="w-3 h-3 text-amber-500" />
                              {brewery.city}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                            {brewery.name}
                          </h3>
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                            {brewery.description}
                          </p>
                        </div>

                        {/* On tap brief */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            <BeerIcon className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            Styles: <span className="font-bold text-zinc-800 dark:text-zinc-200">{brewery.beerStyles.slice(0, 2).join(', ')}</span>
                          </div>
                          <Link
                            href={`/breweries/${brewery.slug}`}
                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 self-start"
                          >
                            Explore Stop Detail &rarr;
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
