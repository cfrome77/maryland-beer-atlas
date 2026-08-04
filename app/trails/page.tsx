'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, Clock, MapPin, ArrowRight, Star } from 'lucide-react';
import { mockTrails } from '@/lib/data/mock-data';

export default function TrailsDirectoryPage() {
  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Header */}
        <div className="text-left mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Compass className="w-10 h-10 text-amber-500" />
            Maryland Beer Trails
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl">
            Choose from our curated self-guided craft beer itineraries. Walk historical streets, explore rural farm valleys, or enjoy scenic waterfront roads while tasting incredible beers.
          </p>
        </div>

        {/* Trail List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockTrails.map((trail) => (
            <div
              key={trail.id}
              className="group rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={trail.image}
                    alt={trail.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-950/85 text-white backdrop-blur-sm">
                      {trail.region} Region
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  {/* Distance and Duration specs */}
                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      {trail.distance}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {trail.duration}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-tight">
                    {trail.name}
                  </h3>

                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {trail.description}
                  </p>

                  {/* Highlights section inside listing */}
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl flex gap-3">
                    <Star className="w-5 h-5 text-amber-500 fill-current shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-semibold text-xs text-zinc-800 dark:text-zinc-200">Trail Highlight</span>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 leading-relaxed">{trail.highlight}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action and details bar */}
              <div className="px-8 pb-8 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Includes <span className="font-bold text-zinc-800 dark:text-zinc-200">{trail.breweries.length}</span> curated stops
                </span>
                <Link
                  href={`/trails/${trail.id}`}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold transition-colors inline-flex items-center gap-1.5 border border-zinc-800"
                >
                  Explore Trail Itinerary
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
