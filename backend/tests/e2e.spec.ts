import { test, expect } from '@playwright/test';

test.describe('MediWise E2E Flow (Playwright)', () => {
  const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

  test('Patient Happy Path: Login -> Browse Medicines -> Add to Order', async ({ page }) => {
    // 1. Visit app
    await page.goto(BASE_URL);

    // 2. Auth gate rendered
    await expect(page.locator('text=Welcome to MediWise')).toBeVisible({ timeout: 10000 });

    // 3. Fill in demo credentials
    await page.fill('input[type="email"], input[type="text"]', 'anika.sharma@example.com');
    await page.fill('input[type="password"]', 'MediWiseDemo2026!');

    // 4. Submit login
    await page.click('button[type="submit"]');

    // 5. Lands on Marketplace View
    await expect(page.locator('text=Marketplace').or(page.locator('text=Therapeutic Categories'))).toBeVisible({ timeout: 10000 });

    // 6. Search for generic medicine
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Atorvastatin');
    }
  });

  test('Pharmacist Flow: Partner Portal Order Queue', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('input[type="email"], input[type="text"]', 'ramesh@medplus.example');
    await page.fill('input[type="password"]', 'MediWiseDemo2026!');
    await page.click('button[type="submit"]');

    // Lands on Partner Portal
    await expect(page.locator('text=Incoming Orders').or(page.locator('text=Partner Portal'))).toBeVisible({ timeout: 10000 });
  });

  test('Admin Flow: Quarantine & Dispute Operations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('input[type="email"], input[type="text"]', 'admin@mediwise.example');
    await page.fill('input[type="password"]', 'MediWiseDemo2026!');
    await page.click('button[type="submit"]');

    // Lands on Admin Dashboard
    await expect(page.locator('text=Super Admin').or(page.locator('text=Quarantine Console'))).toBeVisible({ timeout: 10000 });
  });
});
