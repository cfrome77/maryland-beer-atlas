'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Beer as BeerIcon, Activity, ArrowUpDown, MapPin, Tag, Dog, Utensils, Factory, Trees } from 'lucide-react';
import { Brewery, BreweryType, MarylandRegion, OperationalCategory } from '@/lib/types';
import { BreweryCard } from '@/components/ui/brewery-card';
import { EmptyState } from '@/components/ui/empty-state';
import { TravelGuide } from '@/lib/types';
import { filterBreweries, BrewerySortOption } from '@/lib/utils/filter-breweries';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, BookOpen, ArrowRight } from 'lucide-react';
import { Recommendation } from '@/lib/services/recommendation.service';
import { RecommendationsPanel } from '@/components/ui/recommendations/recommendations-panel';

interface BreweriesDirectoryContentProps {
  breweries: Brewery[];
  guides?: TravelGuide[];
  recommendations?: Recommendation[];
}

interface FilterPreset {
  label: string;
  county?: string;
  region?: MarylandRegion | '';
  type?: BreweryType | '';
  amenity?: string;
  status?: string;
}

const FILTER_PRESETS: Record<string, FilterPreset> = {
  'Frederick County': { label: 'Frederick County', county: 'Frederick' },
  'Baltimore City': { label: 'Baltimore City', county: 'Baltimore City' },
  'Montgomery County': { label: 'Montgomery County', county: 'Montgomery' },
  'Baltimore County': { label: 'Baltimore County', county: 'Baltimore County' },
  '🐕 Dog-Friendly Taprooms': { label: '🐕 Dog-Friendly Taprooms', amenity: 'Dog Friendly' },
  'Farm Breweries': { label: 'Farm Breweries', type: 'Farm Brewery' },
  'Local Brewpubs': { label: 'Local Brewpubs', type: 'Brewpub' },
  'Microbreweries': { label: 'Microbreweries', type: 'Microbrewery' },
  'Open Taprooms': { label: 'Open Taprooms', status: 'open' },
};

const OPERATIONAL_STATUS_OPTIONS: { label: string; value: OperationalCategory | '' }[] = [
  { label: 'All Operational Statuses', value: '' },
  { label: 'Currently Open', value: 'open' },
  { label: 'Temporarily Closed', value: 'temporarily_closed' },
  { label: 'Permanently Closed', value: 'permanently_closed' },
  { label: 'Hours Unavailable', value: 'hours_unavailable' },
];

const SORT_OPTIONS: { label: string; value: BrewerySortOption }[] = [
  { label: 'Name (A to Z)', value: 'name-asc' },
  { label: 'Name (Z to A)', value: 'name-desc' },
  { label: 'County (A to Z)', value: 'county-asc' },
  { label: 'City (A to Z)', value: 'city-asc' },
  { label: 'Region (A to Z)', value: 'region-asc' },
  { label: 'Type (A to Z)', value: 'type-asc' },
  { label: 'Recently Verified', value: 'verified-desc' },
];

function slugifyCounty(countyName: string): string {
  return countyName
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Microbrewery: 'microbrewery',
  Brewpub: 'brewpub',
  Production: 'production',
  'Farm Brewery': 'farm-brewery',
};

