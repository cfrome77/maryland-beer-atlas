'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Brewery, BeerTrail } from '@/lib/types';
import { createRoot } from 'react-dom/client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface MapViewProps {
  breweries: Brewery[];
  selectedBrewery: Brewery | null;
  onSelectBrewery: (brewery: Brewery) => void;
  trails?: BeerTrail[];
  activeTrailId?: string | null;
  className?: string;
}

export default function MapView({
  breweries,
  selectedBrewery,
  onSelectBrewery,
  trails = [],
  activeTrailId = null,
  className = '',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  const defaultZoom = 7.5;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use OpenFreeMap Liberty style as default (free, no key required, theme-integrated)
    const mapStyle = 'https://tiles.openfreemap.org/styles/liberty';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [-76.6413, 39.0458],
      zoom: defaultZoom,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    // Add navigation controls (zoom, compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Clean up on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [defaultZoom]);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Helper for coloring based on brewery type
    const getColorForType = (type: string) => {
      switch (type) {
        case 'Microbrewery': return '#f59e0b'; // Amber
        case 'Brewpub': return '#10b981'; // Emerald
        case 'Production': return '#3b82f6'; // Blue
        case 'Farm Brewery': return '#84cc16'; // Lime
        default: return '#6b7280'; // Gray
      }
    };

    // Add new markers
    breweries.forEach((brewery) => {
      if (!brewery.coordinates || typeof brewery.coordinates.lng !== 'number' || typeof brewery.coordinates.lat !== 'number') {
        return;
      }

      const color = getColorForType(brewery.type);

      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'cursor-pointer transform transition-transform hover:scale-115';

      // Marker HTML template using SVG for crisp mapping dots
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full opacity-35 animate-ping" style="background-color: ${color};"></div>
          <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs" style="background-color: ${color};">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
            </svg>
          </div>
        </div>
      `;

      // Create Popup for this marker
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 max-w-[280px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg shadow-xl text-xs space-y-2';

      const root = createRoot(popupContent);
      root.render(
        <div className="space-y-2 font-sans">
          <div className="relative h-20 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brewery.image}
              alt={brewery.name}
              className="object-cover w-full h-full"
            />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-900/80 text-white backdrop-blur-xs">
              {brewery.type}
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">{brewery.name}</h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{brewery.city} • {brewery.region} Region</p>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 text-[11px] line-clamp-2 leading-snug">
            {brewery.description}
          </p>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-2">
            <a
              href={`/breweries/${brewery.slug}`}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
            >
              Visit Profile <ArrowRight className="w-3 h-3" />
            </a>
            <span className="text-[9px] text-zinc-400">MD {brewery.zipCode}</span>
          </div>
        </div>
      );

      const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
        .setDOMContent(popupContent);

      // Create Marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([brewery.coordinates.lng, brewery.coordinates.lat])
        .setPopup(popup)
        .addTo(map);

      // Handle marker click
      el.addEventListener('click', () => {
        onSelectBrewery(brewery);
      });

      markersRef.current[brewery.id] = marker;
    });

  }, [breweries, onSelectBrewery]);

  // Handle selectedBrewery prop updates (Fly to selected brewery and open its popup)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBrewery) return;

    const coords = selectedBrewery.coordinates;
    if (!coords || typeof coords.lng !== 'number' || typeof coords.lat !== 'number') return;

    // Fly to position
    map.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 11,
      essential: true,
      duration: 1200,
    });

    // Open popup for selected brewery if marker exists
    const marker = markersRef.current[selectedBrewery.id];
    if (marker) {
      // Small timeout to let flyTo start/finish smoothly
      const timer = setTimeout(() => {
        marker.togglePopup();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedBrewery]);

  // Trail route rendering support (Prepared for routes/trails)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Cleanup route layer & source if any
    const removeRoute = () => {
      if (map.getLayer('trail-route-layer')) map.removeLayer('trail-route-layer');
      if (map.getSource('trail-route-source')) map.removeSource('trail-route-source');
    };

    removeRoute();

    if (!activeTrailId) return;

    const trail = trails.find((t) => t.id === activeTrailId);
    if (!trail || !trail.breweries || trail.breweries.length < 2) return;

    // Collect coordinates from trail breweries
    const coordinates = trail.breweries
      .map((b) => b.coordinates)
      .filter((c) => c && typeof c.lng === 'number' && typeof c.lat === 'number')
      .map((c) => [c.lng, c.lat]);

    if (coordinates.length < 2) return;

    // Wait for style to load before adding sources
    const addRouteLayer = () => {
      if (map.getSource('trail-route-source')) return;

      map.addSource('trail-route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: 'trail-route-layer',
        type: 'line',
        source: 'trail-route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#f59e0b', // Amber-500
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });

      // Fit map boundary to contain all breweries in the trail
      const bounds = coordinates.reduce(
        (acc, coord) => acc.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
      );

      map.fitBounds(bounds, { padding: 50, maxZoom: 13 });
    };

    if (map.isStyleLoaded()) {
      addRouteLayer();
    } else {
      map.once('style.load', addRouteLayer);
    }

    return () => removeRoute();
  }, [activeTrailId, trails]);

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Mini Legends card on the map */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-[10px] space-y-1.5 z-10 pointer-events-auto">
        <h5 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[9px]">Legend</h5>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Micro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Brewpub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Production</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-500 border border-white"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Farm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
