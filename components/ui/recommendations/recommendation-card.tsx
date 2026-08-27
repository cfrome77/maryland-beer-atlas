import React from 'react';
import type { Recommendation } from '@/lib/services/recommendation.service';

export function RecommendationCard({ r }: { r: Recommendation }) {
  return (
    <div className="border rounded p-3 bg-white dark:bg-zinc-950">
      <a href={`/breweries/${r.brewery.slug}`} className="font-semibold block mb-1">
        {r.brewery.name}
      </a>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">{r.reason}</div>
      <div className="text-xs mt-2 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">{r.source === 'curated' ? 'Editor pick' : 'Suggested'}</span>
        {r.distanceMiles != null && <span className="text-zinc-500">{r.distanceMiles} mi</span>}
      </div>
    </div>
  );
}
