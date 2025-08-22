import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  mockDocumentExport,
  expectAllSpinnersHidden,
  getMuiCloseButton,
  selectOption,
  expectAlertTextVisible,
  startExcelImport,
  mockOneOrganizationHierarchy,
} from './playwright-utils';
import { VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY } from '@/lib/permissions';

async function goToPisteSyotto(page: Page) {
  await page.goto(
    '/valintojen-toteuttaminen/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105/pistesyotto',
  );
  await expectAllSpinnersHidden(page);
  await expect(page.locator('h1')).toHaveText(
    '> Tampere University Separate Admission/ Finnish MAOL Competition Route 2024',
  );
}

test.beforeEach(async ({ page }) => await goToPisteSyotto(page));

async function selectTila(page: Page, option: string) {
  await selectOption({
    page,
    name: 'Tila',
    option,
  });
}

test('Näyttää pistesyotön', async ({ page }) => {
  const headrow = page.getByTestId('pistesyotto-form').locator('thead tr');
  await checkRow(
    headrow,
    [
      'Hakija',
      'Köksäkokeen arvosana (4–10)',
      'Nakkikoe, oletko nakkisuojassa?',
    ],
    'th',
  );
  const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), ['Dacula Kreivi', '', 'EiOsallistui']);
  await checkRow(rows.nth(1), ['Hui Haamu', '', 'Valitse...Merkitsemättä']);
  await checkRow(rows.nth(2), ['Nukettaja Ruhtinas', '', 'KylläOsallistui']);
  await checkRow(rows.nth(3), ['Purukumi Puru', '', 'Valitse...Merkitsemättä']);
});

test('Pistesyötössä muokkaus ei ole sallittu jos koetulosten tallentaminen ei ole sallittu', async ({
  page,
}) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/parametrit/1.2.246.562.29.00000000000000045102',
    async (route) =>
      await route.fulfill({
        status: 200,
        json: { koetulostentallennus: false },
      }),
  );

  await mockOneOrganizationHierarchy(page, {
    oid: '1.2.246.562.10.82941251389',
  });

  await page.route(
    '*/**/kayttooikeus-service/henkilo/current/omattiedot',
    async (route) => {
      await route.fulfill({
        json: {
          organisaatiot: [
            {
              organisaatioOid: '1.2.246.562.10.82941251389',
              kayttooikeudet: [
                {
                  palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY,
                  oikeus: 'CRUD',
                },
              ],
            },
          ],
        },
      });
    },
  );

  await goToPisteSyotto(page);

  const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), ['Dacula Kreivi', '', 'EiOsallistui']);
  await checkRow(rows.nth(1), ['Hui Haamu', '', 'Valitse...Merkitsemättä']);
  await checkRow(rows.nth(2), ['Nukettaja Ruhtinas', '', 'KylläOsallistui']);
  await checkRow(rows.nth(3), ['Purukumi Puru', '', 'Valitse...Merkitsemättä']);

  await expect(
    page.getByRole('row', { name: 'Dacula Kreivi' }).getByLabel('Pisteet'),
  ).toBeDisabled();
});

test('Näyttää pistesyotöt kaikilla kokeilla', async ({ page }) => {
  await page.getByLabel('Näytä vain laskentaan').click();
  const headrow = page.getByTestId('pistesyotto-form').locator('thead tr');
  await checkRow(
    headrow,
    [
      'Hakija',
      'Köksäkokeen arvosana (4–10)',
      'Nakkikoe, oletko nakkisuojassa?',
    ],
    'th',
  );
  const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');

  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Dacula Kreivi',
    'Merkitsemättä',
    'EiOsallistui',
  ]);
  await checkRow(rows.nth(1), [
    'Hui Haamu',
    'Ei osallistunut',
    'Valitse...Merkitsemättä',
  ]);

  const nukettajaRow = rows.nth(2);
  await checkRow(nukettajaRow, [
    'Nukettaja Ruhtinas',
    'Osallistui',
    'KylläOsallistui',
  ]);
  const arvosanaInput = nukettajaRow
    .getByRole('cell')
    .nth(1)
    .getByRole('textbox');
  await expect(arvosanaInput).toHaveValue('8,8');

  await checkRow(rows.nth(3), [
    'Purukumi Puru',
    'Ei osallistunut',
    'Valitse...Merkitsemättä',
  ]);
});

