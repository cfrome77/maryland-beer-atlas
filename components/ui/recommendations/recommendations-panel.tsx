import React from 'react';
import type { Recommendation } from '@/lib/services/recommendation.service';
import { SafeImage } from '@/components/ui/safe-image';
import { BreweryDirectionsAction } from '@/components/ui/brewery-directions-action';

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <aside className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-700/80 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Trip Recommendations & Insights
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Explainable & Transparent
        </span>
      </div>
      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mb-4">
        Editor picks are editorially curated from guides. Computed suggestions match trustworthy attributes and location proximity.
      </p>

      <ul className="space-y-4">
        {recommendations.map((r) => (
          <li
            key={r.brewery.id}
            className="flex flex-col sm:flex-row items-start gap-3.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 transition-colors"
          >
            <div className="relative w-full sm:w-16 h-28 sm:h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
              <SafeImage
                src={r.brewery.image}
                alt={r.brewery.name}
                fill
                sizes="(max-width: 640px) 100vw, 64px"
                className="object-cover"
                showIconFallbackOnFailure
              />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`/breweries/${r.brewery.slug}`}
                    className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1"
                  >
                    {r.brewery.name}
                  </a>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                      r.source === 'curated'
                        ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {r.source === 'curated' ? 'Editor pick' : 'Suggested'}
                  </span>
                  {r.statusNote && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      {r.statusNote}
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  <BreweryDirectionsAction brewery={r.brewery} variant="compact" size="sm" label="Directions" />
                </div>
              </div>

              <div className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 font-medium">
                {r.reason}
              </div>

              {r.matchedAttributes?.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1 text-[11px]">
                  {r.matchedAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-medium"
                    >
                      ✓ {attr}
                    </span>
                  ))}
                </div>
              ) : null}

              {r.tags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
