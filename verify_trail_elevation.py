from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to Frederick trail detail page
    page.goto("http://localhost:3000/trails/frederick-beer-adventure")
    page.wait_for_timeout(1000)

    # Scroll down to reveal Elevation Profile & Topography section
    page.get_by_text("Route Difficulty & Topography").scroll_into_view_if_needed()
    page.wait_for_timeout(1000)

    # Take screenshot of Elevation Profile & Metrics
    page.screenshot(path="/home/jules/verification/screenshots/elevation_profile.png")
    page.wait_for_timeout(1000)

    # Click on "View Full Map Layer"
    page.get_by_role("link", name="View Full Map Layer").click()
    page.wait_for_timeout(1500)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
