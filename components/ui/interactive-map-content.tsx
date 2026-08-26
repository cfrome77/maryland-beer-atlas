'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Info, Beer as BeerIcon, Phone, Globe, SlidersHorizontal, Eye, Sparkles, Compass } from 'lucide-react';
import { Brewery, BeerTrail, TravelGuide } from '@/lib/types';
import { BreweryStatusBadge, BreweryFreshnessBadge } from '@/components/ui/brewery-status-badge';
import { getDataFreshnessInfo } from '@/lib/utils/freshness';

// Dynamically import the MapView component to disable SSR since MapLibre uses browser APIs (window, self, etc.)
const MapView = dynamic(
  () => import('@/components/ui/map-view'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Loading Interactive Map...</p>
        </div>
      </div>
    ),
  }
);

interface InteractiveMapContentProps {
  breweries: Brewery[];
  trails?: BeerTrail[];
  guides?: TravelGuide[];
}

// Mini custom multi-select dropdown component using pure React states for simplicity and precision.
interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

function MultiSelectDropdown({ label, options, selectedValues, onChange, placeholder }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Unique ID for ARIA mapping
  const id = React.useId();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(val => val !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Keyboard accessibility and focus management
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, option: string, index: number) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggleOption(option);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % options.length;
      optionRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      optionRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative flex-1 min-w-[140px] md:min-w-[170px] space-y-1.5"
    >
      <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{label}</span>
      <button
        ref={buttonRef}
        type="button"
        id={`${id}-button`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-880 rounded-xl text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <span className="truncate">
          {selectedValues.length === 0 ? (
            <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.5 rounded text-[10px] leading-none shrink-0">
                {selectedValues.length}
              </span>
              <span className="truncate">{selectedValues.join(', ')}</span>
            </span>
          )}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedValues.length > 0 && (
            <span
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.stopPropagation();
                  onChange([]);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Clear selected ${label}`}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
              title="Clear selection"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          className="absolute left-0 mt-1 w-full max-h-[220px] overflow-y-auto z-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-880 rounded-xl shadow-lg p-2.5 space-y-1"
        >
          {options.map((option, idx) => {
            const isChecked = selectedValues.includes(option);
            return (
              <div
                key={option}
                ref={el => { optionRefs.current[idx] = el; }}
                role="option"
                aria-selected={isChecked}
                tabIndex={0}
                onKeyDown={(e) => handleOptionKeyDown(e, option, idx)}
                onClick={() => handleToggleOption(option)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-amber-500 ${
                  isChecked
                    ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}} // Controlled through the parent div's handlers
                  tabIndex={-1} // Avoid double tab stops
                  className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-880 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 focus:outline-none pointer-events-none"
                />
                <span className="truncate">{option}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InteractiveMapContent({ breweries, trails = [], guides = [] }: InteractiveMapContentProps) {
  // Multi-Select Filters State
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [activeTrailId, setActiveTrailId] = useState<string | null>(null);

  // Lists of options dynamically pulled/hardcoded
  const regions: string[] = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const types: string[] = ['Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];
  const counties = useMemo(() => Array.from(new Set(breweries.map(b => b.county))).sort(), [breweries]);
  const amenities = useMemo(() => Array.from(new Set(breweries.flatMap(b => b.amenities))).sort(), [breweries]);

  // Filter breweries based on regions, types, counties, and amenities selection
  const visibleBreweries = useMemo(() => {
    return breweries.filter((b) => {
      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(b.region);
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(b.type);
      const countyMatch = selectedCounties.length === 0 || selectedCounties.includes(b.county);
      const amenityMatch = selectedAmenities.length === 0 || selectedAmenities.every(amenity => b.amenities.includes(amenity));

      // If a trail is active, restrict visibility to the trail's breweries
      if (activeTrailId) {
        const trail = trails.find((t) => t.id === activeTrailId);
        if (trail) {
          const inTrail = trail.breweries.some((tb) => tb.id === b.id);
          return inTrail && regionMatch && typeMatch && countyMatch && amenityMatch;
        }
      }

      return regionMatch && typeMatch && countyMatch && amenityMatch;
    });
  }, [breweries, selectedRegions, selectedTypes, selectedCounties, selectedAmenities, activeTrailId, trails]);

  const handleSelectBrewery = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

  const handleClearAllFilters = () => {
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedCounties([]);
    setSelectedAmenities([]);
    setActiveTrailId(null);
    setSelectedBrewery(null);
  };

  // Sync selected brewery when visible items change
  useEffect(() => {
    if (selectedBrewery && !visibleBreweries.some(b => b.id === selectedBrewery.id)) {
      const timer = setTimeout(() => {
        setSelectedBrewery(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [visibleBreweries, selectedBrewery]);

  const handleTrailToggle = (trailId: string) => {
    if (activeTrailId === trailId) {
      setActiveTrailId(null);
    } else {
      setActiveTrailId(trailId);
      // Keep selectedBrewery null so the map uses fitBounds for full trail route overview
      setSelectedBrewery(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

        {/* Main Visual Map & Controls (LHS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Filter Controls Accordion/Container */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>Map Filters & Layer Explorer</span>
              </div>
              {(selectedRegions.length > 0 || selectedTypes.length > 0 || selectedCounties.length > 0 || selectedAmenities.length > 0 || activeTrailId) && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Multi-Select Dropdowns grid - adjusted to 4 columns to fit card perfectly */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MultiSelectDropdown
                  label="Regions"
                  options={regions}
                  selectedValues={selectedRegions}
                  onChange={(vals) => {
                    setSelectedRegions(vals);
                  }}
                  placeholder="All Regions"
                />
                <MultiSelectDropdown
                  label="Counties"
                  options={counties}
                  selectedValues={selectedCounties}
                  onChange={(vals) => {
                    setSelectedCounties(vals);
                  }}
                  placeholder="All Counties"
                />
                <MultiSelectDropdown
                  label="Brewery Type"
                  options={types}
                  selectedValues={selectedTypes}
                  onChange={(vals) => {
                    setSelectedTypes(vals);
                  }}
                  placeholder="All Types"
                />
                <MultiSelectDropdown
                  label="Amenities"
                  options={amenities}
                  selectedValues={selectedAmenities}
                  onChange={(vals) => {
                    setSelectedAmenities(vals);
                  }}
                  placeholder="All Amenities"
                />
              </div>

              {/* Optional Trail Routes Layer toggler */}
              {trails.length > 0 && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Active Beer Trail Layer</span>
                    <div className="flex flex-wrap gap-1.5">
                      {trails.map((trail) => (
                        <button
                          key={trail.id}
                          onClick={() => handleTrailToggle(trail.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            activeTrailId === trail.id
                              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                              : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-880 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          {trail.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Client-Side MapView Component */}
          <div className="relative aspect-[16/10] md:aspect-[16/9] w-full min-h-[420px]">
            <MapView
              breweries={visibleBreweries}
              selectedBrewery={selectedBrewery}
              onSelectBrewery={handleSelectBrewery}
              trails={trails}
              activeTrailId={activeTrailId}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* List of matching breweries in active region */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              Matching Breweries ({visibleBreweries.length})
            </h3>
            {visibleBreweries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {visibleBreweries.map((brewery) => {
                  const isActive = selectedBrewery?.id === brewery.id;
                  return (
                    <button
                      key={brewery.id}
                      onClick={() => handleSelectBrewery(brewery)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 text-zinc-950 dark:text-white'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm truncate">{brewery.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{brewery.city} • {brewery.type}</span>
                          <BreweryStatusBadge brewery={brewery} size="sm" />
                        </div>
                      </div>
                      <MapPin className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-zinc-400'}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                No breweries match your selected filters. Try broadening your region or type preferences.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Inspector Panel (RHS) */}
        <div className="lg:col-span-4">
          {selectedBrewery ? (
            <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-lg sticky top-24 flex flex-col h-[calc(100vh-140px)] max-h-[660px]">
              {/* Photo Header */}
              <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 shrink-0">
                <Image
                  src={selectedBrewery.image}
                  alt={selectedBrewery.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/85 text-white backdrop-blur-sm">
                    {selectedBrewery.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <BreweryStatusBadge brewery={selectedBrewery} size="sm" />
                </div>
              </div>

              {/* Details Scroll */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{selectedBrewery.region} Region</span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{selectedBrewery.name}</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2 leading-relaxed">
                    {selectedBrewery.description}
                  </p>
                </div>

                {/* Status & Data Freshness Summary Block */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-850 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Operational Status</span>
                    <BreweryStatusBadge brewery={selectedBrewery} size="sm" showDetail={true} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Data Freshness</span>
                    <BreweryFreshnessBadge brewery={selectedBrewery} size="sm" />
                  </div>
                  {(() => {
                    const freshness = getDataFreshnessInfo(selectedBrewery);
                    return (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800 font-medium">
                        {freshness.freshnessSummary}
                      </p>
                    );
                  })()}
                </div>

                {/* Address and quick info */}
                <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{selectedBrewery.address}, {selectedBrewery.city}, MD {selectedBrewery.zipCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{selectedBrewery.phone}</span>
                  </div>
                </div>

                {/* Specialty Styles highlights */}
                <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    <BeerIcon className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    Specialty Styles
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBrewery.beerStyles.slice(0, 3).map((style, idx) => (
                      <span key={idx} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button Action bar at bottom */}
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/50 flex gap-2 shrink-0">
                <Link
                  href={`/breweries/${selectedBrewery.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition-colors"
                >
                  View Taproom Profile
                </Link>
                <a
                  href={selectedBrewery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
                  title="Visit Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-8 text-center space-y-3 shadow-md h-full flex flex-col justify-center items-center">
              <Info className="w-10 h-10 text-zinc-400" />
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">No Brewery Selected</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-[200px]">
                Select a marker on the map to inspect taproom details.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Connected Travel Guides Showcase section below the map layout */}
      {guides.length > 0 && (
        <div className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-850">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
                Explore Curated Local Travel Guides & Collections
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Hand-picked local travel itineraries and premium guides mapping the finest beer adventures.
              </p>
            </div>
            <Link
              href="/guides"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              All Guides &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => {
              return (
                <div
                  key={guide.slug}
                  className="group p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:shadow-sm"
                >
                  <div className="flex gap-4 items-start">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                      <Image
                        src={guide.image}
                        alt={guide.title}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{guide.region} Region</span>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors line-clamp-1 leading-snug">
                        {guide.title}
                      </h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                        {guide.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[11px] font-semibold mt-auto">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-amber-500" />
                      {guide.recommendedStops.length} Must-Visit Stops
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors"
                      >
                        Read Full Guide
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
