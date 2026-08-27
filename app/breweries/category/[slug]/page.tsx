import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Tag, Dog, Beer, Utensils, Factory, Trees } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { PageContainer } from '@/components/layout/page-container';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Brewery } from '@/lib/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export interface CategoryDefinition {
  name: string;
  badge: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  filterFn: (b: Brewery) => boolean;
}

export const CATEGORY_MAP: Record<string, CategoryDefinition> = {
  'dog-friendly': {
    name: 'Dog Friendly',
    badge: 'Amenity Category',
    title: 'Dog-Friendly Breweries in Maryland',
    desc: 'Explore pet- and dog-friendly breweries across Maryland. Enjoy craft drinks, bring your dog to outdoor beer gardens, and relax on patio seating.',
    icon: <Dog className="w-4 h-4 text-amber-400" />,
    filterFn: (b) => b.amenities.some((a: string) => a.toLowerCase().includes('dog friendly')),
  },
  microbrewery: {
    name: 'Microbrewery',
    badge: 'Brewery Type',
    title: 'Local Microbreweries in Maryland',
    desc: 'Discover independent microbreweries in Maryland. Taste local small-batch IPAs, stouts, and experimental craft brews brewed with community passion.',
    icon: <Beer className="w-4 h-4 text-amber-400" />,
    filterFn: (b) => b.type === 'Microbrewery',
  },
  brewpub: {
    name: 'Brewpub',
    badge: 'Brewery Type',
    title: 'Best Brewpubs in Maryland | Food & Craft Beer',
    desc: 'Browse prime craft beer dining experiences in Maryland. These top-rated brewpubs serve fresh house-brewed pints perfectly paired with artisanal kitchen menus.',
    icon: <Utensils className="w-4 h-4 text-amber-400" />,
    filterFn: (b) => b.type === 'Brewpub',
  },
  production: {
    name: 'Production Brewery',
    badge: 'Brewery Type',
    title: 'Production Breweries in Maryland | Tasting Rooms',
    desc: 'Discover large-scale production breweries in Maryland. Tour commercial brewing facilities, explore industrial tasting rooms, and try flagship craft beers.',
    icon: <Factory className="w-4 h-4 text-amber-400" />,
    filterFn: (b) => b.type === 'Production',
  },
  'farm-brewery': {
    name: 'Farm Brewery',
    badge: 'Brewery Type',
    title: 'Farm Breweries in Maryland | Open-Air Taprooms',
    desc: 'Experience scenic farm-to-glass brewing in Maryland. Farm breweries operate on active rural agricultural lands, offering family-friendly open spaces.',
    icon: <Trees className="w-4 h-4 text-amber-400" />,
    filterFn: (b) => b.type === 'Farm Brewery',
  },
};

async function getCategoryData(slug: string) {
  const categoryKey = slug.toLowerCase();
  const category = CATEGORY_MAP[categoryKey];
  if (!category) return null;

  const breweries = await contentService.breweries.getAll();
  const matchedBreweries = breweries.filter(category.filterFn);

  return {
    ...category,
    slug: categoryKey,
    breweries: matchedBreweries,
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    return {
      title: 'Category Not Found | Maryland Beer Atlas',
    };
  }

  const countText = `${data.breweries.length} ${data.breweries.length === 1 ? 'brewery' : 'breweries'}`;

  return {
    title: `${data.title} (${data.breweries.length}) | Maryland Beer Atlas`,
    description: `${data.desc} Browse ${countText} with taproom hours, amenities, and directions.`,
    alternates: {
      canonical: `/breweries/category/${slug}`,
    },
    openGraph: {
      title: `${data.title} (${data.breweries.length}) | Maryland Beer Atlas`,
      description: data.desc,
      url: `https://marylandbeeratlas.com/breweries/category/${slug}`,
      type: 'website',
    },
  };
}

export default async function CategoryLandingPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.title,
    description: data.desc,
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
                {data.icon || <Tag className="w-3.5 h-3.5" />}
                {data.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                {data.breweries.length} {data.breweries.length === 1 ? 'Brewery' : 'Breweries'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {data.title}
            </h1>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-normal">
              {data.desc} Explore high-quality craft venues, taprooms, and outdoor spaces across Maryland.
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
            title={`No Breweries Found for "${data.name}"`}
            description="We currently don't have any verified active craft breweries matching this specific category. Explore other categories or view our full brewery directory."
            icon="beer"
          />
        )}
      </PageContainer>
    </div>
  );
}
