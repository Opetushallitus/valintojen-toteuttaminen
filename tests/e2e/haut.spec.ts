import { test, expect, Page } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';

async function selectHakutapa(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', { name: 'Hakutapa' });
  await combobox.click();
  const listbox = page.getByRole('listbox', { name: 'Hakutapa' });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}

async function selectKausi(page: Page, expectedOption: string) {
  const combobox = page.getByRole('combobox', {
    name: 'Koulutuksen alkamiskausi',
  });
  await combobox.click();
  const listbox = page.getByRole('listbox', {
    name: 'Koulutuksen alkamiskausi',
  });
  await listbox.getByRole('option', { name: expectedOption }).click();
  await expect(combobox).toContainText(expectedOption);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
});

test('Haku-page accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000046872',
  );
  await expectAllSpinnersHidden(page);
  await expectPageAccessibilityOk(page);
});

const getMyosArkistoidut = (page: Page) =>
  page.getByRole('checkbox', { name: 'Myös arkistoidut' });

test('filters haku by published state', async ({ page }) => {
  await expect(getMyosArkistoidut(page)).not.toBeChecked();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  const hakuInput = await page.getByRole('textbox', { name: 'Hae hakuja' });
  hakuInput.fill('Luk');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText(
    'Hausjärven lukio jatkuva haku',
  );
});

test('filters haku by archived state', async ({ page }) => {
  const myosArkistoidut = getMyosArkistoidut(page);
  await myosArkistoidut.click();
  await expect(myosArkistoidut).toBeChecked();
  await expect(page.locator('tbody tr')).toHaveCount(6);
  const hakuInput = await page.getByRole('textbox', { name: 'Hae hakuja' });
  hakuInput.fill('hak');
  await expect(page.locator('tbody tr')).toHaveCount(5);
  hakuInput.fill('Leppä');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText(
    'Leppävirran lukio - Jatkuva haku',
  );
});

test('filters by hakutapa', async ({ page }) => {
  await selectHakutapa(page, 'Erillishaku');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await selectHakutapa(page, 'Jatkuva haku');
  await expect(page.locator('tbody tr')).toHaveCount(2);
});

test('filters by start period', async ({ page }) => {
  await selectKausi(page, '2024 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await selectKausi(page, '2020 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(0);
});

test('filters by hakutapa and start period', async ({ page }) => {
  await selectHakutapa(page, 'Jatkuva haku');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await selectKausi(page, '2023 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

test('navigates to haku page', async ({ page }) => {
  await page.locator('tbody tr:last-child td:first-child a').click();
  await expect(page).toHaveURL(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102',
  );
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  await expect(page.locator('.organizationLabel')).toHaveCount(3);
});

test('navigates to haku page with no hakukohde', async ({ page }) => {
  await page.locator('tbody tr:first-child td:first-child a').click();
  await expect(page).toHaveURL(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000046872',
  );
  await expect(page.locator('h1')).toHaveText(
    '> Hausjärven lukio jatkuva haku',
  );
  await expect(page.locator('.organizationLabel')).toHaveCount(0);
});
