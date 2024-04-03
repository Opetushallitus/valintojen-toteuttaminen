import { test, expect } from '@playwright/test';

test('filters active haku', async ({ page }) => {
  await page.goto('http://localhost:3404');

  await expect(page.locator('tbody tr')).toHaveCount(3);

  const hakuInput = await page.locator('input[type=text]');
  hakuInput.fill('Luk');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Hausjärven lukio jatkuva haku');
});

test('filters passive haku', async ({ page }) => {
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

test('filters by hakutapa', async ({page}) => {
  await page.goto('http://localhost:3404');
  await page.getByTestId('haku-hakutapa-select').selectOption('Erillishaku');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByTestId('haku-hakutapa-select').selectOption('Jatkuva haku');
  await expect(page.locator('tbody tr')).toHaveCount(2);
});

test('filters by start period', async ({page}) => {
  await page.goto('http://localhost:3404');
  await page.getByTestId('haku-kausi-select').selectOption('2024 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

test('navigates to haku page', async ({page}) => {
  await page.goto('http://localhost:3404');
  await page.locator('tbody tr:last-child td:first-child a').click();
  await expect(page).toHaveURL('http://localhost:3404/haku/1.2.246.562.29.00000000000000045102');
  await expect(page.locator('h2')).toHaveText('Tampere University Separate Admission/ Finnish MAOL Competition Route 2024');
});
