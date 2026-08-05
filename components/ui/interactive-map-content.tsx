'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Info, Beer as BeerIcon, Phone, Globe, SlidersHorizontal, Eye } from 'lucide-react';
import { MarylandRegion, Brewery, BeerTrail, BreweryType } from '@/lib/types';

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
}

export function InteractiveMapContent({ breweries, trails = [] }: InteractiveMapContentProps) {
  // Filters State
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | 'All'>('All');
  const [selectedType, setSelectedType] = useState<BreweryType | 'All'>('All');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(breweries[0] || null);
  const [activeTrailId, setActiveTrailId] = useState<string | null>(null);

  // Lists of options
  const regions: (MarylandRegion | 'All')[] = ['All', 'Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];
  const types: (BreweryType | 'All')[] = ['All', 'Microbrewery', 'Brewpub', 'Production', 'Farm Brewery'];

  // Filter breweries based on region and brewery type selection
  const visibleBreweries = useMemo(() => {
    return breweries.filter((b) => {
      const regionMatch = selectedRegion === 'All' || b.region === selectedRegion;
      const typeMatch = selectedType === 'All' || b.type === selectedType;

      // If a trail is active, restrict visibility to the trail's breweries
      if (activeTrailId) {
        const trail = trails.find((t) => t.id === activeTrailId);
        if (trail) {
          const inTrail = trail.breweries.some((tb) => tb.id === b.id);
          return inTrail && regionMatch && typeMatch;
        }
      }

      return regionMatch && typeMatch;
    });
  }, [breweries, selectedRegion, selectedType, activeTrailId, trails]);

  const handleSelectBrewery = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

  const handleRegionClick = (region: MarylandRegion | 'All') => {
    setSelectedRegion(region);
    // Reset selected brewery if it is not in the newly filtered visible list
    const isVisibleNow = breweries.filter(b => region === 'All' || b.region === region);
    if (isVisibleNow.length > 0) {
      setSelectedBrewery(isVisibleNow[0]);
    } else {
      setSelectedBrewery(null);
    }
  };

  const handleTypeClick = (type: BreweryType | 'All') => {
    setSelectedType(type);
    const isVisibleNow = breweries.filter(b => {
      const regionMatch = selectedRegion === 'All' || b.region === selectedRegion;
      const typeMatch = type === 'All' || b.type === type;
      return regionMatch && typeMatch;
    });
    if (isVisibleNow.length > 0) {
      setSelectedBrewery(isVisibleNow[0]);
    } else {
      setSelectedBrewery(null);
    }
  };

  const handleTrailToggle = (trailId: string) => {
    if (activeTrailId === trailId) {
      setActiveTrailId(null);
    } else {
      setActiveTrailId(trailId);
      // Auto-select the first brewery in the trail
      const trail = trails.find((t) => t.id === trailId);
      if (trail && trail.breweries && trail.breweries.length > 0) {
        setSelectedBrewery(trail.breweries[0]);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

      {/* Main Visual Map & Controls (LHS) */}
      <div className="lg:col-span-8 flex flex-col gap-6">

        {/* Filter Controls Accordion/Container */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>Map Filters & Layer Explorer</span>
          </div>

          <div className="space-y-4">
            {/* Quick regional filter tabs */}
            <div>
              <span className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Maryland Regions</span>
              <div className="flex flex-wrap gap-1.5">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedRegion === region
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    {region === 'All' ? 'All Maryland' : `${region}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Brewery type filters */}
            <div>
              <span className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Brewery Type</span>
              <div className="flex flex-wrap gap-1.5">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedType === type
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    {type === 'All' ? 'All Types' : `${type}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Trail Routes toggler */}
            {trails.length > 0 && (
              <div>
                <span className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Active Beer Trail Layer</span>
                <div className="flex flex-wrap gap-1.5">
                  {trails.map((trail) => (
                    <button
                      key={trail.id}
                      onClick={() => handleTrailToggle(trail.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        activeTrailId === trail.id
                          ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      {trail.name}
                    </button>
                  ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
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
                    <div className="space-y-0.5 min-w-0">
                      <span className="block font-bold text-sm truncate">{brewery.name}</span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400">{brewery.city} • {brewery.type}</span>
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
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-lg sticky top-24 flex flex-col h-[calc(100vh-140px)] max-h-[640px]">
            {/* Photo Header */}
            <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <Image
                src={selectedBrewery.image}
                alt={selectedBrewery.name}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900/85 text-white backdrop-blur-sm">
                  {selectedBrewery.type}
                </span>
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
  );
}
