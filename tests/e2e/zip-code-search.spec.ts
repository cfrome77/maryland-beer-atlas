import { test, expect } from '@playwright/test';
import { DirectoryPage } from './pages/directory.page';
import { MapPage } from './pages/map.page';

test.describe('ZIP Code Search Functionality', () => {
  test('Directory page: ZIP code proximity input filters results and displays callout banner', async ({ page }) => {
    const directory = new DirectoryPage(page);
    await directory.goto();

    // Verify initial count shows full dataset (e.g. 12 breweries)
    const initialCards = await directory.breweryCards.count();
    expect(initialCards).toBeGreaterThan(5);

    // Enter Frederick ZIP code 21701
    await directory.fillPostalCode('21701');

    // Wait for debounced URL parameter and UI update
    await expect(page).toHaveURL(/postalCode=21701/);

    // Callout banner should be visible and confirm proximity search
    await expect(directory.zipCalloutBanner).toBeVisible();
    await expect(directory.zipCalloutBanner).toContainText('21701');

    // Filtered result list should contain Frederick breweries
    const filteredCards = await directory.breweryCards.count();
    expect(filteredCards).toBeLessThan(initialCards);

    // Check specific matching brewery titles
    const cardsText = (await directory.breweryCards.allInnerTexts()).join(' ');
    expect(cardsText).toContain('Monocacy Brewing');
    expect(cardsText).toContain('Idiom Brewing');

    // Test changing distance radius
    await directory.selectRadius(5);
    await expect(page).toHaveURL(/radius=5/);

    // Test clearing ZIP code filter
    await directory.clearZipButton.click();
    await expect(page).not.toHaveURL(/postalCode=/);
    await expect(directory.zipCalloutBanner).not.toBeVisible();
    expect(await directory.breweryCards.count()).toBe(initialCards);
  });

  test('Directory page: Invalid ZIP code displays validation error callout', async ({ page }) => {
    const directory = new DirectoryPage(page);
    await directory.goto();

    // Enter invalid ZIP code outside MD / invalid format
    await directory.fillPostalCode('99999');

    // Banner callout should display error notice
    await expect(directory.zipCalloutBanner).toBeVisible();
    await expect(directory.zipCalloutBanner).toContainText('99999');
  });

  test('Interactive Map page: ZIP code proximity input filters visible breweries and updates map state', async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    // Enter Hyattsville ZIP code 20781
    await mapPage.fillPostalCode('20781');

    // Banner callout should reflect proximity filter
    const callout = page.getByText('Filtered within 25 miles of ZIP Code 20781');
    await expect(callout).toBeVisible();

    // Matching breweries list should display Streetcar 82 & Franklin's
    await expect(mapPage.matchingBreweryItems.filter({ hasText: 'Streetcar 82' })).toBeVisible();
    await expect(mapPage.matchingBreweryItems.filter({ hasText: "Franklin's" })).toBeVisible();

    // Clear ZIP Code
    await mapPage.clearZipButton.click();
    await expect(callout).not.toBeVisible();
  });
});
