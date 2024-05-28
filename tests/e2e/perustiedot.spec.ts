import { test, expect, Locator } from '@playwright/test';
import { expectAllSpinnersHidden } from './playwright-utils';

const checkRow = async (
  row: Locator,
  expectedValues: string[],
  cellType: 'th' | 'td' = 'td',
) => {
  const cells = row.locator(cellType);
  for (const [index, value] of expectedValues.entries()) {
    await expect(cells.nth(index)).toHaveText(value);
  }
};

test('displays perustiedot', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/perustiedot',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  await expect(page.locator('h3')).toHaveText('Valintatapajonot');
  await expect(page.getByRole('link', { name: 'Valintaryhmä' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Valintaperusteet' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tarjonta' })).toBeVisible();
  const headrow = await page.locator('thead tr');
  checkRow(
    headrow,
    [
      'Nimi',
      'Sijoittelun käyttämät aloituspaikat',
      'Hyväksytyt yht',
      'Joista ehdollisesti hyväksytyt',
      'Varasijoilla',
      'Paikan vastaanottaneet',
      'Paikan peruneet',
      'Alin hyväksytty pistemäärä',
    ],
    'th',
  );
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(3);
  await checkRow(rows.nth(0), [
    'Perusjono',
    '80/100',
    '80',
    '20',
    '150',
    '35',
    '15',
    '7.76',
  ]);
  await checkRow(rows.nth(1), [
    'Erikoisjono',
    '15/100',
    '10',
    '10',
    '250',
    '5',
    '5',
    '9.76',
  ]);
  await checkRow(rows.nth(2), [
    'Harkinnanvaraisten jono',
    '5/100',
    '2',
    '1',
    '5',
    '1',
    '5',
    '5.76',
  ]);
});
