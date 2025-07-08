import { test, expect, Page } from '@playwright/test';
import { checkRow, expectAllSpinnersHidden } from './playwright-utils';

test('Näyttää hakeneet', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakeneet',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
  const headrow = page.locator('thead tr');
  await checkRow(
    headrow,
    [
      'Hakija',
      'Hakukelpoisuus',
      'Hakutoiveen nro',
      'Maksuvelvollisuus',
      'Hakemuksen tekninen tunniste (OID)',
      'Oppijan numero',
    ],
    'th',
  );
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await checkRow(rows.nth(0), [
    'Nukettaja Ruhtinas',
    'Hakukelpoinen',
    '2',
    'Ei maksuvelvollinen',
    '1.2.246.562.11.00000000000001796027',
    '1.2.246.562.24.69259807406',
  ]);
  await checkRow(rows.nth(1), [
    'Dacula Kreivi',
    'Hakukelpoinen',
    '1',
    'Maksuvelvollinen',
    '1.2.246.562.11.00000000000001793706',
    '1.2.246.562.24.25732574711',
  ]);
  await checkRow(rows.nth(2), [
    'Purukumi Puru',
    'Ehdollisesti hakukelpoinen',
    '1',
    'Tarkastamatta',
    '1.2.246.562.11.00000000000001790371',
    '1.2.246.562.24.14598775927',
  ]);
  await checkRow(rows.nth(3), [
    'Hui Haamu',
    'Ei hakukelpoinen',
    '1',
    'Tarkastamatta',
    '1.2.246.562.11.00000000000001543832',
    '1.2.246.562.24.30476885816',
  ]);
  await checkRow(rows.nth(4), [
    'Ratsu Päätön',
    'Ei hakukelpoinen',
    '1',
    'Tarkastamatta',
    '1.2.246.562.11.00000000000001543857',
    '1.2.246.562.24.30476885829',
  ]);
});

test('Ei näytä maksuvelvollisuutta ja hakukelpoisuutta kun kyseessä ei ole korkeakouluhaku', async ({
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
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakeneet',
  );
  await expectAllSpinnersHidden(page);
  const headrow = page.locator('thead tr');
  await checkRow(
    headrow,
    [
      'Hakija',
      'Hakutoiveen nro',
      'Hakemuksen tekninen tunniste (OID)',
      'Oppijan numero',
    ],
    'th',
  );
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(5);
  await checkRow(rows.nth(0), [
    'Nukettaja Ruhtinas',
    '2',
    '1.2.246.562.11.00000000000001796027',
    '1.2.246.562.24.69259807406',
  ]);
});

test.describe('Hakeneet suodatin', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(
      '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/hakeneet',
    );
  });

  test('suodattaa nimellä', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    let rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Nukettaja Ruhtinas',
      'Hakukelpoinen',
      '2',
      'Ei maksuvelvollinen',
      '1.2.246.562.11.00000000000001796027',
      '1.2.246.562.24.69259807406',
    ]);
    await hakuInput.fill('Hui');
    rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei hakukelpoinen',
      '1',
      'Tarkastamatta',
      '1.2.246.562.11.00000000000001543832',
      '1.2.246.562.24.30476885816',
    ]);
  });

  test('Suodattaa hakemusoidilla', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Hui Haamu',
      'Ei hakukelpoinen',
      '1',
      'Tarkastamatta',
      '1.2.246.562.11.00000000000001543832',
      '1.2.246.562.24.30476885816',
    ]);
  });

  test('Suodattaa henkilöoidilla', async () => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Purukumi Puru',
      'Ehdollisesti hakukelpoinen',
      '1',
      'Tarkastamatta',
      '1.2.246.562.11.00000000000001790371',
      '1.2.246.562.24.14598775927',
    ]);
  });
});
