/**
 * Maryland Beer Atlas - Strongly Typed Beer Style Taxonomy
 *
 * Centralized constant array and union type for all supported beer styles.
 */

export const BEER_STYLES = [
  'Altbier',
  'Amber Ale',
  'American IPA',
  'American Pilsner',
  'Belgian IPA',
  'Belgian Witbier',
  'Czech Pilsner',
  'Double IPA',
  'Dry Stout',
  'English Pale Ale',
  'ESB',
  'Farmhouse Ale',
  'Fruited Sour',
  'Gose',
  'Hazy IPA',
  'IPA',
  'Imperial IPA',
  'Imperial Stout',
  'Lager',
  'Pale Ale',
  'Pilsner',
  'Porter',
  'Red Ale',
  'Saison',
  'Sour',
  'Spiced Ale',
  'Stout',
  'Wild Ale',
] as const;

export type BeerStyle = (typeof BEER_STYLES)[number];
