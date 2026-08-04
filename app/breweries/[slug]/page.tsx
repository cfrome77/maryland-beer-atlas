'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Clock,
  Beer as BeerIcon,
  ShieldCheck,
  Calendar,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import { mockBreweries } from '@/lib/data/mock-data';
import { PageContainer } from '@/components/layout/page-container';

// Custom robust inline SVG components for socials to ensure 100% compatibility across all environment versions
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface BreweryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BreweryDetailPage({ params }: BreweryDetailPageProps) {
  const { slug } = use(params);
  const brewery = mockBreweries.find((b) => b.slug === slug);

  if (!brewery) {
    notFound();
  }

  // Format the last verified date nicely (e.g., "May 10, 2025")
  const formatVerifiedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="py-10 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <PageContainer size="default">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/breweries" className="hover:text-amber-500 transition-colors">Breweries</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{brewery.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          href="/breweries"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Brewery Directory
        </Link>

        {/* Hero Card Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm mb-8">
          <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={brewery.image}
              alt={brewery.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-zinc-950/10" />

            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 shadow-sm">
                    {brewery.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-md border border-white/20">
                    {brewery.region} Region
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                    {brewery.county}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                  {brewery.name}
                </h1>
              </div>
              <div className="flex gap-2">
                <a
                  href={brewery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-colors flex items-center gap-2 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Details (LHS) */}
            <div className="lg:col-span-8 space-y-8">
              {/* About description */}
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  About the Taproom
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
                  {brewery.description}
                </p>
              </div>

              {/* Beer Styles focus badges */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Beer Style Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {brewery.beerStyles.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1.5 rounded-xl text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 font-bold"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured / Tap List */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-2 pb-1">
                  <BeerIcon className="w-5 h-5 text-amber-500 fill-current" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">On Tap Highlights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brewery.beers.map((beer, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-2.5 flex flex-col justify-between hover:shadow-sm transition-shadow"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 leading-snug">
                            {beer.name}
                          </h3>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                            {beer.abv}% ABV
                          </span>
                        </div>
                        <span className="inline-block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
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

              {/* Amenities checkboxes */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Taproom Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {brewery.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium"
                    >
                      <div className="p-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Details (RHS) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Last Verified Indicator Badge Box */}
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200/50 dark:border-emerald-800/20 flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Verified Listing</span>
                  <span className="block text-xs text-zinc-600 dark:text-zinc-300 font-medium">Last updated: <strong className="font-bold">{formatVerifiedDate(brewery.lastVerified)}</strong></span>
                </div>
              </div>

              {/* Hours of Operation */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Operating Hours
                </h3>
                <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {brewery.hours.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850/50 last:border-0">
                      <span className="font-bold text-zinc-800 dark:text-zinc-300">{item.day}</span>
                      <span className="font-medium">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location and Contact */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Contact &amp; Location
                </h3>
                <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
                  <div>
                    <span className="block font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider mb-1 text-[10px]">Street Address</span>
                    <span className="block font-medium">{brewery.address}</span>
                    <span className="block font-medium">{brewery.city}, MD {brewery.zipCode}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider mb-1 text-[10px]">County Location</span>
                    <span className="block font-bold text-amber-600 dark:text-amber-400">{brewery.county}</span>
                  </div>
                  {brewery.phone && (
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-850">
                      <span className="block font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider mb-1 text-[10px]">Phone Number</span>
                      <a href={`tel:${brewery.phone}`} className="block font-semibold hover:text-amber-500 transition-colors text-zinc-900 dark:text-zinc-50 text-sm">
                        {brewery.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media Links block */}
              {brewery.socialLinks && (Object.keys(brewery.socialLinks).length > 0) && (
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                    Follow on Socials
                  </h3>
                  <div className="flex items-center gap-3">
                    {brewery.socialLinks.facebook && (
                      <a
                        href={brewery.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:text-amber-500 text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
                        title="Facebook Profile"
                      >
                        <FacebookIcon className="w-5 h-5" />
                      </a>
                    )}
                    {brewery.socialLinks.instagram && (
                      <a
                        href={brewery.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:text-amber-500 text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
                        title="Instagram Profile"
                      >
                        <InstagramIcon className="w-5 h-5" />
                      </a>
                    )}
                    {brewery.socialLinks.twitter && (
                      <a
                        href={brewery.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:text-amber-500 text-zinc-500 dark:text-zinc-400 transition-all shadow-sm"
                        title="Twitter / X Profile"
                      >
                        <TwitterIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
