'use client';

import React, { useState } from 'react';
import { RecommendationsPanel } from './recommendations-panel';
import type { Recommendation } from '@/lib/services/recommendation.service';

export function GeolocationRecommendations({
  curated = [],
  maxMiles = 40,
  limit = 6,
  tags,
}: {
  curated?: Recommendation[];
  maxMiles?: number;
  limit?: number;
  tags?: string[];
}) {
  const [computed, setComputed] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    if (!navigator?.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              maxMiles,
              limit,
              tags,
            }),
          });
          const json = await res.json();
          if (!res.ok) {
            setError(json?.error || 'Failed to fetch recommendations');
            setComputed([]);
          } else {
            // Remove curated duplicates by id
            const curatedIds = new Set(curated.map((c) => c.brewery?.id));
            const filtered = (json.recommendations || []).filter((r: Recommendation) => !curatedIds.has(r.brewery?.id));
            setComputed(filtered);
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) setError('Location permission denied.');
        else setError(err.message || 'Failed to get location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleClick}
          className="px-3 py-2 rounded-md bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Finding nearby...' : 'Find Nearby Breweries'}
        </button>
        <small className="text-xs text-zinc-500">Use your location to surface nearby suggestions</small>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {curated?.length ? (
        <div>
          <h4 className="text-sm font-bold mb-2">Editor picks</h4>
          <RecommendationsPanel recommendations={curated} />
        </div>
      ) : null}

      {computed && computed.length > 0 ? (
        <div>
          <h4 className="text-sm font-bold mt-4 mb-2">Nearby suggestions</h4>
          <RecommendationsPanel recommendations={computed} />
        </div>
      ) : null}
    </div>
  );
}
