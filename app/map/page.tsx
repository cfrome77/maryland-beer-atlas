'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation, Info, Beer as BeerIcon, Compass, Phone, Globe, ExternalLink } from 'lucide-react';
import { mockBreweries } from '@/lib/data/mock-data';
import { MarylandRegion, Brewery } from '@/lib/types';

export default function InteractiveMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<MarylandRegion | 'All'>('All');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(mockBreweries[0]);

  // Regions for custom filter buttons
  const regions: (MarylandRegion | 'All')[] = ['All', 'Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];

  // Filter breweries based on region selection
  const visibleBreweries = selectedRegion === 'All'
    ? mockBreweries
    : mockBreweries.filter(b => b.region === selectedRegion);

  const handleSelectBrewery = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
  };

  const handleRegionClick = (region: MarylandRegion | 'All') => {
    setSelectedRegion(region);
    // Auto-select first brewery in that region as active detail
    const firstOfRegion = region === 'All'
      ? mockBreweries[0]
      : mockBreweries.find(b => b.region === region);
    setSelectedBrewery(firstOfRegion || null);
  };

  // Coordinates helper for drawing map dots
  // Since we're making a mock, stylised interactive layout, we can project coordinates
  // representing Maryland's geographical canvas.
  const getDotPosition = (region: MarylandRegion) => {
    switch (region) {
      case 'Western':
        return { top: '35%', left: '15%' };
      case 'Capital':
        return { top: '55%', left: '42%' };
      case 'Central':
        return { top: '42%', left: '55%' };
      case 'Southern':
        return { top: '72%', left: '62%' };
      case 'Eastern Shore':
        return { top: '65%', left: '82%' };
      default:
        return { top: '50%', left: '50%' };
    }
  };

  return (
    <div className="py-12 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Title & Header */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Interactive Maryland Beer Map
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base max-w-3xl">
            Locate and explore craft breweries throughout Maryland. Select regions to filter the map, then tap on marker dots or the sidebar list to see rich taproom details.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Main Visual Map & Controls (LHS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Quick regional filter tabs */}
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => handleRegionClick(region)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedRegion === region
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                      : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {region === 'All' ? 'All Maryland' : `${region} Region`}
                </button>
              ))}
            </div>

            {/* Stylised SVG/CSS Interactive Mock Map */}
            <div className="relative aspect-[16/9] w-full rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden flex flex-col justify-between p-6">

              {/* Star-like abstract grid to resemble Maryland geography outline */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Region Label Indicator */}
              <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <Compass className="w-4 h-4 text-amber-500" />
                Active View: <span className="text-amber-500">{selectedRegion}</span>
              </div>

              {/* Decorative Water Area Representing the Chesapeake Bay */}
              <div className="absolute bottom-4 right-12 w-1/3 h-1/3 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

              {/* Interactive Dots */}
              {visibleBreweries.map((brewery) => {
                const position = getDotPosition(brewery.region);
                const isActive = selectedBrewery?.id === brewery.id;

                return (
                  <button
                    key={brewery.id}
                    onClick={() => handleSelectBrewery(brewery)}
                    style={{
                      top: position.top,
                      left: position.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute z-10 p-2 focus:outline-none transition-transform hover:scale-110"
                    title={brewery.name}
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Pulse/Radar ring */}
                      {isActive && (
                        <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-500 opacity-20 animate-ping" />
                      )}

                      {/* Marker badge */}
                      <div className={`p-2 rounded-full border shadow-lg transition-colors ${
                        isActive
                          ? 'bg-amber-500 text-zinc-950 border-white'
                          : 'bg-zinc-950 text-amber-500 border-zinc-800 hover:bg-zinc-850'
                      }`}>
                        <BeerIcon className="w-4 h-4 fill-current" />
                      </div>

                      {/* Tooltip on active hover / selection */}
                      {isActive && (
                        <div className="absolute bottom-full mb-2 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-2xl whitespace-nowrap pointer-events-none z-30">
                          {brewery.name}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Graphical Map Compass */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none opacity-45">
                <div className="text-zinc-500 text-[10px] font-mono">
                  LAT: 39.0458° N<br />
                  LNG: 76.6413° W
                </div>
              </div>

              {/* Instruction Banner at Bottom */}
              <div className="mt-auto w-full text-center text-xs text-zinc-500 z-10 pointer-events-none">
                Interactive mock canvas • Tap a marker dot to select and inspect details
              </div>
            </div>

            {/* List of matching breweries in active region */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-4">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                Breweries in {selectedRegion === 'All' ? 'Maryland' : `${selectedRegion} Region`} ({visibleBreweries.length})
              </h3>
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
      </div>
    </div>
  );
}
