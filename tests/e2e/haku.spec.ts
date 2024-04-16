import { test, expect, Page } from '@playwright/test';

async function selectHakutapa(page: Page, idx: number, expectedOption: string) {
  await page.getByTestId('haku-hakutapa-select').click();
  await page.locator(`#menu-hakutapa-select li:nth-child(${idx})`).click();
  await expect(page.locator('#mui-component-select-hakutapa-select')).toContainText(expectedOption);
}

async function selectKausi(page: Page, idx: number, expectedOption: string) {
  await page.getByTestId('haku-kausi-select').click();
  await page.locator(`#menu-alkamiskausi-select li:nth-child(${idx})`).click();
  await expect(page.locator('#mui-component-select-alkamiskausi-select')).toContainText(expectedOption);
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Valintojen Toteuttaminen/);
})

test('filters haku by published state', async ({ page }) => {
  await expect(page.getByTestId('haku-tila-toggle')).toContainText('Julkaistut');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  const hakuInput = await page.locator('input[name=haku-search]');
  hakuInput.fill('Luk');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Hausjärven lukio jatkuva haku');
});

test('filters haku by archived state', async ({ page }) => {
  await page.getByTestId('haku-tila-toggle').click();
  await expect(page.getByTestId('haku-tila-toggle')).toContainText('Arkistoidut');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  const hakuInput = await page.locator('input[name=haku-search]');
  hakuInput.fill('hak');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  hakuInput.fill('Leppä');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Leppävirran lukio - Jatkuva haku');
});

test('filters by hakutapa', async ({page}) => {
  await selectHakutapa(page, 5, 'Erillishaku');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await selectHakutapa(page, 6, 'Jatkuva haku');
  await expect(page.locator('tbody tr')).toHaveCount(2);
});

test('filters by start period', async ({page}) => {
  await selectKausi(page, 2, '2024 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await selectKausi(page, 10, '2020 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(0);
});

test('filters by hakutapa and start period', async ({page}) => {
  await selectHakutapa(page, 6, 'Jatkuva haku');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await selectKausi(page, 4, '2023 SYKSY');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

test('navigates to haku page', async ({page}) => {
  await page.locator('tbody tr:last-child td:first-child a').click();
  await expect(page).toHaveURL('/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102');
  await expect(page.locator('h1')).toHaveText('> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024');
});
