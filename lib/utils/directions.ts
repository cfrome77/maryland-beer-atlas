import { Brewery, BreweryCoordinates } from '../types';

export function hasValidCoordinates(
  coordinates?: BreweryCoordinates | null
): coordinates is BreweryCoordinates {
  return !!(
    coordinates &&
    typeof coordinates.lat === 'number' &&
    typeof coordinates.lng === 'number' &&
    !isNaN(coordinates.lat) &&
    !isNaN(coordinates.lng) &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
}

export interface BreweryDirectionsUrls {
  googleMapsUrl: string;
  appleMapsUrl: string;
  hasValidCoords: boolean;
}

/**
 * Generates canonical Google Maps and Apple Maps URLs for a brewery.
 * Uses exact lat/lng coordinates if valid, otherwise falls back to address query.
 */
export function getDirectionsUrls(
  brewery: Partial<Brewery> & {
    name?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    coordinates?: BreweryCoordinates | null;
  }
): BreweryDirectionsUrls {
  const validCoords = hasValidCoordinates(brewery.coordinates);

  const addressString = [
    brewery.name,
    brewery.address,
    brewery.city,
    brewery.zipCode ? `MD ${brewery.zipCode}` : 'MD',
  ]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = validCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${brewery.coordinates!.lat},${brewery.coordinates!.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString)}`;

  const appleMapsUrl = validCoords
    ? `https://maps.apple.com/?daddr=${brewery.coordinates!.lat},${brewery.coordinates!.lng}`
    : `https://maps.apple.com/?daddr=${encodeURIComponent(addressString)}`;

  return {
    googleMapsUrl,
    appleMapsUrl,
    hasValidCoords: validCoords,
  };
}
