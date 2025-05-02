import { test, expect, Page } from '@playwright/test';
import {
  checkRow,
  mockDocumentExport,
  expectAllSpinnersHidden,
  getMuiCloseButton,
  selectOption,
  expectAlertTextVisible,
  startExcelImport,
} from './playwright-utils';

test('Näyttää pistesyotön', async ({ page }) => {
  await goToPisteSyotto(page);
  const headrow = page.locator('[data-test-id="pistesyotto-form"] thead tr');
  await checkRow(headrow, ['Hakija', 'Nakkikoe, oletko nakkisuojassa?'], 'th');
  const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
  await checkRow(rows.nth(1), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  await checkRow(rows.nth(2), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
  await checkRow(rows.nth(3), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
});

async function selectTila(page: Page, expectedOption: string) {
  await selectOption(page, 'Tila', expectedOption);
}

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

test('Näyttää pistesyotöt kaikilla kokeilla', async ({ page }) => {
  await page.getByLabel('Näytä vain laskentaan').click();
  const headrow = page.locator('[data-test-id="pistesyotto-form"] thead tr');
  await checkRow(
    headrow,
    ['Hakija', 'Nakkikoe, oletko nakkisuojassa?', 'Köksäkokeen arvosana'],
    'th',
  );
  const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
  await expect(rows).toHaveCount(4);
  await checkRow(rows.nth(0), [
    'Dacula Kreivi',
    'EiOsallistui',
    'Merkitsemättä',
  ]);
  await checkRow(rows.nth(1), [
    'Hui Haamu',
    'Valitse...Merkitsemättä',
    'Ei osallistunut',
  ]);
  await checkRow(rows.nth(2), [
    'Nukettaja Ruhtinas',
    'KylläOsallistui',
    'Osallistui',
  ]);
  await checkRow(rows.nth(3), [
    'Purukumi Puru',
    'Valitse...Merkitsemättä',
    'Ei osallistunut',
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
    .getByRole('row', { name: 'Dacula Kreivi Arvo' })
    .getByLabel('Pisteet')
    .fill('3');
  await page.getByRole('button', { name: 'Tallenna' }).click();
  await expect(
    page.getByText('Virheellinen syöte. Tarkista antamasi tiedot.'),
  ).toBeVisible();
});

test('Näyttää ilmoituksen kun tallennus onnistuu', async ({ page }) => {
  await page.route(
    '*/**/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/1.2.246.562.29.00000000000000045102/hakukohde/1.2.246.562.20.00000000000000045105',
    async (route) =>
      await route.fulfill({
        status: 204,
      }),
  );
  const huiRow = page.getByRole('row', { name: 'Hui Haamu' });
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
  await selectOption(page, 'Osallistumisen tila', 'Osallistui', huiRow);
  await page.getByRole('button', { name: 'Tallenna' }).click();
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
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
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
  await selectOption(page, 'Arvo', 'Kyllä', huiRow);
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
    let rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
    await hakuInput.fill('Hui');
    rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  });

  test('Hakemusoidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.11.00000000000001543832');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
  });

  test('Henkilöoidilla', async ({ page }) => {
    const hakuInput = page.getByRole('textbox', {
      name: 'Hae hakijan nimellä tai tunnisteilla',
    });
    await hakuInput.fill('1.2.246.562.24.14598775927');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(1);
    await checkRow(rows.nth(0), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('Osallistumisentilalla Merkitsemättä', async ({ page }) => {
    await selectTila(page, 'Merkitsemättä');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);
    await checkRow(rows.nth(0), ['Hui Haamu', 'Valitse...Merkitsemättä']);
    await checkRow(rows.nth(1), ['Purukumi Puru', 'Valitse...Merkitsemättä']);
  });

  test('Osallistumisentilalla Osallistui', async ({ page }) => {
    await selectTila(page, 'Osallistui');
    const rows = page.locator('[data-test-id="pistesyotto-form"] tbody tr');
    await expect(rows).toHaveCount(2);

    await checkRow(rows.nth(0), ['Dacula Kreivi', 'EiOsallistui']);
    await checkRow(rows.nth(1), ['Nukettaja Ruhtinas', 'KylläOsallistui']);
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
