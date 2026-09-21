'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Brewery, BeerTrail, BreweryOperatingStatus } from '@/lib/types';
import { isValidImageSrc, DEFAULT_PLACEHOLDER } from '@/components/ui/safe-image';
import { AlertTriangle } from 'lucide-react';
import { isBreweryOpenNow, getMarylandDateComponents, formatPeriods } from '@/lib/utils/hours';
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
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

  if (valid.length <= 1) {
    return valid.map((b) => ({
      id: b.id,
      isCluster: false,
      breweries: [b],
      center: { lat: b.coordinates.lat, lng: b.coordinates.lng },
      bounds: {
        minLat: b.coordinates.lat,
        maxLat: b.coordinates.lat,
        minLng: b.coordinates.lng,
        maxLng: b.coordinates.lng,
      },
    }));
  }

  // Distance threshold scales dynamically with zoom level
  // At high zoom levels (>= 13), uncluster unless breweries are virtually co-located (<0.0002 deg)
  const threshold =
    zoom >= 13
      ? 0.0002
      : Math.max(0.008, 1.2 / Math.pow(2, Math.max(0, zoom - 5)));

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

    const lats = clusterMembers.map((b) => b.coordinates.lat);
    const lngs = clusterMembers.map((b) => b.coordinates.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / clusterMembers.length;
    const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / clusterMembers.length;

    clusters.push({
      id: clusterMembers.length > 1 ? `cluster-${clusterMembers.map((b) => b.id).join('-')}` : current.id,
      isCluster: clusterMembers.length > 1,
      breweries: clusterMembers,
      center: { lat: avgLat, lng: avgLng },
      bounds: { minLat, maxLat, minLng, maxLng },
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
        center: [-76.6413, 39.0458],
        zoom: defaultZoom,
        attributionControl: { compact: true },
      });
    } catch (err: unknown) {
      console.error('Error initializing maplibre map instance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize 3D GPU graphics.';
      setTimeout(() => {
        setInitError(errorMessage);
      }, 0);
      return;
    }

    mapRef.current = map;

    // Add navigation controls (zoom, compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => map.resize());
    map.on('style.load', () => map.resize());
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

    // Helper for status styling & badges
    const getStatusStyle = (status: BreweryOperatingStatus, type: string) => {
      switch (status) {
        case 'Closed':
        case 'Permanently closed':
          return {
            pinColor: '#6b7280', // Muted Gray
            strokeColor: '#9ca3af',
            badgeBg: '#ef4444', // Red indicator
            badgeTitle: 'Permanently Closed',
            opacityClass: 'opacity-65',
          };
        case 'Temporarily closed':
        case 'Seasonal':
        case 'Opening soon':
        case 'Relocating':
        case 'Contract-only':
          return {
            pinColor: '#f59e0b', // Amber/Orange
            strokeColor: '#fde047',
            badgeBg: '#f97316', // Orange indicator
            badgeTitle: status,
            opacityClass: 'opacity-90',
          };
        case 'Open':
        default:
          return {
            pinColor: getColorForType(type),
            strokeColor: '#ffffff',
            badgeBg: '#10b981', // Emerald indicator
            badgeTitle: 'Active / Open',
            opacityClass: 'opacity-100',
          };
      }
    };

    const clusters = clusterBreweries(breweries, currentZoom);

    clusters.forEach((item) => {
      if (item.isCluster) {
        // Size tier styling based on cluster count
        const count = item.breweries.length;
        let clusterClasses = {
          dimensions: 'w-9 h-9',
          bgGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
          textSize: 'text-xs font-bold',
          ringColor: 'border border-white/60',
        };

        if (count >= 10) {
          clusterClasses = {
            dimensions: 'w-12 h-12',
            bgGradient: 'bg-gradient-to-br from-red-500 via-orange-500 to-amber-600',
            textSize: 'text-base font-black',
            ringColor: 'border-2 border-white',
          };
        } else if (count >= 5) {
          clusterClasses = {
            dimensions: 'w-10 h-10',
            bgGradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
            textSize: 'text-sm font-extrabold',
            ringColor: 'border-2 border-white',
          };
        }

        const el = document.createElement('div');
        el.className = 'cursor-pointer group';
        el.setAttribute('aria-label', `${count} breweries in this area. Click to zoom in.`);
        el.innerHTML = `
          <div class="relative flex items-center justify-center ${clusterClasses.dimensions} rounded-full ${clusterClasses.bgGradient} text-zinc-950 ${clusterClasses.textSize} ${clusterClasses.ringColor} shadow-lg shadow-amber-500/25 transition-all duration-200 group-hover:scale-110">
            <span class="z-10">${count}</span>
            <span class="absolute -inset-1 rounded-full bg-amber-500/20 pointer-events-none"></span>
          </div>
        `;

        el.addEventListener('click', () => {
          if (!mapRef.current) return;

          if (
            item.bounds &&
            (item.bounds.minLat !== item.bounds.maxLat || item.bounds.minLng !== item.bounds.maxLng)
          ) {
            const bounds = new maplibregl.LngLatBounds(
              [item.bounds.minLng, item.bounds.minLat],
              [item.bounds.maxLng, item.bounds.maxLat]
            );
            mapRef.current.fitBounds(bounds, {
              padding: 60,
              maxZoom: 15,
              duration: 800,
            });
          } else {
            mapRef.current.flyTo({
              center: [item.center.lng, item.center.lat],
              zoom: Math.min(15, currentZoom + 2.5),
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
        // Render Individual Brewery Marker with dynamic status styling
        const brewery = item.breweries[0];
        const statusStyle = getStatusStyle(brewery.status, brewery.type);

        const el = document.createElement('div');
        el.className = 'cursor-pointer';

        el.innerHTML = `
          <div class="relative flex items-center justify-center transition-all duration-300 ease-out hover:scale-115 hover:-translate-y-1 group ${statusStyle.opacityClass}">
            <div class="relative w-9 h-11 flex items-center justify-center drop-shadow-md">
              <svg class="absolute inset-0 w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.06 0 0 8.06 0 18C0 29.4 15.48 42.68 17.16 44.06C17.41 44.27 17.72 44.38 18 44.38C18.28 44.38 18.59 44.27 18.84 44.06C20.52 42.68 36 29.4 36 18C36 8.06 27.94 0 18 0Z" fill="${statusStyle.pinColor}" stroke="${statusStyle.strokeColor}" stroke-width="2"/>
              </svg>

              <div class="relative z-10 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-inner">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="${statusStyle.pinColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 11h1a3 3 0 0 1 0 6h-1"/>
                  <path d="M9 12v6"/>
                  <path d="M13 12v6"/>
                  <path d="M6 8h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/>
                  <path d="M18 5H6"/>
                </svg>
              </div>

              <!-- Status indicator badge dot -->
              <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-xs pointer-events-none" style="background-color: ${statusStyle.badgeBg};" title="${escapeHtml(statusStyle.badgeTitle)}"></span>
            </div>
          </div>
        `;

        // Calculate Operating Hours summary for today
        const { dayOfWeek } = getMarylandDateComponents();
        const openStatus = isBreweryOpenNow(brewery);
        const freshness = getDataFreshnessInfo(brewery);
        const directions = getDirectionsUrls(brewery);

        let todayHoursSummary = 'Hours unavailable';
        if (brewery.structuredHours && brewery.structuredHours.length > 0) {
          const todaySchedule = brewery.structuredHours.find((h) => h.day === dayOfWeek);
          if (todaySchedule) {
            if (todaySchedule.isClosed || !todaySchedule.periods || todaySchedule.periods.length === 0) {
              todayHoursSummary = `Today (${dayOfWeek}): Closed`;
            } else {
              todayHoursSummary = `Today (${dayOfWeek}): ${formatPeriods(todaySchedule.periods)}`;
            }
          }
        } else if (brewery.status === 'Open') {
          todayHoursSummary = 'Open • See profile for taproom schedule';
        } else {
          todayHoursSummary = openStatus.reason;
        }

        const popupImgSrc = isValidImageSrc(brewery.image) ? (brewery.image as string).trim() : DEFAULT_PLACEHOLDER;

        const statusBadgeHtml = openStatus.isOpen
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Open Now</span>`
          : openStatus.category === 'permanently_closed'
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"><span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Closed Permanently</span>`
          : openStatus.category === 'temporarily_closed'
          ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${escapeHtml(brewery.status)}</span>`
          : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Closed Now</span>`;

        const freshnessBadgeHtml = freshness.freshnessCategory === 'fresh'
          ? `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Verified Fresh</span>`
          : `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Verified ${escapeHtml(brewery.lastVerified || 'recently')}</span>`;

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 max-w-[290px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-xl shadow-xl text-xs space-y-2 font-sans border border-zinc-100 dark:border-zinc-800';

        popupContent.innerHTML = `
          <div class="space-y-2">
            <div class="relative h-20 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <img
                src="${popupImgSrc}"
                alt="${escapeHtml(brewery.name)}"
                class="object-cover w-full h-full"
                onerror="if (!this.src.endsWith('${DEFAULT_PLACEHOLDER}')) this.src='${DEFAULT_PLACEHOLDER}';"
              />
              <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-950/80 text-white backdrop-blur-md">
                ${escapeHtml(brewery.type)}
              </span>
            </div>

            <div>
              <h4 class="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">${escapeHtml(brewery.name)}</h4>
              <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                ${escapeHtml(brewery.address)}, ${escapeHtml(brewery.city)}, MD ${escapeHtml(brewery.zipCode)}
              </p>
            </div>

            <!-- Operating Status & Today's Hours -->
            <div class="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <div class="flex items-center justify-between gap-1 text-[10px]">
                <div class="flex items-center gap-1 font-bold">
                  ${statusBadgeHtml}
                </div>
                ${freshnessBadgeHtml}
              </div>
              <div class="text-[10.5px] text-zinc-600 dark:text-zinc-300 flex items-center gap-1 font-medium pt-0.5">
                <svg class="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="truncate">${escapeHtml(todayHoursSummary)}</span>
              </div>
            </div>

            ${brewery.description ? `<p class="text-zinc-600 dark:text-zinc-300 text-[10.5px] line-clamp-2 leading-snug font-normal">${escapeHtml(brewery.description)}</p>` : ''}

            <!-- Direct Action Shortcuts -->
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <div class="flex items-center gap-1.5">
                <a
                  href="${directions.googleMapsUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps directions to ${escapeHtml(brewery.name)}"
                  class="flex-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[10px] inline-flex items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Google Maps
                </a>
                <a
                  href="${directions.appleMapsUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Apple Maps directions to ${escapeHtml(brewery.name)}"
                  class="py-1.5 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] inline-flex items-center justify-center gap-1 transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  Apple Maps
                </a>
              </div>
              <a
                href="/breweries/${escapeHtml(brewery.slug)}"
                class="w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-[10px] inline-flex items-center justify-center gap-1 transition-colors"
              >
                View Full Profile &rarr;
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

    map.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 11,
      essential: true,
      duration: 1200,
    });

    const marker = markersRef.current[selectedBrewery.id];
    if (marker) {
      const timer = setTimeout(() => {
        marker.togglePopup();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedBrewery]);

  // Trail route rendering support
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const removeRoute = () => {
      if (map.getLayer('trail-route-layer')) map.removeLayer('trail-route-layer');
      if (map.getSource('trail-route-source')) map.removeSource('trail-route-source');
    };

    removeRoute();

    if (!activeTrailId) return;

    const trail = trails.find((t) => t.id === activeTrailId);
    if (!trail || !trail.breweries || trail.breweries.length < 2) return;

    const coordinates = trail.breweries
      .map((b) => b.coordinates)
      .filter((c) => c && typeof c.lng === 'number' && typeof c.lat === 'number' && !isNaN(c.lng) && !isNaN(c.lat) && c.lat >= -90 && c.lat <= 90 && c.lng >= -180 && c.lng <= 180)
      .map((c) => [c.lng, c.lat]);

    if (coordinates.length < 2) return;

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
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-[10px] space-y-2 z-10 pointer-events-auto max-w-[200px]">
        <h5 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[9px]">Map Legend</h5>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
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
        <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Active / Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Seasonal / Temp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-zinc-600 dark:text-zinc-400">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
