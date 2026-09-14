'use client';

import React, { useState } from 'react';
import { RecommendationsPanel } from './recommendations-panel';
import type { Recommendation } from '@/lib/services/recommendation.service';

export function GeolocationRecommendations({
  curated = [],
  maxMiles = 40,
  limit = 8,
}: {
  curated?: Recommendation[];
  maxMiles?: number;
  limit?: number;
  tags?: string[];
}) {
  const [computed, setComputed] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preference filter states
  const [foodRequired, setFoodRequired] = useState(false);
  const [outdoorRequired, setOutdoorRequired] = useState(false);
  const [dogRequired, setDogRequired] = useState(false);
  const [familyRequired, setFamilyRequired] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const fetchRecommendations = (coords?: { latitude: number; longitude: number }) => {
    setError(null);
    setLoading(true);

    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: coords?.latitude,
        lon: coords?.longitude,
        maxMiles,
        limit,
        foodRequired,
        outdoorSeatingRequired: outdoorRequired,
        dogFriendlyRequired: dogRequired,
        familyFriendlyRequired: familyRequired,
        region: selectedRegion || undefined,
        breweryType: selectedType || undefined,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json?.error || 'Failed to fetch recommendations');
          setComputed([]);
        } else {
          // De-duplicate against curated items if needed
          const curatedIds = new Set(curated.map((c) => c.brewery?.id));
          const filtered = (json.recommendations || []).filter(
            (r: Recommendation) => !curatedIds.has(r.brewery?.id)
          );
          setComputed(filtered);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleNearbyClick = () => {
    setError(null);
    if (!navigator?.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchRecommendations({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) setError('Location permission denied.');
        else setError(err.message || 'Failed to get location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAttributeFilterClick = () => {
    fetchRecommendations();
  };

  return (
    <div className="space-y-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Trip Discovery & Preference Recommendations
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Find Maryland breweries matching your exact trip needs, grounded strictly in verified data facts.
        </p>
      </div>

      {/* Attribute Toggle Controls */}
      <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
        <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          Filter Trustworthy Attributes:
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFoodRequired(!foodRequired)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              foodRequired
                ? 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-500 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
            }`}
          >
            🍽️ Food Available
          </button>

          <button
            type="button"
            onClick={() => setOutdoorRequired(!outdoorRequired)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              outdoorRequired
                ? 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-500 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
            }`}
          >
            🌳 Outdoor Seating
          </button>

          <button
            type="button"
            onClick={() => setDogRequired(!dogRequired)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              dogRequired
                ? 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-500 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
            }`}
          >
            🐾 Dog Friendly
          </button>

          <button
            type="button"
            onClick={() => setFamilyRequired(!familyRequired)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              familyRequired
                ? 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-500 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
            }`}
          >
            👨‍👩‍👧 Family Friendly
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div>
            <label htmlFor="rec-region-select" className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Region
            </label>
            <select
              id="rec-region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
            >
              <option value="">All Regions</option>
              <option value="Capital">Capital</option>
              <option value="Central">Central</option>
              <option value="Eastern Shore">Eastern Shore</option>
              <option value="Southern">Southern</option>
              <option value="Western">Western</option>
            </select>
          </div>

          <div>
            <label htmlFor="rec-type-select" className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Brewery Type
            </label>
            <select
              id="rec-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
            >
              <option value="">All Types</option>
              <option value="Microbrewery">Microbrewery</option>
              <option value="Brewpub">Brewpub</option>
              <option value="Production">Production</option>
              <option value="Farm Brewery">Farm Brewery</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <button
            type="button"
            onClick={handleAttributeFilterClick}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold disabled:opacity-60 transition-colors shadow-xs"
          >
            {loading ? 'Discovering...' : 'Find Preference Matches'}
          </button>

          <button
            type="button"
            onClick={handleNearbyClick}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 text-xs sm:text-sm font-bold disabled:opacity-60 transition-colors shadow-xs"
          >
            📍 Find Nearby (GPS)
          </button>
        </div>
      </div>

      {error && <div className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</div>}

      {curated?.length ? (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Editorially Curated Picks
          </h4>
          <RecommendationsPanel recommendations={curated} />
        </div>
      ) : null}

      {computed && computed.length > 0 ? (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Computed Attribute & Proximity Matches
          </h4>
          <RecommendationsPanel recommendations={computed} />
        </div>
      ) : null}
    </div>
  );
}
