'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, BookOpen, Star, Info, MapPin } from 'lucide-react';
import { mockGuides } from '@/lib/data/mock-data';

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = use(params);
  const guide = mockGuides.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
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
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-sm inline-block">
                {guide.region} Region
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {guide.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-850 pb-6">
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

            {/* Article Content & Sidebars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Content Body */}
              <div className="lg:col-span-8 space-y-6">
                <div
                  className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: guide.content }}
                />
              </div>

              {/* Right Column: Expert Tips & Recommended Stops */}
              <div className="lg:col-span-4 space-y-6">

                {/* Expert Tips */}
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4.5 h-4.5 fill-current" />
                    Expert Advice
                  </h3>
                  <ul className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
                    {guide.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 items-start leading-relaxed">
                        <span className="shrink-0 text-amber-500 font-bold">&#8226;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended stops */}
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                    Must-Visit Stops
                  </h3>
                  <div className="space-y-3">
                    {guide.recommendedStops.map((brewery) => (
                      <div key={brewery.id} className="border-b border-zinc-105 dark:border-zinc-800 last:border-0 pb-3 last:pb-0 space-y-1">
                        <span className="block font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition-colors">
                          <Link href={`/breweries/${brewery.slug}`}>{brewery.name}</Link>
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{brewery.city}, MD</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