test('Näyttää ilmoituksen ettei mitään tallennettavaa', async ({ page }) => {
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(page.getByText('Ei muutoksia mitä tallentaa.')).toBeVisible();
});

test('Näyttää ilmoituksen virheellisestä syötteestä tallennettaessa', async ({
  page,
}) => {
  await page.getByLabel('Näytä vain laskentaan').click();
  await page
    .getByRole('row', { name: 'Dacula Kreivi' })
    .getByLabel('Pisteet')
    .fill('3');
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(
    page.getByText('Virheellinen syöte. Tarkista antamasi tiedot.'),
  ).toBeVisible();
});

test('Näyttää ilmoituksen kun tallennus onnistuu, lähetetään oikeat pisteet ja noudetaan tiedot uudelleen', async ({
  page,
}) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 204,
      }),
  );
  const nukettajaRow = page.getByRole('row', { name: 'Nukettaja Ruhtinas' });
  await nukettajaRow.getByRole('cell').nth(1).getByRole('textbox').fill('8,7');

  await selectOption({
    page,
    locator: nukettajaRow,
    name: 'Arvo',
    option: 'Ei',
  });
  await selectOption({
    page,
    locator: nukettajaRow,
    name: 'Osallistumisen tila',
    option: 'Osallistui',
  });

  const [putRequest] = await Promise.all([
    page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request
          .url()
          .includes(
            '/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
          ),
    ),
    page.waitForRequest(
      (request) =>
        request.method() === 'GET' &&
        request
          .url()
          .includes(
            '/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
          ),
    ),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]);

  const postData = JSON.parse(putRequest.postData() || '{}');

  const nukettajaPostData = postData[0];
  expect(nukettajaPostData).toMatchObject({
    oid: '1.2.246.562.11.00000000000001796027',
    personOid: '1.2.246.562.24.69259807406',
    firstNames: 'Ruhtinas',
    lastName: 'Nukettaja',
    additionalData: {
      koksa: '8.7',
      'koksa-osallistuminen': 'OSALLISTUI',
      nakki: 'false',
      'nakki-osallistuminen': 'OSALLISTUI',
    },
  });

  await expect(page.getByText('Tiedot tallennettu.')).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(page.getByText('Tiedot tallennettu.')).toBeHidden();
});

test('Näyttää ilmoituksen kun tallennus epäonnistuu', async ({ page }) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      }),
  );
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption({
    page,
    locator: huiRow,
    name: 'Arvo',
    option: 'Kyllä',
  });
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(
    page.getByText('Tietojen tallentamisessa tapahtui virhe.'),
  ).toBeVisible();
  await getMuiCloseButton(page).click();
  await expect(
    page.getByText('Tietojen tallentamisessa tapahtui virhe.'),
  ).toBeHidden();
});

test('Ilmoittaa tallentamattomista muutoksista kun käyttäjä yrittää navigoida toiselle sivulle', async ({
  page,
}) => {
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption({
    page,
    locator: huiRow,
    name: 'Arvo',
    option: 'Kyllä',
  });
  await page.getByText('Hakijaryhmät').click();
  const confirmationQuestion = () =>
    page.getByText(
      'Olet poistumassa lomakkeelta jolla on tallentamattomia muutoksia. Jatketaanko silti?',
    );
  await expect(confirmationQuestion()).toBeVisible();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(confirmationQuestion()).toBeHidden();
  await expect(page).toHaveURL(/.*pistesyotto/);
  await page.getByText('Hakeneet').click();
  await expect(confirmationQuestion()).toBeVisible();
  await page.getByRole('button', { name: 'Jatka' }).click();
  await expect(confirmationQuestion()).toBeHidden();
  await expect(page).toHaveURL(/.*hakeneet/);
});

