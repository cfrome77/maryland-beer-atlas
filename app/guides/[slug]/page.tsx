import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Star,
  MapPin,
  Route,
  Layers,
} from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { BreweryStatusBadge } from '@/components/ui/brewery-status-badge';
import { getGuideTypeBadge } from '@/components/ui/guides-directory-content';

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuideDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await contentService.guides.getBySlug(slug);

  if (!guide) {
    return {
      title: 'Guide Not Found | Maryland Beer Atlas',
    };
  }

  const title = guide.seo?.metaTitle || `${guide.title} | Maryland Beer Guide`;
  const description = guide.seo?.metaDescription || guide.description;
  const ogImage = guide.seo?.ogImage || guide.image;

  return {
    title,
    description,
    keywords: guide.seo?.keywords || guide.categories || ['Maryland Beer', 'Brewery Guide'],
    robots: guide.seo?.noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `/guides/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://marylandbeeratlas.com/guides/${slug}`,
      images: [
        {
          url: ogImage,
          alt: guide.title,
        },
      ],
    },
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const guide = await contentService.guides.getBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Schema.org BlogPosting / Article JSON-LD Schema
  const guideSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: guide.seo?.metaTitle || guide.title,
    description: guide.seo?.metaDescription || guide.description,
    image: [guide.seo?.ogImage || guide.image],
    datePublished: new Date(guide.publishDate).toISOString().split('T')[0] || guide.publishDate,
    author: {
      '@type': 'Person',
      name: guide.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Maryland Beer Atlas',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=200',
      },
    },
    keywords: (guide.seo?.keywords || guide.categories || []).join(', '),
    about: guide.recommendedStops.map((b) => ({
      '@type': 'Brewery',
      name: b.name,
      address: `${b.address}, ${b.city}, MD ${b.zipCode}`,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://marylandbeeratlas.com/guides/${slug}`,
    },
  };

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }}
      />
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Navigation */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Travel Guides
        </Link>

        {/* Article Container */}
        <article className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm mb-10">
          {/* Cover Photo */}
          <div className="relative aspect-[21/9] w-full bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={guide.image}
              alt={guide.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-sm inline-block">
                  {guide.region} Region
                </span>
                {getGuideTypeBadge(guide.guideType)}
                {guide.county && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 text-zinc-200 border border-zinc-700 backdrop-blur-sm">
                    {guide.county} County
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {guide.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-850 pb-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                  <User className="w-4 h-4 text-amber-500" />
                  By {guide.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Published {guide.publishDate}
                </span>
              </div>

              {/* Category Tags */}
              {Array.isArray(guide.categories) && guide.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {guide.categories.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                      #{cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content & Sidebars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Content Body & Media Gallery */}
              <div className="lg:col-span-8 space-y-8">
                {/* Prose Content */}
                <div
                  className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: guide.content }}
                />

                {/* Photo Gallery if provided */}
                {Array.isArray(guide.gallery) && guide.gallery.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-850">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" />
                      Editorial Photo Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {guide.gallery.map((photo, idx) => (
                        <figure key={idx} className="space-y-1.5">
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            <Image
                              src={photo.url}
                              alt={photo.alt || `Photo ${idx + 1}`}
                              fill
                              sizes="(max-width: 640px) 100vw, 400px"
                              className="object-cover"
                            />
                          </div>
                          {photo.caption && (
                            <figcaption className="text-xs text-zinc-500 dark:text-zinc-400 font-medium text-center">
                              {photo.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Expert Advice, Recommended Brewery Stops, Related Trails & Guides */}
              <div className="lg:col-span-4 space-y-6">
                {/* Expert Advice / Tips */}
                {Array.isArray(guide.tips) && guide.tips.length > 0 && (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                    <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4.5 h-4.5 fill-current" />
                      Expert Advice
                    </h3>
                    <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                      {guide.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-relaxed">
                          <span className="shrink-0 text-amber-500 font-bold">&#8226;</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Brewery Stops */}
                {Array.isArray(guide.recommendedStops) && guide.recommendedStops.length > 0 && (
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                      Featured Brewery Stops ({guide.recommendedStops.length})
                    </h3>
                    <div className="space-y-4">
                      {guide.recommendedStops.map((brewery) => (
                        <div
                          key={brewery.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/breweries/${brewery.slug}`}
                                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition-colors block leading-tight"
                              >
                                {brewery.name}
                              </Link>
                              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{brewery.city}, MD</span>
                              </div>
                            </div>
                            <BreweryStatusBadge brewery={brewery} size="sm" />
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {brewery.description}
                          </p>

                          <Link
                            href={`/breweries/${brewery.slug}`}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
                          >
                            View Brewery Details &rarr;
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Beer Trails */}
                {Array.isArray(guide.relatedTrails) && guide.relatedTrails.length > 0 && (
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                    <h3 className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Route className="w-4.5 h-4.5" />
                      Associated Beer Trails
                    </h3>
                    <div className="space-y-3">
                      {guide.relatedTrails.map((trail) => (
                        <div key={trail.id} className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <Link
                            href={`/trails/${trail.slug}`}
                            className="font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-blue-500 transition-colors block"
                          >
                            {trail.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>{trail.distance}</span>
                            <span>•</span>
                            <span>{trail.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Guides */}
                {Array.isArray(guide.relatedGuides) && guide.relatedGuides.length > 0 && (
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                      Related Guides
                    </h3>
                    <div className="space-y-3">
                      {guide.relatedGuides.map((relGuide) => (
                        <div key={relGuide.slug} className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <Link
                            href={`/guides/${relGuide.slug}`}
                            className="font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition-colors block leading-tight"
                          >
                            {relGuide.title}
                          </Link>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {relGuide.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
