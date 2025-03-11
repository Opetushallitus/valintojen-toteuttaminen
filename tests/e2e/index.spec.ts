import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

test('Kotisivun saavutettavuus', async ({ page }) => {
  await page.goto('/');
  await expectAllSpinnersHidden(page);
  await page.locator('tbody tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('Sivulla on otsikko', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});

test('"Ei löydy"-sivun saavutettavuus', async ({ page }) => {
  await page.goto('/valintojen-toteuttaminen/mimic-treasure-chest');
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('Navigoi kotisivulle "Ei löydy"-sivulta', async ({ page }) => {
  await page.goto('/valintojen-toteuttaminen/mimic-treasure-chest');
  await expect(page.locator('h1')).toContainText('404');
  await page.locator('a').click();
  await expect(page.locator('h1')).toContainText(/Valintojen toteuttaminen/);
});
