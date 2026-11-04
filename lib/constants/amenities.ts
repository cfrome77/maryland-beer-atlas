/**
 * Maryland Beer Atlas - Strongly Typed Brewery Amenities Taxonomy
 *
 * Centralized constant array and union type for all supported preconfigured brewery amenities.
 */

export const BREWERY_AMENITIES = [
  'Arcade Games',
  'Brewery Tours',
  'C&O Canal Proximity',
  'Cans To-Go',
  'Creek-Front Seating',
  'Deaf-Friendly / ASL',
  'Dog Friendly',
  'Food Trucks',
  'Food Vendors',
  'Full Food Menu',
  'General Store / Toy Shop',
  'Historic Memorabilia',
  'Huge Outdoor Seating Area',
  'Kid Friendly',
  'Large Beer Hall',
  'Live Music',
  'Local Taproom Specials',
  'Merch Shop',
  'Merchandise',
  'Outdoor Patio',
  'Outdoor Pine Grove',
  'Outdoor Plaza',
  'Outdoor Seating',
  'Pizza Kitchen',
  'Rustic Taproom',
  'Shared Collective Spaces',
  'Spacious Beer Garden',
  'Spacious Taproom',
  'Sustainable Focus',
  'Tasting Flight',
  'Tasting Room',
  'Togo Cans',
  'Trivia Nights',
  'Weekly Events',
] as const;

export type BreweryAmenity = (typeof BREWERY_AMENITIES)[number];
