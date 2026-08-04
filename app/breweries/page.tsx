'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Filter, RotateCcw, Beer as BeerIcon } from 'lucide-react';
import { mockBreweries } from '@/lib/data/mock-data';
import { BreweryType, MarylandRegion } from '@/lib/types';

function BreweriesDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected filters from search params
  const initialRegion = searchParams?.get('region') as MarylandRegion || '';
  const initialType = searchParams?.get('type') as BreweryType || '';
  const initialSearch = searchParams?.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | ''>(initialRegion);
  const [selectedType, setSelectedType] = useState<BreweryType | ''>(initialType);

  // Region and Type lists
  const regions: MarylandRegion[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const breweryTypes: BreweryType[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Update URL Search Params to persist filter states
  const applyFilters = (search: string, region: string, type: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    router.push(`/breweries?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedRegion, selectedType);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarylandRegion | '';
    setSelectedRegion(val);
    applyFilters(searchQuery, val, selectedType);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BreweryType | '';
    setSelectedType(val);
    applyFilters(searchQuery, selectedRegion, val);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('');
    router.push('/breweries');
  };

  // Filter logic
  const filteredBreweries = mockBreweries.filter((brewery) => {
    const matchesSearch =
      brewery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion ? brewery.region === selectedRegion : true;
    const matchesType = selectedType ? brewery.type === selectedType : true;

    return matchesSearch && matchesRegion && matchesType;
  });

  return (
    <>
      {/* Filter Controls Box */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search breweries by name, city, or keyword..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Region Select */}
          <div className="relative md:col-span-3">
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
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

          {/* Brewery Type Select */}
          <div className="relative md:col-span-3">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
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

          {/* Reset Button */}
          <div className="md:col-span-1">
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="w-full h-full py-3 md:py-0 inline-flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Result Count and active filters */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-850">
          <div>
            Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredBreweries.length}</span> of {mockBreweries.length} breweries
          </div>
          {(searchQuery || selectedRegion || selectedType) && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">Filters are currently active</span>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredBreweries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBreweries.map((brewery) => (
            <div
              key={brewery.id}
              className="group rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={brewery.image}
                    alt={brewery.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/85 text-white backdrop-blur-sm">
                      {brewery.type}
                    </span>
                    {brewery.featured && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {brewery.region} Region
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-tight">
                    {brewery.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">
                    {brewery.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {brewery.city}
                </span>
                <Link
                  href={`/breweries/${brewery.id}`}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  View Taproom &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 max-w-lg mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
            <BeerIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">No Breweries Found</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            We couldn&apos;t find any breweries matching your current search parameters. Try clearing some filters or searching for something else.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-sm transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </>
  );
}

export default function BreweriesDirectoryPage() {
  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Subtitle */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Maryland Brewery Directory
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl">
            Explore and filter through our comprehensive atlas of local Maryland breweries. Search by style, region, or city to find your next perfect pint.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4" />
            <p className="text-sm font-semibold">Loading Brewery Directory...</p>
          </div>
        }>
          <BreweriesDirectoryContent />
        </Suspense>
      </div>
    </div>
  );
}
