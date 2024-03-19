import { test, expect } from '@playwright/test';

test('selects haku', async ({ page }) => {
  await page.goto('http://localhost:3404');

  const hakuInput = await page.locator('input[type=text]');
  hakuInput.fill('Luk');
  await expect(page.getByTestId('haku-results').locator('.cursor-pointer')).toHaveCount(1);
  await page.getByTestId('haku-results').locator('.cursor-pointer').first().click();
  await expect(page.locator('input[type=text]')).toHaveValue('Hausjärven lukio jatkuva haku');
});

test('selects passive haku', async ({ page }) => {
  await page.goto('http://localhost:3404');
  await page.getByTestId('haku-tila-toggle').click();

  const hakuInput = await page.locator('input[type=text]');
  hakuInput.fill('hak');
  await expect(page.getByTestId('haku-results').locator('.cursor-pointer')).toHaveCount(3);
  hakuInput.fill('Leppä');
  await expect(page.getByTestId('haku-results').locator('.cursor-pointer')).toHaveCount(1);
  await page.getByTestId('haku-results').locator('.cursor-pointer').first().click();
  await expect(page.locator('input[type=text]')).toHaveValue('Leppävirran lukio - Jatkuva haku');
});