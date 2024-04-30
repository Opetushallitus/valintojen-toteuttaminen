import { test, expect } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

test('index accessibility', async ({ page }) => {
  await page.goto('/');
  await expectAllSpinnersHidden(page);
  await page.locator('tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});

test('not found page accessibility', async ({ page }) => {
  await page.goto('/valintojen-toteuttaminen/mimic-treasure-chest');
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test('not found page', async ({ page }) => {
  await page.goto('/valintojen-toteuttaminen/mimic-treasure-chest');
  await expect(page.locator('h1')).toContainText('404');
  await page.locator('a').click();
  await expect(page.locator('h1')).toContainText(/Valintojen toteuttaminen/);
});
