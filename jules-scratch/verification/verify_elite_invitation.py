import os
import time
from playwright.sync_api import sync_playwright, Page, expect

def verify_invitation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # --- Desktop Verification ---
        page = browser.new_page()
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # Verify cover screen
        expect(page.locator("#cover-screen")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/elite_cover_desktop.png")

        # Open invitation
        page.get_by_role("button", name="Open Invitation").click()
        # Wait for the last animated element to be fully opaque
        footer = page.locator(".footer")
        expect(footer).to_be_visible(timeout=5000)
        expect(footer).to_have_css("opacity", "1", timeout=5000)
        page.screenshot(path="jules-scratch/verification/elite_invitation_desktop.png", full_page=True)

        # --- Mobile Verification ---
        page_mobile = browser.new_page(viewport={"width": 375, "height": 667})
        page_mobile.goto(f"file://{file_path}")

        # Verify cover screen on mobile
        expect(page_mobile.locator("#cover-screen")).to_be_visible()
        page_mobile.screenshot(path="jules-scratch/verification/elite_cover_mobile.png")

        # Open invitation on mobile
        page_mobile.get_by_role("button", name="Open Invitation").click()
        # Wait for the last animated element to be fully opaque
        footer_mobile = page_mobile.locator(".footer")
        expect(footer_mobile).to_be_visible(timeout=5000)
        expect(footer_mobile).to_have_css("opacity", "1", timeout=5000)
        page_mobile.screenshot(path="jules-scratch/verification/elite_invitation_mobile.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_invitation()