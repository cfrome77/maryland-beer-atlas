'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Beer as BeerIcon } from 'lucide-react';
import { mockBreweries } from '@/lib/data/mock-data';
import { BreweryType, MarylandRegion } from '@/lib/types';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/ui/page-header';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingGrid } from '@/components/ui/loading-state';

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
              className="w-full h-full py-3 md:py-0 inline-flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
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
    </>
  );
}

export default function BreweriesDirectoryPage() {
  const breadcrumbs = [
    { label: 'Directory', href: '/breweries' },
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen flex flex-col">
      {/* Refactored PageHeader */}
      <PageHeader
        title="Maryland Brewery Directory"
        description="Explore and filter through our comprehensive atlas of local Maryland breweries. Search by style, region, or city to find your next perfect pint."
        breadcrumbs={breadcrumbs}
        badge="Brewery Atlas"
      />

      {/* PageContainer structure */}
      <PageContainer size="default">
        <Suspense fallback={<LoadingGrid count={6} type="brewery" />}>
          <BreweriesDirectoryContent />
        </Suspense>
      </PageContainer>
    </div>
  );
}
