from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    file_path = os.path.abspath('etas/index.html')

    page.goto(f'file://{file_path}')

    # Fill out the form with sample data
    page.fill('#form-family-name', 'DOE')
    page.fill('#form-given-names', 'JOHN')
    page.fill('#form-nationality', 'UNITED STATES OF AMERICA')
    page.fill('#form-dob', '1990-01-01')
    page.fill('#form-pob', 'WASHINGTON D.C.')
    page.fill('#form-passport-number', 'P123456789')
    page.fill('#form-issue-date', '2022-01-01')
    page.fill('#form-expiry-date', '2032-01-01')
    page.fill('#form-arrival-date', '2024-12-01')

    # Click the generate button to update the document
    page.click('button[type="submit"]')

    # Take a screenshot of just the document container
    container = page.locator('.container')
    container.screenshot(path='jules-scratch/verification/final_etas_screenshot.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
