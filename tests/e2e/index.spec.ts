import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3404');

  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});

test('not found page', async ({ page }) => {
  await page.goto('http://localhost:3404/mimic-treasure-chest');
  await expect(page.locator('h1')).toContainText('404');
  await page.locator('a').click();
  await expect(page.locator('h1')).toContainText(/Valintojen Toteuttaminen/);
});
