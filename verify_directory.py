from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000/breweries")
    page.wait_for_timeout(1000)

    # Search for Frederick
    page.get_by_placeholder("Search by name, style, city...").fill("Frederick")
    page.wait_for_timeout(1000)

    # Check that reset filters exist and can be clicked
    page.get_by_label("Reset all filters").click()
    page.wait_for_timeout(1000)

    # Take screenshot at key moment
    page.screenshot(path="verification-screenshot.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("verification-videos", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification-videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
