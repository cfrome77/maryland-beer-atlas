import { test, expect } from '@playwright/test';
import { DirectoryPage } from './pages/directory.page';
import { MapPage } from './pages/map.page';

test.describe('Trail Filtering & Itinerary Navigation', () => {
  test('Directory page: Filter breweries by regional beer trail', async ({ page }) => {
    const directory = new DirectoryPage(page);
    await directory.goto();

    const initialCount = await directory.breweryCards.count();

    // Select the Hyattsville trail from trail dropdown
    await directory.selectTrail('hyattsville-beer-trail');

    // URL parameter sync
    await expect(page).toHaveURL(/trail=hyattsville-beer-trail/);

    // Filtered count should match trail stops (2 stops) with auto-retry
    await expect(directory.breweryCards).toHaveCount(2);

    const cardsText = (await directory.breweryCards.allInnerTexts()).join(' ');
    expect(cardsText).toContain('Streetcar 82');
    expect(cardsText).toContain("Franklin's");

    // Reset filters
    await directory.resetFilters();
    await expect(page).not.toHaveURL(/trail=/);
    await expect(directory.breweryCards).toHaveCount(initialCount);
  });

  test('Interactive Map page: Toggle trail layer and filter visible breweries', async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    // Select trail layer from dropdown
    await mapPage.selectTrail('downtown-frederick-taproom-walk');

    // Matching breweries list should show Frederick trail stops
    await expect(mapPage.matchingBreweryItems.filter({ hasText: 'Idiom Brewing' })).toBeVisible();
    await expect(mapPage.matchingBreweryItems.filter({ hasText: 'Monocacy Brewing' })).toBeVisible();

    // Click Clear All Filters
    await mapPage.clearAllFiltersButton.click();
    await expect(mapPage.matchingBreweryItems.filter({ hasText: 'Burley Oak Brewing' })).toBeVisible();
  });

  test('Trails directory and detail page: Explore itinerary metrics and sequential stops', async ({ page }) => {
    // Visit trails directory
    await page.goto('/trails');
    await expect(page).toHaveURL('/trails');

    // Ensure trail cards are displayed
    const trailCards = page.locator('div:has(a[aria-label^="Explore "])');
    await expect(trailCards.first()).toBeVisible();
    await expect(page.getByText('Downtown Frederick Taproom Walk')).toBeVisible();

    // Click trail card link using locator matching inner text
    await page.locator('a:has-text("Explore Itinerary")').first().click();

    // Verify trail detail page
    await expect(page).toHaveURL(/\/trails\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toBeVisible();

    // Verify Trip Overview card metrics
    await expect(page.getByText('Trip Overview & Key Details')).toBeVisible();
    await expect(page.getByText('Total Distance').first()).toBeVisible();
    await expect(page.getByText('Brewery Stops')).toBeVisible();

    // Verify timeline stop numbers exist
    await expect(page.getByText('Stop #1').first()).toBeVisible();
    await expect(page.getByText('Stop #2').first()).toBeVisible();
  });
});
