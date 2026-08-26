import { Brewery, MarylandRegion, BreweryType, OperationalCategory } from '../types';
import { getOperationalCategory } from './hours';

export interface BreweryFilterParams {
  search?: string;
  region?: MarylandRegion | string;
  county?: string;
  type?: BreweryType | string;
  status?: OperationalCategory | string;
  amenity?: string;
  amenities?: string[];
}

const CANONICAL_OPERATIONAL_CATEGORIES: OperationalCategory[] = [
  'open',
  'temporarily_closed',
  'permanently_closed',
  'hours_unavailable',
];

/**
 * Centralized, pure utility function for filtering breweries.
 *
 * Reused across directory and map components to prevent duplication
 * of filtering rules across the codebase.
 */
export function filterBreweries(breweries: Brewery[], filters: BreweryFilterParams): Brewery[] {
  const searchQuery = (filters.search || '').trim().toLowerCase();
  const targetRegion = filters.region || '';
  const targetCounty = filters.county || '';
  const targetType = filters.type || '';
  const targetStatus = filters.status || '';
  const singleAmenity = filters.amenity || '';
  const selectedAmenities = filters.amenities || [];

  return breweries.filter((brewery) => {
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
}
