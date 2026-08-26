import { Brewery, MarylandRegion, BreweryType, OperationalCategory } from '../types';
import { getOperationalCategory } from './hours';

export type BrewerySortOption =
  | 'name-asc'
  | 'name-desc'
  | 'county-asc'
  | 'city-asc'
  | 'region-asc'
  | 'type-asc'
  | 'verified-desc';

export interface BreweryFilterParams {
  search?: string;
  region?: MarylandRegion | string;
  county?: string;
  type?: BreweryType | string;
  status?: OperationalCategory | string;
  amenity?: string;
  amenities?: string[];
  sort?: BrewerySortOption;
}

const CANONICAL_OPERATIONAL_CATEGORIES: OperationalCategory[] = [
  'open',
  'temporarily_closed',
  'permanently_closed',
  'hours_unavailable',
];

/**
 * Deterministic helper function to sort breweries with stable tie-breaking.
 */
export function sortBreweries(
  breweries: Brewery[],
  sortOption: BrewerySortOption = 'name-asc'
): Brewery[] {
  const sorted = [...breweries];

  sorted.sort((a, b) => {
    let primaryComparison = 0;

    switch (sortOption) {
      case 'name-asc':
        primaryComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        break;
      case 'name-desc':
        primaryComparison = b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        break;
      case 'county-asc':
        primaryComparison = a.county.localeCompare(b.county, undefined, { sensitivity: 'base' });
        break;
      case 'city-asc':
        primaryComparison = a.city.localeCompare(b.city, undefined, { sensitivity: 'base' });
        break;
      case 'region-asc':
        primaryComparison = a.region.localeCompare(b.region, undefined, { sensitivity: 'base' });
        break;
      case 'type-asc':
        primaryComparison = a.type.localeCompare(b.type, undefined, { sensitivity: 'base' });
        break;
      case 'verified-desc': {
        const dateA = a.lastVerified || '';
        const dateB = b.lastVerified || '';
        primaryComparison = dateB.localeCompare(dateA);
        break;
      }
      default:
        primaryComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        break;
    }

    if (primaryComparison !== 0) {
      return primaryComparison;
    }

    // Secondary comparison: Name ascending (for non-name sort options or when primary attribute matches)
    if (sortOption !== 'name-asc' && sortOption !== 'name-desc') {
      const nameComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      if (nameComparison !== 0) {
        return nameComparison;
      }
    }

    // Tertiary tie-breaker: Unique ID / slug to ensure deterministic stable sorting
    const keyA = a.id || a.slug || '';
    const keyB = b.id || b.slug || '';
    return keyA.localeCompare(keyB);
  });

  return sorted;
}

/**
 * Centralized, pure utility function for filtering and sorting breweries.
 *
 * Reused across directory and map components to prevent duplication
 * of filtering and sorting rules across the codebase.
 */
export function filterBreweries(breweries: Brewery[], filters: BreweryFilterParams): Brewery[] {
  const searchQuery = (filters.search || '').trim().toLowerCase();
  const targetRegion = filters.region || '';
  const targetCounty = filters.county || '';
  const targetType = filters.type || '';
  const targetStatus = filters.status || '';
  const singleAmenity = filters.amenity || '';
  const selectedAmenities = filters.amenities || [];

  const filtered = breweries.filter((brewery) => {
    // 1. Search Query Filter (name, city, description, beer styles)
    if (searchQuery) {
      const matchesName = brewery.name.toLowerCase().includes(searchQuery);
      const matchesCity = brewery.city.toLowerCase().includes(searchQuery);
      const matchesDescription = (brewery.description || '').toLowerCase().includes(searchQuery);
      const matchesStyle = brewery.beerStyles.some((style) =>
        style.toLowerCase().includes(searchQuery)
      );

      if (!matchesName && !matchesCity && !matchesDescription && !matchesStyle) {
        return false;
      }
    }

    // 2. Region Filter
    if (targetRegion && brewery.region !== targetRegion) {
      return false;
    }

    // 3. County Filter
    if (targetCounty && brewery.county !== targetCounty) {
      return false;
    }

    // 4. Brewery Type Filter
    if (targetType && brewery.type !== targetType) {
      return false;
    }

    // 5. Operational Status Filter
    if (targetStatus) {
      const category = getOperationalCategory(brewery.status, brewery.structuredHours);
      const isCanonical = CANONICAL_OPERATIONAL_CATEGORIES.includes(targetStatus as OperationalCategory);

      if (isCanonical) {
        if (category !== targetStatus) {
          return false;
        }
      } else {
        const matchesCategory = category === targetStatus;
        const matchesRawStatus = brewery.status.toLowerCase() === targetStatus.toLowerCase();
        if (!matchesCategory && !matchesRawStatus) {
          return false;
        }
      }
    }

    // 6. Amenity / Amenities Filter
    if (singleAmenity && !brewery.amenities.includes(singleAmenity)) {
      return false;
    }

    if (
      selectedAmenities.length > 0 &&
      !selectedAmenities.every((amenity) => brewery.amenities.includes(amenity))
    ) {
      return false;
    }

    return true;
  });

  return sortBreweries(filtered, filters.sort || 'name-asc');
}
