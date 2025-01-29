import { test, expect } from '@playwright/test';
import {
  checkRow,
  expectAlertTextVisible,
  expectAllSpinnersHidden,
  expectPageAccessibilityOk,
  expectTextboxValue,
  mockDocumentExport,
  mockSeurantaProcess,
  startExcelImport,
} from './playwright-utils';
import VALINNANVAIHE_TULOKSET_ILMAN_LASKENTAA from './fixtures/valinnanvaihe-tulokset-ilman-laskentaa.json';
import VALINNANVAIHEET_ILMAN_LASKENTAA from './fixtures/valinnanvaiheet-ilman-laskentaa.json';
import { configuration } from '@/app/lib/configuration';

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

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  await expect(
    page.getByRole('heading', {
      level: 4,
      name: jonoHeadingText,
    }),
  ).toBeVisible();

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  const jonoHeadingRow = jonoContent.locator('thead tr');
  await checkRow(jonoHeadingRow, JONOSIJA_TABLE_HEADINGS, 'th');

  const jonoRows = jonoContent.locator('tbody tr');

  await expect(jonoRows).toHaveCount(4);

  await checkRow(jonoRows.first(), [
    expectTextboxValue('1'),
    'Nukettaja Ruhtinas',
    'Hyväksyttävissä',
    expectTextboxValue('Test fi'),
    expectTextboxValue('Test sv'),
    expectTextboxValue('Test en'),
  ]);

  await jonoContent.getByRole('button', { name: 'Kokonaispisteet' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Kyllä' }).click();

  await checkRow(jonoHeadingRow, PISTEET_TABLE_HEADINGS, 'th');
});

test('Exports valintatapajono excel successfully', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );

  await mockDocumentExport(page, (url) =>
    url.pathname.includes(
      '/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/vienti',
    ),
  );

  await expectAllSpinnersHidden(page);

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    jonoContent.getByRole('button', { name: 'Vie taulukkolaskentaan' }).click(),
  ]);

  expect(download.suggestedFilename()).toEqual(
    'valintalaskennan-tulokset.xlsx',
  );
});

test('Fails valintatapajono excel export', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );

  await page.route(
    (url) =>
      url.pathname.includes(
        '/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/vienti',
      ),
    async (route) => {
      await route.fulfill({
        status: 500,
      });
    },
  );

  await expectAllSpinnersHidden(page);

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  await jonoContent
    .getByRole('button', { name: 'Vie taulukkolaskentaan' })
    .click();

  await expectAlertTextVisible(
    page,
    'Valintatapajonon tulosten viemisessä taulukkolaskentaan tapahtui virhe!',
  );
});
test('Uploads valintatapajono excel successfully', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );

  await mockSeurantaProcess(page, (url) =>
    url.pathname.includes(
      '/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/tuonti',
    ),
  );

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  await startExcelImport(page, jonoContent);

  await expectAlertTextVisible(
    page,
    'Valintatapajonon tulosten tuominen taulukkolaskennasta onnistui!',
  );
});

test('Fails valintatapajono excel upload', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );

  await page.route(
    '**/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/tuonti*',
    async (route) => {
      await route.fulfill({
        status: 500,
      });
    },
  );

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  await startExcelImport(page, jonoContent);

  await expectAlertTextVisible(
    page,
    'Valintatapajonon tulosten tuomisessa taulukkolaskennasta tapahtui virhe',
  );
});

test('Sends edited data to backend when saving', async ({ page }) => {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/valintalaskennan-tulokset',
  );

  const jonoHeadingText = 'Varsinainen valinta: Tutkintoon valmentava koulutus';

  const jonoContent = page.getByRole('region', { name: jonoHeadingText });

  const firstRow = jonoContent.locator('tbody tr').first();
  await firstRow.getByRole('textbox', { name: 'jonosija' }).fill('2');
  await firstRow
    .getByRole('textbox', { name: 'Kuvaus suomeksi' })
    .fill('Kuvaus FI');
  await firstRow
    .getByRole('textbox', { name: 'Kuvaus ruotsiksi' })
    .fill('Kuvaus SV');
  await firstRow
    .getByRole('textbox', { name: 'Kuvaus englanniksi' })
    .fill('Kuvaus EN');

  // Save data and wait for request
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes(
          configuration.hakukohteenLasketutValinnanVaiheetUrl({
            hakukohdeOid: '1.2.246.562.20.00000000000000045105',
          }),
        ) && req.method() === 'POST',
    ),
    jonoContent.getByRole('button', { name: 'Tallenna' }).click(),
  ]);

  // Check if request payload matches the modified data
  const requestData = JSON.parse(request.postData() || '{}');
  expect(requestData).toMatchObject({
    jarjestysnumero: 0,
    valinnanvaiheoid: '1711376481658-8750199942485536118',
    nimi: 'Varsinainen valinta',
    createdAt: null,
    valintatapajonot: [
      {
        oid: '1679913593167-8093928466417053918',
        nimi: 'Tutkintoon valmentava koulutus',
        valintatapajonooid: '1679913593167-8093928466417053918',
        prioriteetti: 0,
        valmisSijoiteltavaksi: true,
        siirretaanSijoitteluun: false,
        kaytetaanKokonaispisteita: false,
        jonosijat: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            hakijaOid: '1.2.246.562.24.69259807406',
            jonosija: 1,
            tuloksenTila: 'HYVAKSYTTAVISSA',
            prioriteetti: 0,
            jarjestyskriteerit: [
              {
                arvo: -2,
                tila: 'HYVAKSYTTAVISSA',
                kuvaus: { FI: 'Kuvaus FI', SV: 'Kuvaus SV', EN: 'Kuvaus EN' },
                prioriteetti: 0,
                nimi: '',
              },
            ],
            harkinnanvarainen: false,
          },
        ],
      },
    ],
    hakuOid: '1.2.246.562.29.00000000000000045102',
  });
});
