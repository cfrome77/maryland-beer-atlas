import React from 'react';
import { BeerTrail } from '@/lib/types';
import { Mountain, TrendingUp, Layers, Footprints, Compass, ShieldAlert } from 'lucide-react';

interface TrailElevationProfileProps {
  trail: BeerTrail;
}

export function TrailElevationProfile({ trail }: TrailElevationProfileProps) {
  const elevationText = trail.elevationGain || 'Flat / Minor Gradient';
  const terrainText = trail.terrainType || 'Paved Walkway & City Sidewalks';
  const totalDist = trail.totalDistance || trail.distance;

  // Calculate difficulty styling & badges
  const difficultyLower = (trail.difficulty || 'Easy').toLowerCase();
  const isEasy = difficultyLower.includes('easy');
  const isModerate = difficultyLower.includes('moderate');

  const difficultyColor = isEasy
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : isModerate
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

  // Extract numerical value for elevation gain for visual scaling
  const numericElevation = parseInt(elevationText.replace(/\D/g, ''), 10) || 30;

  // Generate simulated relative stop elevation points for profile chart
  const stopsCount = trail.stops?.length || 1;
  const profilePoints = (trail.stops || []).map((stop, index) => {
    // Generate organic relative elevation curve peaking slightly mid-trail
    const factor = stopsCount === 1 ? 0.5 : Math.sin((index / (stopsCount - 1)) * Math.PI);
    const stopElev = Math.round(10 + factor * numericElevation);
    return {
      order: stop.order || index + 1,
      name: stop.brewery?.name || `Stop ${index + 1}`,
      city: stop.brewery?.city || '',
      elevation: stopElev,
    };
  });

  const maxElev = Math.max(...profilePoints.map((p) => p.elevation), 50);

  return (
    <div
      data-testid="trail-elevation-profile"
      className="bg-zinc-900 text-white rounded-2xl border border-zinc-800 p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <Mountain className="w-4 h-4 text-amber-400" />
            Elevation Profile &amp; Terrain Breakdown
          </div>
          <h3 className="text-lg font-bold text-white">Route Difficulty &amp; Topography</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColor}`}>
            Difficulty: {trail.difficulty}
          </span>
        </div>
      </div>

      {/* Primary Topography Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Elevation Gain
          </span>
          <p className="text-lg font-extrabold text-white">{elevationText}</p>
          <p className="text-[11px] text-zinc-400">Total vertical change along route</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-amber-400" /> Total Distance
          </span>
          <p className="text-lg font-extrabold text-white">{totalDist}</p>
          <p className="text-[11px] text-zinc-400">Door-to-door itinerary span</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Terrain Type
          </span>
          <p className="text-sm font-bold text-zinc-100 line-clamp-2 leading-snug">{terrainText}</p>
          <p className="text-[11px] text-zinc-400">Surface conditions along path</p>
        </div>
      </div>

      {/* Visual Elevation Profile Graph */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> Visual Stop Elevation Profile
          </span>
          <span>Max Grade Gain: ~{numericElevation} ft</span>
        </div>

        {/* Profile Bar Chart Representation */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-4">
          <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2 relative border-b border-zinc-800">
            {profilePoints.map((point) => {
              const heightPercent = Math.max(20, Math.round((point.elevation / maxElev) * 100));
              return (
                <div
                  key={point.order}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  <span className="text-[10px] font-bold text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    +{point.elevation} ft
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-amber-500/20 via-amber-500/60 to-amber-400 rounded-t-md group-hover:brightness-125 transition-all relative"
                  >
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-zinc-950 shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stop Labels under Profile Graph */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-center text-xs">
            {profilePoints.map((point) => (
              <div key={point.order} className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-left">
                <span className="text-[10px] font-bold text-amber-400 block">Stop #{point.order}</span>
                <span className="font-semibold text-zinc-200 text-xs truncate block">{point.name}</span>
                {point.city && <span className="text-[10px] text-zinc-400 block">{point.city}, MD</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footwear & Accessibility Advice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-zinc-300 leading-relaxed font-normal text-[11px]">
          <strong className="text-amber-400 font-semibold">Trail Advice:</strong> {terrainText}. Comfortable walking footwear is recommended for all stops along this route.
        </p>
      </div>
    </div>
  );
}
