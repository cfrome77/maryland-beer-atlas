import React from 'react';
import type { Recommendation } from '@/lib/services/recommendation.service';
import { BreweryDirectionsAction } from '@/components/ui/brewery-directions-action';

export function RecommendationCard({ r }: { r: Recommendation }) {
  return (
    <div className="border rounded-2xl p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <a href={`/breweries/${r.brewery.slug}`} className="font-bold text-sm text-zinc-900 dark:text-zinc-50 hover:text-amber-500 transition-colors">
          {r.brewery.name}
        </a>
        <BreweryDirectionsAction brewery={r.brewery} variant="compact" size="sm" label="Directions" />
      </div>
      <div className="text-xs text-zinc-600 dark:text-zinc-400">{r.reason}</div>
      <div className="text-[11px] pt-1 flex items-center justify-between gap-2 text-zinc-500">
        <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
          {r.source === 'curated' ? 'Editor pick' : 'Suggested'}
        </span>
        {r.distanceMiles != null && <span className="font-medium text-amber-600 dark:text-amber-400">{r.distanceMiles} mi away</span>}
      </div>
    </div>
  );
}
