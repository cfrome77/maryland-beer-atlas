'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Beer as BeerIcon, MapPin, Check, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
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
  const initialCounty = searchParams?.get('county') || '';
  const initialAmenities = searchParams?.get('amenities')?.split(',').filter(Boolean) || [];

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | ''>(initialRegion);
  const [selectedType, setSelectedType] = useState<BreweryType | ''>(initialType);
  const [selectedCounty, setSelectedCounty] = useState<string>(initialCounty);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialAmenities);
  const [showAdvanced, setShowAdvanced] = useState(initialCounty !== '' || initialAmenities.length > 0);

  // Lists for dropdown options
  const regions: MarylandRegion[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const breweryTypes: BreweryType[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Extract unique counties and amenities dynamically from data to keep Sanity CMS architecture extensible
  const counties = Array.from(new Set(mockBreweries.map((b) => b.county))).sort();
  const allAmenities = Array.from(new Set(mockBreweries.flatMap((b) => b.amenities))).sort();

  // Update URL Search Params to persist filter states
  const applyFilters = (
    search: string,
    region: string,
    type: string,
    county: string,
    amenitiesList: string[]
  ) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (county) params.set('county', county);
    if (amenitiesList.length > 0) params.set('amenities', amenitiesList.join(','));
    router.push(`/breweries?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedRegion, selectedType, selectedCounty, selectedAmenities);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarylandRegion | '';
    setSelectedRegion(val);
    applyFilters(searchQuery, val, selectedType, selectedCounty, selectedAmenities);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BreweryType | '';
    setSelectedType(val);
    applyFilters(searchQuery, selectedRegion, val, selectedCounty, selectedAmenities);
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCounty(val);
    applyFilters(searchQuery, selectedRegion, selectedType, val, selectedAmenities);
  };

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];

    setSelectedAmenities(updated);
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, updated);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('');
    setSelectedCounty('');
    setSelectedAmenities([]);
    router.push('/breweries');
  };

  // Filter logic matching search text, type, region, county, and multiple amenities
  const filteredBreweries = mockBreweries.filter((brewery) => {
    const matchesSearch =
      brewery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.beerStyles.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = selectedRegion ? brewery.region === selectedRegion : true;
    const matchesType = selectedType ? brewery.type === selectedType : true;
    const matchesCounty = selectedCounty ? brewery.county === selectedCounty : true;
    const matchesAmenities = selectedAmenities.length > 0
      ? selectedAmenities.every(amenity => brewery.amenities.includes(amenity))
      : true;

    return matchesSearch && matchesRegion && matchesType && matchesCounty && matchesAmenities;
  });

  return (
    <>
      {/* Search & Filter Controls Panel */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm mb-10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main search query */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, city, style, or keyword..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Region filter */}
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

          {/* Brewery Type filter */}
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

          {/* Quick reset/toggle actions */}
          <div className="md:col-span-1 flex gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Toggle Advanced Filters"
              className={`flex-1 py-3 md:py-0 inline-flex items-center justify-center rounded-xl transition-colors border cursor-pointer ${
                showAdvanced || selectedCounty || selectedAmenities.length > 0
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-3 md:px-3 md:py-0 inline-flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Advanced filter drawer */}
        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* County Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Filter by Maryland County
              </label>
              <div className="relative max-w-sm">
                <select
                  value={selectedCounty}
                  onChange={handleCountyChange}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">All Maryland Counties</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Amenities badges multiselect */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Filter by Taproom Amenities (Multi-select)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {allAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white font-semibold shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Result summary bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-850">
          <div>
            Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredBreweries.length}</span> of {mockBreweries.length} breweries
          </div>
          {(searchQuery || selectedRegion || selectedType || selectedCounty || selectedAmenities.length > 0) && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active filters narrowing results
            </span>
          )}
        </div>
      </div>

      {/* Brewery Grid or Empty State */}
      {filteredBreweries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBreweries.map((brewery) => (
            <BreweryCard key={brewery.id} brewery={brewery} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Breweries Match Your Filter Criteria"
          description="We couldn't find any breweries that meet all the selected filter parameters. Try loosening your filters or resetting."
          actionLabel="Clear All Filter Criteria"
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
      {/* Beautiful header visual */}
      <PageHeader
        title="Maryland Brewery Directory"
        description="Explore and filter through our comprehensive atlas of local Maryland breweries. Search by name, county, beer style, or custom amenities."
        breadcrumbs={breadcrumbs}
        badge="Brewery Directory"
      />

      {/* Safe container constraint */}
      <PageContainer size="default" className="py-10">
        <Suspense fallback={<LoadingGrid count={6} type="brewery" />}>
          <BreweriesDirectoryContent />
        </Suspense>
      </PageContainer>
    </div>
  );
}
