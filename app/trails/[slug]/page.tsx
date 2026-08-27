import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Compass, MapPin, Star, Beer as BeerIcon, Map as MapIcon, Navigation, ExternalLink, Clock, Route, AlertCircle, CheckCircle2 } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { Brewery } from '@/lib/types';
import { TrailMapView } from '@/components/ui/trail-map-view';
import { BreweryStatusBadge, BreweryFreshnessBadge } from '@/components/ui/brewery-status-badge';

interface TrailDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TrailDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trail = await contentService.trails.getBySlug(slug);

  if (!trail) {
    return {
      title: 'Trail Not Found | Maryland Beer Atlas',
    };
  }

  return {
    title: `${trail.name} | Maryland Beer Trail Itinerary`,
    description: `Explore the ${trail.name}. Distance: ${trail.distance} (${trail.duration}). Stop highlights: ${trail.breweries.map(b => b.name).join(', ')}. Get the ultimate self-guided route.`,
    alternates: {
      canonical: `/trails/${slug}`,
    },
    openGraph: {
      title: `${trail.name} | Curated Maryland Beer Trail`,
      description: trail.description,
      type: 'article',
      url: `https://marylandbeeratlas.com/trails/${slug}`,
      images: [
        {
          url: trail.image,
          alt: trail.name,
        }
      ],
    }
  };
}

interface BreweryStopCardProps {
  brewery: Brewery;
  index: number;
}

