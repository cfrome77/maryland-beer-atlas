import React from 'react';
import type { Recommendation } from '@/lib/services/recommendation.service';
import { BreweryDirectionsAction } from '@/components/ui/brewery-directions-action';

export function RecommendationCard({ r }: { r: Recommendation }) {
  return (
    <div className="border rounded-2xl p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 space-y-2 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <a
          href={`/breweries/${r.brewery.slug}`}
          className="font-bold text-sm text-zinc-900 dark:text-zinc-50 hover:text-amber-500 transition-colors line-clamp-1"
        >
          {r.brewery.name}
        </a>
        <BreweryDirectionsAction brewery={r.brewery} variant="compact" size="sm" label="Directions" />
      </div>

      <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
        {r.reason}
      </div>

      {r.matchedAttributes?.length ? (
        <div className="flex flex-wrap gap-1 text-[10px]">
          {r.matchedAttributes.map((attr) => (
            <span
              key={attr}
              className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium"
            >
              ✓ {attr}
            </span>
          ))}
        </div>
      ) : null}

      <div className="text-[11px] pt-1 flex items-center justify-between gap-2 text-zinc-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
              r.source === 'curated'
                ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {r.source === 'curated' ? 'Editor pick' : 'Suggested'}
          </span>
          {r.statusNote && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[10px] font-medium">
              {r.statusNote}
            </span>
          )}
        </div>
        {r.distanceMiles != null && (
          <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
            {r.distanceMiles} mi away
          </span>
        )}
      </div>
    </div>
  );
}
