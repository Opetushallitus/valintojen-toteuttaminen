import { test, expect } from '@playwright/test';
import { expectAllSpinnersHidden } from './playwright-utils';

test('displays valinnanvaiheet', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valinnan-hallinta',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(3);
  let columns = rows.first().locator('td');
  await expect(columns).toHaveCount(4);
  expect.soft(columns.first()).toContainText('Tietojen tulostus');
  expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  expect.soft(columns.nth(3).locator('button')).toBeEnabled();
  columns = await rows.nth(1).locator('td');
  await expect.soft(columns.first()).toContainText('Välikoe');
  expect.soft(columns.nth(1)).toContainText('Ei lasketa');
  expect.soft(columns.nth(2)).toContainText('Valintakoevalinnanvaihe');
  expect.soft(columns.nth(3)).toContainText('Valinnanvaihe ei ole aktiivinen');
  columns = await rows.nth(2).locator('td');
  await expect.soft(columns.first()).toContainText('Varsinainen valinta');
  expect.soft(columns.nth(1)).toContainText('Mukana laskennassa');
  expect.soft(columns.nth(2)).toContainText('Valinnanvaihe');
  expect.soft(columns.nth(3).locator('button')).toBeEnabled();
});
