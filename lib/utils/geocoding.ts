import { Brewery, MarylandRegion } from '../types';

/**
 * Maryland Postal Code Geocoding & Geospatial Utility Module
 *
 * Provides pure functions for postal code lookup, proximity calculations (Haversine formula),
 * regional geospatial filtering, and deterministic location-based sorting.
 */

export interface GeographicCoordinates {
  lat: number;
  lng: number;
}

/**
 * Maryland Postal Code (ZIP Code) Approximate Geographic Center Database
 * Maps major Maryland ZIP codes and 3-digit ZIP prefixes to latitude / longitude coordinates.
 */
export const MARYLAND_POSTAL_CODE_CENTERS: Record<string, GeographicCoordinates> = {
  // Frederick County
  '21701': { lat: 39.4292, lng: -77.4045 },
  '21702': { lat: 39.4500, lng: -77.4300 },
  '21703': { lat: 39.3621, lng: -77.4245 },
  '21704': { lat: 39.3300, lng: -77.3600 },

  // Montgomery County
  '20882': { lat: 39.2241, lng: -77.1425 },
  '20877': { lat: 39.1434, lng: -77.2014 },
  '20850': { lat: 39.0840, lng: -77.1528 },
  '20910': { lat: 38.9977, lng: -77.0272 },

  // Prince George's County
  '20781': { lat: 38.9482, lng: -76.9405 },
  '20782': { lat: 38.9612, lng: -76.9554 },
  '20774': { lat: 38.8950, lng: -76.7325 },
  '20740': { lat: 38.9897, lng: -76.9378 },

  // Baltimore City & County
  '21201': { lat: 39.2950, lng: -76.6200 },
  '21211': { lat: 39.3371, lng: -76.6412 },
  '21218': { lat: 39.3248, lng: -76.6111 },
  '21227': { lat: 39.2256, lng: -76.6575 },
  '21230': { lat: 39.2740, lng: -76.6210 },
  '21202': { lat: 39.2930, lng: -76.6100 },

  // Anne Arundel & Southern MD
  '21401': { lat: 38.9784, lng: -76.5012 },
  '20601': { lat: 38.6360, lng: -76.9070 },
  '20688': { lat: 38.3240, lng: -76.4520 },

  // Washington County & Western MD
  '21795': { lat: 39.5985, lng: -77.8185 },
  '21740': { lat: 39.6418, lng: -77.7200 },
  '21502': { lat: 39.6528, lng: -78.7625 },

  // Eastern Shore & Coastal MD
  '21811': { lat: 38.3228, lng: -75.2215 },
  '21801': { lat: 38.3607, lng: -75.5994 },
  '21842': { lat: 38.3365, lng: -75.0849 },
  '21601': { lat: 38.7743, lng: -76.0763 },
};

/**
 * 3-Digit Postal Code Prefix Area Fallbacks
 */
export const MARYLAND_POSTAL_PREFIX_CENTERS: Record<string, GeographicCoordinates> = {
  '206': { lat: 38.5000, lng: -76.7000 }, // Southern Maryland
  '207': { lat: 38.9500, lng: -76.8500 }, // Prince George's & Capital
  '208': { lat: 39.1000, lng: -77.2000 }, // Montgomery County
  '209': { lat: 39.0200, lng: -77.0100 }, // Silver Spring / Wheaton
  '210': { lat: 39.1500, lng: -76.7000 }, // Anne Arundel & Howard
  '211': { lat: 39.4000, lng: -76.7500 }, // Baltimore County North/West
  '212': { lat: 39.3000, lng: -76.6100 }, // Baltimore Metro
  '214': { lat: 38.9700, lng: -76.5000 }, // Annapolis
  '215': { lat: 39.6000, lng: -78.8000 }, // Western MD (Allegany/Garrett)
  '216': { lat: 38.8000, lng: -76.1000 }, // Upper Eastern Shore
  '217': { lat: 39.5000, lng: -77.4000 }, // Frederick & Washington County
  '218': { lat: 38.3500, lng: -75.3000 }, // Lower Eastern Shore
  '219': { lat: 39.6000, lng: -75.9000 }, // Cecil County
};

/**
 * Regional Center Coordinates for Geographic Regions in Maryland
 */
export const MARYLAND_REGION_CENTERS: Record<MarylandRegion, GeographicCoordinates> = {
  Capital: { lat: 39.0000, lng: -77.0500 },
  Central: { lat: 39.3000, lng: -76.6000 },
  'Eastern Shore': { lat: 38.5000, lng: -75.4000 },
  Southern: { lat: 38.4000, lng: -76.6000 },
  Western: { lat: 39.6000, lng: -78.3000 },
};

