import { test, expect } from '@playwright/test';
import { MapPage } from './pages/map.page';

test.describe('Interactive Map Pin & Inspector Interactions', () => {
  test('Map Page: Clicking matching brewery item updates RHS sidebar inspector details', async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    // Verify initial inspector state when no brewery is selected
    await expect(page.getByText('No Brewery Selected')).toBeVisible();

    // Search for Flying Dog
    await mapPage.search('Flying Dog');

    // Click Flying Dog in matching breweries list
    await mapPage.clickMatchingBrewery('Flying Dog Brewery');

    // RHS Sidebar Inspector should now display Flying Dog details
    await expect(mapPage.inspectorHeader).toHaveText('Flying Dog Brewery');
    await expect(mapPage.inspectorPanel).toContainText('4607 Wedgewood Blvd');
    await expect(mapPage.inspectorPanel).toContainText('Central Region');
    await expect(mapPage.inspectorPanel).toContainText('Operational Status');

    // Taproom profile link should be active and valid
    const profileLink = mapPage.inspectorPanel.getByRole('link', { name: 'View Taproom Profile' });
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute('href', '/breweries/flying-dog-brewery');
  });

  test('Map Page: Clicking map pin marker opens popup with directions and detail link', async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    // Wait for map markers to be attached
    const markers = mapPage.mapMarkers;
    await expect(markers.first()).toBeVisible();

    // Click first map pin marker
    await markers.first().click();

    // Popup content should appear
    const popup = mapPage.mapPopups;
    await expect(popup).toBeVisible();

    // Popup should contain directions shortcuts
    await expect(popup.getByText('Google Maps')).toBeVisible();
    await expect(popup.getByText('Apple Maps')).toBeVisible();

    // Click View Full Profile link inside popup via evaluate to handle canvas absolute position
    const profileLink = popup.locator('a[href^="/breweries/"]').first();
    await expect(profileLink).toBeVisible();
    await profileLink.evaluate((el: HTMLElement) => el.click());

    // Should navigate to brewery detail page
    await expect(page).toHaveURL(/\/breweries\/[a-z0-9-]+/);
  });
});
