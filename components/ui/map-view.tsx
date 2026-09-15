'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Brewery, BeerTrail } from '@/lib/types';
import { isValidImageSrc, DEFAULT_PLACEHOLDER } from '@/components/ui/safe-image';
import { AlertTriangle } from 'lucide-react';
import { isBreweryOpenNow } from '@/lib/utils/hours';
import { getDataFreshnessInfo } from '@/lib/utils/freshness';
import { getDirectionsUrls } from '@/lib/utils/directions';

interface MapViewProps {
  breweries: Brewery[];
  selectedBrewery: Brewery | null;
  onSelectBrewery: (brewery: Brewery) => void;
  trails?: BeerTrail[];
  activeTrailId?: string | null;
  className?: string;
}

export interface BreweryCluster {
  id: string;
  isCluster: boolean;
  breweries: Brewery[];
  center: { lat: number; lng: number };
}

export function clusterBreweries(breweries: Brewery[], zoom: number): BreweryCluster[] {
  const valid = breweries.filter(
    (b) =>
      b.coordinates &&
      typeof b.coordinates.lat === 'number' &&
      typeof b.coordinates.lng === 'number' &&
      !isNaN(b.coordinates.lat) &&
      !isNaN(b.coordinates.lng) &&
      b.coordinates.lat >= -90 &&
      b.coordinates.lat <= 90 &&
      b.coordinates.lng >= -180 &&
      b.coordinates.lng <= 180
  );

  if (zoom >= 13 || valid.length <= 1) {
    return valid.map((b) => ({
      id: b.id,
      isCluster: false,
      breweries: [b],
      center: { lat: b.coordinates.lat, lng: b.coordinates.lng },
    }));
  }

  const threshold = Math.max(0.012, 1.2 / Math.pow(2, Math.max(0, zoom - 5)));

  const clusters: BreweryCluster[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < valid.length; i++) {
    const current = valid[i];
    if (visited.has(current.id)) continue;

    visited.add(current.id);
    const clusterMembers: Brewery[] = [current];

    for (let j = i + 1; j < valid.length; j++) {
      const candidate = valid[j];
      if (visited.has(candidate.id)) continue;

      const dLat = current.coordinates.lat - candidate.coordinates.lat;
      const dLng = current.coordinates.lng - candidate.coordinates.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist <= threshold) {
        visited.add(candidate.id);
        clusterMembers.push(candidate);
      }
    }

    const avgLat = clusterMembers.reduce((sum, b) => sum + b.coordinates.lat, 0) / clusterMembers.length;
    const avgLng = clusterMembers.reduce((sum, b) => sum + b.coordinates.lng, 0) / clusterMembers.length;

    clusters.push({
      id: clusterMembers.length > 1 ? `cluster-${clusterMembers.map((b) => b.id).join('-')}` : current.id,
      isCluster: clusterMembers.length > 1,
      breweries: clusterMembers,
      center: { lat: avgLat, lng: avgLng },
    });
  }

  return clusters;
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
  const [currentZoom, setCurrentZoom] = useState<number>(7.5);

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

  const defaultZoom = 7.5;

  // Initialize Map
  useEffect(() => {
    if (!webglSupported) return;
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

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [-76.6413, 39.0458],
        zoom: defaultZoom,
        attributionControl: { compact: true },
      });
    } catch (err: unknown) {
      console.error('Error initializing maplibre map instance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize 3D GPU graphics.';
      // Trigger error state on next event loop tick to avoid react setState in render effect warning
      setTimeout(() => {
        setInitError(errorMessage);
      }, 0);
      return;
    }

    mapRef.current = map;

    // Add navigation controls (zoom, compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Explicitly trigger a resize on load and style load, and track zoom level changes
    map.on('load', () => {
      map.resize();
    });
    map.on('style.load', () => {
      map.resize();
    });
    map.on('zoomend', () => {
      if (mapRef.current) {
        setCurrentZoom(mapRef.current.getZoom());
      }
    });

    const resizeTimer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 200);

    // Clean up on unmount
    return () => {
      clearTimeout(resizeTimer);
      if (map) {
        try {
          map.remove();
        } catch (e) {
          console.error('Error removing map instance:', e);
        }
      }
      mapRef.current = null;
    };
  }, [defaultZoom, webglSupported]);

  // Sync Markers & Dense-Area Clusters
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

    const clusters = clusterBreweries(breweries, currentZoom);

    clusters.forEach((item) => {
      if (item.isCluster) {
        // Render Dense-Area Cluster Badge Marker
        const el = document.createElement('div');
        el.className = 'cursor-pointer group';
        el.setAttribute('aria-label', `${item.breweries.length} breweries in this area`);
        el.innerHTML = `
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-black text-xs border-2 border-white shadow-lg shadow-amber-500/30 transition-all duration-200 group-hover:scale-110">
            <span class="z-10">${item.breweries.length}</span>
            <span class="absolute -inset-1 rounded-full bg-amber-500/20 animate-ping pointer-events-none"></span>
          </div>
        `;

        el.addEventListener('click', () => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [item.center.lng, item.center.lat],
              zoom: Math.min(14, currentZoom + 2.5),
              essential: true,
              duration: 800,
            });
          }
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([item.center.lng, item.center.lat])
          .addTo(map);

        markersRef.current[item.id] = marker;
      } else {
        // Render Individual Brewery Marker
        const brewery = item.breweries[0];
        const color = getColorForType(brewery.type);

        const el = document.createElement('div');
        el.className = 'cursor-pointer';

        el.innerHTML = `
          <div class="relative flex items-center justify-center transition-all duration-300 ease-out hover:scale-120 hover:-translate-y-1 group">
            <div class="relative w-9 h-11 flex items-center justify-center drop-shadow-md">
              <svg class="absolute inset-0 w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.06 0 0 8.06 0 18C0 29.4 15.48 42.68 17.16 44.06C17.41 44.27 17.72 44.38 18 44.38C18.28 44.38 18.59 44.27 18.84 44.06C20.52 42.68 36 29.4 36 18C36 8.06 27.94 0 18 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
              </svg>

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

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 max-w-[280px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg shadow-xl text-xs space-y-2 font-sans';

        const popupImgSrc = isValidImageSrc(brewery.image) ? (brewery.image as string).trim() : DEFAULT_PLACEHOLDER;
        const openStatus = isBreweryOpenNow(brewery);
        const freshness = getDataFreshnessInfo(brewery);

        const statusBadgeHtml = openStatus.isOpen
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Open Now</span>`
          : openStatus.category === 'permanently_closed'
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Closed Permanently</span>`
          : openStatus.category === 'temporarily_closed'
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Temporarily Closed</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Closed Now</span>`;

        const freshnessBadgeHtml = freshness.freshnessCategory === 'fresh'
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Verified Fresh</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Verified ${brewery.lastVerified || 'recently'}</span>`;

        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="relative h-20 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
              <img
                src="${popupImgSrc}"
                alt="${brewery.name.replace(/"/g, '&quot;')}"
                class="object-cover w-full h-full"
                onerror="if (!this.src.endsWith('${DEFAULT_PLACEHOLDER}')) this.src='${DEFAULT_PLACEHOLDER}';"
              />
              <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-900/80 text-white backdrop-blur-xs">
                ${brewery.type}
              </span>
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">${brewery.name}</h4>
              <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">${brewery.city} • ${brewery.region} Region</p>
            </div>
            <div class="flex flex-col gap-1 py-1 border-y border-zinc-100 dark:border-zinc-800">
              ${statusBadgeHtml}
              ${freshnessBadgeHtml}
            </div>
            <p class="text-zinc-600 dark:text-zinc-300 text-[11px] line-clamp-2 leading-snug">
              ${brewery.description || ''}
            </p>
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <a
                href="/breweries/${brewery.slug}"
                class="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]"
              >
                Visit Profile &rarr;
              </a>
              <a
                href="${getDirectionsUrls(brewery).googleMapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get directions to ${brewery.name.replace(/"/g, '&quot;')}"
                class="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
              >
                Directions
              </a>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 15, closeButton: true })
          .setDOMContent(popupContent);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([brewery.coordinates.lng, brewery.coordinates.lat])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          onSelectBrewery(brewery);
        });

        markersRef.current[brewery.id] = marker;
      }
    });

    return () => {};
  }, [breweries, currentZoom, onSelectBrewery]);

  // Handle selectedBrewery prop updates (Fly to selected brewery and open its popup)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBrewery) return;

    const coords = selectedBrewery.coordinates;
    if (
      !coords ||
      typeof coords.lng !== 'number' ||
      typeof coords.lat !== 'number' ||
      isNaN(coords.lng) ||
      isNaN(coords.lat) ||
      coords.lat < -90 ||
      coords.lat > 90 ||
      coords.lng < -180 ||
      coords.lng > 180
    ) return;

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
      .filter((c) => c && typeof c.lng === 'number' && typeof c.lat === 'number' && !isNaN(c.lng) && !isNaN(c.lat) && c.lat >= -90 && c.lat <= 90 && c.lng >= -180 && c.lng <= 180)
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

  if (!webglSupported || initError) {
    return (
      <div className={`${positionClass} w-full h-full min-h-[450px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-300 p-6 flex flex-col items-center justify-center text-center shadow-xl ${className}`}>
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">WebGL2 is Disabled or Unsupported</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This interactive map requires WebGL2 hardware graphics acceleration to render the high-performance CARTO maps and brewery geographic markers beautifully.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-left text-[11px] space-y-2 text-zinc-400">
            <span className="font-extrabold text-white text-[12px] block">How to resolve:</span>
            <ul className="list-disc list-inside space-y-1">
              <li>Enable <strong className="text-zinc-200">Hardware Acceleration</strong> in your browser settings.</li>
              <li>Ensure your graphics drivers are up to date.</li>
              <li>If you are using strict privacy extensions or a VM, ensure WebGL is not blocked.</li>
            </ul>
          </div>
          <p className="text-[10px] text-zinc-600">
            Error Details: {initError || 'Browser WebGL2 context is unavailable.'}
          </p>
        </div>
      </div>
    );
  }

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
