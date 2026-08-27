import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Clock,
  Beer as BeerIcon,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Users,
  Info,
  Sparkles,
  Phone,
  Compass,
  Utensils,
  Lightbulb,
  Bookmark,
  ChevronRight,
  Tag,
  Building2,
} from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { getDataFreshnessInfo } from '@/lib/utils/freshness';
import { isBreweryOpenNow } from '@/lib/utils/hours';
import { BreweryStatusBadge, BreweryFreshnessBadge } from '@/components/ui/brewery-status-badge';
import BreweryDetailMap from '@/components/ui/brewery-detail-map';

interface BreweryDetailPageProps {
  params: Promise<{ slug: string }>;
}

function slugifyCounty(countyName: string): string {
  return countyName
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateMetadata({ params }: BreweryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brewery = await contentService.breweries.getBySlug(slug);

  if (!brewery) {
    return {
      title: 'Brewery Not Found | Maryland Beer Atlas',
    };
  }

  const isDogFriendly = brewery.amenities?.some((a) => a.toLowerCase().includes('dog friendly'));
  const dogFriendlyText = isDogFriendly ? 'Dog-friendly taproom. ' : '';
  const stylesText = brewery.beerStyles?.length ? `Specialty styles: ${brewery.beerStyles.join(', ')}. ` : '';

  return {
    title: `${brewery.name} | ${brewery.city}, MD Craft Brewery Details`,
    description: `Visit ${brewery.name} in ${brewery.city}, MD (${brewery.county} County). ${dogFriendlyText}${stylesText}View hours, amenities, interactive map, and editorial guide.`,
    alternates: {
      canonical: `/breweries/${slug}`,
    },
    openGraph: {
      title: `${brewery.name} | ${brewery.city}, MD Brewery`,
      description: brewery.description,
      type: 'article',
      url: `https://marylandbeeratlas.com/breweries/${slug}`,
      images: brewery.image
        ? [
            {
              url: brewery.image,
              alt: brewery.name,
            },
          ]
        : [],
    },
  };
}

export default async function BreweryDetailPage({ params }: BreweryDetailPageProps) {
  const { slug } = await params;
  const brewery = await contentService.breweries.getBySlug(slug);

  if (!brewery) {
    notFound();
  }

  const openStatus = isBreweryOpenNow(brewery);
  const freshness = getDataFreshnessInfo(brewery);
  const countySlug = slugifyCounty(brewery.county);

  // Social links filter
  const socialSameAs: string[] = [];
  if (brewery.socialLinks?.facebook) socialSameAs.push(brewery.socialLinks.facebook);
  if (brewery.socialLinks?.instagram) socialSameAs.push(brewery.socialLinks.instagram);
  if (brewery.socialLinks?.twitter) socialSameAs.push(brewery.socialLinks.twitter);

  // Schema.org JSON-LD
  const brewerySchema = {
    '@context': 'https://schema.org',
    '@type': brewery.type === 'Brewpub' ? 'Brewery' : ['Brewery', 'LocalBusiness'],
    name: brewery.name,
    description: brewery.description,
    image: brewery.image || undefined,
    telephone: brewery.phone || undefined,
    url: brewery.website || undefined,
    sameAs: socialSameAs.length > 0 ? socialSameAs : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: brewery.address,
      addressLocality: brewery.city,
      addressRegion: brewery.state || 'MD',
      postalCode: brewery.zipCode,
      addressCountry: 'US',
    },
    geo: brewery.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: brewery.coordinates.lat,
          longitude: brewery.coordinates.lng,
        }
      : undefined,
    openingHoursSpecification: brewery.hours
      ? brewery.hours.map((item) => {
          const parts = item.hours.split(' - ');
          return {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: item.day,
            opens: parts[0] || '',
            closes: parts[1] || '',
          };
        })
      : [],
    servesCuisine: 'Craft Beer',
    amenityFeature: brewery.amenities
      ? brewery.amenities.map((a) => ({
          '@type': 'LocationFeatureSpecification',
          name: a,
          value: true,
        }))
      : [],
  };

  return (
    <article className="py-8 md:py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen text-zinc-900 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brewerySchema) }}
      />
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* Navigation / Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between">
          <Link
            href="/breweries"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brewery Directory
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/breweries" className="hover:underline">
              Breweries
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/breweries/county/${countySlug}`} className="hover:underline">
              {brewery.county} County
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
              {brewery.name}
            </span>
          </div>
        </nav>

        {/* Hero Card Area */}
        <header className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-zinc-900">
            {brewery.image ? (
              <Image
                src={brewery.image}
                alt={brewery.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-500">
                <Building2 className="w-16 h-16 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            {/* Badges and Main Title */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 shadow-sm">
                    {brewery.type}
                  </span>
                  <BreweryStatusBadge brewery={brewery} size="md" showDetail={true} />
                  <BreweryFreshnessBadge brewery={brewery} size="md" />
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
                    {brewery.region} Region
                  </span>
                  <Link
                    href={`/breweries/county/${countySlug}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40 backdrop-blur-md border border-emerald-500/30 transition-colors"
                  >
                    {brewery.county} County
                  </Link>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {brewery.name}
                </h1>

                <div className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-medium">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {brewery.address}, {brewery.city}, MD {brewery.zipCode}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {brewery.website && (
                  <a
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}

                {brewery.phone && (
                  <a
                    href={`tel:${brewery.phone.replace(/\D/g, '')}`}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/60 transition-all backdrop-blur-md flex items-center gap-1.5 active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">{brewery.phone}</span>
                    <span className="sm:hidden">Call</span>
                  </a>
                )}

                {/* Social Links */}
                {brewery.socialLinks?.instagram && (
                  <a
                    href={brewery.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 transition-colors backdrop-blur-md flex items-center justify-center min-w-[42px] min-h-[42px]"
                    aria-label="Instagram Page"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}

                {brewery.socialLinks?.facebook && (
                  <a
                    href={brewery.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 transition-colors backdrop-blur-md flex items-center justify-center min-w-[42px] min-h-[42px]"
                    aria-label="Facebook Page"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}

                {brewery.socialLinks?.twitter && (
                  <a
                    href={brewery.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700/60 transition-colors backdrop-blur-md flex items-center justify-center min-w-[42px] min-h-[42px]"
                    aria-label="Twitter Page"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Operating Notice Banner */}
            {openStatus.category !== 'open' && (
              <div
                className={`p-5 rounded-2xl border space-y-2 ${
                  openStatus.category === 'permanently_closed'
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-300'
                    : openStatus.category === 'temporarily_closed'
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-300'
                    : 'bg-zinc-500/10 border-zinc-500/25 text-zinc-800 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Operating Notice</span>
                </div>
                <p className="text-sm leading-relaxed">
                  {openStatus.category === 'hours_unavailable'
                    ? 'Structured operating hours for this location are currently unverified. Re-verification directly with official brewery channels is recommended before visiting.'
                    : brewery.statusNotes || openStatus.reason}
                </p>
                {brewery.statusUpdatedAt && (
                  <span className="block text-[10px] text-zinc-500">
                    Notice last updated: {brewery.statusUpdatedAt}
                  </span>
                )}
              </div>
            )}

            {/* About / Editorial Storytelling Section */}
            <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  About the Brewery
                </h2>
                <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Last Verified: {brewery.lastVerified || 'Unverified'}</span>
                </div>
              </div>

              {brewery.description ? (
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed">
                  {brewery.description}
                </p>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm italic">
                  Editorial narrative description for {brewery.name} is currently being updated by our editors.
                </p>
              )}

              {/* Editor Notes & Curated Badges if available */}
              {brewery.curatedContent && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Editor&apos;s Notes</span>
                  </div>
                  {brewery.curatedContent.editorNotes && (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                      &ldquo;{brewery.curatedContent.editorNotes}&rdquo;
                    </p>
                  )}
                  {brewery.curatedContent.curatedTags && brewery.curatedContent.curatedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {brewery.curatedContent.curatedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/25"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Useful Highlights & Atmosphere Section */}
            {((brewery.highlights && brewery.highlights.length > 0) ||
              (brewery.atmosphere && brewery.atmosphere.length > 0)) && (
              <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Useful Highlights &amp; Atmosphere
                </h2>

                {brewery.highlights && brewery.highlights.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Key Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {brewery.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5"
                        >
                          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {brewery.atmosphere && brewery.atmosphere.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <h3 className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      Atmosphere &amp; Ambiance Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {brewery.atmosphere.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Staff Recommendations / Editorial Picks Section */}
            {brewery.editorialRecommendations && brewery.editorialRecommendations.length > 0 && (
              <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  Editorial Recommendations &amp; Staff Picks
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brewery.editorialRecommendations.map((rec, idx) => {
                    const isBeer = rec.category === 'beer';
                    const isFood = rec.category === 'food';
                    const isTiming = rec.category === 'timing';

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isBeer
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : isFood
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : isTiming
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                            }`}
                          >
                            {isBeer && <BeerIcon className="w-4 h-4" />}
                            {isFood && <Utensils className="w-4 h-4" />}
                            {isTiming && <Clock className="w-4 h-4" />}
                            {!isBeer && !isFood && !isTiming && <Lightbulb className="w-4 h-4" />}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                            {rec.category === 'beer'
                              ? 'Must-Try Draft'
                              : rec.category === 'food'
                              ? 'Food & Bite'
                              : rec.category === 'timing'
                              ? 'Best Time to Visit'
                              : 'Local Tip'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{rec.title}</h3>
                        {rec.notes && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{rec.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Live Tap List CTA */}
            <section className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-zinc-900/10 dark:from-amber-500/10 dark:to-zinc-950 border border-amber-500/20 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <BeerIcon className="w-6 h-6 fill-current" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                    Looking for what&apos;s on tap today?
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Tap lists rotate rapidly. Check {brewery.name}&apos;s official channels for up-to-the-minute draft, bottle, and can releases!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1 pl-0 md:pl-16">
                {brewery.website && (
                  <a
                    href={brewery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold transition-colors shadow-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Official Website
                  </a>
                )}
                {brewery.socialLinks?.instagram && (
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
            </section>

            {/* Specialty Beer Styles & Amenities */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Beer Styles */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Specialty Beer Styles</h2>
                {brewery.beerStyles && brewery.beerStyles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {brewery.beerStyles.map((style, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 font-bold"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No specific specialty styles recorded.</p>
                )}
              </div>

              {/* Taproom Amenities */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Taproom Amenities</h2>
                {brewery.amenities && brewery.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {brewery.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No amenities specified for this location.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Interactive Map & Location Card */}
            <section className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                Map &amp; Location
              </h2>

              <BreweryDetailMap brewery={brewery} />

              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300">County</span>
                  <Link
                    href={`/breweries/county/${countySlug}`}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {brewery.county} County
                  </Link>
                </div>

                {brewery.phone && (
                  <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-300">Phone</span>
                    <a
                      href={`tel:${brewery.phone.replace(/\D/g, '')}`}
                      className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      {brewery.phone}
                    </a>
                  </div>
                )}

                {brewery.website && (
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-300">Website</span>
                    <a
                      href={brewery.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-amber-600 dark:text-amber-400 hover:underline truncate max-w-[140px]"
                    >
                      Official Link
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Operating Hours Card */}
            <section className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Hours of Operation
                </h2>
                <BreweryStatusBadge brewery={brewery} size="sm" />
              </div>

              {brewery.structuredHours && brewery.structuredHours.length > 0 ? (
                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {brewery.structuredHours.map((item, idx) => {
                    const formatTime = (t: string) => {
                      const [h, m] = t.split(':');
                      const hour = parseInt(h, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const formattedHour = hour % 12 || 12;
                      return `${formattedHour}:${m} ${ampm}`;
                    };

                    return (
                      <div
                        key={idx}
                        className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850 last:border-0"
                      >
                        <span className="font-semibold text-zinc-800 dark:text-zinc-300">{item.day}</span>
                        <span className="text-right">
                          {item.isClosed ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">Closed</span>
                          ) : item.periods && item.periods.length > 0 ? (
                            item.periods.map((p, pIdx) => (
                              <span key={pIdx} className="block font-medium text-zinc-900 dark:text-zinc-100">
                                {formatTime(p.opens)} - {formatTime(p.closes)}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500">Open</span>
                          )}
                        </span>
                      </div>
                    );
                  })}

                  {brewery.holidayExceptions && brewery.holidayExceptions.length > 0 && (
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Upcoming Holiday Schedule
                      </span>
                      {brewery.holidayExceptions.map((ex, exIdx) => (
                        <div key={exIdx} className="text-xs text-zinc-500 dark:text-zinc-400 flex justify-between py-0.5">
                          <span>
                            {ex.date} {ex.notes && `(${ex.notes})`}
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {ex.isClosed ? 'Closed' : 'Special Hours'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                  <p className="font-bold">Structured hours are not recorded for this location.</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Please check the brewery&apos;s website or call ahead to verify current hours before visiting.
                  </p>
                </div>
              )}
            </section>

            {/* Data Verification & Freshness Sidebar Card */}
            <section
              className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
                freshness.freshnessCategory === 'fresh'
                  ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20'
                  : freshness.freshnessCategory === 'stale'
                  ? 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/20'
                  : freshness.freshnessCategory === 'outdated'
                  ? 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20'
                  : 'bg-indigo-500/5 dark:bg-indigo-950/10 border-indigo-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {freshness.freshnessCategory === 'fresh' && (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {(freshness.freshnessCategory === 'stale' || freshness.freshnessCategory === 'outdated') && (
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      freshness.freshnessCategory === 'outdated'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                )}
                {freshness.freshnessCategory === 'unverified' && (
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
                <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Data Verification &amp; Freshness
                </h2>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="font-medium text-zinc-800 dark:text-zinc-300">Verification Badge</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      freshness.freshnessCategory === 'fresh'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : freshness.freshnessCategory === 'stale'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : freshness.freshnessCategory === 'outdated'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                    }`}
                  >
                    {freshness.verificationBadge.label}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="font-medium text-zinc-800 dark:text-zinc-300">Status</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {brewery.verificationStatus || 'Community Submitted'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="font-medium text-zinc-800 dark:text-zinc-300">Last Verified</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {brewery.lastVerified || 'None Recorded'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="font-medium text-zinc-800 dark:text-zinc-300">Source</span>
                  <span
                    className="text-zinc-950 dark:text-zinc-200 truncate max-w-[150px] font-medium"
                    title={brewery.verificationSource || 'Community submission'}
                  >
                    {brewery.verificationSource || 'Community submission'}
                  </span>
                </div>
              </div>

              {/* Freshness summary box */}
              <div className="p-3 rounded-2xl bg-zinc-500/10 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] leading-relaxed font-medium">
                {freshness.freshnessSummary}
              </div>

              {/* Field Verifications */}
              {brewery.verification && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Field-Level Verification
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5" title={`Hours: ${brewery.verification.hours?.sourceType || 'N/A'}`}>
                      <ShieldCheck
                        className={`w-3.5 h-3.5 shrink-0 ${
                          brewery.verification.hours?.verified ? 'text-emerald-500' : 'text-zinc-400'
                        }`}
                      />
                      <span className="text-zinc-600 dark:text-zinc-400">Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`Address: ${brewery.verification.address?.sourceType || 'N/A'}`}>
                      <ShieldCheck
                        className={`w-3.5 h-3.5 shrink-0 ${
                          brewery.verification.address?.verified ? 'text-emerald-500' : 'text-zinc-400'
                        }`}
                      />
                      <span className="text-zinc-600 dark:text-zinc-400">Address</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={`Amenities: ${brewery.verification.amenities?.sourceType || 'N/A'}`}>
                      <ShieldCheck
                        className={`w-3.5 h-3.5 shrink-0 ${
                          brewery.verification.amenities?.verified ? 'text-emerald-500' : 'text-zinc-400'
                        }`}
                      />
                      <span className="text-zinc-600 dark:text-zinc-400">Amenities</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="General info verified">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span className="text-zinc-600 dark:text-zinc-400">General</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-1.5 space-y-1 bg-zinc-500/5 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 mt-1">
                    <div className="flex justify-between">
                      <span>Confidence Level:</span>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {brewery.verification.general.confidence}
                      </span>
                    </div>
                    {brewery.verification.general.sourceUrl && (
                      <div className="flex justify-between">
                        <span>Verification Link:</span>
                        <a
                          href={brewery.verification.general.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 hover:underline truncate max-w-[120px]"
                        >
                          Official Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed pt-1 flex gap-1.5 items-start border-t border-zinc-200 dark:border-zinc-800">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  Hours and operational details are re-verified regularly against official brewery channels.
                </span>
              </p>
            </section>
          </aside>
        </div>
      </div>
    </article>
  );
}
