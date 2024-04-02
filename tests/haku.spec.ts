import { test, expect } from '@playwright/test';

test('filters active haku', async ({ page }) => {
  await page.goto('http://localhost:3404');

  await expect(page.locator('tbody tr')).toHaveCount(3);

  const hakuInput = await page.locator('input[type=text]');
  hakuInput.fill('Luk');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Hausjärven lukio jatkuva haku');
});

test('selects passive haku', async ({ page }) => {
  await page.goto('http://localhost:3404');
  await page.getByTestId('haku-tila-toggle').click();

  await expect(page.locator('tbody tr')).toHaveCount(3);

  const hakuInput = await page.locator('input[type=text]');
  hakuInput.fill('hak');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  hakuInput.fill('Leppä');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Leppävirran lukio - Jatkuva haku');
});