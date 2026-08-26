import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { PageContainer } from '@/components/layout/page-container';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';

interface CountyPageProps {
  params: Promise<{ slug: string }>;
}

// Helper to convert County name to a URL slug
export function slugifyCounty(countyName: string): string {
  return countyName
    .toLowerCase()
    .replace(/'/g, '') // Prince George's -> prince-georges
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function getCountyData(slug: string) {
  const breweries = await contentService.breweries.getAll();

  // Find unique county names from our canonical brewery data
  const uniqueCounties = Array.from(new Set(breweries.map((b) => b.county)));

  // Find which county matches the slug
  const matchedCounty = uniqueCounties.find((county) => slugifyCounty(county) === slug);

  if (!matchedCounty) {
    return null;
  }

  const countyBreweries = breweries.filter((b) => b.county === matchedCounty);
  const region = countyBreweries.length > 0 ? countyBreweries[0].region : undefined;

  return {
    countyName: matchedCounty,
    region,
    breweries: countyBreweries,
  };
}

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCountyData(slug);

  if (!data) {
    return {
      title: 'County Not Found | Maryland Beer Atlas',
    };
  }

  const countText = `${data.breweries.length} ${data.breweries.length === 1 ? 'brewery' : 'breweries'}`;

  return {
    title: `Best Breweries in ${data.countyName} County MD (${data.breweries.length}) | Taprooms & Map`,
    description: `Discover ${countText} in ${data.countyName} County, Maryland. Explore craft taprooms, check amenities, hours, and map out your next brewery visit in ${data.countyName} MD.`,
    openGraph: {
      title: `Best Breweries in ${data.countyName} County MD | Maryland Beer Atlas`,
      description: `Discover ${countText} in ${data.countyName} County, Maryland. Check hours, dog-friendly outdoor seating, and directions.`,
      url: `https://marylandbeeratlas.com/breweries/county/${slug}`,
      type: 'website',
    },
  };
}

export default async function CountyLandingPage({ params }: CountyPageProps) {
  const { slug } = await params;
  const data = await getCountyData(slug);

  if (!data) {
    notFound();
  }

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Breweries in ${data.countyName} County, MD`,
    description: `A curated list of ${data.breweries.length} local craft breweries located in ${data.countyName} County, Maryland.`,
    numberOfItems: data.breweries.length,
    itemListElement: data.breweries.map((brewery, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Brewery',
        name: brewery.name,
        description: brewery.description,
        image: brewery.image,
        url: `https://marylandbeeratlas.com/breweries/${brewery.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: brewery.address,
          addressLocality: brewery.city,
          addressRegion: 'MD',
          postalCode: brewery.zipCode,
        },
      },
    })),
  };

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <PageContainer size="default">
        {/* Back Button */}
        <Link
          href="/breweries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Header Block */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-zinc-900 text-white overflow-hidden shadow-sm mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.06),transparent_40%)]" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MapPin className="w-3.5 h-3.5" />
                Maryland County Discovery
              </span>
              {data.region && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {data.region} Region
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                {data.breweries.length} {data.breweries.length === 1 ? 'Brewery' : 'Breweries'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Best Breweries in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {data.countyName} County
              </span>
            </h1>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-normal">
              Explore the premier craft beer destinations, independent microbreweries, and local taprooms in {data.countyName} County, Maryland. Check operational hours, amenities, and directions for your next visit.
            </p>
          </div>
        </div>

        {/* Brewery List Grid or Empty State */}
        {data.breweries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.breweries.map((brewery) => (
              <BreweryCard key={brewery.id} brewery={brewery} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No Breweries Found in ${data.countyName} County`}
            description="We currently don't have any verified active craft breweries cataloged in this county. Explore other nearby Maryland counties or browse the full directory."
            icon="beer"
          />
        )}
      </PageContainer>
    </div>
  );
}
