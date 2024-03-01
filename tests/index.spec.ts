import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3404');

  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});
