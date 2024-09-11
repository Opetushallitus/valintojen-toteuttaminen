import { test, expect } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';

test('displays pistesyotto', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/pistesyotto',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const headrow = page.locator('thead tr');
  await checkRow(headrow, ['Hakija', 'Nakkikoe, oletko nakkisuojassa?'], 'th');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
  await checkRow(rows.nth(1), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  await checkRow(rows.nth(2), ['Nukettaja Ruhtinas', 'KylläOsallistui']);

  await checkRow(rows.nth(3), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
});