/**
 * Calculates geographic distance between two coordinates using the Haversine formula.
 *
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @param unit 'miles' (default) or 'km'
 * @returns Distance in specified unit
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'miles' | 'km' = 'miles'
): number {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  const R = unit === 'miles' ? 3958.8 : 6371.0; // Earth's mean radius
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns approximate geographic coordinates for a given postal / ZIP code.
 *
 * Checks exact 5-digit ZIP lookup first, followed by 3-digit prefix lookup.
 */
export function getCoordinatesForPostalCode(
  postalCode: string | null | undefined
): GeographicCoordinates | null {
  if (!postalCode || typeof postalCode !== 'string') return null;

  const cleaned = postalCode.trim().slice(0, 5);
  if (!cleaned) return null;

  if (MARYLAND_POSTAL_CODE_CENTERS[cleaned]) {
    return MARYLAND_POSTAL_CODE_CENTERS[cleaned];
  }

  const prefix3 = cleaned.slice(0, 3);
  if (MARYLAND_POSTAL_PREFIX_CENTERS[prefix3]) {
    return MARYLAND_POSTAL_PREFIX_CENTERS[prefix3];
  }

  return null;
}

/**
 * Filters breweries matching a postal code or 3-digit postal code prefix.
 *
 * @param breweries List of breweries to filter
 * @param postalCode Target postal code query (e.g., "21703" or "217")
 * @param prefixMatch If true, matches 3-digit prefix when 5-digit match fails or query is short
 */
export function filterBreweriesByPostalCode(
  breweries: Brewery[],
  postalCode: string | null | undefined,
  prefixMatch: boolean = false
): Brewery[] {
  if (!postalCode || typeof postalCode !== 'string') return [...breweries];

  const target = postalCode.trim();
  if (!target) return [...breweries];

  return breweries.filter((brewery) => {
    const bZip = (brewery.zipCode || '').trim();
    if (!bZip) return false;

    if (bZip.toLowerCase() === target.toLowerCase() || bZip.startsWith(target)) {
      return true;
    }

    if (prefixMatch && target.length >= 3) {
      const targetPrefix = target.slice(0, 3);
      return bZip.startsWith(targetPrefix);
    }

    return false;
  });
}

/**
 * Filters breweries matching a specific Maryland region.
 */
export function filterBreweriesByRegion(
  breweries: Brewery[],
  region: MarylandRegion | string | null | undefined
): Brewery[] {
  if (!region || typeof region !== 'string') return [...breweries];

  const target = region.trim().toLowerCase();
  if (!target) return [...breweries];

  return breweries.filter((brewery) => (brewery.region || '').trim().toLowerCase() === target);
}

/**
 * Sorts breweries deterministically by geographic proximity (Haversine distance)
 * from a target latitude/longitude location.
 *
 * Tie-breakers: Name ascending, then unique ID / slug.
 */
export function sortBreweriesByProximity(
  breweries: Brewery[],
  targetCoords: GeographicCoordinates
): Brewery[] {
  if (
    !targetCoords ||
    typeof targetCoords.lat !== 'number' ||
    typeof targetCoords.lng !== 'number' ||
    isNaN(targetCoords.lat) ||
    isNaN(targetCoords.lng)
  ) {
    return [...breweries];
  }

  const sorted = [...breweries];

  sorted.sort((a, b) => {
    const distA = calculateHaversineDistance(
      targetCoords.lat,
      targetCoords.lng,
      a.coordinates?.lat,
      a.coordinates?.lng
    );
    const distB = calculateHaversineDistance(
      targetCoords.lat,
      targetCoords.lng,
      b.coordinates?.lat,
      b.coordinates?.lng
    );

    if (distA !== distB) {
      return distA - distB;
    }

    const nameComp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    if (nameComp !== 0) return nameComp;

    const keyA = a.id || a.slug || '';
    const keyB = b.id || b.slug || '';
    return keyA.localeCompare(keyB);
  });

  return sorted;
}

/**
 * Sorts breweries by postal code (ZIP code) string in ascending or descending order.
 *
 * Tie-breakers: Name ascending, then unique ID / slug.
 */
export function sortBreweriesByPostalCode(
  breweries: Brewery[],
  ascending: boolean = true
): Brewery[] {
  const sorted = [...breweries];

  sorted.sort((a, b) => {
    const zipA = (a.zipCode || '').trim();
    const zipB = (b.zipCode || '').trim();

    const primaryComp = ascending
      ? zipA.localeCompare(zipB, undefined, { numeric: true })
      : zipB.localeCompare(zipA, undefined, { numeric: true });

    if (primaryComp !== 0) return primaryComp;

    const nameComp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    if (nameComp !== 0) return nameComp;

    const keyA = a.id || a.slug || '';
    const keyB = b.id || b.slug || '';
    return keyA.localeCompare(keyB);
  });

  return sorted;
}
