import { test, expect } from '@playwright/test';
import { DirectoryPage } from './pages/directory.page';

test.describe('Permanent Amenity & Feature Filtering', () => {
  test('Directory page: Toggle permanent kitchen and outdoor patio filters with combinations', async ({ page }) => {
    const directory = new DirectoryPage(page);
    await directory.goto();

    const initialCount = await directory.breweryCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Toggle Permanent Kitchen
    await directory.toggleKitchen();
    await expect(page).toHaveURL(/hasKitchen=true/);

    // Franklins has a full kitchen and should remain visible
    const kitchenCards = await directory.breweryCards.allInnerTexts();
    expect(kitchenCards.join(' ')).toContain("Franklin's");

    // Combine with Region filter
    await directory.selectRegion('Capital');
    await expect(page).toHaveURL(/region=Capital/);
    await expect(page).toHaveURL(/hasKitchen=true/);

    // Toggle off Kitchen and toggle on Outdoor Patio
    await directory.toggleKitchen();
    await directory.togglePatio();
    await expect(page).toHaveURL(/hasOutdoorPatio=true/);

    const patioCards = await directory.breweryCards.allInnerTexts();
    expect(patioCards.join(' ')).toContain('Streetcar 82');

    // Reset filters
    await directory.resetFilters();
    await expect(page).toHaveURL(/\/breweries$/);
    await expect(directory.breweryCards).toHaveCount(initialCount);
  });
});