test.describe('Suodattimet', () => {
  test('Nimellä', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('Ruht');
    let rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Nukettaja Ruhtinas', '', 'KylläOsallistui']);
    await hakuInput.fill('Hui');
    rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', '', 'Valitse...Merkitsemättä']);
  });

  test('Hakemusoidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', '', 'Valitse...Merkitsemättä']);
  });

  test('Henkilöoidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), [
      'Purukumi Puru',
      '',
      'Valitse...Merkitsemättä',
    ]);
  });

  test('Henkilötunnuksella', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('101172-979F');
    const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Dacula Kreivi', '', 'EiOsallistui']);
  });

  test('Osallistumisentilalla Merkitsemättä', async ({ page }) => {
    await selectTila(page, 'Merkitsemättä');
    const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(2);
    await checkRow(rows.nth(0), ['Hui Haamu', '', 'Valitse...Merkitsemättä']);
    await checkRow(rows.nth(1), [
      'Purukumi Puru',
      '',
      'Valitse...Merkitsemättä',
    ]);
  });

  test('Osallistumisentilalla Osallistui', async ({ page }) => {
    await selectTila(page, 'Osallistui');
    const rows = page.getByTestId('pistesyotto-form').locator('tbody tr');
    await expect(rows).toHaveCount(2);

    await checkRow(rows.nth(0), ['Dacula Kreivi', '', 'EiOsallistui']);
    await checkRow(rows.nth(1), ['Nukettaja Ruhtinas', '', 'KylläOsallistui']);
  });
});

test.describe('Excelin lataus', () => {
  test('Lataa excelin onnistuneesti', async ({ page }) => {
    await mockDocumentExport(page, (url) =>
      url.pathname.includes(
        '/valintalaskentakoostepalvelu/resources/pistesyotto/vienti',
      ),
    );

    const downloadPromise = page.waitForEvent('download');
    await page
      .getByRole('button', {
        name: 'Vie taulukkolaskentaan',
      })
      .click();

    await expectAllSpinnersHidden(page);
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toEqual('pistesyotto.xls');
  });

  test('Näyttää virheen kun excelin lataus epäonnistuu', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          '/valintalaskentakoostepalvelu/resources/pistesyotto/vienti',
        ),
      async (route) => await route.fulfill({ status: 500 }),
    );
    await page
      .getByRole('button', {
        name: 'Vie taulukkolaskentaan',
      })
      .click();
    await expectAllSpinnersHidden(page);
    await expectAlertTextVisible(
      page,
      'Pistetietojen vieminen taulukkolaskentaan epäonnistui',
    );
  });
});

test.describe('Excel tietojen tuonti', () => {
  test('Näyttää virheen kun excelin tuonti epäonnistuu kokonaan', async ({
    page,
  }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          'valintalaskentakoostepalvelu/resources/pistesyotto/tuonti',
        ),
      async (route) => await route.fulfill({ status: 500 }),
    );
    await startExcelImport(page);

    await expect(
      page.getByText('Tuodaan pistetietoja taulukkolaskennasta'),
    ).toBeVisible();
    await expectAllSpinnersHidden(page);
    await page.getByRole('dialog').filter({
      hasText: 'Pistetietojen tuominen taulukkolaskennasta epäonnistui!',
    });
  });

  test('Näyttää virheen kun excelin tuonti epäonnistuu osittain', async ({
    page,
  }) => {
    await page.route(
      (url) =>
        url.pathname.includes(
          'valintalaskentakoostepalvelu/resources/pistesyotto/tuonti',
        ),
      async (route) =>
        await route.fulfill({
          json: [
            {
              applicationOID: '1234',
              errorMessage: 'Yritettiin kirjoittaa yli uudempaa pistetietoa',
            },
          ],
        }),
    );
    await startExcelImport(page);

    await expect(
      page.getByText('Tuodaan pistetietoja taulukkolaskennasta'),
    ).toBeVisible();
    await expectAllSpinnersHidden(page);

    const modalContent = page.getByRole('dialog', {
      name: 'Pistetietojen tuominen taulukkolaskennasta epäonnistui osittain!',
    });

    await expect(modalContent).toBeVisible();

    await expect(
      modalContent.getByText('Yritettiin kirjoittaa yli uudempaa pistetietoa'),
    ).toBeVisible();

    await modalContent.getByRole('button', { name: 'Sulje' }).first().click();
  });
});
