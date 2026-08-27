import React from 'react';
import type { Recommendation } from '@/lib/services/recommendation.service';
import Image from 'next/image';

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <aside className="bg-white dark:bg-zinc-800 rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
        Editor picks are clearly editorial. Computed suggestions are proximity-based to help you plan a trip.
      </p>
      <ul className="space-y-3">
        {recommendations.map((r) => (
          <li key={r.brewery.id} className="flex items-start gap-3">
            {r.brewery.image ? (
              <Image src={r.brewery.image} alt={r.brewery.name} width={56} height={56} className="rounded-md object-cover" />
            ) : (
              <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-700 rounded-md flex items-center justify-center text-sm">
                {r.brewery.name?.slice(0,2)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <a href={`/breweries/${r.brewery.slug}`} className="font-medium hover:underline">
                  {r.brewery.name}
                </a>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                  {r.source === 'curated' ? 'Editor pick' : 'Suggested'}
                </span>
                {r.distanceMiles != null && <span className="text-xs text-zinc-500 ml-2">— {r.distanceMiles} mi</span>}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300">{r.reason}</div>
              {r.tags?.length ? (
                <div className="mt-1 text-xs flex gap-1 flex-wrap">
                  {r.tags.map((t) => (
                    <span key={t} className="text-zinc-500 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-700 px-2 py-0.5 rounded">
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
