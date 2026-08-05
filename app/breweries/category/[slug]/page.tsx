import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { PageContainer } from '@/components/layout/page-container';
import { BreweryCard } from '@/components/ui/brewery-card';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Map slug to category name, matching either type or amenity
import { Brewery } from '@/lib/types';

const CATEGORY_MAP: Record<string, { name: string; title: string; desc: string; filterFn: (b: Brewery) => boolean }> = {
  'dog-friendly': {
    name: 'Dog Friendly',
    title: 'Dog Friendly Breweries in Maryland',
    desc: 'Explore the best pet and dog-friendly breweries in Maryland. Sit outside with your pup, enjoy craft drinks, and relax in spacious outdoor beer gardens.',
    filterFn: (b) => b.amenities.some((a: string) => a.toLowerCase().includes('dog friendly'))
  },
  'microbrewery': {
    name: 'Microbrewery',
    title: 'Local Microbreweries in Maryland',
    desc: 'Discover microbreweries in Maryland. Taste local, small-batch, innovative craft beers brewed with passion by community-driven brewmasters.',
    filterFn: (b) => b.type === 'Microbrewery'
  },
  'brewpub': {
    name: 'Brewpub',
    title: 'Best Brewpubs in Maryland | Craft Beer & Dining',
    desc: 'Browse prime craft beer dining experiences in Maryland. These top-rated brewpubs offer fresh house-brewed pints perfectly paired with artisanal kitchen menus.',
    filterFn: (b) => b.type === 'Brewpub'
  },
  'production': {
    name: 'Production Brewery',
    title: 'Production Breweries in Maryland | Large Taprooms',
    desc: 'Discover large-scale production breweries in Maryland. Take facility tours, explore extensive industrial tasting rooms, and taste famous flagship beers.',
    filterFn: (b) => b.type === 'Production'
  },
  'farm-brewery': {
    name: 'Farm Brewery',
    title: 'Farm Breweries in Maryland | Rural Taprooms',
    desc: 'Experience scenic farm-to-glass brewing in Maryland. These farm breweries operate on active rural agricultural lands, offering beautiful open-air spaces.',
    filterFn: (b) => b.type === 'Farm Brewery'
  }
};

async function getCategoryData(slug: string) {
  const category = CATEGORY_MAP[slug.toLowerCase()];
  if (!category) return null;

  const breweries = await contentService.breweries.getAll();
  const matchedBreweries = breweries.filter(category.filterFn);

  return {
    ...category,
    breweries: matchedBreweries
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    return {
      title: "Category Not Found | Maryland Beer Atlas",
    };
  }

  return {
    title: `${data.title} | Top Taprooms`,
    description: data.desc,
    openGraph: {
      title: `${data.title} | Top MD Taprooms`,
      description: data.desc,
      url: `https://marylandbeeratlas.com/breweries/category/${slug}`,
      type: 'website'
    }
  };
}

export default async function CategoryLandingPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": data.title,
    "description": data.desc,
    "numberOfItems": data.breweries.length,
    "itemListElement": data.breweries.map((brewery, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Brewery",
        "name": brewery.name,
        "description": brewery.description,
        "image": brewery.image,
        "url": `https://marylandbeeratlas.com/breweries/${brewery.slug}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": brewery.address,
          "addressLocality": brewery.city,
          "addressRegion": "MD",
          "postalCode": brewery.zipCode
        }
      }
    }))
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Maryland Beer Guide
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {data.title}
            </h1>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
              {data.desc} Explore high-quality craft venues and enjoy premium vibes.
            </p>
          </div>
        </div>

        {/* Brewery List Grid */}
        {data.breweries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.breweries.map((brewery) => (
              <BreweryCard key={brewery.id} brewery={brewery} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850">
            <p className="text-zinc-600 dark:text-zinc-400">No breweries found in this category currently.</p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
