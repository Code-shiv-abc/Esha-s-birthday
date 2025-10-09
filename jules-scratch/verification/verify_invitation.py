import os
from playwright.sync_api import sync_playwright, Page, expect

def verify_invitation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath("index.html")

        # Navigate to the local HTML file
        page.goto(f"file://{file_path}")

        # Wait for the page to be fully loaded, especially fonts and background images
        page.wait_for_load_state('networkidle')

        # Expect the main heading to be visible
        expect(page.get_by_role("heading", name="|| श्री गणेशाय नमः ||")).to_be_visible()

        # Take a screenshot of the entire page
        page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_invitation()