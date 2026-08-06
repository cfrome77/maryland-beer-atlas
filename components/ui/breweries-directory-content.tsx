'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Beer as BeerIcon } from 'lucide-react';
import { Brewery } from '@/lib/types';
import { BreweryType, MarylandRegion } from '@/lib/types';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';
import { TravelGuide } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, BookOpen, Star, ArrowRight } from 'lucide-react';

interface BreweriesDirectoryContentProps {
  breweries: Brewery[];
  guides?: TravelGuide[];
}

function BreweriesDirectoryContent({ breweries, guides = [] }: BreweriesDirectoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected filters from search params
  const initialRegion = searchParams?.get('region') as MarylandRegion || '';
  const initialType = searchParams?.get('type') as BreweryType || '';
  const initialSearch = searchParams?.get('search') || '';
  const initialCounty = searchParams?.get('county') || '';
  const initialAmenity = searchParams?.get('amenity') || '';
  const initialQuickGuide = searchParams?.get('quickGuide') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | ''>(initialRegion);
  const [selectedType, setSelectedType] = useState<BreweryType | ''>(initialType);
  const [selectedCounty, setSelectedCounty] = useState<string>(initialCounty);
  const [selectedAmenity, setSelectedAmenity] = useState<string>(initialAmenity);
  const [selectedQuickGuide, setSelectedQuickGuide] = useState<string>(initialQuickGuide);

  // Region, Type, County and Amenity lists
  const regions: MarylandRegion[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const breweryTypes: BreweryType[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Dynamically extract unique counties and amenities from the provided dataset
  const counties = Array.from(new Set(breweries.map(b => b.county))).sort();
  const amenities = Array.from(new Set(breweries.flatMap(b => b.amenities))).sort();

  // Update URL Search Params to persist filter states
  const applyFilters = (search: string, region: string, type: string, county: string, amenity: string, quickGuide: string = '') => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (county) params.set('county', county);
    if (amenity) params.set('amenity', amenity);
    if (quickGuide) params.set('quickGuide', quickGuide);
    router.push(`/breweries?${params.toString()}`);
  };

  const handleQuickGuideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedQuickGuide(val);
    if (val === 'Frederick County') {
      setSelectedCounty('Frederick');
      setSelectedRegion('');
      setSelectedType('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', '', 'Frederick', '', val);
    } else if (val === 'Baltimore City') {
      setSelectedCounty('Baltimore City');
      setSelectedRegion('');
      setSelectedType('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', '', 'Baltimore City', '', val);
    } else if (val === 'Montgomery County') {
      setSelectedCounty('Montgomery');
      setSelectedRegion('');
      setSelectedType('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', '', 'Montgomery', '', val);
    } else if (val === 'Baltimore County') {
      setSelectedCounty('Baltimore County');
      setSelectedRegion('');
      setSelectedType('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', '', 'Baltimore County', '', val);
    } else if (val === '🐕 Dog-Friendly Taprooms') {
      setSelectedAmenity('Dog Friendly');
      setSelectedRegion('');
      setSelectedType('');
      setSelectedCounty('');
      applyFilters(searchQuery, '', '', '', 'Dog Friendly', val);
    } else if (val === 'Farm Breweries') {
      setSelectedType('Farm Brewery');
      setSelectedRegion('');
      setSelectedCounty('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', 'Farm Brewery', '', '', val);
    } else if (val === 'Local Brewpubs') {
      setSelectedType('Brewpub');
      setSelectedRegion('');
      setSelectedCounty('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', 'Brewpub', '', '', val);
    } else if (val === 'Microbreweries') {
      setSelectedType('Microbrewery');
      setSelectedRegion('');
      setSelectedCounty('');
      setSelectedAmenity('');
      applyFilters(searchQuery, '', 'Microbrewery', '', '', val);
    } else {
      setSelectedQuickGuide('');
      applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, selectedAmenity, '');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedQuickGuide('');
    applyFilters(val, selectedRegion, selectedType, selectedCounty, selectedAmenity, '');
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarylandRegion | '';
    setSelectedRegion(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, val, selectedType, selectedCounty, selectedAmenity, '');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BreweryType | '';
    setSelectedType(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, val, selectedCounty, selectedAmenity, '');
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCounty(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, selectedType, val, selectedAmenity, '');
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAmenity(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, val, '');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('');
    setSelectedCounty('');
    setSelectedAmenity('');
    setSelectedQuickGuide('');
    router.push('/breweries');
  };

  // Filter logic
  const filteredBreweries = breweries.filter((brewery) => {
    const matchesSearch =
      brewery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.beerStyles.some(style => style.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion ? brewery.region === selectedRegion : true;
    const matchesType = selectedType ? brewery.type === selectedType : true;
    const matchesCounty = selectedCounty ? brewery.county === selectedCounty : true;
    const matchesAmenity = selectedAmenity ? brewery.amenities.includes(selectedAmenity) : true;

    return matchesSearch && matchesRegion && matchesType && matchesCounty && matchesAmenity;
  });

  return (
    <>
      {/* Filter Controls Box */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm mb-10 space-y-4">
        {/* Row 1: Search & Popular Guides preset select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              aria-label="Search by name, style, city"
              placeholder="Search by name, style, city..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Popular Guides Preset Select */}
          <div className="relative">
            <select
              value={selectedQuickGuide}
              onChange={handleQuickGuideChange}
              aria-label="Popular guides and presets"
              className="w-full pl-4 pr-10 py-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
            >
              <option value="" className="text-zinc-800 dark:text-zinc-200">Select Popular Guide or Filter Preset...</option>
              <option value="Frederick County" className="text-zinc-800 dark:text-zinc-200">Frederick County</option>
              <option value="Baltimore City" className="text-zinc-800 dark:text-zinc-200">Baltimore City</option>
              <option value="Montgomery County" className="text-zinc-800 dark:text-zinc-200">Montgomery County</option>
              <option value="Baltimore County" className="text-zinc-800 dark:text-zinc-200">Baltimore County</option>
              <option value="🐕 Dog-Friendly Taprooms" className="text-zinc-800 dark:text-zinc-200">🐕 Dog-Friendly Taprooms</option>
              <option value="Farm Breweries" className="text-zinc-800 dark:text-zinc-200">Farm Breweries</option>
              <option value="Local Brewpubs" className="text-zinc-800 dark:text-zinc-200">Local Brewpubs</option>
              <option value="Microbreweries" className="text-zinc-800 dark:text-zinc-200">Microbreweries</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Standard Filtering dropdowns & Reset button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Region Select */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              aria-label="Filter by region"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region} Region
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* County Select */}
          <div className="relative">
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              aria-label="Filter by county"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Counties</option>
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county} County
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Brewery Type Select */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              aria-label="Filter by brewery type"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Brewery Types</option>
              {breweryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <BeerIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Amenity Filter */}
          <div className="relative">
            <select
              value={selectedAmenity}
              onChange={handleAmenityChange}
              aria-label="Filter by amenity"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Amenities</option>
              {amenities.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={resetFilters}
              title="Reset Filters"
              aria-label="Reset all filters"
              className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800 font-bold text-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Result Count and active filters */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-850">
          <div>
            Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredBreweries.length}</span> of {breweries.length} breweries
          </div>
          {(searchQuery || selectedRegion || selectedType || selectedCounty || selectedAmenity || selectedQuickGuide) && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">Filters are currently active</span>
          )}
        </div>
      </div>

      {/* Directory Grid or Empty State */}
      {filteredBreweries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBreweries.map((brewery) => (
            <BreweryCard key={brewery.id} brewery={brewery} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Breweries Found"
          description="We couldn't find any breweries matching your current search parameters. Try resetting your filters."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
          icon="beer"
        />
      )}

      {/* Connected Curated Travel Guides & Popular Local Regions Showcase */}
      {guides.length > 0 && (
        <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-850 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Inspirational Trips</span>
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                Featured Guides & Collections
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Pair great craft beer with local tourist highlights, active outdoor adventures, and coastal weekend itineraries.
              </p>
            </div>
            <Link
              href="/guides"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 shrink-0"
            >
              Explore All Guides
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.slug}
                className="group p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{guide.region} Region</span>
                    <h4 className="font-extrabold text-sm md:text-base text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors line-clamp-1 leading-snug">
                      {guide.title}
                    </h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-900 text-xs mt-auto">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    Includes {guide.recommendedStops.length} recommended {guide.recommendedStops.length === 1 ? 'stop' : 'stops'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/map?guide=${guide.slug}`}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      View on Map
                    </Link>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors inline-flex items-center gap-0.5"
                    >
                      Read Guide <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick crawlable subcategories / popular counties SEO shortcuts block */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="block text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Popular Counties</span>
              <ul className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <li><Link href="/breweries/county/frederick" className="hover:text-amber-500 transition-colors">Frederick County</Link></li>
                <li><Link href="/breweries/county/baltimore-city" className="hover:text-amber-500 transition-colors">Baltimore City</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">More Counties</span>
              <ul className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <li><Link href="/breweries/county/montgomery" className="hover:text-amber-500 transition-colors">Montgomery County</Link></li>
                <li><Link href="/breweries/county/baltimore-county" className="hover:text-amber-500 transition-colors">Baltimore County</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Dog-Friendly</span>
              <ul className="space-y-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <li>
                  <Link href="/breweries/category/dog-friendly" className="hover:underline flex items-center gap-1">
                    🐕 Dog-Friendly Taprooms
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Brewery Types</span>
              <ul className="space-y-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <li><Link href="/breweries/category/farm-brewery" className="hover:text-amber-500 transition-colors">Farm Breweries</Link></li>
                <li><Link href="/breweries/category/brewpub" className="hover:text-amber-500 transition-colors">Local Brewpubs</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function BreweriesDirectoryContainer({ breweries, guides = [] }: BreweriesDirectoryContentProps) {
  return (
    <Suspense fallback={<div>Loading breweries directory...</div>}>
      <BreweriesDirectoryContent breweries={breweries} guides={guides} />
    </Suspense>
  );
}
