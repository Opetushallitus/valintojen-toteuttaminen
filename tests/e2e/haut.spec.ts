import { test, expect, Page, Locator } from '@playwright/test';
import {
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  expectUrlParamToEqual,
  getHakukohdeNaviLinks,
  selectOption,
} from './playwright-utils';

async function selectHakutapa(page: Page, expectedOption: string) {
  await selectOption(page, 'Hakutapa', expectedOption);
}

async function selectKausi(page: Page, expectedOption: string) {
  await selectOption(page, 'Koulutuksen alkamiskausi', expectedOption);
}

async function selectTila(page: Page, expectedOption: string) {
  await selectOption(page, 'Tila', expectedOption);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Haut-page accessibility', async ({ page }) => {
  await expectAllSpinnersHidden(page);
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
  await expectPageAccessibilityOk(page);
});

const getTableRows = (loc: Page | Locator) => loc.locator('tbody tr');

test('filters haku by published state', async ({ page }) => {
  await selectTila(page, 'Julkaistu');
  const tableRows = getTableRows(page);
  await expect(tableRows).toHaveCount(3);
  const hakuInput = page.getByRole('textbox', { name: 'Hae hakuja' });
  await hakuInput.fill('Luk');
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows).toContainText('Hausjärven lukio jatkuva haku');
});

test('Set tila filter to julkaistu by default', async ({ page }) => {
  await expectUrlParamToEqual(page, 'tila', 'julkaistu');
  await expect(page.getByRole('combobox', { name: 'Tila' })).toContainText(
    'Julkaistu',
  );
});

test('filters haku by archived state', async ({ page }) => {
  const tableRows = getTableRows(page);
  await selectTila(page, 'Arkistoitu');

  await expect(tableRows).toHaveCount(4);
  const hakuInput = page.getByRole('textbox', { name: 'Hae hakuja' });
  await hakuInput.fill('hak');
  await expect(tableRows).toHaveCount(4);
  await hakuInput.fill('Leppä');
  await expect(tableRows).toHaveCount(1);
  await expect(tableRows).toContainText('Leppävirran lukio - Jatkuva haku');
  await expectUrlParamToEqual(page, 'search', 'Leppä');
});

test('filters by hakutapa', async ({ page }) => {
  const tableRows = getTableRows(page);
  await selectHakutapa(page, 'Erillishaku');
  await expect(tableRows).toHaveCount(1);
  await expectUrlParamToEqual(page, 'hakutapa', 'hakutapa_02');
  await selectHakutapa(page, 'Jatkuva haku');
  await expect(tableRows).toHaveCount(2);
  await expectUrlParamToEqual(page, 'hakutapa', 'hakutapa_03');
});

test('filters by start period', async ({ page }) => {
  const tableRows = getTableRows(page);
  await selectKausi(page, '2024 syksy');
  await expect(tableRows).toHaveCount(1);
  await selectKausi(page, '2020 syksy');
  await expect(tableRows).toHaveCount(0);
  await expectUrlParamToEqual(page, 'alkamiskausi', '2020_syksy');
});

test('filters by hakutapa and start period', async ({ page }) => {
  const tableRows = getTableRows(page);
  await selectHakutapa(page, 'Jatkuva haku');
  await expect(tableRows).toHaveCount(2);
  await selectKausi(page, '2023 syksy');
  await expect(tableRows).toHaveCount(1);
});

test('sorts list by nimi when header clicked', async ({ page }) => {
  await expectAllSpinnersHidden(page);
  const nimiHeader = page.getByRole('columnheader', { name: 'Nimi' });
  await nimiHeader.getByRole('button').click();
  await expect(nimiHeader).toHaveAttribute('aria-sort', 'ascending');
  await expectUrlParamToEqual(page, 'sort', 'nimi:asc');

  await nimiHeader.getByRole('button').click();

  await expect(nimiHeader).toHaveAttribute('aria-sort', 'descending');
  await expectUrlParamToEqual(page, 'sort', 'nimi:desc');

  const tableRows = getTableRows(page);

  await expect(
    tableRows.first().getByRole('cell', {
      name: 'Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
    }),
  ).toBeVisible();
});

test('navigates to haku page', async ({ page }) => {
  await page.locator('tbody tr:last-child td:first-child a').click();
  await expect(page).toHaveURL(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde',
  );
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  await expect(getHakukohdeNaviLinks(page)).toHaveCount(3);
});

test('navigates to haku page with no hakukohde', async ({ page }) => {
  await page.locator('tbody tr:first-child td:first-child a').click();
  await expect(page).toHaveURL(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000046872/hakukohde',
  );
  await expect(page.locator('h1')).toHaveText(
    '> Hausjärven lukio jatkuva haku',
  );
  await expect(getHakukohdeNaviLinks(page)).toHaveCount(0);
});
