'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TravelGuide, GuideType } from '@/lib/types';
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Search,
  Route,
  GraduationCap,
  Map,
  Filter,
} from 'lucide-react';

interface GuidesDirectoryContentProps {
  initialGuides: TravelGuide[];
}

const GUIDE_TYPE_LABELS: Record<GuideType | 'all', { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All Guides', icon: BookOpen, color: 'bg-zinc-850 text-white' },
  brewery_guide: { label: 'Brewery Guides', icon: Compass, color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  regional_guide: { label: 'Regional Guides', icon: Map, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  trip_planning: { label: 'Trip Planning', icon: Route, color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  curated_recommendations: { label: 'Curated Picks', icon: Sparkles, color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  education: { label: 'Beer Education', icon: GraduationCap, color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' },
};

export function getGuideTypeBadge(type?: GuideType) {
  const meta = GUIDE_TYPE_LABELS[type || 'brewery_guide'] || GUIDE_TYPE_LABELS.brewery_guide;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {meta.label}
    </span>
  );
}

export function GuidesDirectoryContent({ initialGuides }: GuidesDirectoryContentProps) {
  const [selectedType, setSelectedType] = useState<GuideType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGuides = useMemo(() => {
    return initialGuides.filter((guide) => {
      // Guide type match
      if (selectedType !== 'all' && (guide.guideType || 'brewery_guide') !== selectedType) {
        return false;
      }
      // Region match
      if (selectedRegion !== 'all' && guide.region !== selectedRegion) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = guide.title.toLowerCase().includes(query);
        const matchesDesc = guide.description.toLowerCase().includes(query);
        const matchesAuthor = guide.author.toLowerCase().includes(query);
        const matchesCounty = guide.county ? guide.county.toLowerCase().includes(query) : false;
        const matchesCategories = Array.isArray(guide.categories)
          ? guide.categories.some((c) => c.toLowerCase().includes(query))
          : false;

        return matchesTitle || matchesDesc || matchesAuthor || matchesCounty || matchesCategories;
      }
      return true;
    });
  }, [initialGuides, selectedType, selectedRegion, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search guides by title, region, county, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label="Search travel guides"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
              aria-label="Filter guides by region"
            >
              <option value="all">All Regions</option>
              <option value="Capital">Capital Region</option>
              <option value="Central">Central Maryland</option>
              <option value="Eastern Shore">Eastern Shore</option>
              <option value="Southern">Southern Maryland</option>
              <option value="Western">Western Maryland</option>
            </select>
          </div>
        </div>

        {/* Guide Type Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850" role="tablist" aria-label="Filter guides by category">
          {(Object.keys(GUIDE_TYPE_LABELS) as Array<GuideType | 'all'>).map((type) => {
            const item = GUIDE_TYPE_LABELS[type];
            const Icon = item.icon;
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 shadow-sm'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Summary */}
      <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
        </span>
        {(selectedType !== 'all' || selectedRegion !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedRegion('all');
              setSearchQuery('');
            }}
            className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Editorial Guides Found</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            No guides matched your selected filters. Try broadening your search or selecting all regions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredGuides.map((guide) => (
            <article
              key={guide.slug}
              className="group rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo banner */}
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-950/85 text-white backdrop-blur-sm">
                      {guide.region} Region
                    </span>
                    {getGuideTypeBadge(guide.guideType)}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-8 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      By {guide.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {guide.publishDate}
                    </span>
                    {guide.county && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {guide.county} County
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-tight">
                    <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                  </h3>

                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>

                  {/* Category Tags */}
                  {Array.isArray(guide.categories) && guide.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {guide.categories.map((cat, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                          #{cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="px-8 pb-8 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Compass className="w-4 h-4 text-amber-500" />
                    {guide.recommendedStops.length} {guide.recommendedStops.length === 1 ? 'stop' : 'stops'}
                  </span>
                  {Array.isArray(guide.relatedTrails) && guide.relatedTrails.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Route className="w-4 h-4 text-blue-500" />
                      {guide.relatedTrails.length} {guide.relatedTrails.length === 1 ? 'trail' : 'trails'}
                    </span>
                  )}
                </div>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold transition-colors inline-flex items-center gap-1.5 border border-zinc-800"
                >
                  Read Travel Guide
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
