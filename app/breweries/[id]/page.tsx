'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Globe, Clock, Beer as BeerIcon, ShieldAlert, Award, Star } from 'lucide-react';
import { mockBreweries } from '@/lib/data/mock-data';

interface BreweryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BreweryDetailPage({ params }: BreweryDetailPageProps) {
  const { id } = use(params);
  const brewery = mockBreweries.find((b) => b.id === id);

  if (!brewery) {
    notFound();
  }

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <Link
          href="/breweries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Brewery Directory
        </Link>

        {/* Hero Area */}
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm mb-10">
          <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={brewery.image}
              alt={brewery.name}
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
                    {brewery.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-sm border border-white/20">
                    {brewery.region} Region
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {brewery.name}
                </h1>
              </div>
              <div className="flex gap-2">
                <a
                  href={brewery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">About the Brewery</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                  {brewery.description}
                </p>
              </div>

              {/* Tap List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <BeerIcon className="w-5 h-5 text-amber-500 fill-current" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">On Tap Today</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brewery.beers.map((beer, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 leading-snug">
                            {beer.name}
                          </h3>
                          <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {beer.abv}% ABV
                          </span>
                        </div>
                        <span className="inline-block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {beer.style}
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                          {beer.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Taproom Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {brewery.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Hours of Operation */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Hours of Operation
                </h3>
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {brewery.hours.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850 last:border-0">
                      <span className="font-medium text-zinc-800 dark:text-zinc-300">{item.day}</span>
                      <span>{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact and Location */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Location &amp; Contact
                </h3>
                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div>
                    <span className="block font-semibold text-zinc-800 dark:text-zinc-300">Address</span>
                    <span>{brewery.address}, {brewery.city}, MD {brewery.zipCode}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-zinc-800 dark:text-zinc-300">Phone</span>
                    <span>{brewery.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
