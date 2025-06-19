import { test, expect } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';

test('Näyttää perustiedot', async ({ page }) => {
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
  const headrow = page.locator('thead tr');
  await checkRow(
    headrow,
    [
      'Valintatapajono',
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
    '7,76',
  ]);
  await checkRow(rows.nth(1), [
    'Erikoisjono',
    '15/100',
    '10',
    '10',
    '250',
    '5',
    '5',
    '9,76',
  ]);
  await checkRow(rows.nth(2), [
    'Harkinnanvaraisten jono',
    '5/100',
    '2',
    '1',
    '5',
    '1',
    '5',
    '5,76',
  ]);
});

test('Toisen asteen yhteishaulla näytetään harkinnanvaraisuussarake', async ({
  page,
}) => {
  await page.route(
    '*/**/kouta-internal/haku/1.2.246.562.29.00000000000000045102*',
    async (route) => {
      const haku = {
        oid: '1.2.246.562.29.00000000000000045102',
        tila: 'julkaistu',
        hakutapaKoodiUri: 'hakutapa_01',
        hakuVuosi: '2024',
        hakukausi: 'kausi_s',
        totalHakukohteet: 1,
        kohdejoukkoKoodiUri: 'haunkohdejoukko_11',
      };
      await route.fulfill({ json: haku });
    },
  );
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/perustiedot',
  );
  await expectAllSpinnersHidden(page);
  const headrow = page.locator('thead tr');
  await checkRow(
    headrow,
    [
      'Valintatapajono',
      'Sijoittelun käyttämät aloituspaikat',
      'Hyväksytyt yht',
      'Harkinnanvaraisesti hyväksytyt',
      'Varasijoilla',
      'Paikan vastaanottaneet',
      'Paikan peruneet',
      'Alin hyväksytty pistemäärä',
    ],
    'th',
  );
});
