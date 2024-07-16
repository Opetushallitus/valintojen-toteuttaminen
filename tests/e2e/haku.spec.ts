import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

test('Haku-page accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

test.describe('hakukohde search', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
    );
  });

  test('filters by name', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Natural Sciences');
    await expect(page.locator('.organizationLabel')).toHaveCount(1);
    await expect(page.locator('.hakukohdeLabel').first()).toContainText(
      'Finnish MAOL competition route, Natural Sciences and Mathematics',
    );
    await hakuInput.fill('Sustainable Urban');
    await expect(page.locator('.organizationLabel')).toHaveCount(1);
    await expect(page.locator('.hakukohdeLabel').first()).toContainText(
      'Finnish MAOL competition route, Technology, Sustainable Urban Development',
    );
  });

  test('filter by organizer name', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('Tekniikan ja luonnontieteiden tiedekunta');
    await expect(page.locator('.organizationLabel')).toHaveCount(2);
  });

  test('filter by hakukohde oid', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakukohteita',
    });
    await hakuInput.fill('1.2.246.562.20.00000000000000045104');
    await expect(page.locator('.organizationLabel')).toHaveCount(1);
    await expect(page.locator('.hakukohdeLabel').first()).toContainText(
      'Finnish MAOL competition route, Computing and Electrical Engineering',
    );
  });
});
