import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Compass, Beer, Map, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-20 bg-zinc-50 dark:bg-zinc-900 min-h-[75vh] flex flex-col justify-center items-center text-center">
      <PageContainer size="default" className="flex flex-col items-center max-w-lg">
        {/* Icon Header */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 shadow-sm">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        {/* Title & Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 mb-3">
          404 - Page Not Found
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Looks like you&apos;ve taken a detour
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed mt-3 mb-8">
          The brewery, trail, guide, or route you are looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track to exploring Maryland craft beer!
        </p>

        {/* Helpful Shortcut Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
          <Link
            href="/breweries"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Beer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors block">
                Brewery Directory
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Search all MD taprooms</span>
            </div>
          </Link>

          <Link
            href="/map"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 transition-all flex items-center gap-3 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors block">
                Interactive Map
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">View map pins &amp; regions</span>
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          Return to Maryland Beer Atlas
        </Link>
      </PageContainer>
    </div>
  );
}
