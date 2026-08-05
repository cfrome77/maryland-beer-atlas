'use client';

import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Brewery, BeerTrail } from '@/lib/types';
import { createRoot } from 'react-dom/client';
import { ArrowRight } from 'lucide-react';

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

    // Use high-performance, high-DPI CARTO Voyager raster style as default.
    // This loads streets, buildings, landmarks, and roads beautifully for all users and headless browsers,
    // completely avoiding WebGL hardware-acceleration stalls, canvas blanking, or font failures.
    const mapStyle = {
      version: 8 as const,
      sources: {
        'carto-voyager': {
          type: 'raster' as const,
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, © CARTO',
        }
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster' as const,
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 20,
        }
      ],
    };

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

    // Explicitly trigger a resize on load and style load, and after a short timeout to ensure container has settled
    map.on('load', () => {
      map.resize();
    });
    map.on('style.load', () => {
      map.resize();
    });

    const resizeTimer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 200);

    // Clean up on unmount
    return () => {
      clearTimeout(resizeTimer);
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
      el.className = 'cursor-pointer';

      // Marker HTML template using SVG for crisp mapping dots
      // We apply hover animations only on the inner elements to avoid conflicting with MapLibre's internal CSS transforms
      el.innerHTML = `
        <div class="relative flex items-center justify-center transition-all duration-300 ease-out hover:scale-120 hover:-translate-y-1 group">
          <!-- Pulsing glow ring -->
          <div class="absolute w-10 h-10 rounded-full opacity-25 animate-ping" style="background-color: ${color};"></div>
          <div class="absolute w-10 h-10 rounded-full opacity-20 transition-all duration-300 group-hover:opacity-40" style="background-color: ${color}; filter: blur(4px);"></div>

          <!-- Modern premium marker shape (drop pin) -->
          <div class="relative w-9 h-11 flex items-center justify-center drop-shadow-md">
            <svg class="absolute inset-0 w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0C8.06 0 0 8.06 0 18C0 29.4 15.48 42.68 17.16 44.06C17.41 44.27 17.72 44.38 18 44.38C18.28 44.38 18.59 44.27 18.84 44.06C20.52 42.68 36 29.4 36 18C36 8.06 27.94 0 18 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            </svg>

            <!-- Crisp Inner White Circle containing a modern beer mug icon -->
            <div class="relative z-10 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-inner">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
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

  const positionClass = className.includes('absolute') || className.includes('fixed') ? '' : 'relative';

  return (
    <div className={`${positionClass} w-full h-full min-h-[450px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl ${className}`}>
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

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
