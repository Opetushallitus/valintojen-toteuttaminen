import { test, expect } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import VALINNANVAIHE_TULOKSET_ILMAN_LASKENTAA from './fixtures/valinnanvaihe-tulokset-ilman-laskentaa.json';
import VALINNANVAIHEET_ILMAN_LASKENTAA from './fixtures/valinnanvaiheet-ilman-laskentaa.json';

const JONOSIJA_TABLE_HEADINGS = [
  'Jonosija',
  'Hakija',
  'Valintatieto',
  'Kuvaus suomeksi',
  'Kuvaus ruotsiksi',
  'Kuvaus englanniksi',
];

const PISTEET_TABLE_HEADINGS = [
  'Hakija',
  'Valintatieto',
  'Kokonaispisteet',
  'Kuvaus suomeksi',
  'Kuvaus ruotsiksi',
  'Kuvaus englanniksi',
];

test.beforeEach(async ({ page }) => {
  await page.route(
    '**/valintalaskenta-laskenta-service/resources/hakukohde/**',
    async (route) =>
      await route.fulfill({ json: VALINNANVAIHE_TULOKSET_ILMAN_LASKENTAA }),
  );
  await page.route(
    /valintaperusteet-service\/resources\/hakukohde\/\S+\/ilmanlaskentaa/,
    async (route) =>
      await route.fulfill({ json: VALINNANVAIHEET_ILMAN_LASKENTAA }),
  );
});

test('valintalaskennan tulokset ilman laskentaa accessibility', async ({
  page,
}) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );
  await expectAllSpinnersHidden(page);
  await page.locator('tbody tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('displays valintalaskennan tulokset', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );
  await expectAllSpinnersHidden(page);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
    }),
  ).toBeVisible();

  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'Tampereen yliopisto, Rakennetun ympäristön tiedekunta' +
      'Finnish MAOL competition route, Technology, Sustainable Urban Development, Bachelor and Master of Science (Technology) (3 + 2 yrs)',
  );

  await expect(
    page.getByRole('button', { name: 'Vie kaikki taulukkolaskentaan' }),
  ).toBeVisible();

  await expect(page.getByRole('heading', { level: 3 })).toHaveText(
    'Valinnanvaiheet, joissa ei käytetä laskentaa',
  );

  const jono1HeadingText =
    'Varsinainen valinta: Tutkintoon valmentava koulutus';

  await expect(
    page.getByRole('heading', {
      level: 4,
      name: jono1HeadingText,
    }),
  ).toBeVisible();

  const jono1Content = page.getByRole('region', { name: jono1HeadingText });

  const jono1HeadingRow = jono1Content.locator('thead tr');
  await checkRow(jono1HeadingRow, JONOSIJA_TABLE_HEADINGS, 'th');

  const jono1Rows = jono1Content.locator('tbody tr');

  await expect(jono1Rows).toHaveCount(4);

  await checkRow(jono1Rows.first(), [
    '1',
    'Nukettaja Ruhtinas',
    'Hyväksyttävissä',
    'Test fi',
    'Test sv',
    'Test en',
  ]);

  await jono1Content.getByRole('button', { name: 'Kokonaispisteet' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Kyllä' }).click();

  await checkRow(jono1HeadingRow, PISTEET_TABLE_HEADINGS, 'th');
});

/** TODO:
 * - Onnistunut Excel-download
 * - Epäonnistunut Excel-download
 * - Onnistunut Excel-upload
 * - Epäonnistunut Excel-upload
 * - Tietojen muokkaus ja tallennus, jonosijat ja kokonaispisteet
 */
