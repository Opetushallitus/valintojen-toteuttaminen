import { test, expect } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import VALINTAKOKEET from './fixtures/kutsu-valintakokeet.json';
import VALINTAKOEOSALLISTUMISET from './fixtures/valintakoeosallistumiset.json';
import { difference } from 'remeda';

const VALINTAKOEKUTSUT_TABLE_HEADINGS = [
  '',
  'Hakija',
  'Osallistuminen',
  'Lisätietoja',
  'Laskettu pvm',
  'Asiointikieli',
];

test.beforeEach(async ({ page }) => {
  await page.route(
    '**/valintaperusteet-service/resources/hakukohde/1.2.246.562.20.00000000000000045105/valintakoe',
    async (route) => await route.fulfill({ json: VALINTAKOKEET }),
  );
  await page.route(
    '**/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/**',
    async (route) => await route.fulfill({ json: VALINTAKOEOSALLISTUMISET }),
  );
  await page.route(
    '**/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102&hakukohdeOid=1.2.246.562.20.00000000000000045105',
    async (route) => await route.abort('accessdenied'),
  );
  await page.route(
    '**/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102&hakukohdeOid=1.2.246.562.20.00000000000000045105',
    async (route) => await route.abort('accessdenied'),
  );
  await page.route(
    '**/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102&hakukohdeOid=1.2.246.562.20.00000000000000045105&valintakoeTunniste=1_2_246_562_20_00000000000000045105_paasykoe',
    async (route) => await route.abort('accessdenied'),
  );
});

test('valintakoekutsut accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintakoekutsut',
  );
  await expectAllSpinnersHidden(page);
  await page.locator('tbody tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('displays valintakoekutsut', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintakoekutsut',
  );
  await expectAllSpinnersHidden(page);

  const accordionHeadingText = 'Pääsykoe';

  const accordionContent = page.getByRole('region', {
    name: accordionHeadingText,
  });

  const headingRow = accordionContent.locator('thead tr');
  await checkRow(headingRow, VALINTAKOEKUTSUT_TABLE_HEADINGS, 'th');

  const rows = accordionContent.locator('tbody tr');
  await expect(rows).toHaveCount(3);

  await checkRow(rows.nth(0), [
    '',
    'Nukettaja Ruhtinas',
    'Kutsutaan',
    '',
    '9.1.2024 09:50:59',
    'suomi',
  ]);

  await checkRow(rows.nth(1), [
    '',
    'Dacula Kreivi',
    'Kutsutaan',
    '',
    '9.1.2024 09:51:00',
    'ruotsi',
  ]);

  await checkRow(rows.nth(2), [
    '',
    'Purukumi Puru',
    'Kutsutaan',
    '',
    '9.1.2024 09:51:00',
    'suomi',
  ]);

  await page.getByRole('checkbox', { name: 'Vain kutsuttavat' }).click();

  await expect(rows).toHaveCount(4);

  await checkRow(rows.nth(3), [
    '',
    'Hui Haamu',
    'Ei kutsuta',
    '',
    '9.1.2024 09:51:00',
    'englanti',
  ]);
});

test('Can select kutsut and start excel or osoitetarrat download for selected', async ({
  page,
}) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintakoekutsut',
  );
  await expectAllSpinnersHidden(page);

  const accordionHeadingText = 'Pääsykoe';

  const accordionContent = page.getByRole('region', {
    name: accordionHeadingText,
  });
  const headingRow = accordionContent.locator('thead tr');
  await checkRow(headingRow, VALINTAKOEKUTSUT_TABLE_HEADINGS, 'th');

  const rows = accordionContent.locator('tbody tr');

  const checkedRowCheckboxes = rows.getByRole('checkbox', { checked: true });
  await expect(checkedRowCheckboxes).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Valitse kaikki' }).click();

  await expect(checkedRowCheckboxes).toHaveCount(3);

  const selectedOids = await Promise.all(
    (await checkedRowCheckboxes.all()).map((el) => el.getAttribute('value')),
  );

  await await Promise.all([
    page.waitForRequest((req) => {
      const jsonData = req.postDataJSON();
      return (
        req
          .url()
          .includes(
            '/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102&hakukohdeOid=1.2.246.562.20.00000000000000045105',
          ) && difference(selectedOids, jsonData.hakemusOids).length === 0
      );
    }),
    accordionContent
      .getByRole('button', { name: 'Vie taulukkolaskentaan' })
      .click(),
  ]);

  await Promise.all([
    page.waitForRequest((req) => {
      const jsonData = req.postDataJSON();
      return (
        req
          .url()
          .includes(
            '/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi?hakuOid=1.2.246.562.29.00000000000000045102&hakukohdeOid=1.2.246.562.20.00000000000000045105&valintakoeTunniste=1_2_246_562_20_00000000000000045105_paasykoe',
          ) && difference(selectedOids, jsonData.hakemusOids).length === 0
      );
    }),
    accordionContent
      .getByRole('button', { name: 'Muodosta osoitetarrat' })
      .click(),
  ]);

  await accordionContent
    .getByRole('button', { name: 'Poista valinta' })
    .click();

  await expect(checkedRowCheckboxes).toHaveCount(0);
});
