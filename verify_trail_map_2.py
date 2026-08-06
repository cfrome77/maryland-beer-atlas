from playwright.sync_api import sync_playwright
import os

def run_verification(page):
    # Navigate to the correct Beer Trail Page
    print("Navigating to http://localhost:3000/trails/frederick-beer-adventure...")
    page.goto("http://localhost:3000/trails/frederick-beer-adventure")
    page.wait_for_timeout(2000)

    # Scroll down slightly to show the interactive trail map
    page.evaluate("window.scrollTo(0, 500)")
    page.wait_for_timeout(1500)

    # Take screenshot of the interactive trail map with the connecting line between markers
    print("Taking Trail page map screenshot...")
    page.screenshot(path="/home/jules/verification/screenshots/trail_itinerary_map.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
    print("Verification completed successfully!")
