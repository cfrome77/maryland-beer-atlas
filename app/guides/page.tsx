'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, User, ArrowRight, Compass } from 'lucide-react';
import { mockGuides } from '@/lib/data/mock-data';

export default function TravelGuidesDirectoryPage() {
  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Header */}
        <div className="text-left mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-amber-500" />
            Maryland Beer Travel Guides
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl">
            Get insider advice, regional tourism highlights, and curated itineraries. Our travel experts share the finest details about exploring Maryland&apos;s rich historical landscape and coastal breweries.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockGuides.map((guide) => (
            <div
              key={guide.slug}
              className="group rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo banner */}
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-950/85 text-white backdrop-blur-sm">
                      {guide.region} Region
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-8 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      By {guide.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {guide.publishDate}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-tight">
                    {guide.title}
                  </h3>

                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="px-8 pb-8 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                  <Compass className="w-4 h-4 text-amber-500" />
                  Includes {guide.recommendedStops.length} recommended {guide.recommendedStops.length === 1 ? 'stop' : 'stops'}
                </span>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold transition-colors inline-flex items-center gap-1.5 border border-zinc-800"
                >
                  Read Travel Guide
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
