import { test, expect } from '@playwright/test';
import {
  checkRow,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
} from './playwright-utils';
import LASKETUT_VALINNANVAIHEET from './fixtures/lasketut-valinnanvaiheet.json';

const JONO_TABLE_HEADINGS = [
  'Jonosija',
  'Hakija',
  'Pisteet',
  'Hakutoive',
  'Valintatieto',
  'Muutoksen syy',
];

test.beforeEach(async ({ page }) => {
  await page.route(
    '**/valintalaskenta-laskenta-service/resources/hakukohde/**',
    async (route) => await route.fulfill({ json: LASKETUT_VALINNANVAIHEET }),
  );
});

test('valintalaskennan tulos accessibility', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulos',
  );
  await expectAllSpinnersHidden(page);
  await page.locator('tbody tr').nth(1).hover();
  await expectPageAccessibilityOk(page);
});

test('displays valintalaskennan tulos', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulos',
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
    page.getByRole('link', { name: 'Vie kaikki taulukkolaskentaan' }),
  ).toBeVisible();

  const jono1HeadingText =
    'Harkinnanvaraisten käsittelyvaiheen valintatapajono';

  await expect(
    page.getByRole('heading', {
      level: 3,
      name: jono1HeadingText,
    }),
  ).toBeVisible();

  const jono1Content = page.getByRole('region', { name: jono1HeadingText });

  const jono1HeadingRow = jono1Content.locator('thead tr');
  await checkRow(jono1HeadingRow, JONO_TABLE_HEADINGS, 'th');

  const jono1Rows = jono1Content.locator('tbody tr');

  await expect(jono1Rows).toHaveCount(1);
  await checkRow(jono1Rows.first(), [
    '1',
    'Nukettaja Ruhtinas',
    'Lisätietoja',
    '6',
    'Hyväksyttävissä',
    '',
  ]);

  const jono2HeadingText = 'Varsinainen valinta: Lukiokoulutus';

  await expect(
    page.getByRole('heading', {
      level: 3,
      name: jono2HeadingText,
    }),
  ).toBeVisible();

  const jono2Content = page.getByRole('region', { name: jono2HeadingText });
  const jono2HeadingRow = jono2Content.locator('thead tr');
  await checkRow(jono2HeadingRow, JONO_TABLE_HEADINGS, 'th');

  const jono2Rows = jono2Content.locator('tbody tr');
  await expect(jono2Rows).toHaveCount(2);
  await checkRow(jono2Rows.nth(0), [
    '1',
    'Dacula Kreivi',
    '10 Lisätietoja',
    '2',
    'Hyväksyttävissä',
    '',
  ]);

  await checkRow(jono2Rows.nth(1), [
    '2',
    'Purukumi Puru',
    '9.91 Lisätietoja',
    '1',
    'Hyväksyttävissä',
    '',
  ]);

  await expect(
    jono2Content.getByRole('button', { name: 'Poista jono sijoittelusta' }),
  ).toBeVisible();
});

test('shows error toast when removing jono from sijoittelu fails', async ({
  page,
}) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulos',
  );
  await expectAllSpinnersHidden(page);

  const jono2HeadingText = 'Varsinainen valinta: Lukiokoulutus';
  const jono2Content = page.getByRole('region', { name: jono2HeadingText });

  await page.route(
    '*/**/valintaperusteet-service/resources/V2valintaperusteet/1679913592869-3133925962577840128/automaattinenSiirto?status=false',
    async (route) => {
      await route.fulfill({ status: 500, body: 'Unknown error' });
    },
  );
  await jono2Content
    .getByRole('button', { name: 'Poista jono sijoittelusta' })
    .click();

  await expect(
    page.getByText('Jonon sijoittelun tilan muuttamisesa tapahtui virhe!'),
  ).toBeVisible();
});
