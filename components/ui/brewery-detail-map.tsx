'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Brewery } from '@/lib/types';
import { createRoot, Root } from 'react-dom/client';
import { MapPin, Navigation, ExternalLink, AlertTriangle } from 'lucide-react';

interface BreweryDetailMapProps {
  brewery: Brewery;
  className?: string;
}

export default function BreweryDetailMap({ brewery, className = '' }: BreweryDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  const [webglSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && (canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2')));
    } catch {
      return false;
    }
  });

  const [initError, setInitError] = useState<string | null>(null);

  const hasValidCoordinates =
    brewery.coordinates &&
    typeof brewery.coordinates.lat === 'number' &&
    typeof brewery.coordinates.lng === 'number' &&
    !isNaN(brewery.coordinates.lat) &&
    !isNaN(brewery.coordinates.lng);

  const googleMapsUrl = hasValidCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${brewery.coordinates.lat},${brewery.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${brewery.name}, ${brewery.address}, ${brewery.city}, MD ${brewery.zipCode}`)}`;

  const appleMapsUrl = hasValidCoordinates
    ? `https://maps.apple.com/?daddr=${brewery.coordinates.lat},${brewery.coordinates.lng}`
    : `https://maps.apple.com/?daddr=${encodeURIComponent(`${brewery.name}, ${brewery.address}, ${brewery.city}, MD ${brewery.zipCode}`)}`;

  useEffect(() => {
    if (!webglSupported || !hasValidCoordinates || !mapContainerRef.current) return;

    const mapStyle = {
      version: 8 as const,
      sources: {
        'carto-voyager': {
          type: 'raster' as const,
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, © CARTO',
        },
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster' as const,
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [brewery.coordinates.lng, brewery.coordinates.lat],
        zoom: 14,
        attributionControl: { compact: true },
      });
    } catch (err: unknown) {
      console.error('Error initializing detail map instance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize WebGL map.';
      setTimeout(() => {
        setInitError(errorMessage);
      }, 0);
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => map.resize());
    map.on('style.load', () => map.resize());

    // Color based on brewery type
    const color =
      brewery.type === 'Microbrewery'
        ? '#f59e0b'
        : brewery.type === 'Brewpub'
        ? '#10b981'
        : brewery.type === 'Production'
        ? '#3b82f6'
        : '#84cc16';

    // Marker Element
    const el = document.createElement('div');
    el.className = 'cursor-pointer';
    el.innerHTML = `
      <div class="relative flex items-center justify-center transition-all duration-300 hover:scale-110 group">
        <div class="relative w-10 h-12 flex items-center justify-center drop-shadow-lg">
          <svg class="absolute inset-0 w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.06 0 0 8.06 0 18C0 29.4 15.48 42.68 17.16 44.06C17.41 44.27 17.72 44.38 18 44.38C18.28 44.38 18.59 44.27 18.84 44.06C20.52 42.68 36 29.4 36 18C36 8.06 27.94 0 18 0Z" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
          </svg>
          <div class="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-inner">
            <svg class="w-3.5 h-3.5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
              <path d="M9 12v6"/>
              <path d="M13 12v6"/>
              <path d="M6 8h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/>
              <path d="M18 5H6"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    // Popup
    const popupContent = document.createElement('div');
    popupContent.className = 'p-3 max-w-[260px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-xl shadow-xl text-xs space-y-2 font-sans';

    const root = createRoot(popupContent);
    popupRootRef.current = root;
    root.render(
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">{brewery.name}</h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
          {brewery.address}, {brewery.city}, MD {brewery.zipCode}
        </p>
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            Google Maps
          </a>
        </div>
      </div>
    );

    const popup = new maplibregl.Popup({ offset: 15, closeButton: true }).setDOMContent(popupContent);

    new maplibregl.Marker({ element: el })
      .setLngLat([brewery.coordinates.lng, brewery.coordinates.lat])
      .setPopup(popup)
      .addTo(map);

    return () => {
      const rootToUnmount = popupRootRef.current;
      if (rootToUnmount) {
        setTimeout(() => {
          try {
            rootToUnmount.unmount();
          } catch {
            // ignore
          }
        }, 0);
        popupRootRef.current = null;
      }
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.error('Error removing map instance:', e);
        }
      }
      mapRef.current = null;
    };
  }, [brewery, googleMapsUrl, hasValidCoordinates, webglSupported]);

  if (!hasValidCoordinates) {
    return (
      <div className={`p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-sm">
          <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Location &amp; Address</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {brewery.address}, {brewery.city}, MD {brewery.zipCode} ({brewery.county} County)
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Get Directions (Google Maps)
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Apple Maps
          </a>
        </div>
      </div>
    );
  }

  if (!webglSupported || initError) {
    return (
      <div className={`p-6 rounded-2xl bg-zinc-900 text-zinc-300 border border-zinc-800 space-y-4 ${className}`}>
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Interactive Map Unavailable</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {brewery.address}, {brewery.city}, MD {brewery.zipCode}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md ${className}`}>
      <div ref={mapContainerRef} className="w-full h-[280px] md:h-[340px]" />
      <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
            {brewery.address}
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {brewery.city}, MD {brewery.zipCode} • {brewery.county} County
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs inline-flex items-center gap-1 transition-colors"
            title="Open in Apple Maps"
            aria-label="Open in Apple Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
