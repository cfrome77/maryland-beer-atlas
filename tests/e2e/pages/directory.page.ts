import { Page, Locator, expect } from '@playwright/test';

export class DirectoryPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly zipInput: Locator;
  readonly clearZipButton: Locator;
  readonly radiusSelect: Locator;
  readonly trailSelect: Locator;
  readonly quickGuideSelect: Locator;
  readonly regionSelect: Locator;
  readonly countySelect: Locator;
  readonly typeSelect: Locator;
  readonly statusSelect: Locator;
  readonly beerStyleSelect: Locator;
  readonly amenitySelect: Locator;
  readonly sortSelect: Locator;
  readonly resetFiltersButton: Locator;
  readonly resultsCountBanner: Locator;
  readonly zipCalloutBanner: Locator;
  readonly breweryCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search by name, style, city...');
    this.clearSearchButton = page.getByRole('button', { name: 'Clear search text' });
    this.zipInput = page.getByPlaceholder('ZIP (e.g. 21701)');
    this.clearZipButton = page.getByRole('button', { name: 'Clear ZIP code input' });
    this.radiusSelect = page.getByLabel('Distance radius in miles');
    this.trailSelect = page.getByLabel('Filter by Regional Beer Trail');
    this.quickGuideSelect = page.getByLabel('Popular guides and presets');
    this.regionSelect = page.getByLabel('Filter by region');
    this.countySelect = page.getByLabel('Filter by county');
    this.typeSelect = page.getByLabel('Filter by brewery type');
    this.statusSelect = page.getByLabel('Filter by operational status');
    this.beerStyleSelect = page.getByLabel('Filter by beer style');
    this.amenitySelect = page.getByLabel('Filter by amenity');
    this.sortSelect = page.getByLabel('Sort breweries');
    this.resetFiltersButton = page.getByRole('button', { name: 'Reset All Filters' }).or(page.getByRole('button', { name: 'Reset Filters' }));
    this.resultsCountBanner = page.locator('div[aria-live="polite"]').first();
    this.zipCalloutBanner = page.locator('div.bg-amber-500\\/10:has-text("Searching within")').or(page.locator('div.bg-red-500\\/10'));
    this.breweryCards = page.locator('div.grid.grid-cols-1.md\\:grid-cols-3.gap-8 > div');
  }

  async goto() {
    await this.page.goto('/breweries');
    await expect(this.page).toHaveURL(/\/breweries/);
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

  async selectRegion(region: string) {
    await this.regionSelect.selectOption(region);
  }

  async selectCounty(county: string) {
    await this.countySelect.selectOption(county);
  }

  async selectType(type: string) {
    await this.typeSelect.selectOption(type);
  }

  async selectStatus(status: string) {
    await this.statusSelect.selectOption(status);
  }

  async resetFilters() {
    await this.resetFiltersButton.first().click();
  }
}