function BreweryStopCard({ brewery, index }: BreweryStopCardProps) {
  const isClosedStatus = brewery.status === 'Permanently closed' || brewery.status === 'Temporarily closed' || brewery.status === 'Closed';

  const hasValidCoords =
    brewery.coordinates &&
    typeof brewery.coordinates.lat === 'number' &&
    typeof brewery.coordinates.lng === 'number' &&
    !isNaN(brewery.coordinates.lat) &&
    !isNaN(brewery.coordinates.lng);

  const googleMapsDirectionsUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${brewery.coordinates.lat},${brewery.coordinates.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${brewery.name}, ${brewery.address}, ${brewery.city}, MD ${brewery.zipCode}`)}`;

  const appleMapsDirectionsUrl = hasValidCoords
    ? `https://maps.apple.com/?daddr=${brewery.coordinates.lat},${brewery.coordinates.lng}`
    : `https://maps.apple.com/?daddr=${encodeURIComponent(`${brewery.name}, ${brewery.address}, ${brewery.city}, MD ${brewery.zipCode}`)}`;

  return (
    <article
      aria-label={`Stop ${index + 1}: ${brewery.name}`}
      className={`bg-white dark:bg-zinc-950 rounded-2xl border ${
        isClosedStatus
          ? 'border-amber-500/40 dark:border-amber-500/30 bg-amber-500/5'
          : 'border-zinc-200 dark:border-zinc-850'
      } p-5 md:p-6 shadow-sm hover:shadow-md transition-all space-y-5`}
    >
      {/* Notice for closed/inactive brewery stops */}
      {isClosedStatus && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Trail Stop Operational Notice</span>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              {brewery.name} is currently flagged as <strong className="text-amber-600 dark:text-amber-400">{brewery.status}</strong>. Please check their official site or social channels before visiting on your trip.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Photo */}
        <div className="md:col-span-4 relative aspect-video md:aspect-auto rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 min-h-[160px]">
          <Image
            src={brewery.image}
            alt={brewery.name}
            fill
            sizes="(max-width: 768px) 100vw, 250px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 bg-zinc-950/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm">
            Stop #{index + 1}
          </div>
          <div className="absolute top-3 right-3">
            <BreweryStatusBadge brewery={brewery} size="sm" />
          </div>
        </div>

        {/* Info details */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {brewery.type}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3 text-amber-500" />
                {brewery.city}, MD
              </span>
              <BreweryFreshnessBadge brewery={brewery} size="sm" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                <Link
                  href={`/breweries/${brewery.slug}`}
                  className="hover:text-amber-500 transition-colors"
                >
                  {brewery.name}
                </Link>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <span className="font-medium">{brewery.address}, {brewery.city}, MD {brewery.zipCode} ({brewery.county} County)</span>
              </p>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed line-clamp-3 font-normal">
              {brewery.description}
            </p>

            {/* Quick Amenities Preview */}
            {brewery.amenities && brewery.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {brewery.amenities.slice(0, 4).map((amenity, idx) => (
                  <span key={idx} className="text-[9px] font-semibold bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                    {amenity}
                  </span>
                ))}
                {brewery.amenities.length > 4 && (
                  <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 self-center">
                    +{brewery.amenities.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* On tap brief & actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            {brewery.beerStyles && brewery.beerStyles.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <BeerIcon className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                <span className="truncate">
                  Styles: <strong className="text-zinc-800 dark:text-zinc-200">{brewery.beerStyles.slice(0, 3).join(', ')}</strong>
                </span>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">Craft Brewery Stop</div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-500 dark:hover:text-zinc-950 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] inline-flex items-center gap-1 transition-colors border border-zinc-200 dark:border-zinc-800"
                title={`Get directions to ${brewery.name}`}
              >
                <Navigation className="w-3 h-3 text-amber-500" />
                Directions
              </a>
              <a
                href={appleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] inline-flex items-center gap-1 transition-colors border border-zinc-200 dark:border-zinc-800"
                title={`Open ${brewery.name} in Apple Maps`}
                aria-label={`Open ${brewery.name} in Apple Maps`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
              <Link
                href={`/breweries/${brewery.slug}`}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-xs"
              >
                View Stop &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function TrailDetailPage({ params }: TrailDetailPageProps) {
  const { slug } = await params;
  const trail = await contentService.trails.getBySlug(slug);

  if (!trail) {
    notFound();
  }

  const trailSchema = {
    "@context": "https://schema.org",
    "@type": "TouristRoute",
    "name": trail.name,
    "description": trail.description,
    "image": trail.image,
    "distance": trail.distance,
    "itinerary": {
      "@type": "ItemList",
      "numberOfItems": trail.breweries.length,
      "itemListElement": trail.breweries.map((brewery, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Brewery",
          "name": brewery.name,
          "description": brewery.description,
          "image": brewery.image,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": brewery.address,
            "addressLocality": brewery.city,
            "addressRegion": "MD",
            "postalCode": brewery.zipCode
          }
        }
      }))
    }
  };

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trailSchema) }}
      />
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <Link
          href="/trails"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-8 cursor-pointer"
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
            {/* Structured Trip Overview Card & Quick Metrics */}
            <div className="p-6 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                  <Route className="w-4 h-4" />
                  Trip Overview &amp; Key Details
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {trail.region} Region
                </span>
              </div>

              {/* 4-column Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-400" /> Total Distance
                  </span>
                  <p className="text-base font-extrabold text-white">{trail.distance}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Est. Duration
                  </span>
                  <p className="text-base font-extrabold text-white">{trail.duration}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> Brewery Stops
                  </span>
                  <p className="text-base font-extrabold text-white">{trail.breweries.length} Stops</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Difficulty
                  </span>
                  <p className="text-base font-extrabold text-emerald-400">{trail.difficulty}</p>
                </div>
              </div>

              {/* Trail Overview Narrative & Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                <div className="md:col-span-8 space-y-3">
                  <h3 className="text-base font-bold text-white">About This Craft Route</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed font-normal">
                    {trail.description}
                  </p>
                </div>
                <div className="md:col-span-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Star className="w-4 h-4 fill-current shrink-0" />
                    Trail Highlight
                  </div>
                  <p className="text-zinc-200 text-xs leading-relaxed font-normal">
                    {trail.highlight}
                  </p>
                </div>
              </div>

              {/* Nearby Attractions */}
              {trail.nearbyAttractions && trail.nearbyAttractions.length > 0 && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nearby Attractions &amp; Sights Along the Route</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-zinc-300">
                    {trail.nearbyAttractions.map((attraction, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-normal">{attraction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Interactive Route Map with Connecting Line */}
            <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-850">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-amber-500" />
                Interactive Trail Map
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                View stops along the trail itinerary connected in geographic sequence. Select pins to preview stop details.
              </p>
              <TrailMapView breweries={trail.breweries} trail={trail} />
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

                    {/* Brewery Stop Component */}
                    <BreweryStopCard brewery={brewery} index={index} />
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
