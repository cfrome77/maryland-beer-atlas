import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Globe, Clock, Beer as BeerIcon, Calendar } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';

interface BreweryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BreweryDetailPage({ params }: BreweryDetailPageProps) {
  const { slug } = await params;
  const brewery = await contentService.breweries.getBySlug(slug);

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
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                    {brewery.county} County
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {brewery.name}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={brewery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
                {brewery.socialLinks.instagram && (
                  <a
                    href={brewery.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/50 transition-colors backdrop-blur-sm"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
                {brewery.socialLinks.facebook && (
                  <a
                    href={brewery.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/50 transition-colors backdrop-blur-sm"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}
                {brewery.socialLinks.twitter && (
                  <a
                    href={brewery.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/50 transition-colors backdrop-blur-sm"
                    aria-label="Twitter"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">About the Brewery</h2>
                  <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Last Verified: {brewery.lastVerified}</span>
                  </div>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                  {brewery.description}
                </p>
              </div>

              {/* Live Tap List CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/5 dark:to-zinc-900 border border-amber-500/20 space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                    <BeerIcon className="w-6 h-6 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Looking for what&apos;s on tap?</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Tap lists change frequently. Check {brewery.name}&apos;s official resources for their up-to-the-minute draft, can, and bottle offerings!
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-1 pl-0 md:pl-14">
                  <a
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold transition-colors shadow-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Official Website
                  </a>
                  {brewery.socialLinks.instagram && (
                    <a
                      href={brewery.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-sm font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      Check Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Beer Styles */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Specialty Beer Styles</h2>
                <div className="flex flex-wrap gap-2">
                  {brewery.beerStyles.map((style, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-sm bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold"
                    >
                      {style}
                    </span>
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
                    <span className="block font-semibold text-zinc-800 dark:text-zinc-300">County</span>
                    <span>{brewery.county} County</span>
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
