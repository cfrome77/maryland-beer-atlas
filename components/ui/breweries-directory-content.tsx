'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Beer as BeerIcon } from 'lucide-react';
import { Brewery } from '@/lib/types';
import { BreweryType, MarylandRegion } from '@/lib/types';
import { PageContainer } from '@/components/layout/page-container';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';

interface BreweriesDirectoryContentProps {
  breweries: Brewery[];
}

function BreweriesDirectoryContent({ breweries }: BreweriesDirectoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected filters from search params
  const initialRegion = searchParams?.get('region') as MarylandRegion || '';
  const initialType = searchParams?.get('type') as BreweryType || '';
  const initialSearch = searchParams?.get('search') || '';
  const initialCounty = searchParams?.get('county') || '';
  const initialAmenity = searchParams?.get('amenity') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | ''>(initialRegion);
  const [selectedType, setSelectedType] = useState<BreweryType | ''>(initialType);
  const [selectedCounty, setSelectedCounty] = useState<string>(initialCounty);
  const [selectedAmenity, setSelectedAmenity] = useState<string>(initialAmenity);

  // Region, Type, County and Amenity lists
  const regions: MarylandRegion[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const breweryTypes: BreweryType[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Dynamically extract unique counties and amenities from the provided dataset
  const counties = Array.from(new Set(breweries.map(b => b.county))).sort();
  const amenities = Array.from(new Set(breweries.flatMap(b => b.amenities))).sort();

  // Update URL Search Params to persist filter states
  const applyFilters = (search: string, region: string, type: string, county: string, amenity: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (county) params.set('county', county);
    if (amenity) params.set('amenity', amenity);
    router.push(`/breweries?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedRegion, selectedType, selectedCounty, selectedAmenity);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarylandRegion | '';
    setSelectedRegion(val);
    applyFilters(searchQuery, val, selectedType, selectedCounty, selectedAmenity);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BreweryType | '';
    setSelectedType(val);
    applyFilters(searchQuery, selectedRegion, val, selectedCounty, selectedAmenity);
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCounty(val);
    applyFilters(searchQuery, selectedRegion, selectedType, val, selectedAmenity);
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAmenity(val);
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, val);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('');
    setSelectedCounty('');
    setSelectedAmenity('');
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, style, city..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Region Select */}
          <div className="relative md:col-span-2">
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
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
          <div className="relative md:col-span-2">
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
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
          <div className="relative md:col-span-2">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              {breweryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <BeerIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Amenity Filter */}
          <div className="relative md:col-span-1.5 md:col-span-1">
            <select
              value={selectedAmenity}
              onChange={handleAmenityChange}
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Amenities</option>
              {amenities.map((amenity) => (
                <option key={amenity} value={amenity}>
                  {amenity}
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
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
            Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredBreweries.length}</span> of {breweries.length} breweries
          </div>
          {(searchQuery || selectedRegion || selectedType || selectedCounty || selectedAmenity) && (
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

export function BreweriesDirectoryContainer({ breweries }: BreweriesDirectoryContentProps) {
  return (
    <Suspense fallback={<div>Loading breweries directory...</div>}>
      <BreweriesDirectoryContent breweries={breweries} />
    </Suspense>
  );
}