function BreweriesDirectoryContent({ breweries, guides = [], recommendations = [] }: BreweriesDirectoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected filters from search params
  const initialRegion = (searchParams?.get('region') as MarylandRegion) || '';
  const initialType = (searchParams?.get('type') as BreweryType) || '';
  const initialSearch = searchParams?.get('search') || '';
  const initialCounty = searchParams?.get('county') || '';
  const initialAmenity = searchParams?.get('amenity') || '';
  const initialStatus = searchParams?.get('status') || '';
  const initialQuickGuide = searchParams?.get('quickGuide') || '';
  const initialSort = (searchParams?.get('sort') as BrewerySortOption) || 'name-asc';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | ''>(initialRegion);
  const [selectedType, setSelectedType] = useState<BreweryType | ''>(initialType);
  const [selectedCounty, setSelectedCounty] = useState<string>(initialCounty);
  const [selectedAmenity, setSelectedAmenity] = useState<string>(initialAmenity);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedQuickGuide, setSelectedQuickGuide] = useState<string>(initialQuickGuide);
  const [selectedSort, setSelectedSort] = useState<BrewerySortOption>(initialSort);

  // Region, Type, County and Amenity lists
  const regions: MarylandRegion[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const breweryTypes: BreweryType[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Dynamically extract unique counties and amenities from dataset
  const counties = useMemo(() => Array.from(new Set(breweries.map((b) => b.county))).sort(), [breweries]);
  const amenities = useMemo(() => Array.from(new Set(breweries.flatMap((b) => b.amenities))).sort(), [breweries]);

  // Counts per County
  const countyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    breweries.forEach((b) => {
      counts[b.county] = (counts[b.county] || 0) + 1;
    });
    return counts;
  }, [breweries]);

  // Counts per Brewery Type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    breweries.forEach((b) => {
      counts[b.type] = (counts[b.type] || 0) + 1;
    });
    return counts;
  }, [breweries]);

  // Count for Dog Friendly
  const dogFriendlyCount = useMemo(() => {
    return breweries.filter((b) => b.amenities.some((a) => a.toLowerCase().includes('dog friendly'))).length;
  }, [breweries]);

  // Keep track of parameters currently reflected in URL
  const prevParamsRef = useRef<{
    search: string;
    region: MarylandRegion | '';
    type: BreweryType | '';
    county: string;
    amenity: string;
    status: string;
    quickGuide: string;
    sort: BrewerySortOption;
  }>({
    search: initialSearch,
    region: initialRegion,
    type: initialType,
    county: initialCounty,
    amenity: initialAmenity,
    status: initialStatus,
    quickGuide: initialQuickGuide,
    sort: initialSort,
  });

  const filterStateRef = useRef({
    selectedRegion,
    selectedType,
    selectedCounty,
    selectedAmenity,
    selectedStatus,
    selectedSort,
  });

  useEffect(() => {
    filterStateRef.current = {
      selectedRegion,
      selectedType,
      selectedCounty,
      selectedAmenity,
      selectedStatus,
      selectedSort,
    };
  }, [selectedRegion, selectedType, selectedCounty, selectedAmenity, selectedStatus, selectedSort]);

  useEffect(() => {
    const currentSearch = searchParams?.get('search') || '';
    const currentRegion = searchParams?.get('region') || '';
    const currentType = searchParams?.get('type') || '';
    const currentCounty = searchParams?.get('county') || '';
    const currentAmenity = searchParams?.get('amenity') || '';
    const currentStatus = searchParams?.get('status') || '';
    const currentQuickGuide = searchParams?.get('quickGuide') || '';
    const currentSort = (searchParams?.get('sort') as BrewerySortOption) || 'name-asc';

    const prev = prevParamsRef.current;
    const hasChanged =
      currentSearch !== prev.search ||
      currentRegion !== prev.region ||
      currentType !== prev.type ||
      currentCounty !== prev.county ||
      currentAmenity !== prev.amenity ||
      currentStatus !== prev.status ||
      currentQuickGuide !== prev.quickGuide ||
      currentSort !== prev.sort;

    if (hasChanged) {
      setSearchQuery(currentSearch);
      setSelectedRegion(currentRegion as MarylandRegion | '');
      setSelectedType(currentType as BreweryType | '');
      setSelectedCounty(currentCounty);
      setSelectedAmenity(currentAmenity);
      setSelectedStatus(currentStatus);
      setSelectedQuickGuide(currentQuickGuide);
      setSelectedSort(currentSort);

      prevParamsRef.current = {
        search: currentSearch,
        region: currentRegion as MarylandRegion | '',
        type: currentType as BreweryType | '',
        county: currentCounty,
        amenity: currentAmenity,
        status: currentStatus,
        quickGuide: currentQuickGuide,
        sort: currentSort,
      };
    }
  }, [searchParams]);

  const applyFilters = (
    search: string,
    region: string,
    type: string,
    county: string,
    amenity: string,
    status: string,
    quickGuide: string = '',
    sort: BrewerySortOption = 'name-asc',
    replace: boolean = false
  ) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (county) params.set('county', county);
    if (amenity) params.set('amenity', amenity);
    if (status) params.set('status', status);
    if (quickGuide) params.set('quickGuide', quickGuide);
    if (sort && sort !== 'name-asc') params.set('sort', sort);

    const query = params.toString();
    const url = query ? `/breweries?${query}` : '/breweries';
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  useEffect(() => {
    const currentSearch = searchParams?.get('search') || '';
    if (searchQuery === currentSearch) return;

    const timer = setTimeout(() => {
      setSelectedQuickGuide('');
      const {
        selectedRegion: r,
        selectedType: t,
        selectedCounty: c,
        selectedAmenity: a,
        selectedStatus: s,
        selectedSort: st,
      } = filterStateRef.current;
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (r) params.set('region', r);
      if (t) params.set('type', t);
      if (c) params.set('county', c);
      if (a) params.set('amenity', a);
      if (s) params.set('status', s);
      if (st && st !== 'name-asc') params.set('sort', st);

      const query = params.toString();
      router.replace(query ? `/breweries?${query}` : '/breweries');
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  const handleQuickGuideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedQuickGuide(val);

    const preset = FILTER_PRESETS[val];
    if (preset) {
      const targetCounty = preset.county || '';
      const targetRegion = preset.region || '';
      const targetType = preset.type || '';
      const targetAmenity = preset.amenity || '';
      const targetStatus = preset.status || '';

      setSelectedCounty(targetCounty);
      setSelectedRegion(targetRegion);
      setSelectedType(targetType);
      setSelectedAmenity(targetAmenity);
      setSelectedStatus(targetStatus);

      applyFilters(searchQuery, targetRegion, targetType, targetCounty, targetAmenity, targetStatus, val, selectedSort);
    } else {
      setSelectedQuickGuide('');
      applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, selectedAmenity, selectedStatus, '', selectedSort);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MarylandRegion | '';
    setSelectedRegion(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, val, selectedType, selectedCounty, selectedAmenity, selectedStatus, '', selectedSort);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BreweryType | '';
    setSelectedType(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, val, selectedCounty, selectedAmenity, selectedStatus, '', selectedSort);
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCounty(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, selectedType, val, selectedAmenity, selectedStatus, '', selectedSort);
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAmenity(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, val, selectedStatus, '', selectedSort);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStatus(val);
    setSelectedQuickGuide('');
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, selectedAmenity, val, '', selectedSort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BrewerySortOption;
    setSelectedSort(val);
    applyFilters(searchQuery, selectedRegion, selectedType, selectedCounty, selectedAmenity, selectedStatus, selectedQuickGuide, val);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedType('');
    setSelectedCounty('');
    setSelectedAmenity('');
    setSelectedStatus('');
    setSelectedQuickGuide('');
    setSelectedSort('name-asc');
    router.push('/breweries');
  };

  const filteredBreweries = filterBreweries(breweries, {
    search: searchQuery,
    region: selectedRegion || undefined,
    type: selectedType || undefined,
    county: selectedCounty,
    amenity: selectedAmenity,
    status: selectedStatus,
    sort: selectedSort,
  });

  return (
    <>
      {/* Filter Controls Box */}
      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 shadow-sm mb-10 space-y-4">
        {/* Row 1: Search & Popular Guides preset select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              aria-label="Search by name, style, city"
              placeholder="Search by name, style, city..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedQuickGuide}
              onChange={handleQuickGuideChange}
              aria-label="Popular guides and presets"
              className="w-full pl-4 pr-10 py-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <option value="" className="text-zinc-800 dark:text-zinc-200">
                Select Popular Guide or Filter Preset...
              </option>
              {Object.keys(FILTER_PRESETS).map((key) => (
                <option key={key} value={key} className="text-zinc-800 dark:text-zinc-200">
                  {key}
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Row 2: Standard Filtering dropdowns & Reset button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              aria-label="Filter by region"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
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

          <div className="relative">
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              aria-label="Filter by county"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <option value="">All Counties</option>
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county} County ({countyCounts[county] || 0})
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              aria-label="Filter by brewery type"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <option value="">All Brewery Types</option>
              {breweryTypes.map((type) => (
                <option key={type} value={type}>
                  {type} ({typeCounts[type] || 0})
                </option>
              ))}
            </select>
            <BeerIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              aria-label="Filter by operational status"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              {OPERATIONAL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Activity className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedAmenity}
              onChange={handleAmenityChange}
              aria-label="Filter by amenity"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
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

          <div className="relative">
            <select
              value={selectedSort}
              onChange={handleSortChange}
              aria-label="Sort breweries"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
          </div>

          <div>
            <button
              onClick={resetFilters}
              title="Reset Filters"
              aria-label="Reset all filters"
              className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Result Count and active filters with aria-live */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-850"
        >
          <div>
            Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{filteredBreweries.length}</span> of {breweries.length} breweries
          </div>
          {(searchQuery || selectedRegion || selectedType || selectedCounty || selectedAmenity || selectedStatus || selectedQuickGuide) && (
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

      {/* Recommendations Panel */}
      <div className="mt-8">
        <RecommendationsPanel recommendations={recommendations} />
      </div>

      {/* Dynamic Discovery Sections: Browse by County and Browse by Category */}
      <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-850 space-y-10">
        {/* County Discovery Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Browse Breweries by County
            </h3>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {counties.length} Maryland Counties
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {counties.map((county) => {
              const count = countyCounts[county] || 0;
              const slug = slugifyCounty(county);
              return (
                <Link
                  key={county}
                  href={`/breweries/county/${slug}`}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-zinc-200 dark:border-zinc-850 hover:border-amber-400 transition-all"
                >
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {county}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    {count} {count === 1 ? 'brewery' : 'breweries'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Category & Type Discovery Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Browse by Category & Style
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/breweries/category/dog-friendly"
              className="p-4 rounded-xl bg-white dark:bg-zinc-950 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-zinc-200 dark:border-zinc-850 hover:border-amber-400 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Dog className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Dog-Friendly
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                {dogFriendlyCount} taprooms with outdoor seating for dogs
              </p>
            </Link>

            {breweryTypes.map((type) => {
              const count = typeCounts[type] || 0;
              const slug = CATEGORY_SLUG_MAP[type] || type.toLowerCase();
              let icon = <BeerIcon className="w-4 h-4" />;
              if (type === 'Brewpub') icon = <Utensils className="w-4 h-4" />;
              if (type === 'Production') icon = <Factory className="w-4 h-4" />;
              if (type === 'Farm Brewery') icon = <Trees className="w-4 h-4" />;

              return (
                <Link
                  key={type}
                  href={`/breweries/category/${slug}`}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-950 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-zinc-200 dark:border-zinc-850 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">{icon}</div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {type}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {count} active {count === 1 ? 'brewery' : 'breweries'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connected Curated Travel Guides Showcase */}
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
        </div>
      )}
    </>
  );
}

export function BreweriesDirectoryContainer({ breweries, guides = [], recommendations = [] }: BreweriesDirectoryContentProps) {
  return (
    <Suspense fallback={<div>Loading breweries directory...</div>}>
      <BreweriesDirectoryContent breweries={breweries} guides={guides} recommendations={recommendations} />
    </Suspense>
  );
}
