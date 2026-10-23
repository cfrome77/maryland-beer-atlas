import { Page, Locator, expect } from '@playwright/test';

export class MapPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly statusSelect: Locator;
  readonly sortSelect: Locator;
  readonly zipInput: Locator;
  readonly clearZipButton: Locator;
  readonly radiusSelect: Locator;
  readonly trailSelect: Locator;
  readonly clearAllFiltersButton: Locator;
  readonly matchingBreweriesCount: Locator;
  readonly matchingBreweryItems: Locator;
  readonly inspectorPanel: Locator;
  readonly inspectorHeader: Locator;
  readonly mapContainer: Locator;
  readonly mapMarkers: Locator;
  readonly mapPopups: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search by brewery, city, or style...');
    this.clearSearchButton = page.getByRole('button', { name: 'Clear search input' });
    this.statusSelect = page.getByLabel('Filter by operational status');
    this.sortSelect = page.getByLabel('Sort breweries by');
    this.zipInput = page.getByPlaceholder('ZIP Code (e.g. 21701)');
    this.clearZipButton = page.getByRole('button', { name: 'Clear map ZIP code input' });
    this.radiusSelect = page.getByLabel('Map distance radius in miles');
    this.trailSelect = page.getByLabel('Filter by Regional Beer Trail');
    this.clearAllFiltersButton = page.getByRole('button', { name: 'Clear All Filters' });
    this.matchingBreweriesCount = page.locator('h3:has-text("Matching Breweries")');
    this.matchingBreweryItems = page.locator('div:has(h3:has-text("Matching Breweries")) button');
    this.inspectorPanel = page.locator('div.lg\\:col-span-4').last();
    this.inspectorHeader = page.locator('div.lg\\:col-span-4 h2').last();
    this.mapContainer = page.locator('.maplibregl-map');
    this.mapMarkers = page.locator('.maplibregl-marker');
    this.mapPopups = page.locator('.maplibregl-popup-content');
  }

  async goto() {
    await this.page.goto('/map');
    await expect(this.page).toHaveURL(/\/map/);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async fillPostalCode(zipCode: string) {
    await this.zipInput.fill(zipCode);
  }

  async selectRadius(miles: number) {
    await this.radiusSelect.selectOption(miles.toString());
  }

  async selectTrail(trailId: string) {
    await this.trailSelect.selectOption(trailId);
  }

  async clickMatchingBrewery(breweryName: string) {
    await this.matchingBreweryItems.filter({ hasText: breweryName }).first().click();
  }

  async clickTrailQuickButton(trailName: string) {
    await this.page.getByRole('button', { name: trailName }).click();
  }
}
